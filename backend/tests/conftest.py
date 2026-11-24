"""Configuración de pytest para ClassKids.

SALVAGUARDA: estas pruebas solo pueden ejecutarse contra la base de PRUEBAS
`classkids_test` (puerto 5433, docker-compose.test.yml). Si la URL de conexión apunta a
cualquier otra base —en particular a la base real `classkids`— la ejecución se detiene
antes de importar la aplicación.

Cada prueba se ejecuta dentro de una transacción que se deshace al terminar, de modo que
ni siquiera la base de pruebas queda modificada.
"""
import os
import sys
from urllib.parse import urlsplit

import pytest

TEST_DB_URL = "postgresql+psycopg://postgres:postgrespassword@127.0.0.1:5433/classkids_test"
os.environ.setdefault("DATABASE_URL", TEST_DB_URL)
os.environ.setdefault("JWT_SECRET", "clave-solo-para-pruebas-classkids")
os.environ.setdefault("ENVIRONMENT", "development")

_url = urlsplit(os.environ["DATABASE_URL"].replace("postgresql+psycopg", "postgresql"))
if _url.path.lstrip("/") != "classkids_test" or _url.port != 5433:
    pytest.exit(
        f"SALVAGUARDA: las pruebas solo se ejecutan contra classkids_test en el puerto 5433. "
        f"URL recibida: base '{_url.path.lstrip('/')}', puerto {_url.port}. Ejecución detenida.",
        returncode=2,
    )

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.exc import OperationalError  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

import main  # noqa: E402
from database import engine, get_db  # noqa: E402


def _verificar_base_de_pruebas():
    # Si la base de pruebas no responde (por ejemplo, tras reiniciar el equipo el contenedor
    # quedó detenido), se detiene con un mensaje claro en lugar de una traza de SQLAlchemy.
    try:
        with engine.connect() as conn:
            nombre = conn.execute(text("SELECT current_database()")).scalar()
    except OperationalError as error:
        pytest.exit(
            "La base de pruebas classkids_test (127.0.0.1:5433) no responde. Iníciela desde backend/ con "
            "`docker compose -f docker-compose.test.yml up -d` y vuelva a ejecutar pytest. "
            f"Detalle: {type(error.orig).__name__ if getattr(error, 'orig', None) else error}",
            returncode=3,
        )
    if nombre != "classkids_test":
        pytest.exit(f"SALVAGUARDA: la conexión llegó a la base '{nombre}', no a classkids_test.", returncode=2)


def pytest_sessionstart(session):
    """Antes de ejecutar cualquier prueba: confirma que la conexión llega a classkids_test."""
    _verificar_base_de_pruebas()


@pytest.fixture()
def db():
    """Sesión dentro de una transacción externa que se deshace al final de la prueba.
    Los commit() de los endpoints solo liberan puntos de guardado internos."""
    connection = engine.connect()
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


def _token(db, email):
    row = db.execute(text("""
        SELECT u.id, r.nombre FROM usuarios u JOIN user_roles r ON r.id = u.rol_id WHERE u.email = :e
    """), {"e": email}).first()
    role = "admin" if row.nombre == "Administrador" else "docente"
    return main.create_access_token(row.id, role)


@pytest.fixture()
def docente_headers(db):
    return {"Authorization": f"Bearer {_token(db, 'docente@classkids.local')}"}


@pytest.fixture()
def admin_headers(db):
    return {"Authorization": f"Bearer {_token(db, 'admin@classkids.local')}"}
