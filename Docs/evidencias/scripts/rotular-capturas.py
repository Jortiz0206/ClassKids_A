"""Agrega a cada captura de Docs/evidencias/capturas-v3 un pie con módulo, dispositivo, tema,
fecha y entorno. El pie va FUERA de la imagen de la aplicación (franja inferior), para no
alterar lo que muestra la interfaz.

Uso (desde la raíz): python Docs/evidencias/scripts/rotular-capturas.py
Requiere Pillow. Lee indice-claro.json e indice-oscuro.json, generados por capturas-v3.cjs.
Es idempotente: una captura ya rotulada (marca en los metadatos PNG) no se vuelve a rotular.
"""
import json
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont
from PIL.PngImagePlugin import PngInfo

# Carpeta opcional como argumento (por ejemplo, capturas-v3/vigente).
CARPETA = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parents[1] / "capturas-v3"
ENTORNO = "Entorno de PRUEBAS · frontend :8081 · API :8001 · base classkids_test"


def fuente(tamano, negrita=False):
    for nombre in (("segoeuib.ttf" if negrita else "segoeui.ttf"), ("arialbd.ttf" if negrita else "arial.ttf"), "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(nombre, tamano)
        except OSError:
            continue
    return ImageFont.load_default()


for indice_json in sorted(CARPETA.glob("indice-*.json")):
    for item in json.loads(indice_json.read_text(encoding="utf-8")):
        ruta = CARPETA / item["archivo"]
        im = Image.open(ruta)
        if im.info.get("classkids-rotulo"):
            continue
        # Escala según el dispositivo (las capturas de celular salen con densidad 3x).
        escala = max(1, round(im.width / (390 if item["dispositivo"].startswith("Celular") else 1366)))
        alto = 64 * escala
        lienzo = Image.new("RGB", (im.width, im.height + alto), "#1D2B45")
        lienzo.paste(im.convert("RGB"), (0, 0))
        d = ImageDraw.Draw(lienzo)
        x, y = 16 * escala, im.height + 10 * escala
        ancho_util = im.width - 2 * x

        def ajustada(texto, tamano, negrita=False):
            # Reduce la letra hasta que el texto quepa en el ancho de la imagen.
            f = fuente(tamano, negrita)
            while tamano > 8 and d.textlength(texto, font=f) > ancho_util:
                tamano -= 1
                f = fuente(tamano, negrita)
            return f

        titulo = f"ClassKids V3 · {item['descripcion']}"
        detalle = f"{item['dispositivo']} · {item['tema']} · {item['fecha']} · {ENTORNO}"
        d.text((x, y), titulo, fill="#FFFFFF", font=ajustada(titulo, 18 * escala, True))
        d.text((x, y + 26 * escala), detalle, fill="#DDF4EA", font=ajustada(detalle, 13 * escala))
        meta = PngInfo()
        meta.add_text("classkids-rotulo", "1")
        lienzo.save(ruta, pnginfo=meta, optimize=True)
        print("rotulada", item["archivo"])
