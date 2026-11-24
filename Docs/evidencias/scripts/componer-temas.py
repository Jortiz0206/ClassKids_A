"""Composiciones de comparación a partir de capturas REALES ya tomadas (sin rótulo todavía):
vigente/temas/: la misma pantalla en modo claro y oscuro, lado a lado.

Uso (desde la raíz, después de capturas-plataforma.cjs y ANTES de rotular-capturas.py):
    python Docs/evidencias/scripts/componer-temas.py
Requiere Pillow.
"""
import json
import pathlib

from PIL import Image, ImageDraw, ImageFont

RAIZ = pathlib.Path(__file__).resolve().parents[3]
VIG = RAIZ / "Docs" / "evidencias" / "capturas-v3" / "vigente"


def fuente(t, negrita=True):
    for n in (("segoeuib.ttf" if negrita else "segoeui.ttf"), "arialbd.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(n, t)
        except OSError:
            continue
    return ImageFont.load_default()


def lado_a_lado(izq, der, rot_izq, rot_der, destino, ancho=1366):
    a, b = Image.open(izq).convert("RGB"), Image.open(der).convert("RGB")
    alto = round(a.height * ancho / a.width)
    a = a.resize((ancho, alto)); b = b.resize((ancho, round(b.height * ancho / b.width)))
    alto = max(a.height, b.height)
    lienzo = Image.new("RGB", (ancho * 2 + 24, alto + 64), "#F6F8FC")
    d = ImageDraw.Draw(lienzo)
    for x, im, rotulo in ((0, a, rot_izq), (ancho + 24, b, rot_der)):
        d.text((x + 8, 18), rotulo, fill="#1D2B45", font=fuente(26))
        lienzo.paste(im, (x, 64))
    lienzo.save(destino, optimize=True)


def fecha_de(carpeta):
    return json.loads(next((VIG / carpeta).glob("indice-claro.json")).read_text(encoding="utf-8"))[0]["fecha"]


f = fecha_de("dashboard")
(VIG / "temas").mkdir(exist_ok=True)
indice = []
PARES = [
    ("landing", "portada", "Portada de la landing"),
    ("login", "inicio-sesion", "Inicio de sesión"),
    ("dashboard", "panel-docente", "Dashboard del docente"),
    ("modulos/calificaciones", "tabla-actividad", "Calificaciones"),
    ("modulos/analisis", "rendimiento", "Análisis"),
]
for carpeta, vista, desc in PARES:
    for disp in ("escritorio", "celular"):
        c = VIG / carpeta / f"{f}_{vista}_{disp}_claro.png"
        o = VIG / carpeta / f"{f}_{vista}_{disp}_oscuro.png"
        if not (c.exists() and o.exists()):
            continue
        archivo = f"{f}_{carpeta.split('/')[-1]}-claro-y-oscuro_{disp}_ambos.png"
        lado_a_lado(c, o, "Modo claro", "Modo oscuro", VIG / "temas" / archivo, 1366 if disp == "escritorio" else 600)
        indice.append({"archivo": archivo, "vista": f"{vista}-temas", "modulo": "temas", "descripcion": f"{desc}: modo claro y oscuro (selector persistente)",
                       "dispositivo": "Escritorio 1366 px" if disp == "escritorio" else "Celular 390 × 844", "tema": "Modo claro y oscuro", "fecha": f})
(VIG / "temas" / "indice-temas.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2), encoding="utf-8")

print("ok", len(indice), "composiciones de temas")
