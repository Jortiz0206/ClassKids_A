"""Genera Docs/evidencias/capturas-v3/README.md: índice de las evidencias VIGENTES.

Recorre vigente/ y lee los indice-*.json que dejan capturas-plataforma.cjs y componer-temas.py.
Uso (desde la raíz):  python Docs/evidencias/scripts/indice-capturas.py
"""
import json
import pathlib

SALTO = chr(10)
CARPETA = pathlib.Path(__file__).resolve().parents[1] / "capturas-v3"
VIG = CARPETA / "vigente"

ORDEN = [
    ("landing", "Landing"), ("login", "Inicio de sesión"), ("dashboard", "Dashboard"),
    ("modulos/usuarios", "Usuarios y administración"), ("modulos/grupos", "Grupos"),
    ("modulos/estudiantes", "Estudiantes"), ("modulos/materias", "Materias"),
    ("modulos/actividades", "Actividades"), ("modulos/calificaciones", "Calificaciones"),
    ("modulos/analisis", "Análisis"), ("modulos/alertas", "Alertas"),
    ("temas", "Modo claro y oscuro"), ("video", "Recorrido en video"),
]
COMBOS = ("escritorio-claro", "escritorio-oscuro", "celular-claro", "celular-oscuro")


def combinacion(i):
    disp = "escritorio" if i["dispositivo"].startswith("Escritorio") else "celular"
    tema = "claro" if i["tema"] == "Modo claro" else ("oscuro" if i["tema"] == "Modo oscuro" else "ambos")
    return f"{disp}-{tema}"


total = 0
secciones = []
for carpeta, titulo in ORDEN:
    items = []
    for f in sorted((VIG / carpeta).glob("indice-*.json")):
        items += json.loads(f.read_text(encoding="utf-8"))
    items = [i for i in items if (VIG / carpeta / i["archivo"]).exists()]
    if not items:
        secciones += [f"## {titulo}", "", "**Sin capturas.**", ""]
        continue
    total += len(items)
    vistas = {}
    for i in items:
        vistas.setdefault(i["vista"], {"descripcion": i["descripcion"], "archivos": {}})["archivos"][combinacion(i)] = f"vigente/{carpeta}/{i['archivo']}"
    secciones += [f"## {titulo} · `vigente/{carpeta}/` · {len(items)} capturas", ""]
    if carpeta == "temas":
        secciones += ["| Vista | Escritorio | Celular |", "|---|---|---|"]
        for v, d in vistas.items():
            esc, cel = d["archivos"].get("escritorio-ambos"), d["archivos"].get("celular-ambos")
            secciones.append(f"| {d['descripcion']} | " + (f"[ver]({esc})" if esc else "—") + " | " + (f"[ver]({cel})" if cel else "—") + " |")
    else:
        secciones += ["| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |", "|---|---|---|---|---|"]
        for v, d in vistas.items():
            celdas = [f"[ver]({d['archivos'][c]})" if c in d["archivos"] else "—" for c in COMBOS]
            secciones.append(f"| {d['descripcion']} | " + " | ".join(celdas) + " |")
    secciones.append("")

lineas = [
    "# Evidencias visuales vigentes",
    "",
    f"**{total} capturas reales** de la versión vigente de ClassKids, tomadas el **24/11/2026**, con los permisos por asignación vigentes, en el entorno de pruebas aislado (frontend 8081, API 8001, base `classkids_test` en el puerto 5433) con los datos de demostración.",
    "",
    "- Scripts:",
    "  - [`capturas-plataforma.cjs`](../scripts/capturas-plataforma.cjs) toma todas las vistas, en tema claro y oscuro.",
    "  - [`componer-temas.py`](../scripts/componer-temas.py) arma las comparaciones claro/oscuro.",
    "  - [`rotular-capturas.py`](../scripts/rotular-capturas.py) agrega el pie a cada imagen.",
    "- Nombre de archivo: `AAAA-MM-DD_vista_dispositivo_tema.png`. El dispositivo es `escritorio` (1366 px) o `celular` (390 × 844).",
    "- En cada captura se comprobó el tema (clase `dark` del documento) y que no hubiera desplazamiento horizontal: 0 problemas.",
    "- **Única escritura:** el mensaje de éxito de Calificaciones guarda un cambio en `classkids_test` y lo restaura enseguida. La huella MD5 de la tabla `calificaciones` antes y después fue idéntica.",
    "- Los diálogos de eliminar y desactivar se capturaron y se cancelaron.",
    "- Desde el 24/11/2026 cada docente ve solo sus asignaciones (H-08). Las capturas del docente usan el docente demo (5 materias en 3 grupos); se agregaron vistas de un docente con una sola materia (Matemáticas), del administrador y del filtro por materia en Análisis. Las respuestas de la API ante accesos no autorizados están en [`../permisos/verificacion-api-permisos.md`](../permisos/verificacion-api-permisos.md).",
    "- El video vigente (`frontend/public/video/recorrido-classkids-v3.webm`, grabado después de H-08) muestra al docente con sus asignaciones y al administrador con la visión general; tiene música instrumental original, a volumen bajo, que no suena sola y se controla desde la landing. La v1 (sin audio) y la v2 (anterior a H-08) se conservan como respaldo en `Docs/evidencias/video-respaldo/`.",
    "",
] + secciones + [
    "## Depuración de evidencias (23/11/2026)",
    "",
    "Las capturas V2 y las 94 capturas V3 anteriores se retiraron intencionalmente porque no representaban fielmente la aplicación. Este conjunto las reemplaza por completo.",
    "",
    "El 24/11 se retiró la comparación de la portada con la maqueta: la maqueta fue solo una referencia de estilo y las evidencias muestran únicamente la aplicación real.",
    "",
    "El 24/11, después de corregir H-08, se volvieron a tomar todas las capturas afectadas por los permisos (130 → 142): las del docente cambiaron de alcance y las acciones de catálogo se capturan con el administrador.",
    "",
]
(CARPETA / "README.md").write_text(SALTO.join(lineas), encoding="utf-8")
print("ok", total, "capturas")
