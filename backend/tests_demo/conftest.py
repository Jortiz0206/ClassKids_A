"""Pruebas de la base de DEMOSTRACIÓN generada (classkids_demo).

Se ejecutan aparte de la suite principal, desde backend/:
    python -m pytest tests_demo

Cargan backend/.env.demo y aplican las mismas protecciones que el generador: si la
configuración no apunta a classkids_demo, se detienen antes de conectarse. Cada prueba corre
dentro de una transacción que se deshace, así que no dejan datos en la demostración.
"""
import os
import sys

import pytest

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)

from demo.generar_demo import cargar_entorno, validar_servidor  # noqa: E402

cargar_entorno()  # antes de importar main/database: fija DATABASE_URL a classkids_demo

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

import database  # noqa: E402
import main  # noqa: E402
from database import get_db  # noqa: E402


def pytest_sessionstart(session):
    with database.engine.connect() as conn:
        validar_servidor(conn)


@pytest.fixture()
def db():
    connection = database.engine.connect()
    outer = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    main.app.dependency_overrides[get_db] = lambda: session
    try:
        yield session
    finally:
        main.app.dependency_overrides.pop(get_db, None)
        session.close()
        outer.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    return TestClient(main.app)


def _entrar(client, email, password):
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture()
def entrar(client):
    def _f(email, rol="docente"):
        clave = os.environ["DEMO_ADMIN_PASSWORD" if rol == "admin" else "DEMO_DOCENTE_PASSWORD"]
        return _entrar(client, email, clave)
    return _f
