"""Seguridad de la API: H-18 (autoprotección del administrador) y H-08 (permisos por asignación).

Todas las pruebas llaman a la API directamente, como lo haría alguien que cambia
identificadores a mano, y se ejecutan dentro de una transacción que se deshace al final.

Datos de la base de pruebas usados como referencia:
- `matematicas@classkids.local`: docente con Matemáticas en 7 grupos.
- `docente@classkids.local`: docente con las 5 materias en los otros 3 grupos.
"""
import pytest
from sqlalchemy import text

import main

MATE = "matematicas@classkids.local"


def _usuario(db, email):
    return db.execute(text("SELECT id FROM usuarios WHERE email = :e"), {"e": email}).scalar()


def _cabeceras(db, email):
    fila = db.execute(text("""
        SELECT u.id, r.nombre FROM usuarios u JOIN user_roles r ON r.id = u.rol_id WHERE u.email = :e
    """), {"e": email}).first()
    rol = "admin" if fila.nombre == "Administrador" else "docente"
    return {"Authorization": f"Bearer {main.create_access_token(fila.id, rol)}"}


@pytest.fixture()
def mate(db):
    """Sesión del docente de Matemáticas y sus asignaciones reales."""
    uid = _usuario(db, MATE)
    grupos = {r[0] for r in db.execute(text("SELECT grupo_id FROM asignaciones WHERE docente_id = :u"), {"u": uid})}
    materias = {r[0] for r in db.execute(text("SELECT materia_id FROM asignaciones WHERE docente_id = :u"), {"u": uid})}
    assert grupos and materias, "La base de pruebas debe tener asignaciones para el docente de Matemáticas"
    return {"id": uid, "h": _cabeceras(db, MATE), "grupos": grupos, "materias": materias}


def _ajeno(db, mate):
    """Una asignación (materia, grupo) que NO es del docente de Matemáticas."""
    return db.execute(text("""
        SELECT materia_id, grupo_id FROM asignaciones WHERE docente_id <> :u ORDER BY id LIMIT 1
    """), {"u": mate["id"]}).first()


def _estudiante_en(db, grupos, dentro=True):
    op = "IN" if dentro else "NOT IN"
    lista = ",".join(str(g) for g in grupos)
    return db.execute(text(f"SELECT id FROM estudiantes WHERE grupo_id {op} ({lista}) ORDER BY id LIMIT 1")).scalar()


# ============================================================ H-18

def test_h18_admin_no_puede_cambiar_su_propio_rol(client, admin_headers, db):
    yo = _usuario(db, "admin@classkids.local")
    r = client.put(f"/usuarios/{yo}/rol", json={"role": "docente"}, headers=admin_headers)
    assert r.status_code == 403
    assert db.execute(text("SELECT r.nombre FROM usuarios u JOIN user_roles r ON r.id = u.rol_id WHERE u.id = :i"), {"i": yo}).scalar() == "Administrador"


def test_h18_admin_no_puede_desactivarse(client, admin_headers, db):
    yo = _usuario(db, "admin@classkids.local")
    r = client.delete(f"/usuarios/{yo}", headers=admin_headers)
    assert r.status_code == 403
    assert db.execute(text("SELECT activo FROM usuarios WHERE id = :i"), {"i": yo}).scalar() is True


def test_h18_admin_si_gestiona_a_otros_usuarios(client, admin_headers, db):
    otro = _usuario(db, "ingles@classkids.local")
    assert client.put(f"/usuarios/{otro}/rol", json={"role": "admin"}, headers=admin_headers).status_code == 200
    assert client.put(f"/usuarios/{otro}/rol", json={"role": "docente"}, headers=admin_headers).status_code == 200
    assert client.delete(f"/usuarios/{otro}", headers=admin_headers).status_code == 200


def test_h18_docente_no_gestiona_usuarios(client, mate, db):
    otro = _usuario(db, "ingles@classkids.local")
    assert client.put(f"/usuarios/{otro}/rol", json={"role": "admin"}, headers=mate["h"]).status_code == 403
    assert client.delete(f"/usuarios/{mate['id']}", headers=mate["h"]).status_code == 403


# ============================================================ H-08: lecturas

def test_h08_docente_ve_solo_sus_materias(client, mate):
    materias = client.get("/materias", headers=mate["h"]).json()
    assert {m["id"] for m in materias} == mate["materias"]


def test_h08_docente_ve_solo_sus_grupos(client, mate):
    grupos = client.get("/grupos", headers=mate["h"]).json()
    assert {g["id"] for g in grupos} == mate["grupos"]
    assert client.get("/grupos/count", headers=mate["h"]).json()["count"] == len(mate["grupos"])


def test_h08_docente_no_ve_estudiantes_de_otro_grupo(client, mate, db):
    ajeno = db.execute(text("SELECT id FROM grupos WHERE id NOT IN ({}) LIMIT 1".format(",".join(map(str, mate["grupos"]))))).scalar()
    assert client.get(f"/estudiantes?grupo_id={ajeno}", headers=mate["h"]).status_code == 403
    estudiantes = client.get("/estudiantes", headers=mate["h"]).json()
    assert estudiantes and all(e["grupo_id"] in mate["grupos"] for e in estudiantes)


def test_h08_calificaciones_solo_de_su_materia_y_sus_grupos(client, mate, db):
    cals = client.get("/calificaciones", headers=mate["h"]).json()
    assert cals, "El docente de Matemáticas debe ver sus notas"
    grupo = {r[0]: r[1] for r in db.execute(text("SELECT id, grupo_id FROM estudiantes"))}
    assert all(c["materia_id"] in mate["materias"] for c in cals)
    assert all(grupo[c["estudiante_id"]] in mate["grupos"] for c in cals)
    # No se mezclan materias: el docente de una sola materia solo recibe notas de esa materia.
    assert {c["materia_nombre"] for c in cals} == {"Matemáticas"}


def test_h08_no_consulta_notas_de_actividad_ajena(client, mate, db):
    ajeno = _ajeno(db, mate)
    act = db.execute(text("SELECT id FROM actividades WHERE materia_id = :m AND grupo_id = :g LIMIT 1"), {"m": ajeno.materia_id, "g": ajeno.grupo_id}).scalar()
    assert act is not None
    assert client.get(f"/calificaciones?actividad_id={act}", headers=mate["h"]).status_code == 403
    assert client.get(f"/actividades?grupo_id={ajeno.grupo_id}", headers=mate["h"]).status_code in (200, 403)
    visibles = client.get("/actividades", headers=mate["h"]).json()
    assert all((a["materia_id"], a["grupo_id"]) != (ajeno.materia_id, ajeno.grupo_id) for a in visibles)


def test_h08_alertas_solo_de_sus_estudiantes_y_su_materia(client, mate, db, admin_headers):
    todas = client.get("/alertas", headers=admin_headers).json()
    mias = client.get("/alertas", headers=mate["h"]).json()
    assert len(mias) < len(todas)
    grupo = {r[0]: r[1] for r in db.execute(text("SELECT id, grupo_id FROM estudiantes"))}
    otras_materias = [r[0] for r in db.execute(text("SELECT nombre FROM materias WHERE nombre <> 'Matemáticas'"))]
    for a in mias:
        assert grupo[a["estudiante_id"]] in mate["grupos"]
        assert not any(m.lower() in a["mensaje"].lower() for m in otras_materias), a["mensaje"]
    activas = sum(1 for a in mias if a["estado"] == "active")
    assert client.get("/alertas/activas/count", headers=mate["h"]).json()["count"] == activas


def test_h08_observaciones_solo_de_sus_grupos(client, mate, db):
    grupo = {r[0]: r[1] for r in db.execute(text("SELECT id, grupo_id FROM estudiantes"))}
    obs = client.get("/observaciones", headers=mate["h"]).json()
    assert all(grupo[o["estudiante_id"]] in mate["grupos"] for o in obs)


def test_h08_admin_conserva_acceso_general(client, admin_headers, db):
    assert len(client.get("/grupos", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM grupos")).scalar()
    assert len(client.get("/materias", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM materias")).scalar()
    assert len(client.get("/estudiantes", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM estudiantes")).scalar()
    assert len(client.get("/calificaciones", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM calificaciones")).scalar()
    assert len(client.get("/alertas", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM alertas")).scalar()


# ============================================================ H-08: escrituras

def test_h08_califica_dentro_de_su_asignacion(client, mate, db):
    est = _estudiante_en(db, mate["grupos"])
    materia = next(iter(mate["materias"]))
    r = client.post("/calificaciones", json={"estudiante_id": est, "materia_id": materia, "nota": 4.5, "periodo": 1}, headers=mate["h"])
    assert r.status_code == 201


def test_h08_no_califica_otra_materia(client, mate, db):
    est = _estudiante_en(db, mate["grupos"])
    otra = db.execute(text("SELECT id FROM materias WHERE id NOT IN ({}) LIMIT 1".format(",".join(map(str, mate["materias"]))))).scalar()
    antes = db.execute(text("SELECT COUNT(*) FROM calificaciones")).scalar()
    r = client.post("/calificaciones", json={"estudiante_id": est, "materia_id": otra, "nota": 1.0, "periodo": 1}, headers=mate["h"])
    assert r.status_code == 403
    assert db.execute(text("SELECT COUNT(*) FROM calificaciones")).scalar() == antes


def test_h08_no_califica_estudiante_de_otro_grupo(client, mate, db):
    est = _estudiante_en(db, mate["grupos"], dentro=False)
    materia = next(iter(mate["materias"]))
    r = client.post("/calificaciones", json={"estudiante_id": est, "materia_id": materia, "nota": 1.0, "periodo": 1}, headers=mate["h"])
    assert r.status_code == 403


def test_h08_no_modifica_ni_borra_notas_ajenas(client, mate, db):
    ajeno = _ajeno(db, mate)
    cal = db.execute(text("""
        SELECT c.id FROM calificaciones c JOIN estudiantes e ON e.id = c.estudiante_id
        WHERE c.materia_id = :m AND e.grupo_id = :g LIMIT 1
    """), {"m": ajeno.materia_id, "g": ajeno.grupo_id}).scalar()
    assert cal is not None
    assert client.put(f"/calificaciones/{cal}", json={"estudiante_id": 1, "materia_id": ajeno.materia_id, "nota": 5.0}, headers=mate["h"]).status_code == 403
    assert client.delete(f"/calificaciones/{cal}", headers=mate["h"]).status_code == 403
    assert db.execute(text("SELECT COUNT(*) FROM calificaciones WHERE id = :i"), {"i": cal}).scalar() == 1


def test_h08_actividades_solo_en_sus_asignaciones(client, mate, db):
    ajeno = _ajeno(db, mate)
    datos = {"materia_id": ajeno.materia_id, "grupo_id": ajeno.grupo_id, "titulo": "Actividad no permitida", "tipo": "tarea"}
    assert client.post("/actividades", json=datos, headers=mate["h"]).status_code == 403
    act = db.execute(text("SELECT id FROM actividades WHERE materia_id = :m AND grupo_id = :g LIMIT 1"), {"m": ajeno.materia_id, "g": ajeno.grupo_id}).scalar()
    assert client.put(f"/actividades/{act}", json={**datos, "titulo": "Cambio"}, headers=mate["h"]).status_code == 403
    assert client.delete(f"/actividades/{act}", headers=mate["h"]).status_code == 403
    # Dentro de su asignación sí puede crear.
    propia = db.execute(text("SELECT materia_id, grupo_id FROM asignaciones WHERE docente_id = :u LIMIT 1"), {"u": mate["id"]}).first()
    ok = client.post("/actividades", json={"materia_id": propia.materia_id, "grupo_id": propia.grupo_id, "titulo": "Taller propio", "tipo": "tarea"}, headers=mate["h"])
    assert ok.status_code == 201


def test_h08_alertas_y_observaciones_ajenas_no_se_modifican(client, mate, db):
    lista = ",".join(map(str, mate["grupos"]))
    alerta = db.execute(text(f"SELECT a.id FROM alertas a JOIN estudiantes e ON e.id = a.estudiante_id WHERE e.grupo_id NOT IN ({lista}) LIMIT 1")).scalar()
    assert client.put(f"/alertas/{alerta}/estado", json={"estado": "resolved"}, headers=mate["h"]).status_code == 403
    est = _estudiante_en(db, mate["grupos"], dentro=False)
    assert client.post("/observaciones", json={"estudiante_id": est, "descripcion": "No permitida"}, headers=mate["h"]).status_code == 403
    assert client.post("/alertas", json={"estudiante_id": est, "tipo": "Seguimiento", "mensaje": "No permitida"}, headers=mate["h"]).status_code == 403


def test_h08_catalogo_y_asignaciones_solo_administrador(client, mate, admin_headers, db):
    for metodo, ruta, cuerpo in [
        ("post", "/grupos", {"nombre": "Grupo X"}),
        ("post", "/materias", {"nombre": "Materia X"}),
        ("post", "/asignaciones", {"docente_id": mate["id"], "materia_id": 1, "grupo_id": 1}),
        ("delete", "/estudiantes/1", None),
    ]:
        r = getattr(client, metodo)(ruta, headers=mate["h"], **({"json": cuerpo} if cuerpo else {}))
        assert r.status_code == 403, (metodo, ruta, r.status_code)
    assert client.get("/catalogo/docentes", headers=mate["h"]).status_code == 403
    # El docente solo ve sus propias asignaciones; el administrador, todas.
    propias = client.get("/asignaciones", headers=mate["h"]).json()
    assert propias and all(a["docente_id"] == mate["id"] for a in propias)
    assert len(client.get("/asignaciones", headers=admin_headers).json()) == db.execute(text("SELECT COUNT(*) FROM asignaciones")).scalar()
    assert client.post("/materias", json={"nombre": "Materia de prueba"}, headers=admin_headers).status_code == 201
