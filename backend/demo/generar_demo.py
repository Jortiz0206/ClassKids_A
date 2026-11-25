"""Generador reproducible de la base de DEMOSTRACIÓN de ClassKids (classkids_demo).

Uso (desde backend/, con el entorno virtual activo):
    python demo/generar_demo.py preparar                 # crea backend/.env.demo con claves aleatorias
    python demo/generar_demo.py generar                  # primera generación
    python demo/generar_demo.py generar --reiniciar      # borra SOLO classkids_demo y la vuelve a generar
    python demo/generar_demo.py verificar                # comprobaciones de solo lectura

Cómo crea los datos:
- La única escritura directa es la cuenta del primer administrador (el sistema no tiene un
  endpoint para crearla) y el ajuste de las fechas de registro, que simulan un año lectivo.
- Todo lo demás pasa por la API real de ClassKids (FastAPI, en el mismo proceso): materias,
  grupos, estudiantes, invitaciones de docentes, asignaciones, actividades, calificaciones,
  observaciones y cambios de estado de alertas. Por eso las alertas las crea la regla real
  del backend al registrar cada nota (RN-09), y las contraseñas usan el mismo hash (PBKDF2).

Protecciones: solo escribe si la URL apunta a la base «classkids_demo», el servidor responde
con esa base y en ese servidor no existen las bases «classkids» ni «classkids_test».
"""
from __future__ import annotations

import argparse
import hashlib
import os
import re
import secrets
import string
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

BACKEND = Path(__file__).resolve().parent.parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from demo import catalogo as cat  # noqa: E402
from demo.plan import SEMILLA, Plan, construir_plan  # noqa: E402

BASE_DEMO = "classkids_demo"
BASES_PROTEGIDAS = ("classkids", "classkids_test")
PUERTOS_PROTEGIDOS = (5432, 5433)
ENV_DEMO = BACKEND / ".env.demo"
EJEMPLO = BACKEND / ".env.demo.example"
CREDENCIALES = BACKEND / "CREDENCIALES_DEMO.md"
MARCA = "classkids-demo"
TABLAS = ("alertas", "observaciones", "calificaciones", "actividades", "asignaciones", "estudiantes",
          "grupos", "materias", "invitaciones", "password_reset_tokens", "usuarios")


class DestinoNoPermitido(RuntimeError):
    pass


# ============================================================ configuración y protecciones

def _clave(longitud: int = 14) -> str:
    alfabeto = string.ascii_letters + string.digits
    return "Demo-" + "".join(secrets.choice(alfabeto) for _ in range(longitud))


def preparar() -> None:
    if ENV_DEMO.exists():
        print(f"Ya existe {ENV_DEMO.name}; no se modifica.")
        return
    texto = EJEMPLO.read_text(encoding="utf-8")
    texto = texto.replace("JWT_SECRET=reemplazar-por-una-clave-aleatoria", f"JWT_SECRET={secrets.token_urlsafe(48)}")
    texto = texto.replace("# DEMO_ADMIN_PASSWORD=", f"DEMO_ADMIN_PASSWORD={_clave()}")
    texto = texto.replace("# DEMO_DOCENTE_PASSWORD=", f"DEMO_DOCENTE_PASSWORD={_clave()}")
    ENV_DEMO.write_text(texto, encoding="utf-8")
    print(f"Creado {ENV_DEMO} (excluido de Git) con una clave JWT y contraseñas aleatorias.")


def validar_url(url: str) -> None:
    from sqlalchemy.engine import make_url

    u = make_url(url)
    if u.database != BASE_DEMO:
        raise DestinoNoPermitido(f"La URL apunta a la base '{u.database}'. El generador solo escribe en '{BASE_DEMO}'.")
    if (u.port or 5432) in PUERTOS_PROTEGIDOS:
        raise DestinoNoPermitido(f"El puerto {u.port or 5432} pertenece a la base real o a la de pruebas.")


def validar_servidor(conn) -> None:
    from sqlalchemy import text

    actual = conn.execute(text("SELECT current_database()")).scalar()
    if actual != BASE_DEMO:
        raise DestinoNoPermitido(f"El servidor respondió con la base '{actual}', no con '{BASE_DEMO}'.")
    otras = conn.execute(text("SELECT datname FROM pg_database WHERE datname = ANY(:n)"), {"n": list(BASES_PROTEGIDAS)}).scalars().all()
    if otras:
        raise DestinoNoPermitido(f"Este servidor también aloja {otras}: no es el contenedor de demostración.")


def cargar_entorno() -> str:
    if not ENV_DEMO.exists():
        raise SystemExit(f"Falta {ENV_DEMO.name}. Ejecuta primero: python demo/generar_demo.py preparar")
    from dotenv import load_dotenv

    load_dotenv(ENV_DEMO, override=True)  # la configuración de demostración manda sobre el entorno
    os.environ["CLASSKIDS_ENV_FILE"] = str(ENV_DEMO)
    os.environ["CLASSKIDS_ENTORNO"] = "demo"
    url = os.environ.get("DATABASE_URL", "")
    validar_url(url)
    return url


# ============================================================ utilidades

class Api:
    """Cliente de la API real en el mismo proceso. Falla en cuanto una respuesta no es la esperada."""

    def __init__(self, client):
        self.client = client
        self.tokens: dict[str, dict] = {}

    def entrar(self, quien: str, email: str, password: str) -> None:
        r = self.client.post("/auth/login", json={"email": email, "password": password})
        if r.status_code != 200:
            raise RuntimeError(f"No se pudo iniciar sesión como {email}: {r.status_code} {r.text}")
        self.tokens[quien] = {"Authorization": f"Bearer {r.json()['access_token']}"}

    def llamar(self, quien: str | None, metodo: str, ruta: str, esperado: int, **kw):
        headers = self.tokens[quien] if quien else {}
        r = getattr(self.client, metodo)(ruta, headers=headers, **kw)
        if r.status_code != esperado:
            raise RuntimeError(f"{metodo.upper()} {ruta} como {quien}: {r.status_code} {r.text}")
        return r.json()


def huella(conn) -> str:
    """Huella de los datos de negocio (sin hashes, tokens ni marcas de tiempo automáticas)."""
    from sqlalchemy import text

    consultas = [
        "SELECT id, email, nombre, apellido, rol_id, activo FROM usuarios",
        "SELECT id, nombre, grado, turno, ano_lectivo FROM grupos",
        "SELECT id, documento, nombre, apellido, grupo_id, activo FROM estudiantes",
        "SELECT id, nombre, codigo FROM materias",
        "SELECT id, docente_id, materia_id, grupo_id FROM asignaciones",
        "SELECT id, materia_id, grupo_id, titulo, tipo, descripcion, fecha_entrega FROM actividades",
        "SELECT id, estudiante_id, materia_id, actividad_id, nota, periodo, entregado, fecha_registro FROM calificaciones",
        "SELECT id, estudiante_id, tipo, descripcion, fecha FROM observaciones",
        "SELECT id, estudiante_id, tipo, mensaje, estado, fecha_creacion FROM alertas",
    ]
    h = hashlib.md5()
    for q in consultas:
        for fila in conn.execute(text(q + " ORDER BY id")):
            h.update(repr(tuple(fila)).encode())
    return h.hexdigest()


def marca_actual(conn) -> str | None:
    from sqlalchemy import text

    return conn.execute(text("SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = current_database()")).scalar()


# ============================================================ generación

def reiniciar_base(conn) -> None:
    from sqlalchemy import text

    conn.execute(text(f"TRUNCATE {', '.join(TABLAS)} RESTART IDENTITY CASCADE"))
    conn.execute(text("""
        INSERT INTO user_roles (nombre, descripcion) VALUES
        ('Administrador', 'Control total del sistema'), ('Docente', 'Registro de notas y asistencia'),
        ('Acudiente', 'Consulta de reportes')
        ON CONFLICT (nombre) DO NOTHING
    """))


def generar(plan: Plan, admin_password: str, docente_password: str, progreso=print) -> dict:
    from fastapi.testclient import TestClient
    from sqlalchemy import text

    import database
    import main

    with database.engine.connect() as conn:
        validar_servidor(conn)
    # Un solo cliente abierto durante toda la generación (sin abrirlo, cada petición
    # levantaba su propio bucle de eventos y la generación tardaba varios minutos más).
    cliente = TestClient(main.app)
    cliente.__enter__()
    try:
        return _generar(plan, admin_password, docente_password, progreso, Api(cliente))
    finally:
        cliente.__exit__(None, None, None)


def _generar(plan: Plan, admin_password: str, docente_password: str, progreso, api: Api) -> dict:
    from sqlalchemy import text

    import database
    import main

    with database.engine.begin() as conn:
        reiniciar_base(conn)
        conn.execute(text("""
            INSERT INTO usuarios (email, nombre, apellido, password_hash, rol_id)
            VALUES (:email, :nombre, :apellido, :hash, (SELECT id FROM user_roles WHERE nombre = 'Administrador'))
        """), {**cat.ADMINISTRADOR, "hash": main.pwd_context.hash(admin_password)})
    api.entrar("admin", cat.ADMINISTRADOR["email"], admin_password)

    ids: dict[str, dict] = {"materia": {}, "grupo": {}, "estudiante": {}, "docente": {}, "actividad": {}}
    for m in cat.MATERIAS:
        ids["materia"][m["clave"]] = api.llamar("admin", "post", "/materias", 201, json={"nombre": m["nombre"], "codigo": m["codigo"]})["id"]
    for g in cat.GRUPOS:
        ids["grupo"][g["clave"]] = api.llamar("admin", "post", "/grupos", 201, json={
            "nombre": g["nombre"], "grado": g["grado"], "turno": g["turno"], "ano_lectivo": plan.ano_lectivo})["id"]
    for e in plan.estudiantes:
        ids["estudiante"][e.documento] = api.llamar("admin", "post", "/estudiantes", 201, json={
            "documento": e.documento, "nombre": e.nombre, "apellido": e.apellido, "grupo_id": ids["grupo"][e.grupo]})["id"]
    progreso(f"  {len(cat.MATERIAS)} materias, {len(cat.GRUPOS)} grupos y {len(plan.estudiantes)} estudiantes")

    # Docentes: invitación del administrador y activación de la cuenta, como en la aplicación.
    for d in cat.DOCENTES:
        invitacion = api.llamar("admin", "post", "/usuarios/invitar", 200, json={"email": d["email"], "role": "docente"})
        token = parse_qs(urlsplit(invitacion["invitation_url"]).query)["token"][0]
        api.llamar(None, "post", f"/invitaciones/{token}/aceptar", 200, json={
            "nombre": d["nombre"], "apellido": d["apellido"], "password": docente_password})
    por_email = {u["email"]: u["id"] for u in api.llamar("admin", "get", "/catalogo/docentes", 200)}
    for d in cat.DOCENTES:
        ids["docente"][d["clave"]] = por_email[d["email"]]
        api.entrar(d["clave"], d["email"], docente_password)
    for docente, materia, grupo in cat.ASIGNACIONES:
        api.llamar("admin", "post", "/asignaciones", 201, json={
            "docente_id": ids["docente"][docente], "materia_id": ids["materia"][materia], "grupo_id": ids["grupo"][grupo]})
    progreso(f"  {len(cat.DOCENTES)} docentes invitados y {len(cat.ASIGNACIONES)} asignaciones")

    for a in plan.actividades:
        ids["actividad"][a.clave] = api.llamar(plan.docente_de(a.materia, a.grupo), "post", "/actividades", 201, json={
            "materia_id": ids["materia"][a.materia], "grupo_id": ids["grupo"][a.grupo], "titulo": a.titulo,
            "tipo": a.tipo, "descripcion": a.descripcion, "fecha_entrega": a.fecha_entrega.isoformat()})["id"]
    progreso(f"  {len(plan.actividades)} actividades")

    actividades = {a.clave: a for a in plan.actividades}
    grupo_de = {e.documento: e.grupo for e in plan.estudiantes}
    fechas: list[dict] = []
    for i, c in enumerate(plan.calificaciones, 1):
        a = actividades[c.actividad]
        creada = api.llamar(plan.docente_de(a.materia, a.grupo), "post", "/calificaciones", 201, json={
            "estudiante_id": ids["estudiante"][c.documento], "materia_id": ids["materia"][a.materia],
            "actividad_id": ids["actividad"][c.actividad], "nota": c.nota, "periodo": c.periodo, "entregado": True})
        fechas.append({"id": creada["id"], "f": c.fecha_registro})
        if i % 1000 == 0:
            progreso(f"  {i} de {len(plan.calificaciones)} calificaciones")
    # Fechas simuladas del año lectivo, en bloque al final. Cada alerta toma la fecha de la nota
    # que la provocó: la regla del backend la crea en la misma transacción que esa nota, así que
    # ambas tienen la misma marca de tiempo real (CURRENT_TIMESTAMP de la transacción).
    with database.engine.begin() as conn:
        conn.execute(text("CREATE TEMP TABLE fechas_demo (id integer PRIMARY KEY, f timestamp) ON COMMIT DROP"))
        conn.execute(text("INSERT INTO fechas_demo (id, f) VALUES (:id, :f)"), fechas)
        asociadas = conn.execute(text("""
            UPDATE alertas a SET fecha_creacion = fd.f
            FROM (SELECT DISTINCT ON (al.id) al.id AS alerta, c.id AS cal
                  FROM alertas al JOIN calificaciones c
                    ON c.estudiante_id = al.estudiante_id AND c.fecha_registro = al.fecha_creacion
                  ORDER BY al.id, c.id DESC) m
            JOIN fechas_demo fd ON fd.id = m.cal
            WHERE a.id = m.alerta
        """)).rowcount
        ultima_alerta = conn.execute(text("SELECT count(*) FROM alertas")).scalar()
        if asociadas != ultima_alerta:
            raise RuntimeError(f"Solo {asociadas} de {ultima_alerta} alertas se asociaron con la nota que las creó")
        conn.execute(text("UPDATE calificaciones c SET fecha_registro = fd.f FROM fechas_demo fd WHERE fd.id = c.id"))
    progreso(f"  {len(plan.calificaciones)} calificaciones registradas; la regla del backend creó {ultima_alerta} alertas")

    docentes_por_grupo: dict[str, list[str]] = {}
    for docente, _, grupo in cat.ASIGNACIONES:
        docentes_por_grupo.setdefault(grupo, [])
        if docente not in docentes_por_grupo[grupo]:
            docentes_por_grupo[grupo].append(docente)
    fechas_obs = []
    for i, o in enumerate(plan.observaciones):
        docentes = docentes_por_grupo[grupo_de[o.documento]]
        creada = api.llamar(docentes[i % len(docentes)], "post", "/observaciones", 201, json={
            "estudiante_id": ids["estudiante"][o.documento], "tipo": o.tipo, "descripcion": o.descripcion})
        fechas_obs.append({"id": creada["id"], "f": o.fecha})
    with database.engine.begin() as conn:
        conn.execute(text("UPDATE observaciones SET fecha = :f WHERE id = :id"), fechas_obs)
    progreso(f"  {len(plan.observaciones)} observaciones")

    # Seguimiento de alertas por los docentes (operaciones reales de la aplicación):
    # - «mejora» cuyo promedio ya superó 3.0: el docente la marca como resuelta;
    # - la mitad de las de «umbral»: el docente la marca en revisión.
    perfil = {ids["estudiante"][e.documento]: e for e in plan.estudiantes}
    promedios = {fila.estudiante_id: float(fila.p) for fila in _promedios()}
    estados = {"resolved": 0, "reviewed": 0}
    for alerta in sorted(api.llamar("admin", "get", "/alertas", 200), key=lambda x: x["id"]):
        est = perfil[alerta["estudiante_id"]]
        docente = docentes_por_grupo[est.grupo][0]
        if est.perfil == "mejora" and promedios.get(alerta["estudiante_id"], 0) >= 3:
            nuevo = "resolved"
        elif est.perfil == "umbral" and alerta["id"] % 2 == 0:
            nuevo = "reviewed"
        else:
            continue
        api.llamar(docente, "put", f"/alertas/{alerta['id']}/estado", 200, json={"estado": nuevo})
        estados[nuevo] += 1

    for e in plan.estudiantes:
        if e.perfil == "retirado":
            api.llamar("admin", "put", f"/estudiantes/{ids['estudiante'][e.documento]}", 200, json={
                "documento": e.documento, "nombre": e.nombre, "apellido": e.apellido,
                "grupo_id": ids["grupo"][e.grupo], "activo": False})

    with database.engine.begin() as conn:
        # COMMENT no admite parámetros; el texto solo tiene letras, números, «=», «-» y espacios.
        marca = f"{MARCA} semilla={plan.semilla} referencia={plan.referencia.isoformat()} generada={datetime.now():%Y-%m-%d %Hh%M}"
        assert re.fullmatch(r"[\w=\- ]+", marca)
        conn.execute(text(f"COMMENT ON DATABASE {BASE_DEMO} IS '{marca}'"))
    with database.engine.connect() as conn:
        resumen = resumen_base(conn)
    resumen["alertas_resueltas_por_docentes"] = estados["resolved"]
    resumen["alertas_en_revision_por_docentes"] = estados["reviewed"]
    return resumen


def _promedios():
    from sqlalchemy import text

    import database

    with database.engine.connect() as conn:
        return conn.execute(text("SELECT estudiante_id, AVG(nota) AS p FROM calificaciones GROUP BY estudiante_id")).all()


# ============================================================ verificación (solo lectura)

def resumen_base(conn) -> dict:
    from sqlalchemy import text

    r = {t: conn.execute(text(f"SELECT count(*) FROM {t}")).scalar() for t in
         ("usuarios", "materias", "grupos", "estudiantes", "asignaciones", "actividades", "calificaciones", "observaciones", "alertas")}
    r["alertas_por_estado"] = dict(conn.execute(text("SELECT estado, count(*) FROM alertas GROUP BY estado ORDER BY estado")).all())
    r["huella"] = huella(conn)
    r["marca"] = marca_actual(conn)
    return r


COMPROBACIONES = {
    "notas fuera de 0.0–5.0 o con más de un decimal":
        "SELECT count(*) FROM calificaciones WHERE nota < 0 OR nota > 5 OR nota * 10 <> trunc(nota * 10)",
    "calificaciones duplicadas (mismo estudiante y actividad)":
        "SELECT count(*) FROM (SELECT estudiante_id, actividad_id FROM calificaciones GROUP BY 1, 2 HAVING count(*) > 1) x",
    "calificaciones cuya materia no coincide con la de su actividad":
        "SELECT count(*) FROM calificaciones c JOIN actividades a ON a.id = c.actividad_id WHERE a.materia_id <> c.materia_id",
    "calificaciones de un estudiante de otro grupo":
        "SELECT count(*) FROM calificaciones c JOIN actividades a ON a.id = c.actividad_id JOIN estudiantes e ON e.id = c.estudiante_id WHERE e.grupo_id <> a.grupo_id",
    "actividades sin docente asignado":
        "SELECT count(*) FROM actividades a WHERE NOT EXISTS (SELECT 1 FROM asignaciones s WHERE s.materia_id = a.materia_id AND s.grupo_id = a.grupo_id)",
    "materias con más de un docente en el mismo grupo":
        "SELECT count(*) FROM (SELECT materia_id, grupo_id FROM asignaciones GROUP BY 1, 2 HAVING count(*) > 1) x",
    "estudiantes con promedio menor que 3.0 y sin ninguna alerta":
        "SELECT count(*) FROM (SELECT estudiante_id FROM calificaciones GROUP BY 1 HAVING AVG(nota) < 3) p WHERE NOT EXISTS (SELECT 1 FROM alertas a WHERE a.estudiante_id = p.estudiante_id)",
    "alertas de estudiantes sin calificaciones":
        "SELECT count(*) FROM alertas a WHERE NOT EXISTS (SELECT 1 FROM calificaciones c WHERE c.estudiante_id = a.estudiante_id)",
    "más de una alerta abierta por estudiante (D3)":
        "SELECT count(*) FROM (SELECT estudiante_id FROM alertas WHERE estado IN ('active', 'reviewed') GROUP BY 1 HAVING count(*) > 1) x",
    "documentos o correos repetidos":
        "SELECT (SELECT count(*) - count(DISTINCT documento) FROM estudiantes) + (SELECT count(*) - count(DISTINCT lower(email)) FROM usuarios)",
    "correos fuera del dominio de demostración":
        "SELECT count(*) FROM usuarios WHERE email NOT LIKE '%@demo.classkids.local'",
}


def verificar(conn) -> list[tuple[str, int]]:
    from sqlalchemy import text

    return [(nombre, conn.execute(text(sql)).scalar()) for nombre, sql in COMPROBACIONES.items()]


# ============================================================ credenciales locales

def escribir_credenciales(admin_password: str, docente_password: str) -> None:
    filas = [f"| Administrador | `{cat.ADMINISTRADOR['email']}` | `{admin_password}` | Todas |"]
    for d in cat.DOCENTES:
        asign: dict[str, list[str]] = {}
        for docente, materia, grupo in cat.ASIGNACIONES:
            if docente == d["clave"]:
                asign.setdefault(next(m["nombre"] for m in cat.MATERIAS if m["clave"] == materia), []).append(grupo)
        texto = "; ".join(f"{m}: {', '.join(gs)}" for m, gs in asign.items())
        filas.append(f"| Docente: {d['nombre']} {d['apellido']} | `{d['email']}` | `{docente_password}` | {texto} |")
    CREDENCIALES.write_text(
        "# Credenciales de la demostración (LOCAL, excluido de Git)\n\n"
        "Generado por `demo/generar_demo.py`. Solo sirven para la base `classkids_demo` (puerto 5434).\n"
        "Para cambiarlas, edita `DEMO_ADMIN_PASSWORD` y `DEMO_DOCENTE_PASSWORD` en `backend/.env.demo`\n"
        "y ejecuta `python demo/generar_demo.py generar --reiniciar`.\n\n"
        "| Cuenta | Correo | Contraseña | Asignaciones |\n|---|---|---|---|\n" + "\n".join(filas) + "\n",
        encoding="utf-8")


# ============================================================ línea de comandos

def main_cli(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Base de demostración de ClassKids (classkids_demo).")
    sub = parser.add_subparsers(dest="orden", required=True)
    sub.add_parser("preparar", help="Crea backend/.env.demo con claves aleatorias.")
    g = sub.add_parser("generar", help="Genera los datos de demostración mediante la API.")
    g.add_argument("--reiniciar", action="store_true", help="Borra los datos de classkids_demo antes de generar.")
    g.add_argument("--fecha-referencia", type=date.fromisoformat, default=None, help="AAAA-MM-DD (por defecto, hoy).")
    g.add_argument("--semilla", type=int, default=SEMILLA)
    sub.add_parser("verificar", help="Comprobaciones de solo lectura.")
    args = parser.parse_args(argv)

    if args.orden == "preparar":
        preparar()
        return 0

    cargar_entorno()
    import database

    with database.engine.connect() as conn:
        validar_servidor(conn)
        marca = marca_actual(conn)

    if args.orden == "verificar":
        with database.engine.connect() as conn:
            print(f"Base: {BASE_DEMO} · {marca or 'sin datos de demostración'}")
            for k, v in resumen_base(conn).items():
                print(f"  {k}: {v}")
            fallos = 0
            for nombre, cantidad in verificar(conn):
                print(f"  [{'OK' if cantidad == 0 else 'FALLA'}] {nombre}: {cantidad}")
                fallos += cantidad != 0
        return 1 if fallos else 0

    if marca and marca.startswith(MARCA) and not args.reiniciar:
        print(f"La base ya tiene datos de demostración ({marca}).\n"
              "Para borrarlos y generarlos de nuevo: python demo/generar_demo.py generar --reiniciar")
        return 1
    admin_password = os.environ.get("DEMO_ADMIN_PASSWORD") or _clave()
    docente_password = os.environ.get("DEMO_DOCENTE_PASSWORD") or _clave()
    if len(admin_password) < 6 or len(docente_password) < 6:
        raise SystemExit("Las contraseñas de demostración deben tener al menos 6 caracteres.")

    plan = construir_plan(args.semilla, args.fecha_referencia)
    print(f"Generando {BASE_DEMO} (semilla {plan.semilla}, referencia {plan.referencia})...")
    resumen = generar(plan, admin_password, docente_password)
    escribir_credenciales(admin_password, docente_password)
    for k, v in resumen.items():
        print(f"  {k}: {v}")
    print(f"Credenciales locales: {CREDENCIALES}")
    return 0


if __name__ == "__main__":
    sys.exit(main_cli())
