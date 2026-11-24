from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field, AliasChoices
from typing import NamedTuple, Optional
from secrets import token_urlsafe
from datetime import datetime, timedelta
from urllib.parse import urlsplit
import os
import smtplib
from email.message import EmailMessage
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from database import get_db

load_dotenv()

app = FastAPI(
    title="ClassKids API - Control Académico",
    description="Backend desacoplado con CRUDs completos en PostgreSQL local",
    version="2.1.0"
)

# El frontend (Vite) corre por defecto en el puerto 8080 (ver frontend/vite.config.ts).
# Se incluye también 5173 (puerto por defecto de Vite) por si se ejecuta sin ese config.
# Esta misma lista se reutiliza para validar `redirect_to` en /auth/forgot-password
# (evita que alguien use ese campo para apuntar el enlace de recuperación a un dominio externo).
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS",
    "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173",
).split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================================================================
# 📋 MODELOS PYDANTIC
# =================================================================

class GrupoSchema(BaseModel):
    nombre: str
    grado: Optional[str] = "1°"
    turno: Optional[str] = "Matutino"
    # H-27: la columna y la respuesta de GET /grupos usan `ano_lectivo`. Se acepta también
    # el nombre anterior `año_lectivo` para no romper clientes existentes.
    ano_lectivo: Optional[int] = Field(default=2026, validation_alias=AliasChoices("ano_lectivo", "año_lectivo"))

class EstudianteSchema(BaseModel):
    documento: str
    nombre: str
    apellido: str
    grupo_id: Optional[int] = None
    activo: Optional[bool] = True

class MateriaSchema(BaseModel):
    nombre: str
    codigo: Optional[str] = None

class ActividadSchema(BaseModel):
    materia_id: int
    grupo_id: int
    titulo: str
    tipo: str = "tarea"
    descripcion: Optional[str] = None
    fecha_entrega: Optional[str] = None

class CalificacionSchema(BaseModel):
    estudiante_id: int
    materia_id: int
    actividad_id: Optional[int] = None
    nota: float
    periodo: Optional[int] = 1
    observacion: Optional[str] = None
    # Estado «Entregado» (H-31). Se guarda en calificaciones.entregado solo si la
    # migración 001 está aplicada en la base; si no, se acepta y se ignora.
    entregado: Optional[bool] = None

class ObservacionSchema(BaseModel):
    estudiante_id: int
    tipo: Optional[str] = "Convivencial"
    descripcion: str

class AlertaSchema(BaseModel):
    estudiante_id: int
    tipo: str
    mensaje: str
    estado: Optional[str] = "active"

class LoginSchema(BaseModel):
    email: str
    password: str

class ForgotPasswordSchema(BaseModel):
    email: str
    redirect_to: Optional[str] = None

class ResetPasswordSchema(BaseModel):
    password: str
    token: Optional[str] = None

class InvitationSchema(BaseModel):
    email: str
    role: str = "docente"

class AcceptInvitationSchema(BaseModel):
    password: str
    nombre: str
    apellido: Optional[str] = None

class RoleUpdateSchema(BaseModel):
    role: str

class AlertStatusSchema(BaseModel):
    estado: str

class AsignacionSchema(BaseModel):
    docente_id: int
    materia_id: int
    grupo_id: int


def normalize_alert_status(value: str) -> str:
    statuses = {
        "Pendiente": "active",
        "Activa": "active",
        "active": "active",
        "En revisión": "reviewed",
        "Revisada": "reviewed",
        "reviewed": "reviewed",
        "Resuelta": "resolved",
        "resolved": "resolved",
    }
    if value not in statuses:
        raise HTTPException(status_code=422, detail="Estado de alerta inválido")
    return statuses[value]


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    # Nunca usar un secreto público y conocido como "change-this-secret-in-production":
    # cualquiera podría forjar tokens (incluido rol admin) leyendo el código fuente.
    # En dev generamos uno aleatorio por proceso; en producción, definir JWT_SECRET es obligatorio.
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        raise RuntimeError("JWT_SECRET no está definido. Configúralo como variable de entorno antes de arrancar en producción.")
    JWT_SECRET = token_urlsafe(48)
    # Sin emoji: en Windows, cuando stdout no usa UTF-8 (consola con code page
    # cp1252, o salida redirigida a archivo/pipe), imprimir un emoji aquí
    # provoca un UnicodeEncodeError que tumba el backend al arrancar.
    print("[AVISO] JWT_SECRET no definido: se genero uno aleatorio solo para esta sesion de desarrollo. "
          "Los tokens emitidos no seran validos tras reiniciar el servidor. Define JWT_SECRET en tu .env para produccion.")

JWT_ALGORITHM = "HS256"
PRIVATE_PREFIXES = ("/usuarios", "/catalogo", "/grupos", "/estudiantes", "/materias", "/actividades", "/calificaciones", "/observaciones", "/alertas", "/roles", "/asignaciones", "/docentes", "/admins")
ADMIN_PREFIXES = ("/usuarios", "/docentes", "/admins", "/catalogo")


def create_access_token(user_id: int, role: str) -> str:
    expires = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode({"sub": str(user_id), "role": role, "exp": expires}, JWT_SECRET, algorithm=JWT_ALGORITHM)


@app.middleware("http")
async def require_authentication(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    if request.url.path.startswith(PRIVATE_PREFIXES):
        authorization = request.headers.get("Authorization", "")
        if not authorization.startswith("Bearer "):
            return JSONResponse({"detail": "Autenticación requerida"}, status_code=401)
        try:
            claims = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if request.url.path.startswith(ADMIN_PREFIXES) and claims.get("role") != "admin":
                return JSONResponse({"detail": "Permisos insuficientes"}, status_code=403)
            # Identidad autenticada para los permisos por asignación (H-08) y la autoprotección (H-18).
            request.state.usuario = Sesion(id=int(claims["sub"]), rol=str(claims.get("role", "docente")))
        except (JWTError, ValueError):
            return JSONResponse({"detail": "Token inválido o expirado"}, status_code=401)
    return await call_next(request)

RESET_TOKEN_TTL_MINUTES = 30


# =================================================================
# 🔐 PERMISOS POR ROL Y POR ASIGNACIÓN (H-08)
# =================================================================
# El administrador ve y gestiona todo. El docente solo trabaja con sus asignaciones
# (tabla `asignaciones`: docente + materia + grupo):
#   - grupos y estudiantes: los grupos donde tiene al menos una asignación;
#   - materias: las que tiene asignadas;
#   - actividades y calificaciones: solo las de una materia en un grupo que tiene asignados;
#   - observaciones: las de los estudiantes de sus grupos;
#   - alertas: las de los estudiantes de sus grupos. La tabla `alertas` no guarda la materia;
#     cuando el mensaje nombra una materia, solo la ve el docente de esa materia en ese grupo.
# Toda comprobación usa el id del token, nunca un id enviado por el cliente.

class Sesion(NamedTuple):
    id: int
    rol: str


def sesion_actual(request: Request) -> Sesion:
    usuario = getattr(request.state, "usuario", None)
    if usuario is None:
        raise HTTPException(status_code=401, detail="Autenticación requerida")
    return usuario


def solo_admin(yo: Sesion) -> None:
    if yo.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo el administrador puede realizar esta acción")


def sin_permiso(detalle: str = "No tienes asignado este grupo o esta materia"):
    return HTTPException(status_code=403, detail=detalle)


# Fragmentos SQL fijos (sin datos del usuario); el id del docente siempre va como :uid.
_GRUPOS_DEL_DOCENTE = "SELECT grupo_id FROM asignaciones WHERE docente_id = :uid"
_MATERIAS_DEL_DOCENTE = "SELECT materia_id FROM asignaciones WHERE docente_id = :uid"
_ASIGNADA = "EXISTS (SELECT 1 FROM asignaciones s WHERE s.docente_id = :uid AND s.materia_id = {materia} AND s.grupo_id = {grupo})"
# Alerta visible: el estudiante está en un grupo del docente y, si el mensaje nombra una
# materia, es una de las que ese docente tiene asignadas en ese grupo.
_ALERTA_VISIBLE = """EXISTS (
    SELECT 1 FROM asignaciones s JOIN materias m ON m.id = s.materia_id
    WHERE s.docente_id = :uid AND s.grupo_id = e.grupo_id
      AND (position(lower(m.nombre) in lower(a.mensaje)) > 0
           OR NOT EXISTS (SELECT 1 FROM materias m2 WHERE position(lower(m2.nombre) in lower(a.mensaje)) > 0))
)"""


def tiene_grupo(db: Session, yo: Sesion, grupo_id) -> bool:
    if yo.rol == "admin":
        return True
    if grupo_id is None:
        return False
    return bool(db.execute(text(f"SELECT :g IN ({_GRUPOS_DEL_DOCENTE})"), {"uid": yo.id, "g": grupo_id}).scalar())


def tiene_asignacion(db: Session, yo: Sesion, materia_id, grupo_id) -> bool:
    if yo.rol == "admin":
        return True
    return bool(db.execute(text("SELECT " + _ASIGNADA.format(materia=":m", grupo=":g")), {"uid": yo.id, "m": materia_id, "g": grupo_id}).scalar())


def grupo_de_estudiante(db: Session, estudiante_id):
    return db.execute(text("SELECT grupo_id FROM estudiantes WHERE id = :id"), {"id": estudiante_id}).scalar()


def exigir_estudiante(db: Session, yo: Sesion, estudiante_id) -> None:
    if yo.rol == "admin":
        return
    if not tiene_grupo(db, yo, grupo_de_estudiante(db, estudiante_id)):
        raise sin_permiso("Este estudiante no pertenece a tus grupos")


def exigir_calificar(db: Session, yo: Sesion, estudiante_id, materia_id, actividad_id=None) -> None:
    """El docente solo califica a estudiantes de un grupo donde tiene asignada esa materia."""
    if yo.rol == "admin":
        return
    if not tiene_asignacion(db, yo, materia_id, grupo_de_estudiante(db, estudiante_id)):
        raise sin_permiso("No tienes asignada esta materia en el grupo del estudiante")
    if actividad_id is not None:
        act = db.execute(text("SELECT materia_id, grupo_id FROM actividades WHERE id = :id"), {"id": actividad_id}).first()
        if not act or not tiene_asignacion(db, yo, act.materia_id, act.grupo_id):
            raise sin_permiso("La actividad no pertenece a tus asignaciones")


# =================================================================
# 🏠 INICIO
# =================================================================

@app.get("/", tags=["Inicio"])
def inicio():
    return {"proyecto": "ClassKids", "estado": "Operativo - PostgreSQL Docker", "autor": "Johanna Ortiz, Jan Llanos y María Alejandra Guio"}


# =================================================================
# AUTENTICACIÓN
# =================================================================

@app.post("/auth/login", tags=["Autenticación"])
def iniciar_sesion(credentials: LoginSchema, db: Session = Depends(get_db)):
    query = text("""
        SELECT u.id, u.email, u.nombre, u.apellido, u.password_hash, u.activo, r.nombre AS rol
        FROM usuarios u LEFT JOIN user_roles r ON r.id = u.rol_id
        WHERE lower(u.email) = lower(:email)
    """)
    user = db.execute(query, {"email": credentials.email.strip()}).fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if not user.activo:
        raise HTTPException(status_code=403, detail="Esta cuenta se encuentra deshabilitada. Contacte al administrador.")

    try:
        password_valid = pwd_context.verify(credentials.password, user.password_hash)
    except Exception:
        password_valid = False

    if not password_valid:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    db.execute(text("UPDATE usuarios SET last_sign_in_at = CURRENT_TIMESTAMP WHERE id = :id"), {"id": user.id})
    db.commit()

    role_name = (user.rol or "Docente").lower()
    role = "admin" if role_name == "administrador" else "docente"
    return {
        "access_token": create_access_token(user.id, role),
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "nombre": user.nombre, "apellido": user.apellido, "rol": role},
    }

def enviar_reset_por_correo(email: str, reset_url: str) -> bool:
    host = os.getenv("SMTP_HOST")
    if not host:
        return False
    message = EmailMessage()
    message["Subject"] = "Recuperación de contraseña - ClassKids"
    message["From"] = os.getenv("SMTP_FROM", "no-reply@classkids.local")
    message["To"] = email
    message.set_content(f"Solicitaste restablecer tu contraseña. Usa este enlace (vence en {RESET_TOKEN_TTL_MINUTES} minutos): {reset_url}")
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=10) as smtp:
        smtp.starttls()
        smtp.login(os.getenv("SMTP_USER", ""), os.getenv("SMTP_PASSWORD", ""))
        smtp.send_message(message)
    return True


@app.post("/auth/forgot-password", tags=["Autenticación"])
def solicitar_recuperacion(data: ForgotPasswordSchema, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.execute(text("SELECT email FROM usuarios WHERE lower(email) = :email AND activo = TRUE"), {"email": email}).first()

    email_sent = False
    if user:
        email = user.email
        reset_token = token_urlsafe(24)
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
        db.execute(text("""
            INSERT INTO password_reset_tokens (email, token, expires_at)
            VALUES (:email, :token, :expires_at)
        """), {"email": email, "token": reset_token, "expires_at": expires_at})
        db.commit()
        # `redirect_to` lo envía el cliente: solo se acepta si su origen (esquema +
        # host + puerto, comparado de forma exacta, no como prefijo de texto) es uno
        # de ALLOWED_ORIGINS. Si no, se ignora y se usa FRONTEND_URL. Esto evita que
        # el enlace de recuperación termine apuntando a un dominio externo — incluido
        # un dominio que simplemente empiece con el texto de un origen permitido
        # (ej. "http://localhost:8080.atacante.com").
        frontend_base = os.getenv('FRONTEND_URL', 'http://127.0.0.1:8080')
        if data.redirect_to:
            candidate = urlsplit(data.redirect_to)
            candidate_origin = f"{candidate.scheme}://{candidate.netloc}"
            if candidate_origin in ALLOWED_ORIGINS:
                frontend_base = data.redirect_to
        reset_url = f"{frontend_base.rstrip('/')}?token={reset_token}"
        try:
            email_sent = enviar_reset_por_correo(email, reset_url)
        except Exception:
            # No exponemos detalles del error SMTP al cliente; el token ya quedó
            # registrado y puede reintentarse o revisarse por soporte/logs.
            email_sent = False

    # Respuesta siempre genérica: nunca confirmamos si el correo existe,
    # y NUNCA devolvemos el token en la respuesta HTTP (solo viaja por correo).
    return {"mensaje": "Si el correo existe, se ha enviado un enlace de recuperación", "email_sent": email_sent}

@app.post("/auth/reset-password", tags=["Autenticación"])
def restablecer_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    if len(data.password) < 6:
        raise HTTPException(status_code=422, detail="La contraseña debe tener al menos 6 caracteres")
    if not data.token:
        raise HTTPException(status_code=400, detail="Enlace de recuperación inválido o expirado")

    row = db.execute(text("""
        SELECT id, email FROM password_reset_tokens
        WHERE token = :token AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
    """), {"token": data.token}).first()
    if not row:
        raise HTTPException(status_code=400, detail="Enlace de recuperación inválido o expirado")

    db.execute(text("UPDATE usuarios SET password_hash = :password WHERE lower(email) = :email"), {"password": pwd_context.hash(data.password), "email": row.email})
    db.execute(text("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :id"), {"id": row.id})
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}


def enviar_invitacion_por_correo(email: str, invitation_url: str) -> bool:
    host = os.getenv("SMTP_HOST")
    if not host:
        return False
    message = EmailMessage()
    message["Subject"] = "Invitación a ClassKids"
    message["From"] = os.getenv("SMTP_FROM", "no-reply@classkids.local")
    message["To"] = email
    message.set_content(f"Has sido invitado a ClassKids. Activa tu cuenta aquí: {invitation_url}")
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=10) as smtp:
        smtp.starttls()
        smtp.login(os.getenv("SMTP_USER", ""), os.getenv("SMTP_PASSWORD", ""))
        smtp.send_message(message)
    return True


@app.get("/usuarios", tags=["Usuarios"])
def obtener_usuarios(db: Session = Depends(get_db)):
    query = text("""
        SELECT u.id::text AS user_id, u.email, u.nombre, u.apellido, CASE WHEN lower(r.nombre) = 'administrador' THEN 'admin' ELSE 'docente' END AS role,
               u.created_at, u.last_sign_in_at
        FROM usuarios u LEFT JOIN user_roles r ON r.id = u.rol_id
        WHERE u.activo = TRUE ORDER BY u.created_at DESC
    """)
    return [dict(row._mapping) for row in db.execute(query)]

@app.get("/catalogo/docentes", tags=["Usuarios"])
def obtener_catalogo_docentes(db: Session = Depends(get_db)):
    query = text("""
        SELECT u.id, u.nombre, u.apellido, u.email
        FROM usuarios u JOIN user_roles r ON r.id = u.rol_id
        WHERE u.activo = TRUE AND lower(r.nombre) = 'docente'
        ORDER BY u.nombre ASC
    """)
    return [dict(row._mapping) for row in db.execute(query)]


@app.post("/usuarios/invitar", tags=["Usuarios"])
def invitar_usuario(data: InvitationSchema, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    role_name = "Administrador" if data.role == "admin" else "Docente"
    existing = db.execute(text("SELECT 1 FROM usuarios WHERE lower(email) = :email AND activo = TRUE"), {"email": email}).first()
    if existing:
        raise HTTPException(status_code=409, detail="El usuario ya existe")
    role = db.execute(text("SELECT id FROM user_roles WHERE nombre = :name"), {"name": role_name}).first()
    if not role:
        raise HTTPException(status_code=500, detail="Rol no configurado")
    token = token_urlsafe(48)
    db.execute(text("""
        INSERT INTO invitaciones (email, rol_id, token, expires_at)
        VALUES (:email, :role_id, :token, :expires_at)
    """), {"email": email, "role_id": role.id, "token": token, "expires_at": datetime.utcnow() + timedelta(days=2)})
    db.commit()
    invitation_url = f"{os.getenv('FRONTEND_URL', 'http://127.0.0.1:8080')}/invitacion?token={token}"
    email_sent = enviar_invitacion_por_correo(email, invitation_url)
    return {"mensaje": "Invitación creada", "email_sent": email_sent, "invitation_url": invitation_url}

@app.put("/usuarios/{user_id}/rol", tags=["Usuarios"])
def actualizar_rol_usuario(user_id: int, data: RoleUpdateSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    # H-18: un administrador no puede cambiar su propio rol (evita dejar el sistema sin administradores).
    if user_id == yo.id:
        raise HTTPException(status_code=403, detail="No puedes cambiar tu propio rol")
    role_name = "Administrador" if data.role == "admin" else "Docente"
    role = db.execute(text("SELECT id FROM user_roles WHERE nombre = :name"), {"name": role_name}).first()
    if not role:
        raise HTTPException(status_code=500, detail="Rol no configurado")
    result = db.execute(text("UPDATE usuarios SET rol_id = :role_id WHERE id = :id AND activo = TRUE RETURNING id"), {"role_id": role.id, "id": user_id}).first()
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.commit()
    return {"mensaje": "Rol actualizado"}

@app.delete("/usuarios/{user_id}", tags=["Usuarios"])
def desactivar_usuario(user_id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    # H-18: un administrador no puede desactivar su propia cuenta.
    if user_id == yo.id:
        raise HTTPException(status_code=403, detail="No puedes desactivar tu propia cuenta")
    result = db.execute(text("UPDATE usuarios SET activo = FALSE WHERE id = :id AND activo = TRUE RETURNING id"), {"id": user_id}).first()
    if not result:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.commit()
    return {"mensaje": "Usuario desactivado"}

# Consultas de conteo fijadas de antemano (sin interpolar texto de entrada en el
# SQL): cada clave mapea a una sentencia completa y conocida, así esta función
# nunca puede convertirse en una vía de inyección SQL aunque en el futuro alguien
# la reutilice con datos que no sean literales de código.
_COUNT_QUERIES = {
    "docentes": "SELECT COUNT(*) AS count FROM usuarios u JOIN user_roles r ON r.id = u.rol_id WHERE u.activo = TRUE AND lower(r.nombre) = 'docente'",
    "administradores": "SELECT COUNT(*) AS count FROM usuarios u JOIN user_roles r ON r.id = u.rol_id WHERE u.activo = TRUE AND lower(r.nombre) = 'administrador'",
    "grupos": "SELECT COUNT(*) AS count FROM grupos",
    "estudiantes_activos": "SELECT COUNT(*) AS count FROM estudiantes WHERE activo = TRUE",
    "actividades": "SELECT COUNT(*) AS count FROM actividades",
    "alertas_activas": "SELECT COUNT(*) AS count FROM alertas WHERE estado = 'active'",
}

def count_query(key: str):
    return text(_COUNT_QUERIES[key])

@app.get("/docentes/count", tags=["Usuarios"])
def contar_docentes(db: Session = Depends(get_db)):
    row = db.execute(count_query("docentes")).first()
    return {"count": row.count}

@app.get("/admins/count", tags=["Usuarios"])
def contar_administradores(db: Session = Depends(get_db)):
    row = db.execute(count_query("administradores")).first()
    return {"count": row.count}

@app.get("/grupos/count", tags=["Grupos"])
def contar_grupos(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return {"count": db.execute(text(f"SELECT COUNT(DISTINCT grupo_id) FROM ({_GRUPOS_DEL_DOCENTE}) x"), {"uid": yo.id}).scalar_one()}
    return {"count": db.execute(count_query("grupos")).scalar_one()}

@app.get("/estudiantes/count", tags=["Estudiantes"])
def contar_estudiantes(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return {"count": db.execute(text(f"SELECT COUNT(*) FROM estudiantes WHERE activo = TRUE AND grupo_id IN ({_GRUPOS_DEL_DOCENTE})"), {"uid": yo.id}).scalar_one()}
    return {"count": db.execute(count_query("estudiantes_activos")).scalar_one()}

@app.get("/actividades/count", tags=["Actividades"])
def contar_actividades(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return {"count": db.execute(text("SELECT COUNT(*) FROM actividades act WHERE " + _ASIGNADA.format(materia="act.materia_id", grupo="act.grupo_id")), {"uid": yo.id}).scalar_one()}
    return {"count": db.execute(count_query("actividades")).scalar_one()}

@app.get("/alertas/activas/count", tags=["Alertas"])
def contar_alertas_activas(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return {"count": db.execute(text(f"SELECT COUNT(*) FROM alertas a JOIN estudiantes e ON e.id = a.estudiante_id WHERE a.estado = 'active' AND {_ALERTA_VISIBLE}"), {"uid": yo.id}).scalar_one()}
    return {"count": db.execute(count_query("alertas_activas")).scalar_one()}


@app.get("/invitaciones/{token}", tags=["Usuarios"])
def consultar_invitacion(token: str, db: Session = Depends(get_db)):
    invitation = db.execute(text("""
        SELECT i.email, r.nombre AS rol FROM invitaciones i JOIN user_roles r ON r.id = i.rol_id
        WHERE i.token = :token AND i.accepted_at IS NULL AND i.expires_at > CURRENT_TIMESTAMP
    """), {"token": token}).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación inválida o expirada")
    return {"email": invitation.email, "rol": invitation.rol}


@app.post("/invitaciones/{token}/aceptar", tags=["Usuarios"])
def aceptar_invitacion(token: str, data: AcceptInvitationSchema, db: Session = Depends(get_db)):
    if len(data.password) < 6:
        raise HTTPException(status_code=422, detail="La contraseña debe tener al menos 6 caracteres")
    invitation = db.execute(text("""
        SELECT email, rol_id FROM invitaciones
        WHERE token = :token AND accepted_at IS NULL AND expires_at > CURRENT_TIMESTAMP
    """), {"token": token}).first()
    if not invitation:
        raise HTTPException(status_code=400, detail="Invitación inválida o expirada")
    db.execute(text("""
        INSERT INTO usuarios (email, nombre, apellido, password_hash, rol_id)
        VALUES (:email, :nombre, :apellido, :password, :rol_id)
        ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido, password_hash = EXCLUDED.password_hash, rol_id = EXCLUDED.rol_id, activo = TRUE
    """), {"email": invitation.email, "nombre": data.nombre.strip(), "apellido": (data.apellido or "").strip() or None, "password": pwd_context.hash(data.password), "rol_id": invitation.rol_id})
    db.execute(text("UPDATE invitaciones SET accepted_at = CURRENT_TIMESTAMP WHERE token = :token"), {"token": token})
    db.commit()
    return {"mensaje": "Cuenta activada correctamente"}


# =================================================================
# 🏢 1. GRUPOS (Full CRUD)
# =================================================================

@app.get("/grupos", tags=["Grupos"])
def obtener_grupos(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return [dict(row._mapping) for row in db.execute(text(f"SELECT * FROM grupos WHERE id IN ({_GRUPOS_DEL_DOCENTE}) ORDER BY id ASC"), {"uid": yo.id})]
    return [dict(row._mapping) for row in db.execute(text("SELECT * FROM grupos ORDER BY id ASC"))]

@app.post("/grupos", tags=["Grupos"], status_code=status.HTTP_201_CREATED)
def crear_grupo(g: GrupoSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    query = text("INSERT INTO grupos (nombre, grado, turno, ano_lectivo) VALUES (:n, :gr, :t, :a) RETURNING *")
    res = db.execute(query, {"n": g.nombre, "gr": g.grado, "t": g.turno, "a": g.ano_lectivo}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.put("/grupos/{id}", tags=["Grupos"])
def actualizar_grupo(id: int, g: GrupoSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    query = text("UPDATE grupos SET nombre=:n, grado=:gr, turno=:t, ano_lectivo=:a WHERE id=:id RETURNING *")
    res = db.execute(query, {"n": g.nombre, "gr": g.grado, "t": g.turno, "a": g.ano_lectivo, "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Grupo no encontrado")
    db.commit()
    return dict(res._mapping)

@app.delete("/grupos/{id}", tags=["Grupos"])
def eliminar_grupo(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    try:
        db.execute(text("DELETE FROM grupos WHERE id = :id"), {"id": id})
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar el grupo: tiene actividades u otros registros asociados")
    return {"mensaje": f"Grupo {id} eliminado"}


# =================================================================
# 👨‍🎓 2. ESTUDIANTES (Full CRUD)
# =================================================================

@app.get("/estudiantes", tags=["Estudiantes"])
def obtener_estudiantes(grupo_id: Optional[int] = None, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    query = "SELECT e.*, g.nombre as nombre_grupo FROM estudiantes e LEFT JOIN grupos g ON e.grupo_id = g.id WHERE TRUE"
    params = {}
    if grupo_id is not None:
        if not tiene_grupo(db, yo, grupo_id):
            raise sin_permiso("No tienes asignado este grupo")
        query += " AND e.grupo_id = :grupo_id"
        params["grupo_id"] = grupo_id
    if yo.rol != "admin":
        query += f" AND e.grupo_id IN ({_GRUPOS_DEL_DOCENTE})"
        params["uid"] = yo.id
    query += " ORDER BY e.id ASC"
    return [dict(row._mapping) for row in db.execute(text(query), params)]

@app.post("/estudiantes", tags=["Estudiantes"], status_code=status.HTTP_201_CREATED)
def crear_estudiante(e: EstudianteSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if not tiene_grupo(db, yo, e.grupo_id):
        raise sin_permiso("Solo puedes registrar estudiantes en tus grupos")
    query = text("INSERT INTO estudiantes (documento, nombre, apellido, grupo_id, activo) VALUES (:doc, :nom, :ape, :grupo, :act) RETURNING *")
    res = db.execute(query, {"doc": e.documento, "nom": e.nombre, "ape": e.apellido, "grupo": e.grupo_id, "act": e.activo}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.put("/estudiantes/{id}", tags=["Estudiantes"])
def actualizar_estudiante(id: int, e: EstudianteSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    exigir_estudiante(db, yo, id)
    if not tiene_grupo(db, yo, e.grupo_id):
        raise sin_permiso("Solo puedes mover estudiantes entre tus grupos")
    query = text("UPDATE estudiantes SET documento=:doc, nombre=:nom, apellido=:ape, grupo_id=:grupo, activo=:act WHERE id=:id RETURNING *")
    res = db.execute(query, {"doc": e.documento, "nom": e.nombre, "ape": e.apellido, "grupo": e.grupo_id, "act": e.activo, "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    db.commit()
    return dict(res._mapping)

@app.delete("/estudiantes/{id}", tags=["Estudiantes"])
def eliminar_estudiante(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    # Borrar un estudiante elimina también sus notas de todas las materias: solo el administrador.
    solo_admin(yo)
    db.execute(text("DELETE FROM estudiantes WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Estudiante eliminado"}


# =================================================================
# 📚 3. MATERIAS (Full CRUD)
# =================================================================

@app.get("/materias", tags=["Materias"])
def obtener_materias(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if yo.rol != "admin":
        return [dict(row._mapping) for row in db.execute(text(f"SELECT * FROM materias WHERE id IN ({_MATERIAS_DEL_DOCENTE}) ORDER BY id ASC"), {"uid": yo.id})]
    return [dict(row._mapping) for row in db.execute(text("SELECT * FROM materias ORDER BY id ASC"))]

@app.post("/materias", tags=["Materias"], status_code=status.HTTP_201_CREATED)
def crear_materia(m: MateriaSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    res = db.execute(text("INSERT INTO materias (nombre, codigo) VALUES (:n, :c) RETURNING *"), {"n": m.nombre, "c": m.codigo}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.put("/materias/{id}", tags=["Materias"])
def actualizar_materia(id: int, m: MateriaSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    res = db.execute(text("UPDATE materias SET nombre=:n, codigo=:c WHERE id=:id RETURNING *"), {"n": m.nombre, "c": m.codigo, "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Materia no encontrada")
    db.commit()
    return dict(res._mapping)

@app.delete("/materias/{id}", tags=["Materias"])
def eliminar_materia(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    try:
        db.execute(text("DELETE FROM materias WHERE id = :id"), {"id": id})
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="No se puede eliminar la materia: tiene actividades, calificaciones u otros registros asociados")
    return {"mensaje": "Materia eliminada"}


# =================================================================
# 📝 4. ACTIVIDADES (Full CRUD)
# =================================================================

def _exigir_actividad(db: Session, yo: Sesion, actividad_id: int) -> None:
    if yo.rol == "admin":
        return
    act = db.execute(text("SELECT materia_id, grupo_id FROM actividades WHERE id = :id"), {"id": actividad_id}).first()
    if act is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    if not tiene_asignacion(db, yo, act.materia_id, act.grupo_id):
        raise sin_permiso("La actividad no pertenece a tus asignaciones")


@app.get("/actividades", tags=["Actividades"])
def obtener_actividades(grupo_id: Optional[int] = None, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    query = """
         SELECT act.*, m.nombre as materia_nombre, g.nombre as grupo_nombre,
             CASE WHEN act.fecha_entrega < CURRENT_DATE THEN 'vencida' ELSE 'pendiente' END AS estado
        FROM actividades act
        JOIN materias m ON act.materia_id = m.id
        JOIN grupos g ON act.grupo_id = g.id
        WHERE TRUE
    """
    params = {}
    if grupo_id is not None:
        if not tiene_grupo(db, yo, grupo_id):
            raise sin_permiso("No tienes asignado este grupo")
        query += " AND act.grupo_id = :grupo_id"
        params["grupo_id"] = grupo_id
    if yo.rol != "admin":
        query += " AND " + _ASIGNADA.format(materia="act.materia_id", grupo="act.grupo_id")
        params["uid"] = yo.id
    query += " ORDER BY act.fecha_entrega ASC"
    return [dict(row._mapping) for row in db.execute(text(query), params)]

@app.post("/actividades", tags=["Actividades"], status_code=status.HTTP_201_CREATED)
def crear_actividad(act: ActividadSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    if not tiene_asignacion(db, yo, act.materia_id, act.grupo_id):
        raise sin_permiso("No tienes asignada esta materia en ese grupo")
    query = text("INSERT INTO actividades (materia_id, grupo_id, titulo, tipo, descripcion, fecha_entrega) VALUES (:m_id, :g_id, :tit, :tipo, :desc, :f_ent) RETURNING *")
    res = db.execute(query, {"m_id": act.materia_id, "g_id": act.grupo_id, "tit": act.titulo, "tipo": act.tipo, "desc": act.descripcion, "f_ent": act.fecha_entrega}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.put("/actividades/{id}", tags=["Actividades"])
def actualizar_actividad(id: int, act: ActividadSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_actividad(db, yo, id)
    if not tiene_asignacion(db, yo, act.materia_id, act.grupo_id):
        raise sin_permiso("No tienes asignada esta materia en ese grupo")
    query = text("UPDATE actividades SET materia_id=:m_id, grupo_id=:g_id, titulo=:tit, tipo=:tipo, descripcion=:desc, fecha_entrega=:f_ent WHERE id=:id RETURNING *")
    res = db.execute(query, {"m_id": act.materia_id, "g_id": act.grupo_id, "tit": act.titulo, "tipo": act.tipo, "desc": act.descripcion, "f_ent": act.fecha_entrega, "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Actividad no encontrada")
    db.commit()
    return dict(res._mapping)

@app.delete("/actividades/{id}", tags=["Actividades"])
def eliminar_actividad(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_actividad(db, yo, id)
    db.execute(text("DELETE FROM actividades WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Actividad eliminada"}


# =================================================================
# 📊 5. CALIFICACIONES (Full CRUD)
# =================================================================

@app.get("/calificaciones", tags=["Calificaciones"])
def obtener_calificaciones(actividad_id: Optional[int] = None, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    query = """
        SELECT c.*, e.nombre as estudiante_nombre, e.apellido as estudiante_apellido, m.nombre as materia_nombre
        FROM calificaciones c
        JOIN estudiantes e ON c.estudiante_id = e.id
        JOIN materias m ON c.materia_id = m.id
        WHERE TRUE
    """
    params = {}
    if actividad_id is not None:
        _exigir_actividad(db, yo, actividad_id)
        query += " AND c.actividad_id = :actividad_id"
        params["actividad_id"] = actividad_id
    if yo.rol != "admin":
        # Solo las notas de una materia que el docente tiene asignada en el grupo del estudiante.
        query += " AND " + _ASIGNADA.format(materia="c.materia_id", grupo="e.grupo_id")
        params["uid"] = yo.id
    query += " ORDER BY c.fecha_registro DESC"
    return [dict(row._mapping) for row in db.execute(text(query), params)]

# Columnas opcionales que dependen de migraciones (backend/migrations/). El backend debe
# funcionar igual con y sin ellas: la base real todavía no tiene la migración 001.
# El resultado se guarda por proceso; tras aplicar una migración hay que reiniciar el backend.
_COLUMNAS_OPCIONALES: dict = {}


def columna_existe(db: Session, tabla: str, columna: str) -> bool:
    clave = (tabla, columna)
    if clave not in _COLUMNAS_OPCIONALES:
        _COLUMNAS_OPCIONALES[clave] = bool(db.execute(text("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = :tabla AND column_name = :columna
            )
        """), {"tabla": tabla, "columna": columna}).scalar())
    return _COLUMNAS_OPCIONALES[clave]


# Columnas que PUT /calificaciones/{id} puede modificar. Los nombres de esta lista son los
# únicos que se insertan en el SQL (los valores siempre van como parámetros).
_COLUMNAS_EDITABLES_CALIFICACION = ("estudiante_id", "materia_id", "actividad_id", "nota", "periodo", "observacion", "entregado")


def _exigir_calificacion(db: Session, yo: Sesion, calificacion_id: int) -> None:
    if yo.rol == "admin":
        return
    cal = db.execute(text("SELECT estudiante_id, materia_id FROM calificaciones WHERE id = :id"), {"id": calificacion_id}).first()
    if cal is None:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    if not tiene_asignacion(db, yo, cal.materia_id, grupo_de_estudiante(db, cal.estudiante_id)):
        raise sin_permiso("Esta calificación no pertenece a tus asignaciones")


@app.post("/calificaciones", tags=["Calificaciones"], status_code=status.HTTP_201_CREATED)
def registrar_calificacion(c: CalificacionSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    exigir_calificar(db, yo, c.estudiante_id, c.materia_id, c.actividad_id)
    params = {"e_id": c.estudiante_id, "m_id": c.materia_id, "a_id": c.actividad_id, "nota": c.nota, "per": c.periodo, "obs": c.observacion}
    if columna_existe(db, "calificaciones", "entregado"):
        params["ent"] = True if c.entregado is None else c.entregado
        query = text("INSERT INTO calificaciones (estudiante_id, materia_id, actividad_id, nota, periodo, observacion, entregado) VALUES (:e_id, :m_id, :a_id, :nota, :per, :obs, :ent) RETURNING *")
    else:
        query = text("INSERT INTO calificaciones (estudiante_id, materia_id, actividad_id, nota, periodo, observacion) VALUES (:e_id, :m_id, :a_id, :nota, :per, :obs) RETURNING *")
    res = db.execute(query, params).fetchone()
    # Regla RN-09 (sin cambios): promedio acumulado de todas las notas del estudiante < 3.0.
    average = db.execute(text("SELECT AVG(nota) AS promedio FROM calificaciones WHERE estudiante_id = :id"), {"id": c.estudiante_id}).scalar()
    if average is not None and float(average) < 3:
        # Decisión D3 (H-32): no se crea otra alerta si el estudiante ya tiene una alerta
        # de bajo rendimiento ABIERTA. Se consideran equivalentes la alerta automática
        # (`low_grade`) y la registrada como «Bajo Rendimiento», y se consideran abiertas
        # las alertas activas y las que están en revisión (incluidos sus nombres en español).
        active_alert = db.execute(text("""
            SELECT 1 FROM alertas
            WHERE estudiante_id = :id
              AND (tipo = 'low_grade' OR lower(tipo) = 'bajo rendimiento')
              AND estado IN ('active', 'reviewed', 'Pendiente', 'Activa', 'En revisión', 'Revisada')
        """), {"id": c.estudiante_id}).first()
        if not active_alert:
            db.execute(text("""
                INSERT INTO alertas (estudiante_id, tipo, mensaje, estado)
                VALUES (:id, 'low_grade', :mensaje, 'active')
            """), {"id": c.estudiante_id, "mensaje": f"Promedio académico bajo: {float(average):.2f}"})
    db.commit()
    return dict(res._mapping)

@app.put("/calificaciones/{id}", tags=["Calificaciones"])
def actualizar_calificacion(id: int, c: CalificacionSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_calificacion(db, yo, id)
    if yo.rol != "admin" and c.model_fields_set & {"estudiante_id", "materia_id", "actividad_id"}:
        # Si cambia a quién o en qué se califica, el destino también debe ser suyo.
        actual = db.execute(text("SELECT estudiante_id, materia_id, actividad_id FROM calificaciones WHERE id = :id"), {"id": id}).first()
        exigir_calificar(db, yo,
                         c.estudiante_id if "estudiante_id" in c.model_fields_set else actual.estudiante_id,
                         c.materia_id if "materia_id" in c.model_fields_set else actual.materia_id,
                         c.actividad_id if "actividad_id" in c.model_fields_set else actual.actividad_id)
    # Solo se actualizan los campos que el cliente envía. Antes, un campo omitido tomaba el
    # valor por defecto del esquema: el periodo volvía a 1 (H-33) y la observación se
    # borraba (H-31). Ahora, si el cliente no envía `periodo` u `observacion`, se conservan.
    campos = {k: getattr(c, k) for k in _COLUMNAS_EDITABLES_CALIFICACION if k in c.model_fields_set}
    if "entregado" in campos and (campos["entregado"] is None or not columna_existe(db, "calificaciones", "entregado")):
        campos.pop("entregado")
    asignaciones = ", ".join(f"{columna} = :{columna}" for columna in campos)
    query = text(f"UPDATE calificaciones SET {asignaciones} WHERE id = :id RETURNING *")
    res = db.execute(query, {**campos, "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Calificación no encontrada")
    db.commit()
    return dict(res._mapping)

@app.delete("/calificaciones/{id}", tags=["Calificaciones"])
def eliminar_calificacion(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_calificacion(db, yo, id)
    db.execute(text("DELETE FROM calificaciones WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Calificación eliminada"}


# =================================================================
# 💬 6. OBSERVACIONES (Full CRUD)
# =================================================================

@app.get("/observaciones", tags=["Observaciones"])
def obtener_observaciones(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    filtro = "" if yo.rol == "admin" else f"WHERE e.grupo_id IN ({_GRUPOS_DEL_DOCENTE})"
    query = text(f"SELECT o.*, e.nombre as estudiante_nombre, e.apellido as estudiante_apellido FROM observaciones o JOIN estudiantes e ON o.estudiante_id = e.id {filtro} ORDER BY o.fecha DESC")
    return [dict(row._mapping) for row in db.execute(query, {"uid": yo.id})]

@app.post("/observaciones", tags=["Observaciones"], status_code=status.HTTP_201_CREATED)
def crear_observacion(o: ObservacionSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    exigir_estudiante(db, yo, o.estudiante_id)
    query = text("INSERT INTO observaciones (estudiante_id, tipo, descripcion) VALUES (:e_id, :tipo, :desc) RETURNING *")
    res = db.execute(query, {"e_id": o.estudiante_id, "tipo": o.tipo, "desc": o.descripcion}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.delete("/observaciones/{id}", tags=["Observaciones"])
def eliminar_observacion(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    est = db.execute(text("SELECT estudiante_id FROM observaciones WHERE id = :id"), {"id": id}).scalar()
    if est is not None:
        exigir_estudiante(db, yo, est)
    db.execute(text("DELETE FROM observaciones WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Observación eliminada"}


# =================================================================
# 🚨 7. ALERTAS (Full CRUD)
# =================================================================

@app.get("/alertas", tags=["Alertas"])
def obtener_alertas(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    filtro = "" if yo.rol == "admin" else f"WHERE {_ALERTA_VISIBLE}"
    query = text(f"SELECT a.*, e.nombre as estudiante_nombre, e.apellido as estudiante_apellido FROM alertas a JOIN estudiantes e ON a.estudiante_id = e.id {filtro} ORDER BY a.fecha_creacion DESC")
    return [dict(row._mapping) for row in db.execute(query, {"uid": yo.id})]


def _exigir_alerta(db: Session, yo: Sesion, alerta_id: int) -> None:
    if yo.rol == "admin":
        return
    existe = db.execute(text("SELECT 1 FROM alertas WHERE id = :id"), {"id": alerta_id}).first()
    if existe is None:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    visible = db.execute(text(f"SELECT 1 FROM alertas a JOIN estudiantes e ON e.id = a.estudiante_id WHERE a.id = :id AND {_ALERTA_VISIBLE}"), {"id": alerta_id, "uid": yo.id}).first()
    if visible is None:
        raise sin_permiso("Esta alerta no corresponde a tus asignaciones")

@app.post("/alertas", tags=["Alertas"], status_code=status.HTTP_201_CREATED)
def crear_alerta(al: AlertaSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    exigir_estudiante(db, yo, al.estudiante_id)
    estado = normalize_alert_status(al.estado or "active")
    query = text("INSERT INTO alertas (estudiante_id, tipo, mensaje, estado) VALUES (:e_id, :tipo, :msj, :est) RETURNING *")
    res = db.execute(query, {"e_id": al.estudiante_id, "tipo": al.tipo, "msj": al.mensaje, "est": estado}).fetchone()
    db.commit()
    return dict(res._mapping)

@app.put("/alertas/{id}", tags=["Alertas"])
def cambiar_estado_alerta(id: int, estado: str, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_alerta(db, yo, id)
    res = db.execute(text("UPDATE alertas SET estado=:est WHERE id=:id RETURNING *"), {"est": normalize_alert_status(estado), "id": id}).fetchone()
    if not res: raise HTTPException(status_code=404, detail="Alerta no encontrada")
    db.commit()
    return dict(res._mapping)

@app.put("/alertas/{id}/estado", tags=["Alertas"])
def actualizar_estado_alerta(id: int, data: AlertStatusSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    return cambiar_estado_alerta(id, data.estado, db, yo)

@app.delete("/alertas/{id}", tags=["Alertas"])
def eliminar_alerta(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    _exigir_alerta(db, yo, id)
    db.execute(text("DELETE FROM alertas WHERE id = :id"), {"id": id})
    db.commit()
    return {"mensaje": "Alerta eliminada"}


# =================================================================
# 👥 8. ROLES Y ASIGNACIONES
# =================================================================

@app.get("/roles", tags=["Soporte"])
def obtener_roles(db: Session = Depends(get_db)):
    return [dict(row._mapping) for row in db.execute(text("SELECT * FROM user_roles ORDER BY id ASC"))]

@app.get("/asignaciones", tags=["Soporte"])
def obtener_asignaciones(db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    # El docente solo ve sus propias asignaciones.
    filtro = "" if yo.rol == "admin" else "WHERE a.docente_id = :uid"
    query = text(f"""
        SELECT a.id, a.docente_id, a.materia_id, a.grupo_id,
               TRIM(u.nombre || ' ' || COALESCE(u.apellido, '')) as docente, m.nombre as materia_nombre, g.nombre as grupo_nombre
        FROM asignaciones a
        JOIN usuarios u ON a.docente_id = u.id
        JOIN materias m ON a.materia_id = m.id
        JOIN grupos g ON a.grupo_id = g.id
        {filtro}
        ORDER BY g.nombre, m.nombre, u.nombre
    """)
    return [dict(row._mapping) for row in db.execute(query, {"uid": yo.id})]

@app.post("/asignaciones", tags=["Soporte"], status_code=status.HTTP_201_CREATED)
def crear_asignacion(data: AsignacionSchema, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    docente = db.execute(text("""
        SELECT u.id FROM usuarios u
        JOIN user_roles r ON r.id = u.rol_id
        WHERE u.id = :docente_id AND u.activo = TRUE AND lower(r.nombre) = 'docente'
    """), {"docente_id": data.docente_id}).first()
    if not docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")
    exists = db.execute(text("""
        SELECT 1 FROM asignaciones
        WHERE materia_id = :materia_id AND grupo_id = :grupo_id
    """), data.model_dump()).first()
    if exists:
        raise HTTPException(status_code=409, detail="La asignación ya existe")
    result = db.execute(text("""
        INSERT INTO asignaciones (docente_id, materia_id, grupo_id)
        VALUES (:docente_id, :materia_id, :grupo_id)
        RETURNING id, docente_id, materia_id, grupo_id
    """), data.model_dump()).first()
    db.commit()
    return dict(result._mapping)

@app.delete("/asignaciones/{id}", tags=["Soporte"])
def eliminar_asignacion(id: int, db: Session = Depends(get_db), yo: Sesion = Depends(sesion_actual)):
    solo_admin(yo)
    result = db.execute(text("DELETE FROM asignaciones WHERE id = :id RETURNING id"), {"id": id}).first()
    if not result:
        raise HTTPException(status_code=404, detail="Asignación no encontrada")
    db.commit()
    return {"mensaje": "Asignación eliminada"}