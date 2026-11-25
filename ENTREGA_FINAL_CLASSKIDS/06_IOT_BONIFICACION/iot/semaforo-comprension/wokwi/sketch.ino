/*
  Semáforo de Comprensión ClassKids — prototipo IoT independiente (simulación en Wokwi)
  ------------------------------------------------------------------------------------
  Placa: Arduino UNO.

  Qué hace:
  - Durante una explicación, los estudiantes votan de forma ANÓNIMA con tres botones:
      verde = «Entendí», amarillo = «Tengo dudas», rojo = «No entendí».
  - El dispositivo cuenta los votos y calcula el porcentaje de comprensión
    (votos «Entendí» / total de votos).
  - Tres LED forman un semáforo:
      verde ≥ 70 %, amarillo de 40 % a 69 %, rojo < 40 %. Sin votos, todos apagados.
  - Una pantalla LCD 16x2 (I2C) muestra los conteos y el porcentaje.
  - El zumbador confirma cada voto (tono agudo) o avisa un rechazo (tono grave).
  - El botón azul del docente cierra la ronda: envía el resumen al computador y
    reinicia los contadores para la siguiente pregunta.

  Comunicación (protocolo):
  - Puerto serial USB a 9600 baudios, una línea JSON por evento, terminada en '\n'.
  - Eventos: inicio, voto, rechazado, resumen y ronda_vacia
    (ver iot/semaforo-comprension/README.md).
  - El receptor en Python (receptor/receptor.py) lee esas líneas y las procesa.

  Privacidad: no se guarda ni se envía ningún dato personal; solo conteos anónimos.

  Este prototipo NO está conectado a ClassKids: no usa su API ni su base de datos.
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---------------- Pines (deben coincidir con diagram.json) ----------------
const uint8_t PIN_BTN_ENTENDI = 2;   // botón verde
const uint8_t PIN_BTN_DUDA    = 3;   // botón amarillo
const uint8_t PIN_BTN_NO      = 4;   // botón rojo
const uint8_t PIN_BTN_CERRAR  = 5;   // botón azul (docente)
const uint8_t PIN_ZUMBADOR    = 8;
const uint8_t PIN_LED_VERDE   = 9;
const uint8_t PIN_LED_AMARILLO = 10;
const uint8_t PIN_LED_ROJO    = 12;   // no se usa el 11: tone() ocupa el Timer2, que también controla ese pin
// La LCD usa I2C: SDA = A4, SCL = A5, dirección 0x27.

// ---------------- Parámetros ----------------
const char*    DISPOSITIVO        = "aula-1A";  // identificador del aula, no de personas
const uint8_t  UMBRAL_VERDE       = 70;         // % mínimo para verde
const uint8_t  UMBRAL_AMARILLO    = 40;         // % mínimo para amarillo
const uint16_t MAX_VOTOS_RONDA    = 60;         // tope de votos por ronda
const unsigned long ANTIRREBOTE_MS = 30;        // filtra el rebote mecánico del botón
const unsigned long BLOQUEO_MS     = 800;       // tiempo mínimo entre dos votos

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------------- Estado ----------------
uint16_t entendi = 0, dudas = 0, noEntendi = 0;
uint16_t ronda = 1;
unsigned long ultimoVoto = 0;

// Un botón con antirrebote: detecta el instante en que se presiona.
struct Boton {
  uint8_t pin;
  bool estadoEstable;       // HIGH = suelto (INPUT_PULLUP)
  bool lecturaAnterior;
  unsigned long cambio;
};

Boton botones[4] = {
  {PIN_BTN_ENTENDI, HIGH, HIGH, 0},
  {PIN_BTN_DUDA,    HIGH, HIGH, 0},
  {PIN_BTN_NO,      HIGH, HIGH, 0},
  {PIN_BTN_CERRAR,  HIGH, HIGH, 0},
};

// Devuelve true solo en el momento en que el botón pasa de suelto a presionado.
bool sePresiono(Boton &b) {
  bool lectura = digitalRead(b.pin);
  if (lectura != b.lecturaAnterior) {
    b.cambio = millis();
    b.lecturaAnterior = lectura;
  }
  if (millis() - b.cambio > ANTIRREBOTE_MS && lectura != b.estadoEstable) {
    b.estadoEstable = lectura;
    return b.estadoEstable == LOW;
  }
  return false;
}

// ---------------- Cálculos ----------------
uint16_t totalVotos() {
  return entendi + dudas + noEntendi;
}

// Porcentaje entero redondeado: (entendí × 100 + total / 2) / total.
uint8_t comprension() {
  uint16_t total = totalVotos();
  if (total == 0) return 0;
  return (uint8_t)(((uint32_t)entendi * 100 + total / 2) / total);
}

const char* nivel() {
  if (totalVotos() == 0) return "sin_datos";
  uint8_t p = comprension();
  if (p >= UMBRAL_VERDE) return "verde";
  if (p >= UMBRAL_AMARILLO) return "amarillo";
  return "rojo";
}

// ---------------- Salidas ----------------
void actualizarSemaforo() {
  const char* n = nivel();
  digitalWrite(PIN_LED_VERDE,    strcmp(n, "verde") == 0 ? HIGH : LOW);
  digitalWrite(PIN_LED_AMARILLO, strcmp(n, "amarillo") == 0 ? HIGH : LOW);
  digitalWrite(PIN_LED_ROJO,     strcmp(n, "rojo") == 0 ? HIGH : LOW);
}

void actualizarPantalla() {
  char linea[17];
  lcd.clear();
  snprintf(linea, sizeof(linea), "Si%u D%u No%u", entendi, dudas, noEntendi);
  lcd.setCursor(0, 0);
  lcd.print(linea);
  lcd.setCursor(0, 1);
  if (totalVotos() == 0) {
    snprintf(linea, sizeof(linea), "Ronda %u: votar", ronda);
  } else {
    snprintf(linea, sizeof(linea), "Comprende %u%%", comprension());
  }
  lcd.print(linea);
}

// Mensajes del protocolo: una línea JSON por evento.
void enviarVoto(const char* opcion) {
  Serial.print(F("{\"evento\":\"voto\",\"dispositivo\":\""));
  Serial.print(DISPOSITIVO);
  Serial.print(F("\",\"ronda\":"));
  Serial.print(ronda);
  Serial.print(F(",\"opcion\":\""));
  Serial.print(opcion);
  Serial.print(F("\",\"total\":"));
  Serial.print(totalVotos());
  Serial.println(F("}"));
}

void enviarRechazo(const char* motivo) {
  Serial.print(F("{\"evento\":\"rechazado\",\"dispositivo\":\""));
  Serial.print(DISPOSITIVO);
  Serial.print(F("\",\"ronda\":"));
  Serial.print(ronda);
  Serial.print(F(",\"motivo\":\""));
  Serial.print(motivo);
  Serial.println(F("\"}"));
}

void enviarResumen() {
  Serial.print(F("{\"evento\":\"resumen\",\"dispositivo\":\""));
  Serial.print(DISPOSITIVO);
  Serial.print(F("\",\"ronda\":"));
  Serial.print(ronda);
  Serial.print(F(",\"entendi\":"));
  Serial.print(entendi);
  Serial.print(F(",\"dudas\":"));
  Serial.print(dudas);
  Serial.print(F(",\"no_entendi\":"));
  Serial.print(noEntendi);
  Serial.print(F(",\"total\":"));
  Serial.print(totalVotos());
  Serial.print(F(",\"comprension\":"));
  Serial.print(comprension());
  Serial.print(F(",\"nivel\":\""));
  Serial.print(nivel());
  Serial.println(F("\"}"));
}

// ---------------- Acciones ----------------
void registrarVoto(uint16_t &contador, const char* opcion) {
  unsigned long ahora = millis();
  if (ultimoVoto != 0 && ahora - ultimoVoto < BLOQUEO_MS) {
    tone(PIN_ZUMBADOR, 220, 150);         // tono grave: voto demasiado seguido
    enviarRechazo("muy_seguido");
    return;
  }
  if (totalVotos() >= MAX_VOTOS_RONDA) {
    tone(PIN_ZUMBADOR, 220, 150);
    enviarRechazo("limite_ronda");
    return;
  }
  contador++;
  ultimoVoto = ahora;
  tone(PIN_ZUMBADOR, 1000, 80);           // tono agudo: voto aceptado
  enviarVoto(opcion);
  actualizarSemaforo();
  actualizarPantalla();
}

void cerrarRonda() {
  if (totalVotos() == 0) {
    tone(PIN_ZUMBADOR, 220, 400);
    Serial.print(F("{\"evento\":\"ronda_vacia\",\"dispositivo\":\""));
    Serial.print(DISPOSITIVO);
    Serial.print(F("\",\"ronda\":"));
    Serial.print(ronda);
    Serial.println(F("}"));
    return;
  }
  enviarResumen();
  entendi = dudas = noEntendi = 0;
  ronda++;
  ultimoVoto = 0;
  tone(PIN_ZUMBADOR, 1500, 200);
  actualizarSemaforo();
  actualizarPantalla();
}

void setup() {
  Serial.begin(9600);
  for (uint8_t i = 0; i < 4; i++) pinMode(botones[i].pin, INPUT_PULLUP);
  pinMode(PIN_LED_VERDE, OUTPUT);
  pinMode(PIN_LED_AMARILLO, OUTPUT);
  pinMode(PIN_LED_ROJO, OUTPUT);
  pinMode(PIN_ZUMBADOR, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ClassKids IoT");
  lcd.setCursor(0, 1);
  lcd.print("Semaforo listo");
  delay(1200);

  Serial.print(F("{\"evento\":\"inicio\",\"dispositivo\":\""));
  Serial.print(DISPOSITIVO);
  Serial.println(F("\",\"version\":1}"));
  actualizarSemaforo();
  actualizarPantalla();
}

void loop() {
  if (sePresiono(botones[0])) registrarVoto(entendi, "entendi");
  if (sePresiono(botones[1])) registrarVoto(dudas, "duda");
  if (sePresiono(botones[2])) registrarVoto(noEntendi, "no_entendi");
  if (sePresiono(botones[3])) cerrarRonda();
}
