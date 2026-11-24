"""Genera los diagramas de ClassKids (MER, casos de uso, arquitectura y flujos)
a partir de la estructura real verificada en PostgreSQL y en el código."""
import sys, os
sys.path.insert(0, sys.argv[2])
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Ellipse, Rectangle, Polygon

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
GREEN = "#1f7a5a"; NAVY = "#1e2a3a"; LIGHT = "#eef6f2"; GREY = "#6b7280"; ORANGE = "#e8a33d"; RED = "#c0392b"
plt.rcParams["font.family"] = "DejaVu Sans"

# ------------------------------------------------------------------ MER
ROW = 0.36; HEAD = 0.5; W = 4.6
TABLES = {
    "user_roles": (0.4, 17.5, [("id", "PK", "SERIAL"), ("nombre", "UQ", "VARCHAR(50)"), ("descripcion", "", "TEXT")]),
    "usuarios": (6.0, 17.5, [("id", "PK", "SERIAL"), ("email", "UQ", "VARCHAR(255)"), ("nombre", "", "VARCHAR(120)"), ("apellido", "", "VARCHAR(120)"),
                             ("password_hash", "", "VARCHAR(255)"), ("rol_id", "FK", "INTEGER"), ("activo", "", "BOOLEAN"), ("created_at", "", "TIMESTAMP"), ("last_sign_in_at", "", "TIMESTAMP")]),
    "invitaciones": (12.0, 17.5, [("id", "PK", "SERIAL"), ("email", "", "VARCHAR(255)"), ("rol_id", "FK", "INTEGER"), ("token", "UQ", "VARCHAR(120)"),
                                  ("expires_at", "", "TIMESTAMP"), ("accepted_at", "", "TIMESTAMP"), ("created_at", "", "TIMESTAMP")]),
    "password_reset_tokens": (18.0, 17.5, [("id", "PK", "SERIAL"), ("email", "", "VARCHAR(255)"), ("token", "UQ", "VARCHAR(120)"),
                                           ("expires_at", "", "TIMESTAMP"), ("used_at", "", "TIMESTAMP"), ("created_at", "", "TIMESTAMP")]),
    "grupos": (0.4, 12.8, [("id", "PK", "SERIAL"), ("nombre", "", "VARCHAR(120)"), ("grado", "", "VARCHAR(30)"), ("turno", "", "VARCHAR(30)"), ("ano_lectivo", "", "INTEGER")]),
    "asignaciones": (6.0, 12.8, [("id", "PK", "SERIAL"), ("docente_id", "FK", "INTEGER"), ("materia_id", "FK", "INTEGER"), ("grupo_id", "FK", "INTEGER")]),
    "materias": (12.0, 12.8, [("id", "PK", "SERIAL"), ("nombre", "", "VARCHAR(120)"), ("codigo", "", "VARCHAR(30)")]),
    "actividades": (12.0, 10.2, [("id", "PK", "SERIAL"), ("materia_id", "FK", "INTEGER"), ("grupo_id", "FK", "INTEGER"), ("titulo", "", "VARCHAR(200)"),
                                 ("tipo", "", "VARCHAR(30)"), ("descripcion", "", "TEXT"), ("fecha_entrega", "", "DATE")]),
    "estudiantes": (0.4, 9.6, [("id", "PK", "SERIAL"), ("documento", "UQ", "VARCHAR(50)"), ("nombre", "", "VARCHAR(120)"), ("apellido", "", "VARCHAR(120)"),
                               ("grupo_id", "FK", "INTEGER"), ("activo", "", "BOOLEAN")]),
    "calificaciones": (6.0, 9.8, [("id", "PK", "SERIAL"), ("estudiante_id", "FK", "INTEGER"), ("materia_id", "FK", "INTEGER"), ("actividad_id", "FK", "INTEGER"),
                                  ("nota", "CK", "NUMERIC(3,1)"), ("periodo", "", "INTEGER"), ("observacion", "", "TEXT"), ("fecha_registro", "", "TIMESTAMP")]),
    "observaciones": (0.4, 5.6, [("id", "PK", "SERIAL"), ("estudiante_id", "FK", "INTEGER"), ("tipo", "", "VARCHAR(50)"), ("descripcion", "", "TEXT"), ("fecha", "", "TIMESTAMP")]),
    "alertas": (6.0, 5.2, [("id", "PK", "SERIAL"), ("estudiante_id", "FK", "INTEGER"), ("tipo", "", "VARCHAR(80)"), ("mensaje", "", "TEXT"),
                           ("estado", "", "VARCHAR(30)"), ("fecha_creacion", "", "TIMESTAMP")]),
}

def table_box(ax, name, x, ytop, cols):
    h = HEAD + ROW * len(cols)
    ax.add_patch(Rectangle((x, ytop - h), W, h, facecolor="white", edgecolor=NAVY, lw=1.4, zorder=2))
    ax.add_patch(Rectangle((x, ytop - HEAD), W, HEAD, facecolor=GREEN, edgecolor=NAVY, lw=1.4, zorder=3))
    ax.text(x + W / 2, ytop - HEAD / 2, name, ha="center", va="center", color="white", fontsize=10.5, weight="bold", zorder=4)
    for i, (c, k, t) in enumerate(cols):
        yy = ytop - HEAD - ROW * (i + 0.5)
        col = {"PK": "#b7791f", "FK": "#2b6cb0", "UQ": GREEN, "CK": RED}.get(k, GREY)
        ax.text(x + 0.12, yy, k, ha="left", va="center", fontsize=7, color=col, weight="bold", zorder=4)
        ax.text(x + 0.62, yy, c, ha="left", va="center", fontsize=8.3, color=NAVY, weight="bold" if k == "PK" else "normal", zorder=4)
        ax.text(x + W - 0.1, yy, t, ha="right", va="center", fontsize=7.3, color=GREY, zorder=4)
    return h

def rel(ax, pts, a="1", b="N", label=None, dashed=False, lpos=None):
    xs, ys = zip(*pts)
    ax.plot(xs, ys, color=NAVY if not dashed else GREY, lw=1.2, ls="--" if dashed else "-", zorder=1)
    def end_label(p, q, txt):
        dx, dy = q[0] - p[0], q[1] - p[1]
        n = max((dx * dx + dy * dy) ** 0.5, 1e-6)
        ax.text(p[0] + dx / n * 0.28 + (0.12 if dy else 0), p[1] + dy / n * 0.28 + (0.13 if dx else 0), txt,
                fontsize=8.5, color=RED, weight="bold", ha="center", va="center", zorder=5,
                bbox=dict(facecolor="white", edgecolor="none", pad=0.4))
    end_label(pts[0], pts[1], a); end_label(pts[-1], pts[-2], b)
    if label:
        lx, ly = lpos if lpos else ((pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2)
        ax.text(lx, ly, label, fontsize=7.2, color=GREY, style="italic", ha="center", va="center", zorder=5,
                bbox=dict(facecolor="white", edgecolor="none", pad=0.5))

def row_y(name, col):
    x, ytop, cols = TABLES[name]
    i = [c[0] for c in cols].index(col)
    return ytop - HEAD - ROW * (i + 0.5)

def mer():
    fig, ax = plt.subplots(figsize=(23.5, 17.2))
    ax.set_xlim(0, 23.2); ax.set_ylim(1.6, 19.2); ax.axis("off")
    for n, (x, y, cols) in TABLES.items():
        table_box(ax, n, x, y, cols)
    ub = 17.5 - HEAD - ROW * 3
    rel(ax, [(2.7, ub), (2.7, row_y("usuarios", "rol_id")), (6.0, row_y("usuarios", "rol_id"))], "1", "N", "usuarios.rol_id", lpos=(4.3, row_y("usuarios", "rol_id") + 0.28))
    rel(ax, [(2.7, 17.5), (2.7, 18.4), (14.3, 18.4), (14.3, 17.5)], "1", "N", "invitaciones.rol_id", lpos=(10.6, 18.4))
    rel(ax, [(10.6, row_y("usuarios", "email")), (11.3, row_y("usuarios", "email")), (11.3, 18.8), (20.3, 18.8), (20.3, 17.5)], "1", "N",
        "relación lógica por email (sin FK)", dashed=True, lpos=(16.0, 18.8))
    rel(ax, [(8.3, 13.8), (8.3, 12.8)], "1", "N", "docente_id", lpos=(9.1, 13.3))
    rel(ax, [(12.0, row_y("asignaciones", "materia_id")), (10.6, row_y("asignaciones", "materia_id"))], "1", "N", "materia_id", lpos=(11.3, row_y("asignaciones", "materia_id") + 0.3))
    rel(ax, [(5.0, row_y("asignaciones", "grupo_id")), (6.0, row_y("asignaciones", "grupo_id"))], "1", "N", "grupo_id", lpos=(5.5, row_y("asignaciones", "grupo_id") + 0.3))
    gb = 12.8 - HEAD - ROW * 5
    rel(ax, [(2.7, gb), (2.7, 9.6)], "1", "N", "grupo_id\nON DELETE SET NULL", lpos=(1.45, 10.05))
    rel(ax, [(4.3, gb), (4.3, 10.35), (13.5, 10.35), (13.5, 10.2)], "1", "N", "actividades.grupo_id", lpos=(11.3, 10.35))
    rel(ax, [(15.0, 12.8 - HEAD - ROW * 3), (15.0, 10.2)], "1", "N", "materia_id", lpos=(15.8, 10.85))
    rel(ax, [(5.0, row_y("calificaciones", "estudiante_id")), (6.0, row_y("calificaciones", "estudiante_id"))], "1", "N", "ON DELETE\nCASCADE",
        lpos=(5.5, row_y("calificaciones", "estudiante_id") - 0.55))
    rel(ax, [(12.0, row_y("calificaciones", "actividad_id")), (10.6, row_y("calificaciones", "actividad_id"))], "1", "N", "actividad_id (opcional)\nON DELETE SET NULL",
        lpos=(11.3, row_y("calificaciones", "actividad_id") - 0.55))
    rel(ax, [(16.6, row_y("materias", "nombre")), (17.4, row_y("materias", "nombre")), (17.4, 6.85), (11.0, 6.85),
             (11.0, row_y("calificaciones", "materia_id")), (10.6, row_y("calificaciones", "materia_id"))], "1", "N", "calificaciones.materia_id", lpos=(14.2, 6.85))
    rel(ax, [(2.7, 9.6 - HEAD - ROW * 6), (2.7, 5.6)], "1", "N", "ON DELETE CASCADE", lpos=(3.9, 6.15))
    rel(ax, [(5.0, row_y("estudiantes", "activo")), (5.5, row_y("estudiantes", "activo")), (5.5, row_y("alertas", "estudiante_id")),
             (6.0, row_y("alertas", "estudiante_id"))], "1", "N")
    ax.text(8.3, 2.2, "alertas.estudiante_id  ON DELETE CASCADE", fontsize=7.2, color=GREY, style="italic", ha="center")
    # Leyenda
    lx, ly = 12.0, 6.2
    ax.add_patch(Rectangle((lx, ly - 3.55), 10.8, 3.55, facecolor=LIGHT, edgecolor=GREEN, lw=1))
    ax.text(lx + 0.2, ly - 0.35, "Convenciones y restricciones reales (PostgreSQL 15)", fontsize=10, weight="bold", color=NAVY, va="center")
    items = [("PK", "#b7791f", "Clave primaria (SERIAL)"), ("FK", "#2b6cb0", "Clave foránea"), ("UQ", GREEN, "Valor único"),
             ("CK", RED, "CHECK: nota entre 0 y 5")]
    for i, (k, c, t) in enumerate(items):
        ax.text(lx + 0.3, ly - 0.9 - i * 0.42, k, color=c, weight="bold", fontsize=9, va="center")
        ax.text(lx + 1.0, ly - 0.9 - i * 0.42, t, fontsize=9, va="center", color=NAVY)
    notes = ["Índices únicos en asignaciones:", "  (docente_id, materia_id, grupo_id) y (materia_id, grupo_id)",
             "  → un solo docente por materia en cada grupo.", "1 / N: cardinalidad uno a muchos.",
             "calificaciones.entregado (BOOLEAN): solo en la base de", "  pruebas; migración 001 pendiente en la base real."]
    for i, t in enumerate(notes):
        ax.text(lx + 5.0, ly - 0.9 - i * 0.42, t, fontsize=8.6, va="center", color=NAVY)
    ax.set_title("ClassKids — Modelo entidad-relación (implementación actual)", fontsize=16, weight="bold", color=NAVY, pad=4)
    fig.savefig(f"{OUT}/mer-classkids.png", dpi=110, bbox_inches="tight", facecolor="white"); plt.close(fig)

# ------------------------------------------------------------------ CASOS DE USO
def actor(ax, x, y, name):
    ax.add_patch(plt.Circle((x, y + 0.75), 0.22, fill=False, lw=1.6, color=NAVY))
    ax.plot([x, x], [y + 0.53, y - 0.1], color=NAVY, lw=1.6)
    ax.plot([x - 0.38, x + 0.38], [y + 0.3, y + 0.3], color=NAVY, lw=1.6)
    ax.plot([x, x - 0.3], [y - 0.1, y - 0.6], color=NAVY, lw=1.6)
    ax.plot([x, x + 0.3], [y - 0.1, y - 0.6], color=NAVY, lw=1.6)
    ax.text(x, y - 0.9, name, ha="center", va="top", fontsize=11, weight="bold", color=NAVY)

def casos_uso():
    fig, ax = plt.subplots(figsize=(17, 15.5))
    ax.set_xlim(0, 17); ax.set_ylim(-0.9, 14.7); ax.axis("off")
    ax.add_patch(Rectangle((3.4, 0.6), 10.5, 13.4, fill=False, lw=2, color=NAVY))
    ax.text(8.65, 13.65, "Sistema ClassKids (implementación actual)", ha="center", fontsize=14, weight="bold", color=NAVY)
    left = [("CU-01", "Iniciar sesión"), ("CU-03", "Cerrar sesión"), ("CU-14", "Recuperar contraseña"), ("CU-04", "Gestionar grupos"),
            ("CU-05", "Gestionar estudiantes"), ("CU-06", "Gestionar materias"), ("CU-07", "Asignar docente a materia y grupo"),
            ("CU-08", "Gestionar actividades"), ("CU-09", "Registrar calificación"), ("CU-10", "Registrar observación"),
            ("CU-11", "Consultar tablero de rendimiento"), ("CU-13", "Gestionar estado de alerta")]
    pos = {}
    for i, (c, t) in enumerate(left):
        pos[c] = (6.3, 13.0 - i * 1.05)
    right = [("CU-02", "Gestionar usuarios", 10.6), ("CU-16", "Consultar panel de\nadministración", 9.0),
             ("CU-12", "Generar alerta\nacadémica", pos["CU-09"][1]), ("CU-15", "Activar cuenta\npor invitación", 1.5)]
    for c, t, y in right:
        pos[c] = (11.3, y)
    for c, t in left + [(c, t) for c, t, _ in right]:
        x, y = pos[c]
        fc = "#fff4e5" if c in ("CU-02", "CU-16") else "#fdecea" if c == "CU-12" else LIGHT
        ax.add_patch(Ellipse((x, y), 4.2, 0.92, facecolor=fc, edgecolor=NAVY, lw=1.3, zorder=2))
        ax.text(x, y, f"{c}  {t}" if "\n" not in t else f"{c}\n{t}", ha="center", va="center", fontsize=9, color=NAVY, zorder=3)
    actor(ax, 1.3, 7.3, "Docente")
    actor(ax, 15.9, 9.4, "Administrador")
    actor(ax, 15.9, 4.4, "Sistema")
    actor(ax, 15.9, 1.1, "Usuario\ninvitado")
    for c, _ in left:
        ax.plot([1.75, pos[c][0] - 2.1], [7.6, pos[c][1]], color=NAVY, lw=0.8, zorder=1)
    for c in ("CU-02", "CU-16"):
        ax.plot([15.45, pos[c][0] + 2.1], [9.7, pos[c][1]], color=ORANGE, lw=1.5, zorder=1)
    ax.plot([15.45, pos["CU-12"][0] + 2.1], [4.7, pos["CU-12"][1]], color=NAVY, lw=0.9)
    ax.plot([15.45, pos["CU-15"][0] + 2.1], [1.4, pos["CU-15"][1]], color=NAVY, lw=0.9)
    # generalización Administrador -> Docente (punta hueca en Docente)
    ax.plot([15.9, 15.9, 1.3, 1.3], [10.4, 14.35, 14.35, 8.75], color=NAVY, lw=1.4)
    ax.add_patch(Polygon([[1.3, 8.35], [1.12, 8.75], [1.48, 8.75]], closed=True, facecolor="white", edgecolor=NAVY, lw=1.4, zorder=4))
    ax.text(8.65, 14.5, "Generalización: el Administrador hereda todas las funciones del Docente (accede a /app mediante «Vista docente»)",
            ha="center", fontsize=9, color=GREY, style="italic")
    ax.annotate("", xy=(pos["CU-12"][0] - 2.1, pos["CU-12"][1]), xytext=(pos["CU-09"][0] + 2.1, pos["CU-09"][1]),
                arrowprops=dict(arrowstyle="->", ls="--", color=RED, lw=1.4))
    ax.text(8.8, pos["CU-09"][1] + 0.35, "<<include>>", fontsize=8.5, color=RED, ha="center", weight="bold")
    ax.text(8.8, pos["CU-09"][1] - 0.42, "solo al crear la nota\ny si promedio < 3.0", fontsize=7.6, color=RED, ha="center", va="top")
    ax.text(3.55, 0.25, "Naranja: exclusivo del administrador (controlado por el backend).   Rojo claro: caso de uso ejecutado por el sistema.",
            fontsize=8.5, color=GREY)
    fig.savefig(f"{OUT}/casos-de-uso.png", dpi=110, bbox_inches="tight", facecolor="white"); plt.close(fig)

# ------------------------------------------------------------------ ARQUITECTURA
def box(ax, x, y, w, h, title, lines, color=GREEN, fc="white", fs=9.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.15", facecolor=fc, edgecolor=color, lw=1.6))
    ax.text(x + w / 2, y + h - 0.3, title, ha="center", va="top", fontsize=fs + 1.5, weight="bold", color=NAVY)
    for i, l in enumerate(lines):
        ax.text(x + 0.25, y + h - 0.85 - i * 0.38, l, ha="left", va="top", fontsize=fs, color=NAVY)

def arquitectura():
    fig, ax = plt.subplots(figsize=(17, 9.6))
    ax.set_xlim(0, 17); ax.set_ylim(0, 9.6); ax.axis("off")
    ax.text(8.5, 9.3, "ClassKids — Arquitectura cliente-servidor en tres capas", ha="center", fontsize=15, weight="bold", color=NAVY)
    box(ax, 0.3, 1.0, 5.2, 7.6, "Capa de presentación", [
        "Navegador · SPA React 18 + TypeScript", "Vite (puerto 8080) · Tailwind · shadcn/ui", "", "pages/  Dashboard, Grupos, Estudiantes,",
        "        Materias, Actividades, Calificaciones,", "        Análisis, Alertas, admin/*, legal/*", "components/  dashboard, students, layout",
        "contexts/AuthContext  sesión (localStorage)", "App.tsx  rutas protegidas por rol", "api/client.ts  fetch + Bearer token",
        "Recharts  gráficas del tablero", "", "Cálculo en el cliente: promedios,", "clasificación de riesgo y tendencias"], fc="#f7fbf9")
    box(ax, 6.0, 1.0, 5.2, 7.6, "Capa de lógica (API REST)", [
        "FastAPI + Uvicorn (puerto 8000) · Python", "", "Middleware require_authentication:", "  valida JWT (HS256, 8 h) y rol admin", "",
        "49 operaciones REST (main.py)", "Esquemas Pydantic (entrada JSON)", "Regla de alerta automática", "  (promedio < 3.0 al crear nota)",
        "Hash de contraseñas: passlib PBKDF2", "Invitaciones y recuperación por token", "", "Swagger UI en /docs"], fc="#f7fbf9")
    box(ax, 11.7, 3.4, 5.0, 5.2, "Capa de datos", [
        "PostgreSQL 15 (Docker)", "contenedor classkids_db · puerto 5432", "", "12 tablas · FK · UNIQUE · CHECK", "SQLAlchemy Core: SQL parametrizado",
        "  con text() (sin modelos ORM)", "init.sql: esquema + datos demo", "Volumen persistente postgres_data"], fc="#f7fbf9")
    box(ax, 11.7, 1.0, 5.0, 1.9, "Servicio externo (opcional)", ["SMTP: correos de invitación y", "recuperación de contraseña"], color=ORANGE, fc="#fffaf0", fs=9)
    ax.annotate("", xy=(6.0, 5.4), xytext=(5.5, 5.4), arrowprops=dict(arrowstyle="<->", color=NAVY, lw=2))
    ax.text(5.75, 5.85, "HTTP/JSON\nAuthorization:\nBearer JWT", ha="center", fontsize=8.2, color=NAVY)
    ax.annotate("", xy=(11.7, 6.0), xytext=(11.2, 6.0), arrowprops=dict(arrowstyle="<->", color=NAVY, lw=2))
    ax.text(11.45, 6.35, "SQL", ha="center", fontsize=8.5, color=NAVY)
    ax.annotate("", xy=(11.7, 1.9), xytext=(11.2, 1.9), arrowprops=dict(arrowstyle="->", color=ORANGE, lw=2))
    ax.text(8.5, 0.45, "Flujo: el usuario interactúa con React → client.ts envía la petición con el token → FastAPI valida el token y ejecuta SQL → PostgreSQL responde → React calcula indicadores y muestra.",
            ha="center", fontsize=8.6, color=GREY)
    fig.savefig(f"{OUT}/arquitectura.png", dpi=110, bbox_inches="tight", facecolor="white"); plt.close(fig)

# ------------------------------------------------------------------ FLUJO DEL PROCESO
def flowbox(ax, x, y, w, h, txt, fc=LIGHT, ec=GREEN, fs=9.2):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02,rounding_size=0.12", facecolor=fc, edgecolor=ec, lw=1.4))
    ax.text(x, y, txt, ha="center", va="center", fontsize=fs, color=NAVY)

def arrow(ax, a, b, txt=None, color=NAVY):
    ax.annotate("", xy=b, xytext=a, arrowprops=dict(arrowstyle="->", color=color, lw=1.4))
    if txt:
        ax.text((a[0] + b[0]) / 2 + 0.1, (a[1] + b[1]) / 2 + 0.12, txt, fontsize=8, color=color)

def flujo_proceso():
    fig, ax = plt.subplots(figsize=(17, 10))
    ax.set_xlim(0, 17); ax.set_ylim(0, 10); ax.axis("off")
    ax.text(8.5, 9.65, "ClassKids — Flujo general del proceso (tal como está implementado)", ha="center", fontsize=15, weight="bold", color=NAVY)
    lanes = [("Administrador", 7.9, "#fff4e5"), ("Docente", 5.0, LIGHT), ("Sistema", 2.1, "#fdecea")]
    for name, y, c in lanes:
        ax.add_patch(Rectangle((0.2, y - 1.3), 16.6, 2.6, facecolor=c, edgecolor="#d1d5db", lw=1))
        ax.text(0.55, y, name, rotation=90, ha="center", va="center", fontsize=11, weight="bold", color=NAVY)
    flowbox(ax, 2.4, 7.9, 2.6, 1.0, "1. Invita usuarios\n(CU-02) y gestiona roles", fc="white", ec=ORANGE)
    flowbox(ax, 5.6, 7.9, 2.6, 1.0, "2. Revisa métricas y\ndatos globales (CU-16)", fc="white", ec=ORANGE)
    flowbox(ax, 2.4, 5.0, 2.6, 1.0, "3. Activa cuenta (CU-15)\ne inicia sesión (CU-01)", fc="white")
    flowbox(ax, 5.6, 5.0, 2.6, 1.0, "4. Grupos (CU-04),\nmaterias (CU-06) y\nasignaciones (CU-07)", fc="white")
    flowbox(ax, 8.8, 5.0, 2.6, 1.0, "5. Registra estudiantes\n(CU-05) y actividades\n(CU-08)", fc="white")
    flowbox(ax, 12.0, 5.0, 2.6, 1.0, "6. Registra\ncalificaciones (CU-09)\ny observaciones (CU-10)", fc="white")
    flowbox(ax, 15.1, 5.0, 2.6, 1.0, "9. Consulta tablero\n(CU-11) y gestiona\nalertas (CU-13)", fc="white")
    flowbox(ax, 10.4, 2.1, 3.0, 1.0, "7. Calcula promedio acumulado\nal crear cada nota", fc="white", ec=RED)
    flowbox(ax, 14.0, 2.1, 3.0, 1.0, "8. Si promedio < 3.0 y no hay\nalerta low_grade activa →\ncrea alerta (CU-12)", fc="white", ec=RED)
    arrow(ax, (2.4, 7.4), (2.4, 5.5), "enlace de invitación")
    arrow(ax, (3.7, 5.0), (4.3, 5.0)); arrow(ax, (6.9, 5.0), (7.5, 5.0)); arrow(ax, (10.1, 5.0), (10.7, 5.0))
    arrow(ax, (12.0, 4.5), (10.6, 2.6)); arrow(ax, (11.9, 2.1), (12.5, 2.1)); arrow(ax, (14.6, 2.6), (15.1, 4.5))
    arrow(ax, (13.3, 5.0), (13.8, 5.0))
    ax.text(8.5, 0.35, "El tablero (CU-11) calcula en el navegador promedios por grupo, distribución de rendimiento, estudiantes en riesgo (< 70 %) y tendencia.",
            ha="center", fontsize=8.8, color=GREY)
    fig.savefig(f"{OUT}/flujo-proceso.png", dpi=110, bbox_inches="tight", facecolor="white"); plt.close(fig)

def flujo_calificacion():
    fig, ax = plt.subplots(figsize=(13, 12.5))
    ax.set_xlim(0, 13); ax.set_ylim(0, 12.5); ax.axis("off")
    ax.text(6.5, 12.15, "Registro de calificaciones y alerta automática (código actual)", ha="center", fontsize=14, weight="bold", color=NAVY)
    steps = [
        (11.2, "Docente selecciona grupo y actividad\n(pantalla Calificaciones)"),
        (10.0, "La UI lista los estudiantes con su nota de esa actividad en porcentaje\n(nota × 20); un estudiante sin nota aparece con el campo vacío"),
        (8.8, "Docente digita o cambia notas (0–100), marca «Entregado»\ny pulsa «Guardar cambios (n)»"),
        (7.6, "Solo las filas MODIFICADAS: nota = porcentaje ÷ 20 (1 decimal)\n¿la fila ya tenía calificación?"),
    ]
    for y, t in steps:
        flowbox(ax, 6.5, y, 8.6, 0.85, t, fc="white")
    for a, b in zip(steps, steps[1:]):
        arrow(ax, (6.5, a[0] - 0.43), (6.5, b[0] + 0.43))
    flowbox(ax, 3.2, 6.0, 4.6, 1.05, "Sí → PUT /calificaciones/{id}\nsolo los campos enviados: conserva\nperiodo y observación (no evalúa alertas)", fc="#f3f4f6", fs=8.6)
    flowbox(ax, 9.8, 6.1, 4.6, 0.85, "No → POST /calificaciones\n(periodo 1; guarda «entregado»)", fc="white")
    arrow(ax, (5.2, 7.17), (3.6, 6.53), "sí"); arrow(ax, (7.8, 7.17), (9.4, 6.53), "no")
    flowbox(ax, 9.8, 4.75, 4.6, 0.85, "Calcula AVG(nota) de TODAS las\ncalificaciones del estudiante", fc="#fdecea", ec=RED)
    arrow(ax, (9.8, 5.67), (9.8, 5.18))
    flowbox(ax, 9.8, 3.4, 4.6, 1.0, "¿promedio < 3.0 y sin alerta de bajo\nrendimiento (low_grade o «Bajo Rendimiento»)\nactiva o en revisión?", fc="#fdecea", ec=RED, fs=8.4)
    arrow(ax, (9.8, 4.32), (9.8, 3.83))
    flowbox(ax, 9.8, 1.95, 4.6, 0.85, "Sí → INSERT alerta tipo 'low_grade',\nestado 'active', «Promedio académico bajo: X.XX»", fc="#fdecea", ec=RED)
    arrow(ax, (9.8, 2.97), (9.8, 2.38), "sí")
    flowbox(ax, 3.2, 3.4, 4.6, 0.85, "No → solo se guarda la nota", fc="#f3f4f6")
    arrow(ax, (7.5, 3.4), (5.5, 3.4), "no")
    flowbox(ax, 6.5, 0.6, 8.6, 0.7, "La UI recarga la tabla y muestra «Calificaciones guardadas correctamente»", fc="white")
    fig.savefig(f"{OUT}/flujo-calificacion-alerta.png", dpi=110, bbox_inches="tight", facecolor="white"); plt.close(fig)

mer(); casos_uso(); arquitectura(); flujo_proceso(); flujo_calificacion()
print("diagramas generados en", OUT)
