# Criterio 6. IoT (bonificación)

**Estado:** Cumplido. El prototipo se construyó y se simuló en Wokwi, y el receptor en Python procesó el monitor serial copiado de esa simulación. Las 9 pruebas manuales están aprobadas y el criterio queda cerrado con las evidencias disponibles: la grabación, el registro serial copiado de Wokwi, el CSV del receptor y las 48 pruebas automáticas.

**Qué solicita el instructor:** prototipo funcional, recepción de datos y protocolo de comunicación explicado.

**Solución:**
- **Qué es:** el *Semáforo de Comprensión ClassKids*. Durante una explicación, los estudiantes votan de forma anónima si entendieron; un semáforo de LED muestra el nivel del grupo, y el resumen de cada ronda se envía en JSON por el puerto serial a un receptor en Python, que lo valida y lo guarda en un CSV.
- **Componentes:** Arduino UNO, LCD 16x2 I2C, 4 pulsadores, 3 LED con resistencias de 220 Ω y un zumbador, simulados en Wokwi.
- **Relación con ClassKids:** es un prototipo **independiente**. No usa la API ni la base de datos de ClassKids, y ClassKids no lo muestra.

## Estructura

```
06_IOT_BONIFICACION/
├── README.md                     este archivo
├── Propuesta-sustentacion-iot.md  preguntas y respuestas para defender el prototipo
└── iot/semaforo-comprension/
    ├── README.md                 instrucciones, circuito, pines, reglas, protocolo y pruebas
    ├── wokwi/                    proyecto de Wokwi (igual al ZIP descargado) y wokwi.toml
    ├── receptor/                 receptor en Python y ejemplo del protocolo
    ├── pruebas/                  48 pruebas automáticas
    └── evidencias/               grabación (original local y copia ligera), fotogramas, captura, registro serial, CSV y ZIP original
```

## Requisitos del criterio frente a lo entregado

| Requisito | Implementación | Evidencia | Prueba realizada | Estado |
|---|---|---|---|---|
| Prototipo funcional | Circuito (`diagram.json`) y programa (`sketch.ino`) en Wokwi | Proyecto <https://wokwi.com/projects/481623698742645761>; grabación de 106 s; 6 fotogramas; captura | Simulación ejecutada por el equipo: arranque, 19 votos, 7 rechazos, dos rondas cerradas y los tres colores del semáforo | **Cumplido** |
| Recepción de datos | `receptor/receptor.py`: lee el puerto serial, un archivo o la entrada estándar; valida y guarda un CSV | `evidencias/registro-wokwi.txt` → `evidencias/resumenes.csv`; `evidencias/resumenes-desde-la-grabacion.csv` | El receptor procesó el monitor serial **copiado de Wokwi** (10 votos, 1 rechazado, 1 ronda vacía, resumen de 70 %, verde, 0 líneas inválidas) y el registro transcrito de la grabación | **Cumplido** (lectura desde archivo; no se leyó la simulación en vivo) |
| Protocolo explicado | JSON por serial a 9600 baudios; 5 eventos documentados con ejemplos | README del prototipo y `Docs/iot/propuesta-iot.md`, sección 17 | 15 pruebas del protocolo, entre ellas el registro real de Wokwi | **Cumplido** |
| Pruebas | 48 automáticas y 9 manuales | `pruebas/test_prototipo.py`; tabla de pruebas manuales del README | 48 de 48 automáticas; 9 de 9 manuales | **Cumplido** |

**Lo que este prototipo no es:**
- **Hardware real:** no hubo montaje físico.
- **Integrado con ClassKids:** no lo está. La integración es una propuesta, en la sección 28 de la propuesta.

## Archivos oficiales

| Evidencia | Ubicación |
|---|---|
| Propuesta completa: problema, objetivos, arquitectura, diagramas, componentes, pines, protocolo, seguridad, privacidad, costos, pruebas, alternativas e integración futura | [`Docs/iot/propuesta-iot.md`](../../Docs/iot/propuesta-iot.md) |
| Prototipo e instrucciones | [`iot/semaforo-comprension/README.md`](iot/semaforo-comprension/README.md) |
| Receptor en Python | [`iot/semaforo-comprension/receptor/receptor.py`](iot/semaforo-comprension/receptor/receptor.py) |
| Pruebas automáticas (48 de 48 el 25/11/2026) | [`iot/semaforo-comprension/pruebas/test_prototipo.py`](iot/semaforo-comprension/pruebas/test_prototipo.py) |
| Evidencias de la simulación | [`iot/semaforo-comprension/evidencias/`](iot/semaforo-comprension/evidencias/) |
| Guía de sustentación | [`Propuesta-sustentacion-iot.md`](Propuesta-sustentacion-iot.md) |

## Pendientes y notas

Ninguno obligatorio. Notas:

1. **Qué respalda cada evidencia:** la grabación muestra el funcionamiento general (pruebas 1 a 5, 7 y 9). La ronda del 70 % y la ronda vacía (pruebas 6 y 8) no aparecen en la grabación: se sustentan en `registro-wokwi.txt`, en `resumenes.csv` y en una prueba automática. El equipo decidió no agregar capturas adicionales. Detalle en la sección «Qué demuestra cada evidencia» del [README del prototipo](iot/semaforo-comprension/README.md#qué-demuestra-cada-evidencia).
2. **Tope de 60 votos por ronda:** no tiene evidencia y no forma parte de las 9 pruebas. Es opcional.
3. **Grabación original:** se conserva en local (93,5 MiB, con audio) y `.gitignore` la excluye. En el repositorio va una copia ligera `.webm` de 3 MB, sin audio y sin la barra de la cuenta. Si el instructor necesita el original con sonido, se puede compartir por Google Drive o por un enlace de YouTube no listado.
4. **Implementación física:** opcional.

Matriz completa: [`../00_INDICE_Y_ESTADO/matriz-cumplimiento.md`](../00_INDICE_Y_ESTADO/matriz-cumplimiento.md)
