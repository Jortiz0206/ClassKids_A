import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# H-17: el archivo .env se carga AQUÍ, antes de leer DATABASE_URL. Antes, main.py importaba
# este módulo antes de llamar a load_dotenv(), y la DATABASE_URL del .env no tenía efecto.
# Las variables ya definidas en el entorno tienen prioridad (load_dotenv no las sobrescribe).
load_dotenv(os.getenv("CLASSKIDS_ENV_FILE") or os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg://postgres:postgrespassword@localhost:5432/classkids"
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