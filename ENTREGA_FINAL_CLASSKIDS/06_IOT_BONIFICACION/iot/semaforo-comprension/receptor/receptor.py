"""Receptor del Semáforo de Comprensión ClassKids (prototipo IoT independiente).

Lee las líneas JSON que envía el Arduino por el puerto serial, valida cada mensaje según el
protocolo y guarda los resúmenes de cada ronda en un archivo CSV.

Fuentes de datos:
    python receptor.py --puerto COM3                       # Arduino físico (Windows)
    python receptor.py --puerto /dev/ttyACM0               # Arduino físico (Linux)
    python receptor.py --puerto rfc2217://localhost:4000   # simulación de Wokwi en VS Code
    python receptor.py --archivo registro.log              # registro guardado (por ejemplo, copiado del monitor serial de wokwi.com)
    ... | python receptor.py                               # entrada estándar

Solo `--puerto` necesita la biblioteca pyserial (requirements.txt). El resto usa la biblioteca
estándar de Python. Este programa no se conecta a ClassKids ni a su base de datos.
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable, Iterator

UMBRAL_VERDE = 70
UMBRAL_AMARILLO = 40
EVENTOS = {"inicio", "voto", "rechazado", "resumen", "ronda_vacia"}
OPCIONES = {"entendi", "duda", "no_entendi"}
MOTIVOS = {"muy_seguido", "limite_ronda"}
COLUMNAS_CSV = ["recibido", "dispositivo", "ronda", "entendi", "dudas", "no_entendi", "total",
                "comprension", "nivel", "requiere_refuerzo"]


class MensajeInvalido(ValueError):
    """La línea no cumple el protocolo."""


def comprension(entendi: int, total: int) -> int:
    """Mismo cálculo que el Arduino: porcentaje entero redondeado, (entendí × 100 + total / 2) / total."""
    return 0 if total == 0 else (entendi * 100 + total // 2) // total


def nivel(porcentaje: int, total: int) -> str:
    if total == 0:
        return "sin_datos"
    if porcentaje >= UMBRAL_VERDE:
        return "verde"
    if porcentaje >= UMBRAL_AMARILLO:
        return "amarillo"
    return "rojo"


def _entero(msg: dict, clave: str, minimo: int = 0) -> int:
    valor = msg.get(clave)
    if not isinstance(valor, int) or isinstance(valor, bool) or valor < minimo:
        raise MensajeInvalido(f"«{clave}» debe ser un entero mayor o igual que {minimo}")
    return valor


def interpretar(linea: str) -> dict:
    """Convierte una línea en un mensaje validado. Lanza MensajeInvalido si no cumple el protocolo."""
    try:
        msg = json.loads(linea)
    except json.JSONDecodeError as e:
        raise MensajeInvalido(f"no es JSON válido ({e.msg})") from None
    if not isinstance(msg, dict):
        raise MensajeInvalido("el mensaje debe ser un objeto JSON")
    evento = msg.get("evento")
    if evento not in EVENTOS:
        raise MensajeInvalido(f"evento desconocido: {evento!r}")
    if not isinstance(msg.get("dispositivo"), str) or not msg["dispositivo"]:
        raise MensajeInvalido("falta «dispositivo»")

    if evento == "inicio":
        _entero(msg, "version", 1)
    elif evento == "voto":
        _entero(msg, "ronda", 1)
        _entero(msg, "total", 1)
        if msg.get("opcion") not in OPCIONES:
            raise MensajeInvalido(f"opción desconocida: {msg.get('opcion')!r}")
    elif evento == "rechazado":
        _entero(msg, "ronda", 1)
        if msg.get("motivo") not in MOTIVOS:
            raise MensajeInvalido(f"motivo desconocido: {msg.get('motivo')!r}")
    elif evento == "ronda_vacia":
        _entero(msg, "ronda", 1)
    elif evento == "resumen":
        _entero(msg, "ronda", 1)
        a, b, c = (_entero(msg, k) for k in ("entendi", "dudas", "no_entendi"))
        total = _entero(msg, "total", 1)
        if a + b + c != total:
            raise MensajeInvalido(f"el total ({total}) no coincide con la suma de votos ({a + b + c})")
        esperado = comprension(a, total)
        if _entero(msg, "comprension") != esperado:
            raise MensajeInvalido(f"comprensión {msg['comprension']} % no coincide con el cálculo ({esperado} %)")
        if msg.get("nivel") != nivel(esperado, total):
            raise MensajeInvalido(f"nivel {msg.get('nivel')!r} no corresponde a {esperado} %")
    return msg


@dataclass
class Sesion:
    """Resultado de procesar una secuencia de líneas."""
    resumenes: list[dict] = field(default_factory=list)
    votos: int = 0
    rechazados: int = 0
    rondas_vacias: int = 0
    invalidas: list[tuple[int, str, str]] = field(default_factory=list)  # (n.º de línea, texto, motivo)
    ignoradas: int = 0  # líneas vacías o que no empiezan con «{» (por ejemplo, ruido al arrancar)


def procesar(lineas: Iterable[str], al_resumen=None) -> Sesion:
    sesion = Sesion()
    for n, cruda in enumerate(lineas, 1):
        linea = cruda.strip()
        if not linea.startswith("{"):
            sesion.ignoradas += 1
            continue
        try:
            msg = interpretar(linea)
        except MensajeInvalido as e:
            sesion.invalidas.append((n, linea, str(e)))
            continue
        evento = msg["evento"]
        if evento == "voto":
            sesion.votos += 1
        elif evento == "rechazado":
            sesion.rechazados += 1
        elif evento == "ronda_vacia":
            sesion.rondas_vacias += 1
        elif evento == "resumen":
            fila = {
                "recibido": datetime.now().isoformat(timespec="seconds"),
                **{k: msg[k] for k in COLUMNAS_CSV[1:-1]},
                "requiere_refuerzo": msg["nivel"] == "rojo",
            }
            sesion.resumenes.append(fila)
            if al_resumen:
                al_resumen(fila)
    return sesion


def guardar_csv(filas: list[dict], destino: Path) -> None:
    nuevo = not destino.exists()
    with destino.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNAS_CSV)
        if nuevo:
            w.writeheader()
        w.writerows(filas)


def lineas_serial(puerto: str, baudios: int) -> Iterator[str]:
    import serial  # pyserial: solo se necesita para leer un puerto

    with serial.serial_for_url(puerto, baudrate=baudios, timeout=1) as conexion:
        print(f"Escuchando {puerto} a {baudios} baudios. Ctrl + C para terminar.")
        while True:
            dato = conexion.readline()
            if dato:
                yield dato.decode("utf-8", errors="replace")


def mostrar(fila: dict) -> None:
    # Flechas ASCII: la consola de Windows (cp1252) no puede mostrar «→» ni «←».
    aviso = "  <- requiere refuerzo" if fila["requiere_refuerzo"] else ""
    print(f"Ronda {fila['ronda']}: Entendí {fila['entendi']}, Dudas {fila['dudas']}, No entendí {fila['no_entendi']} "
          f"-> {fila['comprension']} % ({fila['nivel']}){aviso}")


def main(argv=None) -> int:
    # Si la consola no admite algún carácter, se reemplaza en lugar de detener el receptor.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    p = argparse.ArgumentParser(description="Receptor del Semáforo de Comprensión (prototipo IoT de ClassKids).")
    origen = p.add_mutually_exclusive_group()
    origen.add_argument("--puerto", help="Puerto serial o URL (COM3, /dev/ttyACM0, rfc2217://localhost:4000)")
    origen.add_argument("--archivo", type=Path, help="Archivo con las líneas recibidas")
    p.add_argument("--baudios", type=int, default=9600)
    p.add_argument("--csv", type=Path, default=Path("resumenes.csv"), help="Archivo donde se agregan los resúmenes")
    args = p.parse_args(argv)

    if args.puerto:
        lineas = lineas_serial(args.puerto, args.baudios)
    elif args.archivo:
        lineas = args.archivo.read_text(encoding="utf-8").splitlines()
    else:
        lineas = sys.stdin

    filas: list[dict] = []
    try:
        sesion = procesar(lineas, al_resumen=lambda f: (mostrar(f), filas.append(f)))
    except KeyboardInterrupt:
        sesion = None
    if filas:
        guardar_csv(filas, args.csv)
        print(f"{len(filas)} resumen(es) guardado(s) en {args.csv}")
    if sesion:
        print(f"Votos: {sesion.votos} · Rechazados: {sesion.rechazados} · Rondas vacías: {sesion.rondas_vacias} · "
              f"Líneas inválidas: {len(sesion.invalidas)} · Ignoradas: {sesion.ignoradas}")
        for n, _, motivo in sesion.invalidas:
            print(f"  Línea {n} inválida: {motivo}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
