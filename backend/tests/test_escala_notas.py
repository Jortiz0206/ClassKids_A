"""Escala oficial de calificaciones: 0.0 a 5.0 con un decimal (regla aprobada, sin cambios).

Comprueba la escala en las tres capas: PostgreSQL (CHECK y NUMERIC(3,1)), la API
(POST y PUT /calificaciones) y la regla de alerta (promedio < 3.0 sobre la escala 0–5).
Se ejecuta contra classkids_test dentro de una transacción que se deshace (conftest.py).
"""
import pytest
from sqlalchemy import text
from sqlalchemy.exc import DataError, IntegrityError

VALIDAS = [0.0, 0.1, 2.5, 3.0, 4.0, 4.9, 5.0]
FUERA_DE_RANGO = [-0.1, 5.1, 7, 12, 20, 80, 100]  # 80 y 100 son porcentajes, no notas
MAS_DE_UN_DECIMAL = [2.96, 4.95, 0.05, 3.25]
NO_NUMERICAS = ["4.0", "80", True, None]


def _cuerpo(nota):
    return {"estudiante_id": 1, "materia_id": 1, "nota": nota}


def _id_de_una_calificacion(db):
    return db.execute(text("SELECT id FROM calificaciones ORDER BY id LIMIT 1")).scalar()


# ============================================================ API: registrar

@pytest.mark.parametrize("nota", VALIDAS)
def test_registrar_acepta_los_limites_validos(client, admin_headers, db, nota):
    r = client.post("/calificaciones", json=_cuerpo(nota), headers=admin_headers)
    assert r.status_code == 201, r.text
    guardada = db.execute(text("SELECT nota FROM calificaciones WHERE id = :id"), {"id": r.json()["id"]}).scalar()
    assert float(guardada) == nota


@pytest.mark.parametrize("nota", FUERA_DE_RANGO + MAS_DE_UN_DECIMAL + NO_NUMERICAS)
def test_registrar_rechaza_valores_fuera_de_la_escala(client, admin_headers, db, nota):
    antes = db.execute(text("SELECT count(*) FROM calificaciones")).scalar()
    r = client.post("/calificaciones", json=_cuerpo(nota), headers=admin_headers)
    assert r.status_code == 422, (nota, r.status_code, r.text)
    assert "nota" in str(r.json()["detail"])
    assert db.execute(text("SELECT count(*) FROM calificaciones")).scalar() == antes


def test_registrar_como_docente_tambien_valida_la_escala(client, docente_headers):
    # La validación ocurre antes de los permisos: ningún rol puede guardar 80 como nota.
    assert client.post("/calificaciones", json=_cuerpo(80), headers=docente_headers).status_code == 422


# ============================================================ API: editar

@pytest.mark.parametrize("nota", VALIDAS)
def test_editar_acepta_los_limites_validos(client, admin_headers, db, nota):
    cal_id = _id_de_una_calificacion(db)
    r = client.put(f"/calificaciones/{cal_id}", json=_cuerpo(nota), headers=admin_headers)
    assert r.status_code == 200, r.text
    assert float(db.execute(text("SELECT nota FROM calificaciones WHERE id = :id"), {"id": cal_id}).scalar()) == nota


@pytest.mark.parametrize("nota", FUERA_DE_RANGO + MAS_DE_UN_DECIMAL + NO_NUMERICAS)
def test_editar_rechaza_valores_fuera_de_la_escala(client, admin_headers, db, nota):
    cal_id = _id_de_una_calificacion(db)
    original = db.execute(text("SELECT nota FROM calificaciones WHERE id = :id"), {"id": cal_id}).scalar()
    r = client.put(f"/calificaciones/{cal_id}", json=_cuerpo(nota), headers=admin_headers)
    assert r.status_code == 422, (nota, r.status_code, r.text)
    assert db.execute(text("SELECT nota FROM calificaciones WHERE id = :id"), {"id": cal_id}).scalar() == original


# ============================================================ PostgreSQL: última barrera

def test_columna_es_numeric_3_1_con_check_0_a_5(db):
    col = db.execute(text("""
        SELECT data_type, numeric_precision, numeric_scale FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'calificaciones' AND column_name = 'nota'
    """)).one()
    assert tuple(col) == ("numeric", 3, 1)
    check = db.execute(text("""
        SELECT pg_get_constraintdef(oid) FROM pg_constraint
        WHERE conrelid = 'calificaciones'::regclass AND contype = 'c' AND conname = 'calificaciones_nota_check'
    """)).scalar()
    assert check == "CHECK (((nota >= (0)::numeric) AND (nota <= (5)::numeric)))"


@pytest.mark.parametrize("nota", ["-0.1", "5.1", "80", "100"])
def test_postgresql_rechaza_notas_fuera_de_rango_aunque_se_salte_la_api(db, nota):
    # 100 ni siquiera cabe en NUMERIC(3,1) (máximo 99.9): falla por desbordamiento; el resto, por el CHECK.
    with pytest.raises((IntegrityError, DataError)) as error:
        with db.begin_nested():
            db.execute(text("INSERT INTO calificaciones (estudiante_id, materia_id, nota) VALUES (1, 1, CAST(:n AS numeric))"), {"n": nota})
    assert "calificaciones_nota_check" in str(error.value) or "numeric field overflow" in str(error.value)


@pytest.mark.parametrize("nota", ["0.0", "0.1", "4.9", "5.0"])
def test_postgresql_acepta_los_limites_validos(db, nota):
    with db.begin_nested() as sp:
        valor = db.execute(text("INSERT INTO calificaciones (estudiante_id, materia_id, nota) VALUES (1, 1, CAST(:n AS numeric)) RETURNING nota"), {"n": nota}).scalar()
        sp.rollback()
    assert str(valor) == nota


def test_ninguna_nota_guardada_esta_fuera_de_la_escala(db):
    fila = db.execute(text("""
        SELECT count(*) FILTER (WHERE nota < 0 OR nota > 5), count(*) FILTER (WHERE nota * 10 <> trunc(nota * 10))
        FROM calificaciones
    """)).one()
    assert tuple(fila) == (0, 0)


# ============================================================ Regla de alerta sobre la escala 0–5

def _estudiante_sin_notas_ni_alertas(db):
    est = db.execute(text("""
        SELECT e.id FROM estudiantes e
        WHERE NOT EXISTS (SELECT 1 FROM calificaciones c WHERE c.estudiante_id = e.id)
          AND NOT EXISTS (SELECT 1 FROM alertas a WHERE a.estudiante_id = e.id)
        ORDER BY e.id LIMIT 1
    """)).scalar()
    if est is None:
        est = db.execute(text("SELECT id FROM estudiantes ORDER BY id DESC LIMIT 1")).scalar()
        db.execute(text("DELETE FROM calificaciones WHERE estudiante_id = :id"), {"id": est})
        db.execute(text("DELETE FROM alertas WHERE estudiante_id = :id"), {"id": est})
    return est


def _alertas(db, est):
    return db.execute(text("SELECT count(*) FROM alertas WHERE estudiante_id = :id AND tipo = 'low_grade'"), {"id": est}).scalar()


def test_alerta_con_2_9_si_y_con_3_0_no(client, admin_headers, db):
    est = _estudiante_sin_notas_ni_alertas(db)
    assert client.post("/calificaciones", json={"estudiante_id": est, "materia_id": 1, "nota": 3.0}, headers=admin_headers).status_code == 201
    assert _alertas(db, est) == 0  # 3.0 = 60/100 no está por debajo del umbral
    assert client.post("/calificaciones", json={"estudiante_id": est, "materia_id": 1, "nota": 2.8}, headers=admin_headers).status_code == 201
    assert _alertas(db, est) == 1  # promedio 2.9 < 3.0
