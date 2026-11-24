"""Pruebas de los hallazgos resueltos en el cierre (24/11/2026): H-05, H-09 y H-17.

Se ejecutan contra classkids_test dentro de una transacción que se deshace (conftest.py).
"""
import os
import subprocess
import sys

from sqlalchemy import text

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ============================================================ H-05: validación de entradas

def test_h05_nota_fuera_de_escala_responde_422(client, admin_headers):
    r = client.post("/calificaciones", json={"estudiante_id": 1, "materia_id": 1, "nota": 7}, headers=admin_headers)
    assert r.status_code == 422
    assert "nota" in str(r.json()["detail"])


def test_h05_estudiante_inexistente_responde_422_con_causa(client, admin_headers):
    r = client.post("/calificaciones", json={"estudiante_id": 999999, "materia_id": 1, "nota": 4.0}, headers=admin_headers)
    assert r.status_code == 422
    assert "no existe" in r.json()["detail"]


def test_h05_documento_duplicado_responde_409(client, admin_headers, db):
    documento = db.execute(text("SELECT documento FROM estudiantes ORDER BY id LIMIT 1")).scalar()
    r = client.post("/estudiantes", json={"documento": documento, "nombre": "Prueba", "apellido": "Duplicada", "grupo_id": 1}, headers=admin_headers)
    assert r.status_code == 409
    assert "Ya existe" in r.json()["detail"]


def test_h05_textos_vacios_fechas_y_roles_invalidos_responden_422(client, admin_headers):
    casos = [
        ("post", "/grupos", {"nombre": ""}),
        ("post", "/estudiantes", {"documento": "X1", "nombre": "", "apellido": "Pérez", "grupo_id": 1}),
        ("post", "/actividades", {"materia_id": 1, "grupo_id": 1, "titulo": "Taller", "fecha_entrega": "31-02-2026"}),
        ("post", "/usuarios/invitar", {"email": "no-es-un-correo", "role": "docente"}),
        ("put", "/usuarios/2/rol", {"role": "superadmin"}),
    ]
    for metodo, ruta, cuerpo in casos:
        r = getattr(client, metodo)(ruta, json=cuerpo, headers=admin_headers)
        assert r.status_code == 422, (ruta, r.status_code, r.text)


def test_h05_datos_validos_siguen_funcionando(client, admin_headers):
    r = client.post("/actividades", json={"materia_id": 1, "grupo_id": 1, "titulo": "Taller válido", "fecha_entrega": "2026-12-01"}, headers=admin_headers)
    assert r.status_code == 201
    assert str(r.json()["fecha_entrega"]).startswith("2026-12-01")


# ============================================================ H-09: la cuenta se revalida en cada petición

def test_h09_cuenta_desactivada_pierde_el_acceso_de_inmediato(client, docente_headers, db):
    assert client.get("/grupos", headers=docente_headers).status_code == 200
    db.execute(text("UPDATE usuarios SET activo = FALSE WHERE email = 'docente@classkids.local'"))
    r = client.get("/grupos", headers=docente_headers)
    assert r.status_code == 401
    assert "no está activa" in r.json()["detail"]


def test_h09_cambio_de_rol_invalida_el_token_anterior(client, docente_headers, db):
    db.execute(text("""
        UPDATE usuarios SET rol_id = (SELECT id FROM user_roles WHERE nombre = 'Administrador')
        WHERE email = 'docente@classkids.local'
    """))
    r = client.get("/grupos", headers=docente_headers)
    assert r.status_code == 401
    assert "rol cambió" in r.json()["detail"]


def test_h09_cuenta_activa_con_su_rol_sigue_funcionando(client, admin_headers):
    assert client.get("/usuarios", headers=admin_headers).status_code == 200


# ============================================================ H-17: DATABASE_URL desde el archivo .env

def test_h17_database_url_del_env_se_aplica(tmp_path):
    archivo = tmp_path / ".env"
    archivo.write_text("DATABASE_URL=postgresql+psycopg://usuario:clave@127.0.0.1:5999/desde_env\n", encoding="utf-8")
    entorno = {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}
    entorno["CLASSKIDS_ENV_FILE"] = str(archivo)
    salida = subprocess.run(
        [sys.executable, "-c", "import database; print(database.DATABASE_URL)"],
        cwd=BACKEND, env=entorno, capture_output=True, text=True, timeout=60,
    )
    assert salida.returncode == 0, salida.stderr
    assert salida.stdout.strip().endswith("/desde_env")


def test_h17_una_variable_del_entorno_tiene_prioridad_sobre_el_env(tmp_path):
    archivo = tmp_path / ".env"
    archivo.write_text("DATABASE_URL=postgresql+psycopg://u:c@127.0.0.1:5999/desde_env\n", encoding="utf-8")
    entorno = dict(os.environ, CLASSKIDS_ENV_FILE=str(archivo), DATABASE_URL="postgresql+psycopg://u:c@127.0.0.1:5998/desde_variable")
    salida = subprocess.run(
        [sys.executable, "-c", "import database; print(database.DATABASE_URL)"],
        cwd=BACKEND, env=entorno, capture_output=True, text=True, timeout=60,
    )
    assert salida.stdout.strip().endswith("/desde_variable")


# ============================================================ CORS en las respuestas del middleware

def test_401_y_403_del_middleware_llevan_cabeceras_cors(client, docente_headers):
    """Sin estas cabeceras el navegador bloquea la respuesta y la interfaz no puede mostrar el motivo
    (H-09: cerrar la sesión cuando la cuenta cambió)."""
    import main
    permitido = main.ALLOWED_ORIGINS[0]  # un origen de la lista configurada (CORS_ORIGINS o el valor por defecto)
    origen = {"Origin": permitido}
    sin_token = client.get("/grupos", headers=origen)
    assert sin_token.status_code == 401
    assert sin_token.headers.get("access-control-allow-origin") == permitido
    no_admin = client.get("/usuarios", headers={**origen, **docente_headers})
    assert no_admin.status_code == 403
    assert no_admin.headers.get("access-control-allow-origin") == permitido
