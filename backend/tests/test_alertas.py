"""H-32 / decisión D3: alerta automática de bajo rendimiento sin duplicados.

Reglas que NO cambian (se verifican también): umbral promedio < 3.0, promedio global de
todas las notas, la regla se evalúa al crear (no al editar) y las alertas existentes no se
modifican.
"""
from sqlalchemy import text


def _alertas_bajo_rendimiento(db, estudiante_id):
    return db.execute(text("""
        SELECT id, tipo, estado, mensaje FROM alertas
        WHERE estudiante_id = :e AND (tipo = 'low_grade' OR lower(tipo) = 'bajo rendimiento')
        ORDER BY id
    """), {"e": estudiante_id}).mappings().all()


def _todas_las_alertas(db):
    return db.execute(text("SELECT id, estudiante_id, tipo, mensaje, estado FROM alertas ORDER BY id")).all()


def _nota(client, headers, estudiante_id, nota, materia_id=1):
    r = client.post("/calificaciones", json={"estudiante_id": estudiante_id, "materia_id": materia_id, "nota": nota}, headers=headers)
    assert r.status_code == 201
    return r.json()


def test_alerta_bajo_rendimiento_activa_impide_duplicado(client, docente_headers, db):
    # Estudiante 8 (Alejandro Ramírez): alerta «Bajo Rendimiento» activa en los datos demo.
    antes = _alertas_bajo_rendimiento(db, 8)
    assert len(antes) == 1 and antes[0]["tipo"] == "Bajo Rendimiento" and antes[0]["estado"] == "active"
    _nota(client, docente_headers, 8, 1.0)
    assert len(_alertas_bajo_rendimiento(db, 8)) == 1


def test_alerta_en_revision_impide_duplicado(client, docente_headers, db):
    alerta = _alertas_bajo_rendimiento(db, 8)[0]
    r = client.put(f"/alertas/{alerta['id']}/estado", json={"estado": "reviewed"}, headers=docente_headers)
    assert r.status_code == 200
    _nota(client, docente_headers, 8, 1.0)
    assert len(_alertas_bajo_rendimiento(db, 8)) == 1


def test_alerta_resuelta_no_impide_una_nueva(client, docente_headers, db):
    alerta = _alertas_bajo_rendimiento(db, 8)[0]
    client.put(f"/alertas/{alerta['id']}/estado", json={"estado": "resolved"}, headers=docente_headers)
    _nota(client, docente_headers, 8, 1.0)
    alertas = _alertas_bajo_rendimiento(db, 8)
    assert len(alertas) == 2
    assert alertas[-1]["tipo"] == "low_grade" and alertas[-1]["estado"] == "active"


def test_estudiante_sin_alerta_recibe_una_al_bajar_de_3(client, docente_headers, db):
    # Nicolas Vargas (12): promedio 2.90 y sin alerta de bajo rendimiento en los datos demo.
    assert _alertas_bajo_rendimiento(db, 12) == []
    _nota(client, docente_headers, 12, 2.9)
    alertas = _alertas_bajo_rendimiento(db, 12)
    assert len(alertas) == 1
    assert alertas[0]["tipo"] == "low_grade"
    assert alertas[0]["mensaje"] == "Promedio académico bajo: 2.90"


def test_alerta_low_grade_activa_impide_duplicado(client, docente_headers, db):
    _nota(client, docente_headers, 12, 2.9)
    _nota(client, docente_headers, 12, 2.0)
    assert len(_alertas_bajo_rendimiento(db, 12)) == 1


def test_umbral_sin_cambios_promedio_exacto_3_no_genera_alerta(client, docente_headers, db):
    # Estudiante 3 (Valentina Martínez): notas 4.0 y 4.2, sin alertas. Con 0.8 el promedio es 3.0.
    assert _alertas_bajo_rendimiento(db, 3) == []
    _nota(client, docente_headers, 3, 0.8)
    assert db.execute(text("SELECT AVG(nota) FROM calificaciones WHERE estudiante_id = 3")).scalar() == 3
    assert _alertas_bajo_rendimiento(db, 3) == []


def test_editar_una_nota_no_evalua_la_regla(client, docente_headers, db):
    # RN-10 sin cambios: la regla solo se evalúa al crear.
    fila = db.execute(text("SELECT * FROM calificaciones WHERE estudiante_id = 3 ORDER BY id LIMIT 1")).mappings().first()
    client.put(f"/calificaciones/{fila['id']}", json={"estudiante_id": 3, "materia_id": fila["materia_id"], "nota": 0.0}, headers=docente_headers)
    assert _alertas_bajo_rendimiento(db, 3) == []


def test_las_alertas_existentes_no_se_modifican(client, docente_headers, db):
    antes = _todas_las_alertas(db)
    for estudiante in (8, 12, 2, 20):
        _nota(client, docente_headers, estudiante, 1.5)
    despues = _todas_las_alertas(db)
    assert despues[:len(antes)] == antes
