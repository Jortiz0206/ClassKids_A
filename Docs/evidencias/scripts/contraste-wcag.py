"""Verifica el contraste WCAG 2.1 de los pares de color de ClassKids en los temas claro y oscuro.

Lee los tokens HSL directamente de frontend/src/index.css (bloques `:root` y `.dark`), así el
resultado corresponde al código entregado. Uso (desde la raíz del repositorio):

    python Docs/evidencias/scripts/contraste-wcag.py > Docs/evidencias/contraste-wcag.md

Criterios: texto normal ≥ 4.5:1; componentes gráficos y bordes de campos ≥ 3:1 (WCAG 1.4.11).
"""
import colorsys
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[3]
css = (RAIZ / "frontend" / "src" / "index.css").read_text(encoding="utf-8")
PATRON = re.compile(r"--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%")


def leer_tokens(texto):
    return {m.group(1): tuple(float(x) for x in m.groups()[1:]) for m in PATRON.finditer(texto)}


inicio_oscuro = css.index("  .dark {")
TEMAS = {
    "claro": leer_tokens(css[css.index(":root {"):inicio_oscuro]),
    "oscuro": leer_tokens(css[inicio_oscuro:css.index("}", inicio_oscuro)]),
}
BLANCO = (0.0, 0.0, 100.0)


def rgb(hsl):
    h, s, l = hsl
    return colorsys.hls_to_rgb(h / 360, l / 100, s / 100)


def luminancia(c):
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (f(x) for x in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = sorted((luminancia(rgb(a)), luminancia(rgb(b))), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def hexa(hsl):
    return "#%02X%02X%02X" % tuple(round(x * 255) for x in rgb(hsl))


PARES = [
    ("Texto principal sobre el fondo", "foreground", "background", 4.5),
    ("Texto principal sobre tarjeta", "foreground", "card", 4.5),
    ("Texto secundario sobre el fondo", "muted-foreground", "background", 4.5),
    ("Texto secundario sobre tarjeta", "muted-foreground", "card", 4.5),
    ("Texto secundario sobre gris claro", "muted-foreground", "secondary", 4.5),
    ("Botón principal (texto sobre verde)", "primary-foreground", "primary", 4.5),
    ("Botón de peligro (texto sobre frambuesa)", "destructive-foreground", "destructive", 4.5),
    ("Enlaces azules sobre tarjeta", "azul", "card", 4.5),
    ("Estado Excelente", "nivel-excelente-fg", "nivel-excelente", 4.5),
    ("Estado Aprobado", "nivel-aprobado-fg", "nivel-aprobado", 4.5),
    ("Estado Observar / Vencida", "nivel-observar-fg", "nivel-observar", 4.5),
    ("Estado Reprobado / En riesgo", "nivel-reprobado-fg", "nivel-reprobado", 4.5),
    ("Estado Alerta / Crítico", "nivel-alerta-fg", "nivel-alerta", 4.5),
    ("Estado Sin calificar", "nivel-sin-fg", "nivel-sin", 4.5),
    ("Etiqueta de grupo (lavanda)", "nivel-grupo-fg", "nivel-grupo", 4.5),
    ("Texto de éxito sobre tarjeta", "success", "card", 4.5),
    ("Texto de advertencia sobre tarjeta", "warning", "card", 4.5),
    ("Texto informativo sobre tarjeta", "info", "card", 4.5),
    ("Menú: rótulo inactivo", "sidebar-foreground", "sidebar-background", 4.5),
    ("Menú: rótulo activo", "sidebar-primary", "sidebar-accent", 4.5),
    ("Texto sobre menta (ítem activo)", "foreground", "menta", 4.5),
    ("Texto sobre mantequilla (fila editada)", "foreground", "mantequilla", 4.5),
    ("Insignia de alertas (texto sobre frambuesa)", "destructive-foreground", "frambuesa", 4.5),
    ("Color de apoyo 2 como texto", "chart-2", "card", 4.5),
    ("Color de apoyo 3 como texto", "chart-3", "card", 4.5),
    ("Color de apoyo 4 como texto", "chart-4", "card", 4.5),
    ("Borde de campos de formulario", "input", "card", 3.0),
    ("Barra de gráfica ≥ 90 %", "barra-excelente", "card", 3.0),
    ("Barra de gráfica 80 – 89 %", "barra-alto", "card", 3.0),
    ("Barra de gráfica 70 – 79 %", "barra-observar", "card", 3.0),
    ("Barra de gráfica < 70 %", "barra-bajo", "card", 3.0),
    ("Indicador de foco (azul) sobre fondo", "azul", "background", 3.0),
]

print("# Verificación de contraste WCAG 2.1 (AA)\n")
print("Generado por `Docs/evidencias/scripts/contraste-wcag.py` a partir de `frontend/src/index.css` (tema claro `:root` y tema oscuro `.dark`).\n")
fallos = 0
for tema, valores in TEMAS.items():
    t = lambda n: BLANCO if n == "blanco" else valores.get(n, TEMAS["claro"][n])
    print(f"## Tema {tema}\n")
    print("| Uso | Primer plano | Fondo | Contraste | Mínimo | Resultado |")
    print("|---|---|---|---:|---:|---|")
    for uso, fg, bg, minimo in PARES:
        a, b = t(fg), t(bg)
        r = contraste(a, b)
        ok = r >= minimo
        fallos += not ok
        print(f"| {uso} | `{fg}` {hexa(a)} | `{bg}` {hexa(b)} | {r:.2f}:1 | {minimo}:1 | {'Cumple' if ok else 'NO CUMPLE'} |")
    print()
total = len(PARES) * len(TEMAS)
print(f"**Resultado:** {total - fallos} de {total} pares cumplen ({len(PARES)} por tema).")
sys.exit(1 if fallos else 0)
