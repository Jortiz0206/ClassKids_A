"""La base classkids_demo coincide con el plan, es íntegra y respeta roles, escala y alertas."""
import re
from collections import defaultdict
from datetime import date

import pytest
from sqlalchemy import text

from demo import catalogo as cat
from demo.generar_demo import marca_actual, verificar
from demo.plan import construir_plan

ADMIN = cat.ADMINISTRADOR["email"]
DOCENTE = {d["clave"]: d["email"] for d in cat.DOCENTES}


@pytest.fixture(scope="module")
def plan():
    import database

    with database.engine.connect() as conn:
        marca = marca_actual(conn) or ""
    m = re.search(r"semilla=(\d+) referencia=(\d{4}-\d{2}-\d{2})", marca)
    assert m, f"La base no tiene datos generados: {marca!r}. Ejecuta demo/generar_demo.py generar"
    return construir_plan(int(m.group(1)), date.fromisoformat(m.group(2)))


# ============================================================ integridad y coincidencia con el plan

def test_comprobaciones_de_integridad(db):
    fallos = [(n, c) for n, c in verificar(db.connection()) if c]
    assert not fallos


def test_la_base_contiene_exactamente_el_plan(db, plan):
    estudiantes = db.execute(text("SELECT e.documento, e.nombre, e.apellido, g.nombre FROM estudiantes e JOIN grupos g ON g.id = e.grupo_id ORDER BY e.id")).all()
    grupo_nombre = {g["clave"]: g["nombre"] for g in cat.GRUPOS}
    assert [tuple(f) for f in estudiantes] == [(e.documento, e.nombre, e.apellido, grupo_nombre[e.grupo]) for e in plan.estudiantes]

    notas = db.execute(text("""
        SELECT e.documento, m.codigo, g.nombre, a.titulo, c.nota, c.periodo, c.fecha_registro
        FROM calificaciones c JOIN estudiantes e ON e.id = c.estudiante_id JOIN actividades a ON a.id = c.actividad_id
        JOIN materias m ON m.id = a.materia_id JOIN grupos g ON g.id = a.grupo_id ORDER BY c.id
    """)).all()
    codigo = {m["clave"]: m["codigo"] for m in cat.MATERIAS}
    actividades = {a.clave: a for a in plan.actividades}
    esperado = [(c.documento, codigo[actividades[c.actividad].materia], grupo_nombre[actividades[c.actividad].grupo],
                 actividades[c.actividad].titulo, c.nota, c.periodo, c.fecha_registro) for c in plan.calificaciones]
    assert [(d, m, g, t, float(n), p, f) for d, m, g, t, n, p, f in notas] == esperado


def test_contrasenas_con_el_hash_del_proyecto(db):
    # El recorrido de e2e/demo puede dejar desactivada la cuenta docente.recorrido; se comprueban
    # las seis cuentas generadas y que todas las contraseñas usen el hash del proyecto.
    filas = dict(db.execute(text("SELECT email, password_hash FROM usuarios WHERE activo")).all())
    assert {cat.ADMINISTRADOR["email"], *DOCENTE.values()} <= set(filas)
    todas = db.execute(text("SELECT password_hash FROM usuarios")).scalars().all()
    assert all(h.startswith("$pbkdf2-sha256$") for h in todas)


# ============================================================ alertas creadas por la regla real

def test_cada_alerta_corresponde_a_la_primera_vez_que_el_promedio_bajo_de_3(db):
    """Durante la generación ninguna alerta se cerró antes de terminar de registrar notas, así que
    la regla RN-09 con D3 crea como máximo una alerta por estudiante: en la primera nota con la que
    el promedio acumulado queda por debajo de 3.0, y con la fecha de esa nota."""
    notas = defaultdict(list)
    for est, nota, fecha in db.execute(text("SELECT estudiante_id, nota, fecha_registro FROM calificaciones ORDER BY id")):
        notas[est].append((float(nota), fecha))
    esperadas = {}
    for est, lista in notas.items():
        suma = 0
        for i, (nota, fecha) in enumerate(lista, 1):
            suma += nota
            if suma / i < 3:
                esperadas[est] = fecha
                break
    reales = {est: fecha for est, fecha in db.execute(text("SELECT estudiante_id, fecha_creacion FROM alertas WHERE tipo = 'low_grade'"))}
    assert reales == esperadas


def test_ningun_estudiante_excelente_tiene_alerta(db, plan):
    excelentes = [e.documento for e in plan.estudiantes if e.perfil == "excelente"]
    n = db.execute(text("SELECT count(*) FROM alertas a JOIN estudiantes e ON e.id = a.estudiante_id WHERE e.documento = ANY(:d)"), {"d": excelentes}).scalar()
    assert n == 0


def test_alertas_atendidas_por_los_docentes(db):
    estados = dict(db.execute(text("SELECT estado, count(*) FROM alertas GROUP BY estado")).all())
    assert estados.get("active", 0) > 0 and estados.get("reviewed", 0) > 0 and estados.get("resolved", 0) > 0


# ============================================================ roles y permisos (API real)

def _grupos_de(client, headers):
    return {g["nombre"] for g in client.get("/grupos", headers=headers).json()}


def test_cada_docente_ve_solo_los_grupos_de_sus_asignaciones(client, entrar):
    nombre = {g["clave"]: g["nombre"] for g in cat.GRUPOS}
    for clave, email in DOCENTE.items():
        esperados = {nombre[g] for d, _, g in cat.ASIGNACIONES if d == clave}
        assert _grupos_de(client, entrar(email)) == esperados, clave


def test_el_administrador_ve_todo(client, entrar):
    h = entrar(ADMIN, "admin")
    assert len(client.get("/grupos", headers=h).json()) == 10
    assert len(client.get("/estudiantes", headers=h).json()) == 200
    assert client.get("/usuarios", headers=h).status_code == 200


def test_un_docente_no_puede_calificar_ni_ver_otro_grupo(client, entrar, db):
    # D2 (Matemáticas de 4° y 5°) frente a un estudiante de 1A, que pertenece a D1.
    est_1a = db.execute(text("SELECT e.id FROM estudiantes e JOIN grupos g ON g.id = e.grupo_id WHERE g.nombre = 'Grado 1A' ORDER BY e.id LIMIT 1")).scalar()
    mat = db.execute(text("SELECT id FROM materias WHERE codigo = 'MAT-DEMO'")).scalar()
    h2 = entrar(DOCENTE["D2"])
    assert client.post("/calificaciones", json={"estudiante_id": est_1a, "materia_id": mat, "nota": 4.0}, headers=h2).status_code == 403
    assert all(e["id"] != est_1a for e in client.get("/estudiantes", headers=h2).json())
    assert client.get("/usuarios", headers=h2).status_code == 403


def test_un_docente_registra_edita_y_consulta_una_nota_de_0_a_5(client, entrar, db):
    act = db.execute(text("""
        SELECT a.id, a.materia_id, a.grupo_id FROM actividades a JOIN grupos g ON g.id = a.grupo_id
        JOIN materias m ON m.id = a.materia_id WHERE g.nombre = 'Grado 1A' AND m.codigo = 'MAT-DEMO'
        ORDER BY a.fecha_entrega DESC LIMIT 1
    """)).one()
    est = db.execute(text("SELECT id FROM estudiantes WHERE grupo_id = :g ORDER BY id LIMIT 1"), {"g": act.grupo_id}).scalar()
    h1 = entrar(DOCENTE["D1"])
    r = client.post("/calificaciones", json={"estudiante_id": est, "materia_id": act.materia_id, "actividad_id": act.id, "nota": 3.8}, headers=h1)
    assert r.status_code == 201 and float(r.json()["nota"]) == 3.8
    cal = r.json()["id"]
    assert client.put(f"/calificaciones/{cal}", json={"estudiante_id": est, "materia_id": act.materia_id, "nota": 4.0}, headers=h1).status_code == 200
    assert client.put(f"/calificaciones/{cal}", json={"estudiante_id": est, "materia_id": act.materia_id, "nota": 80}, headers=h1).status_code == 422
    leidas = client.get(f"/calificaciones?actividad_id={act.id}", headers=h1).json()
    assert [float(c["nota"]) for c in leidas if c["id"] == cal] == [4.0]


def test_indicadores_por_rol(client, entrar):
    h_admin, h1 = entrar(ADMIN, "admin"), entrar(DOCENTE["D1"])
    assert client.get("/estudiantes/count", headers=h_admin).json()["count"] == 198  # 2 retirados
    assert client.get("/grupos/count", headers=h1).json()["count"] == 6
    assert client.get("/actividades/count", headers=h1).json()["count"] == 12 * 5
