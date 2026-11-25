"""Pruebas del prototipo IoT que se pueden ejecutar sin hardware ni simulador.

1. Receptor: validación del protocolo, cálculos y CSV (receptor/receptor.py).
2. Circuito: diagram.json usa piezas y pines reales de Wokwi y coincide con los pines del sketch.

La simulación en Wokwi (que el circuito arranque y responda) se valida aparte, con la lista de
pruebas manuales del README y con la grabación de evidencias/. Ejecutar desde la raíz del repositorio:
    python -m pytest ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/pruebas
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "receptor"))

import receptor as rc  # noqa: E402

DIAGRAMA = json.loads((RAIZ / "wokwi" / "diagram.json").read_text(encoding="utf-8"))
SKETCH = (RAIZ / "wokwi" / "sketch.ino").read_text(encoding="utf-8")


def resumen(entendi, dudas, no_entendi, **cambios):
    total = entendi + dudas + no_entendi
    p = rc.comprension(entendi, total)
    msg = {"evento": "resumen", "dispositivo": "aula-1A", "ronda": 1, "entendi": entendi, "dudas": dudas,
           "no_entendi": no_entendi, "total": total, "comprension": p, "nivel": rc.nivel(p, total)}
    msg.update(cambios)
    return json.dumps(msg)


# ============================================================ cálculos (mismas reglas que el sketch)

@pytest.mark.parametrize("entendi,total,esperado", [(0, 1, 0), (1, 1, 100), (7, 10, 70), (2, 3, 67), (1, 3, 33), (1, 8, 13), (0, 0, 0),
                                                       (2, 5, 40), (3, 8, 38), (2, 7, 29), (1, 7, 14), (3, 9, 33), (8, 18, 44)])
def test_comprension_redondeada(entendi, total, esperado):
    assert rc.comprension(entendi, total) == esperado


@pytest.mark.parametrize("porcentaje,total,esperado", [(100, 5, "verde"), (70, 10, "verde"), (69, 10, "amarillo"),
                                                       (40, 10, "amarillo"), (39, 10, "rojo"), (0, 4, "rojo"), (0, 0, "sin_datos")])
def test_nivel_del_semaforo_en_los_limites(porcentaje, total, esperado):
    assert rc.nivel(porcentaje, total) == esperado


# ============================================================ protocolo

def test_resumen_valido():
    msg = rc.interpretar(resumen(12, 5, 3))
    assert (msg["total"], msg["comprension"], msg["nivel"]) == (20, 60, "amarillo")


@pytest.mark.parametrize("linea,motivo", [
    ("{no es json", "no es JSON"),
    ('["lista"]', "objeto JSON"),
    ('{"evento":"desconocido","dispositivo":"aula-1A"}', "evento desconocido"),
    ('{"evento":"voto","ronda":1,"opcion":"entendi","total":1}', "dispositivo"),
    ('{"evento":"voto","dispositivo":"aula-1A","ronda":1,"opcion":"tal_vez","total":1}', "opción"),
    ('{"evento":"voto","dispositivo":"aula-1A","ronda":0,"opcion":"duda","total":1}', "ronda"),
    ('{"evento":"rechazado","dispositivo":"aula-1A","ronda":1,"motivo":"otro"}', "motivo"),
    ('{"evento":"inicio","dispositivo":"aula-1A","version":true}', "version"),
])
def test_mensajes_que_no_cumplen_el_protocolo(linea, motivo):
    with pytest.raises(rc.MensajeInvalido, match=motivo):
        rc.interpretar(linea)


def test_resumen_inconsistente_se_rechaza():
    with pytest.raises(rc.MensajeInvalido, match="total"):
        rc.interpretar(resumen(3, 1, 1, total=6))
    with pytest.raises(rc.MensajeInvalido, match="comprensión"):
        rc.interpretar(resumen(3, 1, 1, comprension=80))
    with pytest.raises(rc.MensajeInvalido, match="nivel"):
        rc.interpretar(resumen(3, 1, 1, nivel="verde"))  # 60 % es amarillo
    with pytest.raises(rc.MensajeInvalido, match="total"):
        rc.interpretar(resumen(0, 0, 0))  # un resumen nunca tiene 0 votos: eso es ronda_vacia


def test_procesar_una_sesion_completa(tmp_path):
    lineas = [
        "ets Jun  8 2016 ruido de arranque",  # texto que no es del protocolo: se ignora
        '{"evento":"inicio","dispositivo":"aula-1A","version":1}',
        '{"evento":"voto","dispositivo":"aula-1A","ronda":1,"opcion":"entendi","total":1}',
        '{"evento":"rechazado","dispositivo":"aula-1A","ronda":1,"motivo":"muy_seguido"}',
        '{"evento":"voto","dispositivo":"aula-1A","ronda":1,"opcion":"no_entendi","total":2}',
        resumen(1, 0, 1),
        '{"evento":"ronda_vacia","dispositivo":"aula-1A","ronda":2}',
        resumen(1, 1, 3, ronda=2),
        '{"evento":"voto","dispositivo":"aula-1A"',  # línea cortada
        "",
    ]
    sesion = rc.procesar(lineas)
    assert (sesion.votos, sesion.rechazados, sesion.rondas_vacias, sesion.ignoradas) == (2, 1, 1, 2)
    assert len(sesion.invalidas) == 1 and sesion.invalidas[0][0] == 9
    assert [(f["ronda"], f["comprension"], f["nivel"], f["requiere_refuerzo"]) for f in sesion.resumenes] == [
        (1, 50, "amarillo", False), (2, 20, "rojo", True)]

    destino = tmp_path / "resumenes.csv"
    rc.guardar_csv(sesion.resumenes, destino)
    rc.guardar_csv(sesion.resumenes[:1], destino)  # se agrega sin repetir el encabezado
    filas = destino.read_text(encoding="utf-8").splitlines()
    assert filas[0].split(",") == rc.COLUMNAS_CSV
    assert len(filas) == 4


def test_el_registro_de_la_grabacion_de_wokwi_se_procesa_sin_errores():
    """Líneas transcritas del monitor serial de la grabación real (evidencias/)."""
    registro = (RAIZ / "evidencias" / "registro-serial-transcrito-de-la-grabacion.txt").read_text(encoding="utf-8")
    sesion = rc.procesar(registro.splitlines())
    assert not sesion.invalidas
    assert (sesion.votos, sesion.rechazados, sesion.rondas_vacias, sesion.ignoradas) == (19, 7, 0, 2)
    assert [(f["ronda"], f["entendi"], f["dudas"], f["no_entendi"], f["comprension"], f["nivel"]) for f in sesion.resumenes] == [
        (1, 3, 4, 3, 30, "rojo"), (2, 2, 3, 4, 22, "rojo")]


def test_el_registro_copiado_de_wokwi_70_por_ciento_y_ronda_vacia(tmp_path):
    """Monitor serial copiado de Wokwi (evidencias/registro-wokwi.txt): 70 % exacto y cierre sin votos."""
    lineas = (RAIZ / "evidencias" / "registro-wokwi.txt").read_text(encoding="utf-8").splitlines()
    assert rc.interpretar(lineas[0])["evento"] == "inicio"
    sesion = rc.procesar(lineas)
    assert not sesion.invalidas
    assert (sesion.votos, sesion.rechazados, sesion.rondas_vacias, sesion.ignoradas) == (10, 1, 1, 0)
    assert len(sesion.resumenes) == 1  # la ronda vacía no genera fila
    fila = sesion.resumenes[0]
    assert ({k: fila[k] for k in rc.COLUMNAS_CSV[1:]} ==
            {"dispositivo": "aula-1A", "ronda": 1, "entendi": 7, "dudas": 3, "no_entendi": 0, "total": 10,
             "comprension": 70, "nivel": "verde", "requiere_refuerzo": False})
    destino = tmp_path / "resumenes.csv"
    rc.guardar_csv(sesion.resumenes, destino)
    filas = destino.read_text(encoding="utf-8").splitlines()
    assert len(filas) == 2 and filas[1].endswith(",aula-1A,1,7,3,0,10,70,verde,False")


def test_el_resumen_de_la_captura_de_wokwi_es_valido():
    """Última línea visible en evidencias/2026-11-24_captura-ronda-3-3-3-rojo.png."""
    msg = rc.interpretar('{"evento":"resumen","dispositivo":"aula-1A","ronda":1,"entendi":3,"dudas":3,'
                         '"no_entendi":3,"total":9,"comprension":33,"nivel":"rojo"}')
    assert msg["nivel"] == "rojo"


def test_el_receptor_funciona_en_una_consola_de_windows(tmp_path):
    """La consola de Windows usa cp1252: el receptor no debe detenerse al mostrar un resumen."""
    entorno = {**os.environ, "PYTHONIOENCODING": "cp1252"}
    destino = tmp_path / "resumenes.csv"
    salida = subprocess.run(
        [sys.executable, "-I", str(RAIZ / "receptor" / "receptor.py"), "--csv", str(destino)],
        input=resumen(1, 1, 3) + "\n", capture_output=True, text=True, encoding="cp1252", env=entorno, timeout=30)
    assert salida.returncode == 0, salida.stderr
    assert "requiere refuerzo" in salida.stdout
    assert len(destino.read_text(encoding="utf-8").splitlines()) == 2


def test_el_ejemplo_del_protocolo_es_valido():
    ejemplo = (RAIZ / "receptor" / "ejemplo-protocolo.txt").read_text(encoding="utf-8").splitlines()
    sesion = rc.procesar(ejemplo)
    assert not sesion.invalidas
    assert len(sesion.resumenes) == 3


# ============================================================ circuito frente al código

PINES_POR_PIEZA = {
    "wokwi-arduino-uno": {str(n) for n in range(14)} | {f"A{n}" for n in range(6)} | {"GND.1", "GND.2", "GND.3", "5V", "VIN"},
    "wokwi-lcd1602": {"GND", "VCC", "SDA", "SCL"},  # modo I2C
    "wokwi-pushbutton": {"1.l", "1.r", "2.l", "2.r"},
    "wokwi-led": {"A", "C"},
    "wokwi-resistor": {"1", "2"},
    "wokwi-buzzer": {"1", "2"},
}
PIEZAS = {p["id"]: p for p in DIAGRAMA["parts"]}


def _conexiones():
    return [(a, b) for a, b, *_ in DIAGRAMA["connections"]]


def _vecinos(extremo):
    return {b if a == extremo else a for a, b in _conexiones() if extremo in (a, b)}


def _pin_del_sketch(nombre):
    return re.search(rf"const uint8_t {nombre}\s*=\s*(\d+);", SKETCH).group(1)


def test_todas_las_piezas_y_pines_existen_en_wokwi():
    assert DIAGRAMA["version"] == 1 and DIAGRAMA["editor"] == "wokwi"
    for a, b in _conexiones():
        for extremo in (a, b):
            pieza, pin = extremo.split(":")
            assert pieza in PIEZAS, extremo
            assert pin in PINES_POR_PIEZA[PIEZAS[pieza]["type"]], extremo
    assert PIEZAS["lcd1"]["attrs"]["pins"] == "i2c"


@pytest.mark.parametrize("boton,constante", [("btnSi", "PIN_BTN_ENTENDI"), ("btnDuda", "PIN_BTN_DUDA"),
                                             ("btnNo", "PIN_BTN_NO"), ("btnCerrar", "PIN_BTN_CERRAR")])
def test_cada_boton_va_a_su_pin_y_a_tierra(boton, constante):
    assert _vecinos(f"{boton}:1.l") == {f"uno:{_pin_del_sketch(constante)}"}
    assert next(iter(_vecinos(f"{boton}:2.l"))).startswith("uno:GND")
    assert "INPUT_PULLUP" in SKETCH  # sin resistencia externa: el botón presionado lee LOW


@pytest.mark.parametrize("led,resistencia,constante", [("ledVerde", "rVerde", "PIN_LED_VERDE"),
                                                       ("ledAmarillo", "rAmarillo", "PIN_LED_AMARILLO"),
                                                       ("ledRojo", "rRojo", "PIN_LED_ROJO")])
def test_cada_led_tiene_resistencia_y_va_a_su_pin(led, resistencia, constante):
    assert _vecinos(f"{resistencia}:1") == {f"uno:{_pin_del_sketch(constante)}"}
    assert _vecinos(f"{resistencia}:2") == {f"{led}:A"}
    assert next(iter(_vecinos(f"{led}:C"))).startswith("uno:GND")
    assert PIEZAS[resistencia]["attrs"]["value"] == "220"


def test_zumbador_y_pantalla():
    assert _vecinos("zumbador:2") == {f"uno:{_pin_del_sketch('PIN_ZUMBADOR')}"}
    assert next(iter(_vecinos("zumbador:1"))).startswith("uno:GND")
    assert _vecinos("lcd1:SDA") == {"uno:A4"} and _vecinos("lcd1:SCL") == {"uno:A5"}
    assert _vecinos("lcd1:VCC") == {"uno:5V"}
    assert "LiquidCrystal_I2C lcd(0x27, 16, 2)" in SKETCH
    assert "LiquidCrystal I2C" in (RAIZ / "wokwi" / "libraries.txt").read_text(encoding="utf-8")


def test_ningun_pin_se_usa_dos_veces():
    pines = re.findall(r"const uint8_t PIN_\w+\s*=\s*(\d+);", SKETCH)
    assert len(pines) == len(set(pines)) == 8
    assert not {"0", "1"} & set(pines)  # 0 y 1 son el puerto serial


def test_el_sketch_usa_los_mismos_umbrales_y_formula_que_el_receptor():
    assert f"UMBRAL_VERDE       = {rc.UMBRAL_VERDE};" in SKETCH
    assert f"UMBRAL_AMARILLO    = {rc.UMBRAL_AMARILLO};" in SKETCH
    assert "(uint32_t)entendi * 100 + total / 2) / total" in SKETCH
    assert "Serial.begin(9600)" in SKETCH


def test_textos_de_la_pantalla_caben_en_16_columnas():
    # Peor caso de cada línea (contadores y ronda de 3 cifras, 100 %).
    assert len("Si%u D%u No%u" % (60, 60, 60)) <= 16
    assert len("Comprende %u%%" % 100) <= 16
    assert len("Ronda %u: votar" % 999) <= 16
    for formato in ("Si%u D%u No%u", "Comprende %u%%", "Ronda %u: votar"):
        assert formato in SKETCH
