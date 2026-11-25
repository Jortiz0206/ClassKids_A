# Semáforo de Comprensión ClassKids

Prototipo IoT **independiente** de ClassKids (bonificación del criterio 6).

- **Qué hace:** durante una explicación, los estudiantes votan de forma anónima si entendieron. Un semáforo de LED muestra el nivel de comprensión del grupo, y el docente cierra cada ronda para enviar el resumen al computador.
- **Cómo se demuestra:** con una simulación en Wokwi, ya ejecutada: <https://wokwi.com/projects/481623698742645761>. La grabación, una captura, los registros seriales y los CSV del receptor están en [`evidencias/`](evidencias/).
- **Relación con ClassKids:** no se conecta a ClassKids. La propuesta, la justificación y la integración futura están en [`Docs/iot/propuesta-iot.md`](../../../../Docs/iot/propuesta-iot.md).
- **Para la sustentación:** [`Propuesta-sustentacion-iot.md`](../../Propuesta-sustentacion-iot.md) responde las preguntas típicas con palabras sencillas.

## Contenido

| Archivo | Para qué |
|---|---|
| `wokwi/diagram.json` | Circuito: Arduino UNO, LCD 16x2 I2C, 4 pulsadores, 3 LED con resistencias de 220 Ω y un zumbador |
| `wokwi/sketch.ino` | Programa del Arduino, comentado |
| `wokwi/libraries.txt` | Biblioteca que instala Wokwi (`LiquidCrystal I2C`) |
| `wokwi/wokwi.toml` | Solo para la extensión Wokwi de VS Code (firmware compilado y puerto serial por TCP). No viene en la descarga de wokwi.com |
| `wokwi/wokwi-project.txt` | Enlace del proyecto en wokwi.com (lo agrega Wokwi al descargar) |
| `receptor/receptor.py` | Programa en Python que recibe y valida los mensajes JSON y guarda los resúmenes en CSV |
| `receptor/ejemplo-protocolo.txt` | Ejemplo **escrito a mano** del protocolo, para probar el receptor (no es una captura) |
| `pruebas/test_prototipo.py` | Pruebas automáticas del receptor, del circuito frente al código y del registro de la simulación |
| `evidencias/2026-11-24_grabacion-simulacion-wokwi.mp4` | Grabación original de la simulación (106 s, 1916 × 904, con audio, 93,5 MiB). Antes se llamaba «GRABACION SEMAFORO COMPRENCIÓN.mp4»; solo cambiaron el nombre y la carpeta (mismo SHA-256: `93dc39e6…77d7`). **Se conserva en local y no se publica en Git** (regla en `.gitignore`) |
| `evidencias/2026-11-24_grabacion-simulacion-wokwi_copia-ligera.webm` | Copia ligera para el repositorio (3 MB, 1280 × 570, 8 fotogramas por segundo, **sin audio**), generada a partir del original. Se recortó la barra superior de Wokwi, que muestra la foto de la cuenta. El texto de la LCD y del monitor serial sigue legible |
| `evidencias/fotogramas/` | 6 fotogramas extraídos de la grabación, sin la barra superior de Wokwi (que muestra la foto de la cuenta) |
| `evidencias/2026-11-24_captura-ronda-3-3-3-rojo.png` | Captura de otra ejecución: ronda de 9 votos (3, 3 y 3), 33 %, rojo |
| `evidencias/registro-serial-transcrito-de-la-grabacion.txt` | Monitor serial de la grabación, **transcrito a mano** línea por línea |
| `evidencias/resumenes-desde-la-grabacion.csv` | CSV que generó el receptor con ese registro |
| `evidencias/registro-wokwi.txt` | Monitor serial **copiado de Wokwi** por el equipo (25/11/2026): ronda con 7 de 10 «Entendí» (70 %, verde) y cierre de una ronda sin votos |
| `evidencias/resumenes.csv` | CSV que generó el receptor con `registro-wokwi.txt` |
| `evidencias/wokwi-descarga-original.zip` | ZIP descargado de wokwi.com, sin cambios. La carpeta `wokwi/` contiene los mismos 4 archivos, idénticos byte a byte |

## Circuito y pines

| Componente | Pin del Arduino | Detalle |
|---|---|---|
| Botón verde «Entendí» | 2 | `INPUT_PULLUP`; el otro lado a GND |
| Botón amarillo «Tengo dudas» | 3 | Igual |
| Botón rojo «No entendí» | 4 | Igual |
| Botón azul «Docente: cerrar ronda» | 5 | Igual |
| Zumbador | 8 (+) y GND (−) | Tono agudo cuando acepta un voto y grave cuando lo rechaza |
| LED verde | 9 → resistencia de 220 Ω → LED → GND | Comprensión ≥ 70 % |
| LED amarillo | 10 → 220 Ω → LED → GND | De 40 % a 69 % |
| LED rojo | 12 → 220 Ω → LED → GND | < 40 %. Se usa el 12 y no el 11 porque `tone()` ocupa el Timer2, que también controla el pin 11 |
| LCD 16x2 I2C (dirección 0x27) | SDA → A4, SCL → A5, VCC → 5V, GND → GND | Conteos y porcentaje |

En Wokwi también se puede votar con el teclado: `1` = Entendí, `2` = Tengo dudas, `3` = No entendí y `4` = cerrar ronda.

## Reglas

**Cálculo y semáforo:**
- **Comprensión** = votos «Entendí» × 100 / total de votos, redondeado al entero: `(entendí × 100 + total / 2) / total`.
- **Semáforo:** verde ≥ 70 %, amarillo de 40 % a 69 %, rojo < 40 %. Sin votos, los tres LED están apagados.

**Votos:**
- **Antirrebote:** 30 ms.
- **Tiempo mínimo entre dos votos:** 800 ms. Si se vota antes, el voto se rechaza (tono grave y mensaje `rechazado`).
- **Máximo por ronda:** 60 votos.

**Cierre de ronda (botón azul):**
- Envía el resumen, reinicia los contadores y pasa a la ronda siguiente.
- Si no hubo votos, envía `ronda_vacia` y no cambia de ronda.

## Protocolo de comunicación

- **Medio:** puerto serial USB, 9600 baudios, 8N1.
- **Formato:** una línea JSON por evento, terminada en salto de línea.

| Evento | Cuándo | Ejemplo |
|---|---|---|
| `inicio` | Al encender | `{"evento":"inicio","dispositivo":"aula-1A","version":1}` |
| `voto` | Voto aceptado | `{"evento":"voto","dispositivo":"aula-1A","ronda":1,"opcion":"entendi","total":1}` |
| `rechazado` | Voto demasiado seguido o con la ronda llena | `{"evento":"rechazado","dispositivo":"aula-1A","ronda":1,"motivo":"muy_seguido"}` |
| `resumen` | El docente cierra una ronda con votos | `{"evento":"resumen","dispositivo":"aula-1A","ronda":1,"entendi":3,"dudas":1,"no_entendi":0,"total":4,"comprension":75,"nivel":"verde"}` |
| `ronda_vacia` | El docente cierra una ronda sin votos | `{"evento":"ronda_vacia","dispositivo":"aula-1A","ronda":2}` |

**Validaciones del receptor:**
- Rechaza las líneas que no cumplen el protocolo: JSON mal formado, evento u opción desconocidos, enteros negativos o booleanos, o un `total` distinto de la suma de votos.
- Recalcula la comprensión y el nivel, y rechaza el mensaje si no coinciden.
- Ignora el texto que no empieza con `{`, como el ruido de arranque.

## Cómo ejecutarlo en wokwi.com (navegador)

**Forma rápida:** abre <https://wokwi.com/projects/481623698742645761> y pulsa ▶. Si el enlace no está disponible, créalo desde cero:

1. Entra a <https://wokwi.com>, inicia sesión y crea un proyecto **Arduino Uno**.
2. Reemplaza el contenido de `sketch.ino` por el de `wokwi/sketch.ino`.
3. En la pestaña `diagram.json`, pega el contenido de `wokwi/diagram.json`.
4. Agrega la biblioteca:
   - con el botón «Library Manager», busca **LiquidCrystal I2C**;
   - o crea el archivo `libraries.txt` con el contenido de `wokwi/libraries.txt`.
5. Pulsa ▶ (Start Simulation). La LCD debe mostrar «ClassKids IoT / Semaforo listo» y después «Si0 D0 No0 / Ronda 1: votar».
6. Vota con los botones (o con las teclas 1 a 4) y observa los LED, la LCD y el **monitor serial**.
7. Para usar el receptor:
   - copia las líneas del monitor serial en un archivo, por ejemplo `registro.log`;
   - ejecuta `python receptor/receptor.py --archivo registro.log`.

Con la extensión **Wokwi para VS Code**, el receptor puede leer la simulación en vivo:
1. Compila el sketch: `arduino-cli compile --fqbn arduino:avr:uno --output-dir build .`, dentro de `wokwi/`.
2. Inicia el simulador.
3. Ejecuta `python receptor/receptor.py --puerto rfc2217://localhost:4000`. Requiere `pip install -r receptor/requirements.txt`.

## Pruebas

### Automáticas (ejecutadas el 25/11/2026: 48 de 48)

```bash
# desde la raíz del repositorio
python -m pytest ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/pruebas
```

**Qué cubren:**
- cálculo de la comprensión y límites del semáforo (70, 69, 40 y 39 %), incluidos los porcentajes que mostró la simulación;
- el registro serial transcrito de la grabación (19 votos, 7 rechazados, 2 resúmenes, 0 líneas inválidas) y el resumen de la captura;
- el registro copiado de Wokwi (`registro-wokwi.txt`): 10 votos, 1 rechazado, 1 ronda vacía, un solo resumen (70 %, verde) y su fila del CSV;
- que el receptor no se detenga en una consola de Windows (cp1252);
- validación de cada tipo de mensaje y rechazo de los mensajes mal formados o inconsistentes;
- procesamiento de una sesión completa y escritura del CSV;
- comprobación estática del circuito:
  - cada pieza y pin existen en Wokwi;
  - cada botón, LED, resistencia, zumbador y la LCD van al pin que declara el sketch;
  - ningún pin se repite y no se usan los pines 0 y 1, que son del puerto serial;
  - los textos caben en la pantalla.

**Lo que estas pruebas no demuestran por sí solas:** que el sketch compile ni que el circuito responda. Eso lo demuestra la simulación en Wokwi (tabla siguiente). En el entorno de desarrollo no se pudo compilar con `arduino-cli`; Wokwi sí lo compiló.

### Manuales en Wokwi

Las pruebas 1 a 5, 7 y 9 se ejecutaron el 24/11/2026 y se revisaron fotograma a fotograma en la grabación (columna «Evidencia»: segundo del video). Las pruebas 6 y 8 se ejecutaron el 25/11/2026; su evidencia es el monitor serial copiado de Wokwi (`registro-wokwi.txt`). El tono del zumbador no se puede comprobar en los fotogramas.

| # | Acción | Resultado esperado | Resultado obtenido | Evidencia | Estado |
|---|---|---|---|---|---|
| 1 | Iniciar la simulación | LCD «ClassKids IoT / Semaforo listo»; evento `inicio`; LED apagados | Igual al esperado; después, «Si0 D0 No0 / Ronda 1: votar» | 2 a 6 | Aprobada |
| 2 | Pulsar «Entendí» una vez | LED verde (100 %); LCD «Si1 D0 No0 / Comprende 100%»; evento `voto` | Igual al esperado | 10 | Aprobada |
| 3 | «Tengo dudas» y luego «No entendí» con 1 s entre votos | 1 de 3 = 33 %: LED rojo | Ronda 2: «Si1 D1 No1 / Comprende 33%», LED rojo | 72 | Aprobada |
| 4 | Dos pulsaciones en menos de 0,8 s | El segundo voto se rechaza: evento `rechazado` con motivo `muy_seguido` | 7 rechazos en la grabación; ninguno sumó voto | 20 a 92 | Aprobada |
| 5 | Llegar a 2 de 3 «Entendí» (67 %) | LED amarillo | «Si2 D1 No0 / Comprende 67%», LED amarillo. También 2 de 5 = 40 %, amarillo (límite inferior del amarillo) | 16 y 24 | Aprobada |
| 6 | Llegar a 7 de 10 «Entendí» (70 %) | LED verde (límite exacto) | 7 «Entendí» y 3 «Tengo dudas»; un voto rechazado por `muy_seguido` no se sumó. `resumen`: 7, 3 y 0 → 70 %, `verde` | `registro-wokwi.txt` | Aprobada |
| 7 | Botón azul con votos | `resumen` correcto; contadores en cero; «Ronda 2: votar»; LED apagados | Ronda 1: 3, 4 y 3 → 30 %, rojo. Ronda 2: 2, 3 y 4 → 22 %, rojo. En ambos casos, contadores en cero y LED apagados | 48 y 92 | Aprobada |
| 8 | Botón azul sin votos | `ronda_vacia`; no cambia de ronda | `{"evento":"ronda_vacia","dispositivo":"aula-1A","ronda":2}` justo después del resumen de la ronda 1; según el equipo, la LCD siguió en «Ronda 2: votar» | `registro-wokwi.txt` | Aprobada |
| 9 | Pasar el registro serial al receptor | Cada ronda con su porcentaje, «requiere refuerzo» en las rojas, 0 líneas inválidas | Igual al esperado con los dos registros: el transcrito de la grabación y el copiado de Wokwi | `resumenes-desde-la-grabacion.csv` y `resumenes.csv` | Aprobada |

**Resultado:** 9 de 9 aprobadas. No hay evidencia del tope de 60 votos por ronda, que no forma parte de las 9 pruebas.

### Qué demuestra cada evidencia

| Evidencia | Qué demuestra | Qué no demuestra |
|---|---|---|
| Grabación (original local y copia ligera `.webm`) y sus 6 fotogramas | Funcionamiento general: arranque, votos, 7 rechazos, dos rondas cerradas (30 % y 22 %, rojo) y los tres colores del semáforo. Respalda las pruebas 1 a 5, 7 y 9 | La ronda del 70 % ni la ronda vacía: no aparecen en la grabación |
| `registro-wokwi.txt` | Monitor serial real copiado de Wokwi: prueba 6 (7 de 10 → 70 %, verde, con un voto rechazado que no se sumó) y prueba 8 (`ronda_vacia` sin cambiar de ronda) | El estado de la LCD y del LED; que la pantalla siguiera en «Ronda 2: votar» consta como observación del equipo |
| `resumenes.csv` | El receptor en Python procesó ese registro: un resumen de 70 %, verde, y la ronda vacía sin fila; 0 líneas inválidas | La lectura en vivo de la simulación: el receptor leyó un archivo |
| `registro-serial-transcrito-de-la-grabacion.txt` y `resumenes-desde-la-grabacion.csv` | El receptor procesó el registro de la grabación: 2 resúmenes, 0 líneas inválidas | Es una transcripción a mano, no una copia del monitor |
| `2026-11-24_captura-ronda-3-3-3-rojo.png` | Otra ejecución: 3 de 9 → 33 %, rojo | — |
| 48 pruebas automáticas | El cálculo, los límites del semáforo, el protocolo, el circuito frente al código y que los dos registros se procesan sin errores | Que el sketch compile: eso lo demostró Wokwi |

La validación de las pruebas 6 y 8 se sustenta en el registro serial, el procesamiento del receptor y las pruebas automáticas; el video respalda el funcionamiento general. El equipo decidió no agregar capturas adicionales.

**Receptor con el registro copiado de Wokwi** (25/11/2026, desde `evidencias/`: `python ../receptor/receptor.py --archivo registro-wokwi.txt`):

```
Ronda 1: Entendí 7, Dudas 3, No entendí 0 -> 70 % (verde)
1 resumen(es) guardado(s) en resumenes.csv
Votos: 10 · Rechazados: 1 · Rondas vacías: 1 · Líneas inválidas: 0 · Ignoradas: 0
```

La ronda vacía no genera una fila en el CSV.

**Otra ejecución (captura):** una ronda de 9 votos (3, 3 y 3) dio 33 %, rojo, que coincide con la fórmula. El equipo también reportó una ronda de 18 votos (8, 4 y 6) con 44 %, amarillo; la fórmula da el mismo resultado, pero no hay ningún archivo que la muestre.

**Observación visual:** la LCD está girada 90° en el circuito, así que el texto se lee de lado. No afecta al funcionamiento. Se dejó así para que el circuito siga igual al de la grabación y al del proyecto en Wokwi.
