"""Convierte las capturas reales de frontend/src/assets/producto/_png a WebP (las que usa la landing)
y borra la carpeta temporal _png. Uso (desde la raíz): python Docs/evidencias/scripts/optimizar-producto-landing.py
"""
import pathlib
import shutil

from PIL import Image

CARPETA = pathlib.Path(__file__).resolve().parents[3] / "frontend" / "src" / "assets" / "producto"
for png in sorted((CARPETA / "_png").glob("*.png")):
    im = Image.open(png).convert("RGB")
    if png.stem.startswith("movil-") and im.width > 720:  # celular: 720 px bastan para la composición
        im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    elif im.width > 1440:
        im = im.resize((1440, round(im.height * 1440 / im.width)), Image.LANCZOS)
    destino = CARPETA / (png.stem + ".webp")
    im.save(destino, "WEBP", quality=82, method=6)
    print(destino.name, im.size, destino.stat().st_size // 1024, "KB")
shutil.rmtree(CARPETA / "_png")
