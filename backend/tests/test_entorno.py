"""Comprueba que el entorno de pruebas está aislado de la base real."""
from sqlalchemy import text


def test_conexion_es_la_base_de_pruebas(db):
    assert db.execute(text("SELECT current_database()")).scalar() == "classkids_test"


def test_base_de_pruebas_tiene_los_datos_demo(db):
    assert db.execute(text("SELECT COUNT(*) FROM estudiantes")).scalar() == 200
    assert db.execute(text("SELECT COUNT(*) FROM calificaciones")).scalar() == 215
    assert db.execute(text("SELECT COUNT(*) FROM alertas")).scalar() == 32


def test_las_escrituras_de_una_prueba_se_deshacen(client, admin_headers, db):
    antes = db.execute(text("SELECT COUNT(*) FROM grupos")).scalar()
    r = client.post("/grupos", json={"nombre": "Grupo temporal", "grado": "1°", "turno": "Matutino"}, headers=admin_headers)
    assert r.status_code == 201
    assert db.execute(text("SELECT COUNT(*) FROM grupos")).scalar() == antes + 1
    # Al terminar, la fixture `db` deshace la transacción (lo verifica la prueba siguiente).


def test_la_escritura_anterior_no_quedo_guardada(db):
    assert db.execute(text("SELECT COUNT(*) FROM grupos WHERE nombre = 'Grupo temporal'")).scalar() == 0
