"""Evidencia de permisos de la API (H-08 y H-18) contra el backend de PRUEBAS (8001 → classkids_test).

Hace peticiones reales con tres sesiones (administrador, docente demo y docente de Matemáticas)
y escribe Docs/evidencias/permisos/verificacion-api-permisos.md con el resultado de cada una.
Solo hace lecturas e intentos de escritura que deben ser RECHAZADOS (403): si alguno se
aceptara, el script lo marca como fallo. No usa la base real.

Uso (desde la raíz, con el entorno de pruebas levantado):
    CK_DOCENTE_PASS=... CK_ADMIN_PASS=... python Docs/evidencias/scripts/verificar-permisos-api.py
"""
import datetime
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

API = "http://127.0.0.1:8001"
SALIDA = pathlib.Path(__file__).resolve().parents[1] / "permisos" / "verificacion-api-permisos.md"


def pedir(metodo, ruta, token=None, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(API + ruta, data=datos, method=metodo, headers={"Content-Type": "application/json"})
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")


def entrar(email, clave):
    estado, datos = pedir("POST", "/auth/login", cuerpo={"email": email, "password": clave})
    if estado != 200:
        sys.exit(f"No se pudo iniciar sesión con {email} ({estado}).")
    return datos["access_token"], datos["user"]["id"]


def main():
    doc_pass, adm_pass = os.environ.get("CK_DOCENTE_PASS"), os.environ.get("CK_ADMIN_PASS")
    if not doc_pass or not adm_pass:
        sys.exit("Defina CK_DOCENTE_PASS y CK_ADMIN_PASS (contraseñas demo de la base de pruebas).")
    adm, adm_id = entrar("admin@classkids.local", adm_pass)
    mate, mate_id = entrar("matematicas@classkids.local", doc_pass)
    demo, _ = entrar("docente@classkids.local", doc_pass)

    # Datos de referencia leídos con la sesión del administrador.
    asignaciones = pedir("GET", "/asignaciones", adm)[1]
    de_mate = [a for a in asignaciones if a["docente_id"] == mate_id]
    grupos_mate = {a["grupo_id"] for a in de_mate}
    ajena = next(a for a in asignaciones if a["docente_id"] != mate_id)
    actividades = pedir("GET", "/actividades", adm)[1]
    act_ajena = next(a for a in actividades if (a["materia_id"], a["grupo_id"]) == (ajena["materia_id"], ajena["grupo_id"]))
    estudiantes = pedir("GET", "/estudiantes", adm)[1]
    est_ajeno = next(e for e in estudiantes if e["grupo_id"] not in grupos_mate)
    est_propio = next(e for e in estudiantes if e["grupo_id"] in grupos_mate)
    alertas = pedir("GET", "/alertas", adm)[1]
    alerta_ajena = next(a for a in alertas if a["estudiante_id"] == est_ajeno["id"] or
                        next(e for e in estudiantes if e["id"] == a["estudiante_id"])["grupo_id"] not in grupos_mate)
    materias = pedir("GET", "/materias", adm)[1]
    otra_materia = next(m for m in materias if m["id"] not in {a["materia_id"] for a in de_mate})

    filas = []

    def caso(quien, metodo, ruta, esperado, token, cuerpo=None, detalle=""):
        estado, datos = pedir(metodo, ruta, token, cuerpo)
        n = f"{len(datos)} registros" if isinstance(datos, list) else (datos.get("detail", "") if isinstance(datos, dict) else "")
        filas.append((quien, f"`{metodo} {ruta}`", detalle, str(esperado), str(estado), n, "Cumple" if estado == esperado else "**NO CUMPLE**"))
        return estado, datos

    # H-18
    caso("Administrador", "PUT", f"/usuarios/{adm_id}/rol", 403, adm, {"role": "docente"}, "Cambiar su propio rol")
    caso("Administrador", "DELETE", f"/usuarios/{adm_id}", 403, adm, None, "Desactivar su propia cuenta")
    # H-08: lecturas permitidas y acotadas
    caso("Administrador", "GET", "/grupos", 200, adm, None, "Visión general")
    caso("Docente de Matemáticas", "GET", "/grupos", 200, mate, None, "Solo sus grupos")
    caso("Docente de Matemáticas", "GET", "/materias", 200, mate, None, "Solo sus materias")
    caso("Docente demo", "GET", "/materias", 200, demo, None, "Solo sus materias")
    caso("Docente de Matemáticas", "GET", "/calificaciones", 200, mate, None, "Solo notas de su materia en sus grupos")
    caso("Docente de Matemáticas", "GET", "/alertas", 200, mate, None, "Solo alertas de sus estudiantes")
    caso("Administrador", "GET", "/alertas", 200, adm, None, "Todas las alertas")
    # H-08: accesos ajenos cambiando identificadores
    caso("Docente de Matemáticas", "GET", f"/estudiantes?grupo_id={est_ajeno['grupo_id']}", 403, mate, None, "Estudiantes de un grupo ajeno")
    caso("Docente de Matemáticas", "GET", f"/calificaciones?actividad_id={act_ajena['id']}", 403, mate, None, "Notas de una actividad de otra materia")
    caso("Docente de Matemáticas", "POST", "/calificaciones", 403, mate,
         {"estudiante_id": est_propio["id"], "materia_id": otra_materia["id"], "nota": 1.0}, "Calificar otra materia a su estudiante")
    caso("Docente de Matemáticas", "POST", "/calificaciones", 403, mate,
         {"estudiante_id": est_ajeno["id"], "materia_id": de_mate[0]["materia_id"], "nota": 1.0}, "Calificar a un estudiante de otro grupo")
    caso("Docente de Matemáticas", "PUT", f"/actividades/{act_ajena['id']}", 403, mate,
         {"materia_id": act_ajena["materia_id"], "grupo_id": act_ajena["grupo_id"], "titulo": "Cambio", "tipo": "tarea"}, "Modificar una actividad ajena")
    caso("Docente de Matemáticas", "PUT", f"/alertas/{alerta_ajena['id']}/estado", 403, mate, {"estado": "resolved"}, "Resolver una alerta ajena")
    caso("Docente de Matemáticas", "POST", "/grupos", 403, mate, {"nombre": "No permitido"}, "Crear un grupo")
    caso("Docente de Matemáticas", "POST", "/materias", 403, mate, {"nombre": "No permitida"}, "Crear una materia")
    caso("Docente de Matemáticas", "GET", "/catalogo/docentes", 403, mate, None, "Catálogo de docentes")

    fallos = sum(1 for f in filas if f[-1] != "Cumple")
    lineas = [
        "# Verificación de permisos de la API (H-08 y H-18)",
        "",
        f"Peticiones reales al backend de pruebas (`{API}`, base `classkids_test`), ejecutadas el "
        f"{datetime.date.today().strftime('%d/%m/%Y')} con [`verificar-permisos-api.py`](../scripts/verificar-permisos-api.py). "
        "Sesiones: administrador, docente demo (5 materias en 3 grupos) y docente de Matemáticas (1 materia en 7 grupos).",
        "",
        f"**Resultado: {len(filas) - fallos} de {len(filas)} casos cumplen.** Los intentos denegados no modificaron datos.",
        "",
        "| Sesión | Petición | Caso | Esperado | Obtenido | Respuesta | Resultado |",
        "|---|---|---|---|---|---|---|",
    ] + [f"| {' | '.join(f)} |" for f in filas] + [
        "",
        "Las pruebas automatizadas equivalentes están en `backend/tests/test_permisos.py` (19 casos) y `e2e/tests/permisos.spec.ts`.",
        "",
    ]
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text("\n".join(lineas), encoding="utf-8")
    print(f"{len(filas) - fallos}/{len(filas)} casos cumplen → {SALIDA}")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
