# Descripción general del proyecto

## Idea de negocio

ClassKids es una plataforma web que apoya a los docentes de un colegio en el seguimiento académico de sus estudiantes. Centraliza en un solo lugar la información de grupos, estudiantes, materias, actividades, calificaciones y observaciones, y a partir de esos datos calcula indicadores de rendimiento y genera alertas tempranas cuando un estudiante presenta bajo desempeño.

La plataforma no es solo un registro de notas: está pensada como una herramienta de apoyo a la decisión pedagógica. El tablero de rendimiento permite identificar rápidamente a los estudiantes en riesgo, comparar grupos y revisar la tendencia de cada estudiante entre periodos, mientras que el módulo de alertas organiza el acompañamiento de cada caso (activa, en revisión, resuelta).

El acceso es exclusivo para el personal de la institución: no existe registro público. Un administrador invita a cada docente por correo electrónico y este activa su cuenta definiendo su propia contraseña. Los estudiantes son registros administrados dentro del sistema; no ingresan a la plataforma.

## Problema identificado

Los docentes manejan grupos numerosos y, en general, registran las notas en hojas de cálculo o cuadernos que no les permiten analizar patrones de bajo rendimiento de forma estructurada y preventiva. Cuando una nota baja aparece, el docente no siempre cuenta con el contexto necesario (promedio acumulado, evolución entre periodos, observaciones previas) para actuar a tiempo, y no existe un mecanismo que lo alerte automáticamente.

## Objetivo general

Desarrollar un sistema web que permita registrar, consultar y analizar el desempeño académico de los estudiantes de un colegio, y que genere alertas tempranas ante situaciones de bajo rendimiento, para apoyar la toma de decisiones pedagógicas de los docentes.

## Objetivos específicos

| N.° | Objetivo específico | Estado en la versión actual |
|---|---|---|
| OE-01 | Gestionar el acceso de usuarios con roles de Administrador y Docente. | Cumplido: inicio de sesión con JWT, invitación por correo, cambio de rol y desactivación. |
| OE-02 | Gestionar los grupos académicos de la institución. | Cumplido parcialmente: creación y consulta desde la interfaz; edición y eliminación disponibles solo en la API. |
| OE-03 | Registrar y organizar a los estudiantes por grupo. | Cumplido parcialmente: registro, edición, búsqueda y filtros; la eliminación solo existe en la API. |
| OE-04 | Gestionar materias y la asignación de docentes a cada materia y grupo. | Cumplido: catálogo de materias y asignaciones docente–materia–grupo. |
| OE-05 | Crear actividades académicas (tarea, examen, proyecto, participación). | Cumplido parcialmente: creación y consulta; edición y eliminación solo en la API. |
| OE-06 | Registrar calificaciones por actividad. | Cumplido, con observaciones de calidad documentadas en el capítulo de hallazgos. |
| OE-07 | Calcular automáticamente los promedios y el nivel de rendimiento. | Cumplido: promedios individuales, por grupo, por materia y por tipo de actividad. |
| OE-08 | Registrar observaciones académicas, convivenciales y de reconocimiento. | Cumplido. |
| OE-09 | Generar automáticamente alertas por bajo rendimiento y hacerles seguimiento. | Cumplido parcialmente: regla automática por promedio menor a 3.0 y gestión de estados; la creación manual solo existe en la API. |
| OE-10 | Consultar indicadores de rendimiento en un tablero con gráficas. | Cumplido: dashboard docente, tablero de análisis y panel administrativo. |

## Alcance

### Incluido en la versión actual

- Autenticación con correo y contraseña, sesión mediante token JWT con vigencia de 8 horas y control de acceso por rol.
- Incorporación de usuarios por invitación (enlace con vigencia de 48 horas) y recuperación de contraseña por enlace (vigencia de 30 minutos, de un solo uso).
- Gestión de grupos, estudiantes, materias, asignaciones docente–materia–grupo, actividades, calificaciones, observaciones y alertas, con persistencia real en PostgreSQL.
- Escala académica oficial de 0.0 a 5.0, con un decimal, en la que se almacenan las calificaciones y se evalúan las alertas. La interfaz las presenta en porcentaje (nota × 20).
- Cálculo de promedios y clasificación del rendimiento (Excelente, Bueno, Regular, En riesgo).
- Alerta automática de bajo rendimiento cuando el promedio acumulado de un estudiante es menor a 3.0 al registrar una nueva calificación.
- Dashboard del docente, tablero de análisis con cuatro gráficas y listado de estudiantes en riesgo.
- Panel de administración con métricas globales, gestión de usuarios y vista de solo lectura de los datos.
- Páginas públicas de inicio (landing) y políticas legales (términos, privacidad, cookies y protección de datos).
- Datos de demostración de un colegio con 10 grupos (1.° a 5.°, secciones A y B) y 200 estudiantes.

### Fuera del alcance de la versión actual

- Control de asistencia e inasistencias.
- Portal para acudientes o estudiantes (el rol *Acudiente* existe en la base de datos, pero no tiene funcionalidad).
- Exportación de reportes a PDF o Excel.
- Notificaciones en tiempo real o por correo cuando se genera una alerta.
- Auditoría de cambios (registro de qué usuario creó o modificó cada dato).
- Despliegue en un servidor de producción: el sistema se ejecuta en un entorno local.
- Configuración de la escala de calificación y de los umbrales por institución (mejora futura).

## Actores y roles

| Actor | Tipo | Descripción | Cómo se controla en el sistema |
|---|---|---|---|
| Administrador | Usuario de la plataforma | Gestiona los usuarios, consulta las métricas globales y los datos de toda la plataforma. Además entra a los módulos académicos («Gestión académica») con visión de todo el colegio, y es el único que crea grupos, materias y asignaciones. | Rol `Administrador` en `user_roles`. El backend exige este rol en `/usuarios`, `/docentes` y `/admins`; el frontend protege las rutas `/admin/*`. |
| Docente | Usuario de la plataforma | Trabaja solo con sus asignaciones (docente + materia + grupo): consulta sus materias, sus grupos y los estudiantes de esos grupos; registra actividades y calificaciones de su materia en ese grupo y observaciones de sus estudiantes; consulta sus indicadores y gestiona las alertas de su ámbito. | Rol `Docente`. Accede a `/app/*`; la API filtra cada consulta por sus asignaciones y responde 403 a cualquier operación fuera de ellas (RF-26, RN-33 a RN-38). |
| Usuario invitado | Persona externa en proceso de incorporación | Recibe un enlace de invitación y activa su cuenta definiendo nombre, apellido y contraseña. | Endpoints públicos `/invitaciones/{token}` y página `/invitacion`. |
| Sistema | Actor automático | Calcula el promedio acumulado al registrar una calificación y genera la alerta de bajo rendimiento cuando corresponde. | Lógica de `POST /calificaciones` en el backend. |
| Estudiante | Registro (no es usuario) | Persona sobre la que se hace el seguimiento académico. No ingresa a la plataforma. | Tabla `estudiantes`. |

> **Nota sobre permisos (24/11/2026):** el docente está limitado a sus asignaciones y no puede crear grupos, materias ni asignaciones (H-08 corregido). La tabla `alertas` no guarda la materia; la visibilidad de las alertas se resuelve como indica RN-37.

## Módulos del sistema

| N.° | Módulo | Funcionalidades principales | Pantallas | Casos de uso |
|---|---|---|---|---|
| 1 | Seguridad y acceso | Inicio y cierre de sesión, recuperación de contraseña, activación de cuenta por invitación. | Inicio de sesión, Restablecer contraseña, Invitación | CU-01, CU-03, CU-14, CU-15 |
| 2 | Administración de usuarios | Invitar usuarios, cambiar rol, desactivar, métricas globales, datos globales. | Panel admin: Resumen, Usuarios, Datos globales | CU-02, CU-16 |
| 3 | Grupos | Crear y consultar grupos con indicadores por grupo. | Grupos | CU-04 |
| 4 | Estudiantes | Registrar, editar, buscar y filtrar estudiantes; detalle con promedio, estado, tendencia y observaciones. | Estudiantes | CU-05 |
| 5 | Materias y asignaciones | Catálogo de materias y asignación de un docente por materia en cada grupo. | Materias | CU-06, CU-07 |
| 6 | Actividades | Crear y consultar actividades con estado y progreso de entrega. | Actividades | CU-08 |
| 7 | Calificaciones | Registrar y actualizar notas por actividad para todo un grupo. | Calificaciones | CU-09 |
| 8 | Observaciones | Registrar, consultar y eliminar observaciones por estudiante. | Detalle del estudiante | CU-10 |
| 9 | Análisis de rendimiento | Dashboard docente y tablero de análisis con indicadores y gráficas. | Dashboard, Análisis | CU-11 |
| 10 | Alertas académicas | Generación automática, consulta con filtros y cambio de estado. | Alertas, panel de alertas del Dashboard | CU-12, CU-13 |
| 11 | Información pública | Landing y políticas legales. | Inicio, Términos, Privacidad, Cookies, Protección de datos | — |

## Marco metodológico

- **Marco de trabajo:** Scrum, con organización del trabajo en sprints y entregas incrementales.
- **Gestión de requisitos:** casos de uso e historias de usuario.
- **Priorización:** método MoSCoW para definir el alcance del producto mínimo viable (MVP).
- **Control de versiones:** Git, con ramas `master` (principal) y `stg` (integración).

## Equipo de desarrollo

Composición actual del equipo (noviembre de 2026). Andrés Gutiérrez participó en la versión 1.0 del documento y ya no forma parte del grupo.

| Integrante | Programa |
|---|---|
| María Alejandra Guio | Análisis y Desarrollo de Software (ADSO) – SENA |
| Faloon Johanna Ortiz | Análisis y Desarrollo de Software (ADSO) – SENA |
| Jan Llanos | Análisis y Desarrollo de Software (ADSO) – SENA |
