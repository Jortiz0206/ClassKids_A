import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

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