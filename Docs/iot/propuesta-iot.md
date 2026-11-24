# IoT · bonificación (criterio 6)

**Estado al 23/11/2026: no implementado.** ClassKids **no tiene integración IoT** y no se encontró ningún prototipo relacionado. Este documento no presenta IoT como una funcionalidad de ClassKids. No hay capturas, comunicación serial, sensores ni datos recibidos, porque no existen.

## 1. Búsqueda realizada (23/11/2026)

| Dónde se buscó | Qué se buscó | Resultado |
|---|---|---|
| Repositorio ClassKids (código, `Docs/`, presentación PDF) | Arduino, IoT, sensores, serial, MQTT, ESP32 | Nada |
| Documento versión 1.0 (`ClassKids.pdf`) y `Estructura proyecto Class Kids.docx` | Las mismas palabras | Nada |
| Carpetas del equipo en este computador (Escritorio, Documentos, Descargas, OneDrive) | Archivos `.ino`, carpetas «arduino», «iot», «sensor», «serial», «esp32», «dht» y archivos comprimidos | Nada |

El encargo menciona actividades de la formación con **Arduino, sensores, comunicación serial, JSON y Python**. Si existen, están en otro equipo o cuenta: **el equipo debe aportarlas** (código del sketch, script de Python, fotos o video del montaje).

## 2. Plantilla para documentar la actividad de la formación (completar con lo real)

| Campo | Valor |
|---|---|
| Nombre de la actividad y formación | PENDIENTE |
| Placa y sensores (por ejemplo, Arduino UNO + DHT11) | PENDIENTE |
| Diagrama de conexión (foto o esquema) | PENDIENTE |
| Código del Arduino (`.ino`) | PENDIENTE: ruta del archivo |
| Comunicación | Serial USB a ___ baudios / Wi-Fi / otro: PENDIENTE |
| Formato del mensaje | PENDIENTE (por ejemplo `{"temperatura": 24.5, "humedad": 60}`) |
| Programa receptor en Python | PENDIENTE: ruta del script (por ejemplo, `pyserial` + `json`) |
| Qué hace con los datos (mostrar, guardar, enviar a una API) | PENDIENTE |
| Evidencia (video, capturas, registro de la consola) | PENDIENTE |
| Integrantes que la realizaron | PENDIENTE |

**Cómo explicarlo:**
1. El sensor mide.
2. El Arduino arma un mensaje JSON y lo envía por el puerto serial.
3. Python lee el puerto, convierte el texto JSON en un diccionario y usa los datos.

Eso es IoT básico: un dispositivo que captura datos del mundo físico y los comunica a un programa.

## 3. PROPUESTA: prototipo independiente (posible bonificación, no construido)

Prototipo pequeño, **separado de ClassKids**, para demostrar el ciclo IoT básico:

| Paso | Qué hace | Tecnología sugerida |
|---|---|---|
| 1. Medir | Un sensor de temperatura y humedad toma una lectura cada 5 s | Arduino UNO + DHT11 |
| 2. Empaquetar | El Arduino arma el mensaje `{"temperatura": 24.5, "humedad": 60}` | `ArduinoJson` o texto armado a mano |
| 3. Comunicar | Envía una línea por el puerto serial USB a 9600 baudios | `Serial.println()` |
| 4. Recibir | Un script lee el puerto, convierte el JSON y muestra o guarda los datos | Python + `pyserial` + `json` |
| 5. Evidenciar | Video del montaje, foto del circuito y registro de la consola | — |

**Criterios para considerarlo terminado** (ninguno se cumple todavía):
- el montaje funciona;
- el script recibe datos reales;
- el protocolo está explicado (puerto, velocidad, formato);
- hay evidencia real.

## 4. Propuesta de relación con ClassKids (no implementada)

Solo si el equipo la autoriza y hay tiempo: registro de asistencia en el aula, que el diseño original planteaba y no se construyó.

| Componente | Opción |
|---|---|
| Dispositivo | Arduino + lector RFID, o ESP32 con Wi-Fi |
| Mensaje | `{"documento": "100102", "aula": "1A", "fecha_hora": "..."}` |
| Protocolo | Serial → script Python que reenvía por HTTP POST a la API; o ESP32 directo por HTTP |
| Recepción en ClassKids | Endpoint nuevo `POST /asistencias` y tabla `asistencias`. **Requiere autorización de cambio de esquema** y se probaría solo en el entorno de pruebas |

Si se usa un simulador en lugar de hardware, se debe declarar como **simulador**.
