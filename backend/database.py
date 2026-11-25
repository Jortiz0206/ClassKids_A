import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

# H-17: el archivo .env se carga AQUÍ, antes de leer DATABASE_URL. Antes, main.py importaba
# este módulo antes de llamar a load_dotenv(), y la DATABASE_URL del .env no tenía efecto.
# Las variables ya definidas en el entorno tienen prioridad (load_dotenv no las sobrescribe).
load_dotenv(os.getenv("CLASSKIDS_ENV_FILE") or os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg://postgres:postgrespassword@localhost:5432/classkids"
)

# Entorno explícito. CLASSKIDS_ENTORNO = real | test | demo obliga a que DATABASE_URL apunte a
# la base de ese entorno; si no coincide, el backend no arranca. Así una configuración de
# demostración nunca termina escribiendo en la base real (ni al revés).
BASE_POR_ENTORNO = {"real": "classkids", "test": "classkids_test", "demo": "classkids_demo"}
ENTORNO = os.getenv("CLASSKIDS_ENTORNO", "").strip().lower()
NOMBRE_BASE = make_url(DATABASE_URL).database
if ENTORNO and ENTORNO not in BASE_POR_ENTORNO:
    raise RuntimeError(f"CLASSKIDS_ENTORNO='{ENTORNO}' no es válido. Usa: {', '.join(BASE_POR_ENTORNO)}.")
if ENTORNO and NOMBRE_BASE != BASE_POR_ENTORNO[ENTORNO]:
    raise RuntimeError(
        f"CLASSKIDS_ENTORNO={ENTORNO} exige la base '{BASE_POR_ENTORNO[ENTORNO]}', "
        f"pero DATABASE_URL apunta a '{NOMBRE_BASE}'. Revisa el archivo .env del entorno."
    )

# pool_pre_ping: comprueba cada conexión antes de usarla. Sin esto, tras reiniciar PostgreSQL
# la primera petición recibía una conexión muerta del pool y respondía 500.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()