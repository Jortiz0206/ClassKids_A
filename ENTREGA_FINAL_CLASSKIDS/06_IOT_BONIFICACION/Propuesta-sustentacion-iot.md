# Propuesta de innovación para ClassKids
## Semáforo de Comprensión
### Una herramienta IoT para identificar dificultades de aprendizaje durante la clase

## 1. Introducción

ClassKids es un sistema de seguimiento académico orientado a facilitar el trabajo docente mediante el registro de estudiantes, actividades, calificaciones, observaciones y alertas académicas.

Como oportunidad de mejora, identificamos que el seguimiento académico puede fortalecerse incorporando información sobre la comprensión de los estudiantes durante el desarrollo de las clases, sin esperar únicamente a los resultados de las evaluaciones.

A partir de esta necesidad surge la propuesta del **Semáforo de Comprensión**, una herramienta basada en IoT que busca complementar las funcionalidades de ClassKids mediante la participación anónima de los estudiantes.

## 2. Problema identificado

Actualmente, los docentes pueden identificar dificultades académicas mediante las calificaciones y las alertas del sistema. Sin embargo, estas señales generalmente aparecen después de realizar una actividad o evaluación.

Durante una explicación pueden existir estudiantes que tengan dudas, no comprendan un tema o necesiten una explicación adicional, pero que no se sientan cómodos expresándolo delante de sus compañeros.

Esto genera una oportunidad de mejora: contar con un mecanismo que permita conocer la percepción de comprensión del grupo mientras se desarrolla la clase.

## 3. Nuestra propuesta

Desarrollar un dispositivo denominado **Semáforo de Comprensión**, que permita a los estudiantes expresar anónimamente cómo comprenden un tema mediante tres botones:

- **Verde:** Entendí.
- **Amarillo:** Tengo dudas.
- **Rojo:** No entendí.

El dispositivo recopila las respuestas, calcula los porcentajes y representa el resultado mediante indicadores luminosos y una pantalla.

La información obtenida podría utilizarse posteriormente en ClassKids para complementar el análisis académico y facilitar decisiones pedagógicas oportunas.

## 4. ¿Cómo funcionaría?

El funcionamiento propuesto contempla dos momentos:

### Momento 1. Participación en el aula

1. El docente plantea una pregunta relacionada con el tema explicado.
2. Los estudiantes seleccionan una de las tres opciones.
3. El dispositivo registra las respuestas de manera anónima.
4. Arduino calcula los resultados y determina el nivel de comprensión.
5. El docente puede consultar el resultado general y decidir si necesita reforzar el tema.

### Momento 2. Integración futura con ClassKids

1. El docente selecciona en ClassKids el grupo, la materia y la actividad.
2. Inicia una sesión de comprensión.
3. El dispositivo recopila las respuestas.
4. Los resultados se transmiten a ClassKids mediante una conexión segura.
5. El sistema almacena los resultados y los presenta en el módulo de Análisis.
6. El docente consulta los indicadores y el historial para orientar sus decisiones.

## 5. Clasificación de los resultados

La propuesta contempla tres niveles de comprensión:

| Nivel | Porcentaje | Interpretación |
|---|---|---|
| Verde | 70 % o más | El grupo manifiesta un nivel favorable de comprensión. |
| Amarillo | 40 % a 69 % | Se identifican dudas que pueden requerir aclaraciones. |
| Rojo | Menos del 40 % | Se recomienda reforzar la explicación. |

Estos porcentajes representan la percepción de comprensión del grupo, no una medición definitiva del aprendizaje.

## 6. Prototipo desarrollado

Para comprobar la viabilidad técnica de la propuesta, se construyó un prototipo funcional utilizando Arduino UNO y el simulador Wokwi.

El prototipo incorpora:

| Componente | Funcionalidad |
|---|---|
| Arduino UNO | Procesamiento y control del dispositivo. |
| Cuatro pulsadores | Tres para registrar respuestas y uno para cerrar la ronda. |
| Tres LED | Representación visual de los resultados. |
| Pantalla LCD 16x2 | Visualización de conteos y porcentajes. |
| Zumbador | Confirmación sonora de las respuestas. |
| Python | Recepción, validación y almacenamiento de resultados. |

La comunicación entre Arduino y Python utiliza mensajes JSON mediante el puerto serial.

El receptor desarrollado en Python permite validar los mensajes y almacenar los resúmenes en archivos CSV.

**Alcance del prototipo:** se comprobó el funcionamiento mediante simulación en Wokwi y procesamiento de los registros obtenidos. Todavía no existe una conexión con la plataforma ClassKids.

## 7. Validación técnica realizada

Para verificar el funcionamiento del prototipo se realizaron:

- 48 pruebas automáticas aprobadas.
- 9 pruebas manuales en Wokwi aprobadas.
- Validaciones del cálculo de porcentajes y clasificación de colores.
- Comprobaciones de recepción y validación de mensajes JSON.
- Pruebas de cierre de rondas y rechazo de respuestas.
- Verificación del almacenamiento de resultados en CSV.

Los resultados permiten comprobar el funcionamiento de los componentes implementados y respaldan la viabilidad técnica inicial de la propuesta.

## 8. Proyección: integración con ClassKids

La principal oportunidad de crecimiento consiste en incorporar el Semáforo de Comprensión como un nuevo módulo del sistema.

Proponemos desarrollar una funcionalidad denominada **Comprensión en el Aula**, que podría incluir:

### Gestión de sesiones

- Iniciar y finalizar rondas de comprensión.
- Relacionar cada sesión con un grupo, una materia y una actividad.
- Identificar el dispositivo asignado al aula.

### Indicadores de comprensión

- Mostrar porcentajes de respuestas verdes, amarillas y rojas.
- Consultar resultados por actividad.
- Visualizar el nivel general de comprensión del grupo.

### Historial y análisis

- Consultar resultados de sesiones anteriores.
- Comparar la comprensión entre diferentes actividades.
- Identificar temas donde se presentan dificultades recurrentes.

### Alertas y acompañamiento

- Generar avisos cuando se detecten niveles bajos de comprensión.
- Proponer actividades de refuerzo.
- Facilitar al docente la identificación de temas que requieren mayor atención.

## 9. Arquitectura tecnológica propuesta

La futura integración podría funcionar mediante la siguiente estructura:

**Dispositivo IoT → Comunicación segura → API de ClassKids → Backend → Base de datos → Panel docente**

Para hacerlo posible sería necesario:

1. Incorporar conectividad Wi-Fi mediante un ESP32 o utilizar un receptor Python como intermediario.
2. Crear una API que reciba y valide los resultados.
3. Diseñar las tablas necesarias para almacenar las sesiones de comprensión.
4. Relacionar los resultados con los grupos, materias, docentes y actividades.
5. Desarrollar la interfaz del nuevo módulo.
6. Incorporar los indicadores al análisis académico de ClassKids.

La integración deberá respetar los permisos de acceso y mantener la participación anónima de los estudiantes.

## 10. Beneficios esperados

La implementación futura podría aportar:

- Identificación más oportuna de dificultades de comprensión.
- Mayor participación de los estudiantes mediante respuestas anónimas.
- Información complementaria para el seguimiento académico.
- Apoyo a las decisiones pedagógicas del docente.
- Identificación de temas que requieren refuerzo.
- Mayor integración entre la información obtenida en clase y el análisis académico de ClassKids.

## 11. Alcance y consideraciones

Es importante diferenciar el estado actual de la propuesta y su proyección.

| Estado actual | Desarrollo futuro propuesto |
|---|---|
| Prototipo simulado en Wokwi. | Dispositivo físico con conectividad. |
| Registro de respuestas mediante Arduino. | Comunicación con ClassKids. |
| Procesamiento de mensajes JSON en Python. | API integrada con el backend. |
| Almacenamiento en CSV. | Persistencia en la base de datos. |
| Indicadores en pantalla LCD y LED. | Panel de análisis dentro de ClassKids. |
| Resultados generales por ronda. | Historial asociado a grupos, materias y actividades. |

## 12. Conclusión

El Semáforo de Comprensión nace como una propuesta para fortalecer el seguimiento académico de ClassKids, incorporando una perspectiva complementaria: conocer cómo perciben los estudiantes su comprensión durante las clases.

El prototipo desarrollado permite demostrar la viabilidad inicial de la captura, procesamiento y almacenamiento de respuestas mediante tecnologías IoT.

Su integración futura con ClassKids permitiría transformar esos resultados en información útil para el docente, facilitando la identificación temprana de dificultades y el desarrollo de estrategias de refuerzo.

**Nuestra propuesta no busca reemplazar las calificaciones ni las alertas académicas existentes, sino complementarlas con información que permita acompañar el aprendizaje antes de que las dificultades se reflejen en los resultados académicos.**