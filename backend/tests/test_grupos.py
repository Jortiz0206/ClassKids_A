"""H-27: el año lectivo debe llamarse igual al enviarlo y al recibirlo.

Crear y modificar grupos es tarea del administrador (H-08); por eso las escrituras usan su sesión."""
from sqlalchemy import text


def _ano(db, grupo_id):
    return db.execute(text("SELECT ano_lectivo FROM grupos WHERE id = :id"), {"id": grupo_id}).scalar()


def test_get_devuelve_ano_lectivo(client, docente_headers):
    grupo = client.get("/grupos", headers=docente_headers).json()[0]
    assert "ano_lectivo" in grupo


def test_put_con_el_objeto_recibido_conserva_el_ano(client, admin_headers, db):
    """El caso del hallazgo: reenviar lo que devolvió GET ya no reinicia el año a 2026."""
    grupo = client.get("/grupos", headers=admin_headers).json()[0]
    grupo["ano_lectivo"] = 2027
    r = client.put(f"/grupos/{grupo['id']}", json=grupo, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["ano_lectivo"] == 2027
    assert _ano(db, grupo["id"]) == 2027


def test_put_con_el_nombre_anterior_sigue_funcionando(client, admin_headers, db):
    r = client.put("/grupos/1", json={"nombre": "Grado 1A", "grado": "1°", "turno": "Matutino", "año_lectivo": 2028}, headers=admin_headers)
    assert r.status_code == 200
    assert _ano(db, 1) == 2028


def test_post_sin_ano_usa_2026(client, admin_headers):
    r = client.post("/grupos", json={"nombre": "Grupo nuevo", "grado": "2°", "turno": "Vespertino"}, headers=admin_headers)
    assert r.status_code == 201
    assert r.json()["ano_lectivo"] == 2026
