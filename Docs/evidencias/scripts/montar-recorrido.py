"""Monta el video VIGENTE del recorrido: recorta la grabación de grabar-recorrido.cjs, le pone la
música instrumental y la codifica en WebM (VP9 + Opus).

La música es ORIGINAL de ClassKids: se compone y sintetiza aquí mismo con numpy (acordes,
arpegio, bajo y percusión suave), sin muestras ni grabaciones de terceros, así que no tiene
restricciones de licencia. Va a volumen discreto (unos -21 LUFS) porque el video no tiene
narración: la música acompaña, no compite con la interfaz.

Uso (desde la raíz):
    python Docs/evidencias/scripts/montar-recorrido.py <grabación.webm> <segundo de inicio>
Requiere numpy y ffmpeg con libvpx-vp9 y libopus (variable FFMPEG o el paquete imageio-ffmpeg).
Resultado: frontend/public/video/recorrido-classkids-v3.webm (o el nombre de VIDEO_SALIDA)
"""
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

SR = 44100
RAIZ = pathlib.Path(__file__).resolve().parents[3]
# Nombre del archivo de salida; por defecto, la versión vigente (v3, grabada después de H-08).
DESTINO = RAIZ / "frontend" / "public" / "video" / os.environ.get("VIDEO_SALIDA", "recorrido-classkids-v3.webm")


def ffmpeg():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def nota(n):
    """Frecuencia de una nota MIDI."""
    return 440.0 * 2 ** ((n - 69) / 12)


def envolvente(n, ataque, caida):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(ataque, 1e-4))
    return e * np.exp(-t / caida)


def componer(duracion):
    """Composición original en Fa mayor, 92 pulsos por minuto, progresión Fa – Rem – Sib – Do."""
    rng = np.random.default_rng(7)
    total = int(duracion * SR) + SR
    izq, der = np.zeros(total), np.zeros(total)
    pulso = 60 / 92
    compas = 4 * pulso
    acordes = [  # notas MIDI de cada compás: fundamental del bajo y acorde
        (41, [65, 69, 72, 76]),  # Fa maj7
        (38, [62, 65, 69, 72]),  # Re m7
        (46, [65, 70, 74, 77]),  # Sib maj7 (inversión)
        (36, [64, 67, 72, 74]),  # Do add9
    ]
    compases = int(duracion / compas) + 1

    def poner(senal, inicio, pan=0.0):
        i = int(inicio * SR)
        if i >= total:
            return
        senal = senal[: total - i]
        izq[i:i + len(senal)] += senal * (1 - pan) / 2 * 2 ** 0.5
        der[i:i + len(senal)] += senal * (1 + pan) / 2 * 2 ** 0.5

    for c in range(compases):
        t0 = c * compas
        bajo, acorde = acordes[c % 4]
        ultimo = t0 + compas > duracion - 4.5  # cierre: solo colchón y un acorde final
        # Colchón (pad): senos levemente desafinados, entrada y salida lentas.
        n = int((compas + 1.2) * SR)
        t = np.arange(n) / SR
        e = np.minimum(1, t / 0.9) * np.minimum(1, np.maximum(0, (compas + 1.2 - t) / 1.2))
        pad = sum(np.sin(2 * np.pi * nota(m) * t * d) for m in acorde for d in (0.997, 1.003)) / 8
        poner(0.11 * pad * e, t0, pan=-0.15)
        if ultimo:
            continue
        # Bajo: fundamental en los pulsos 1 y 3 (desde el segundo compás).
        if c >= 1:
            for p in (0, 2):
                n = int(pulso * 1.8 * SR)
                t = np.arange(n) / SR
                f = nota(bajo)
                b = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * envolvente(n, 0.01, 0.55)
                poner(0.22 * b, t0 + p * pulso)
        # Arpegio tipo marimba en corcheas (desde el tercer compás).
        if c >= 2:
            patron = [0, 1, 2, 3, 2, 1, 2, 3] if c % 2 == 0 else [0, 2, 1, 3, 2, 3, 1, 2]
            for k, idx in enumerate(patron):
                f = nota(acorde[idx] + 12)
                n = int(0.9 * SR)
                t = np.arange(n) / SR
                golpe = (np.sin(2 * np.pi * f * t) * envolvente(n, 0.004, 0.28)
                         + 0.25 * np.sin(2 * np.pi * 4 * f * t) * envolvente(n, 0.002, 0.05))
                acento = 1.0 if k % 2 == 0 else 0.75
                poner(0.085 * acento * golpe, t0 + k * pulso / 2, pan=0.35 if k % 2 else -0.05)
        # Percusión suave: sonaja en contratiempos y un golpe grave muy bajo (desde el quinto compás).
        if c >= 4:
            for k in range(4):
                n = int(0.05 * SR)
                ruido = rng.standard_normal(n)
                ruido = np.diff(ruido, prepend=0)  # filtro paso alto sencillo
                poner(0.018 * ruido * envolvente(n, 0.003, 0.015), t0 + (k + 0.5) * pulso, pan=0.5)
            for p in (0, 2):
                n = int(0.35 * SR)
                t = np.arange(n) / SR
                frec = 50 + 70 * np.exp(-t / 0.04)
                poner(0.12 * np.sin(2 * np.pi * np.cumsum(frec) / SR) * envolvente(n, 0.002, 0.12), t0 + p * pulso)
        # Campana melódica en compases alternos de la parte central.
        if 8 <= c < compases - 6 and c % 8 in (0, 1, 4, 5):
            frase = {0: [72, 74, 77], 1: [76, 74], 4: [77, 79, 81], 5: [79, 77]}[c % 8]
            for k, m in enumerate(frase):
                n = int(1.6 * SR)
                t = np.arange(n) / SR
                f = nota(m + 12)
                campana = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.2)) * envolvente(n, 0.005, 0.7)
                poner(0.05 * campana, t0 + k * pulso * (4 / len(frase)), pan=-0.3)

    # Acorde final que se apaga.
    n = int(4.5 * SR)
    t = np.arange(n) / SR
    final = sum(np.sin(2 * np.pi * nota(m) * t) for m in (53, 60, 65, 69, 72, 77)) / 6 * envolvente(n, 0.4, 1.6)
    poner(0.16 * final, duracion - 4.6)

    # Reverberación: respuesta al impulso de ruido con caída exponencial, distinta en cada canal.
    def reverb(x, semilla):
        r = np.random.default_rng(semilla)
        n = int(1.8 * SR)
        ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.5)
        ir /= np.sqrt(np.sum(ir ** 2))
        largo = 1 << int(np.ceil(np.log2(len(x) + n)))
        y = np.fft.irfft(np.fft.rfft(x, largo) * np.fft.rfft(ir, largo), largo)[: len(x)]
        return 0.8 * x + 0.3 * y

    izq, der = reverb(izq, 1), reverb(der, 2)
    mezcla = np.stack([izq, der], axis=1)[: int(duracion * SR)]
    # Entrada y salida graduales.
    n = len(mezcla)
    rampa = np.ones(n)
    rampa[: int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
    rampa[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))
    mezcla *= rampa[:, None]
    # Volumen discreto: RMS objetivo -23 dBFS (≈ -21 LUFS), sin superar -3 dBFS de pico.
    rms = np.sqrt(np.mean(mezcla ** 2))
    mezcla *= 10 ** (-23 / 20) / rms
    pico = np.max(np.abs(mezcla))
    if pico > 10 ** (-3 / 20):
        mezcla *= 10 ** (-3 / 20) / pico
    return mezcla


def guardar_wav(ruta, mezcla):
    datos = (np.clip(mezcla, -1, 1) * 32767).astype("<i2")
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())


def duracion_de(ff, ruta):
    salida = subprocess.run([ff, "-hide_banner", "-i", str(ruta)], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", salida).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def main():
    grabacion, inicio = pathlib.Path(sys.argv[1]), float(sys.argv[2])
    ff = ffmpeg()
    duracion = round(duracion_de(ff, grabacion) - inicio - 0.1, 2)
    with tempfile.TemporaryDirectory() as tmp:
        wav = pathlib.Path(tmp) / "musica.wav"
        guardar_wav(wav, componer(duracion))
        subprocess.run([
            ff, "-hide_banner", "-loglevel", "error", "-y",
            "-ss", f"{inicio:.2f}", "-i", str(grabacion), "-i", str(wav),
            "-map", "0:v", "-map", "1:a", "-t", f"{duracion:.2f}",
            "-c:v", "libvpx-vp9", "-crf", "31", "-b:v", "0", "-g", "50", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
            "-c:a", "libopus", "-b:a", "112k",
            "-metadata", "title=ClassKids — Aprender, Crecer y Avanzar · Recorrido por la plataforma",
            "-metadata", "comment=Grabación real (entorno de pruebas, datos de demostración). Música instrumental original de ClassKids.",
            str(DESTINO),
        ], check=True)
    print(DESTINO, f"{duracion:.1f} s", DESTINO.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
