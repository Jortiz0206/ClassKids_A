# Comparación con la documentación anterior

Este capítulo compara el documento original «Proyecto Class Kids – Sistema de apoyo a la atención y seguimiento académico con alertas tempranas» (versión 1.0, noviembre de 2025) y la documentación anterior del repositorio con la implementación verificada el 20/11/2026.

**Clasificaciones.**

- **Desactualizada:** la documentación describía algo distinto de lo que se construyó; se corrigió el documento.
- **Nueva sin documentar:** la funcionalidad existe en el sistema y no estaba documentada; se incorporó.
- **Coincide:** documentación e implementación concuerdan.
- **Requiere verificación:** hay una diferencia que el equipo o el instructor deben decidir.
- **Pendiente:** la funcionalidad se documentó, pero no existe en el sistema; se conserva como trabajo futuro.

## Documento Word original frente a la implementación

| Elemento | Documentación anterior | Implementación actual | Acción | Clasificación |
|---|---|---|---|---|
| Enfoque del sistema | Seguimiento académico y **conductual**, con detección de dificultades **atencionales**. | Seguimiento académico (notas, promedios, alertas por bajo rendimiento) y observaciones cualitativas. No hay indicadores de atención. | Se reformularon la idea, el objetivo y el alcance según lo construido. | Desactualizada |
| Actores | Administrador y Docente. | Administrador, Docente, Usuario invitado y Sistema. El administrador hereda las funciones del docente. | Se documentaron los cuatro actores. | Desactualizada |
| Creación de usuarios | El administrador crea y edita usuarios con un formulario. | El administrador **invita** por correo; el invitado activa su cuenta. No se pueden editar nombre ni correo. | Se reescribió CU-02 y se agregó CU-15. | Desactualizada |
| Activación por invitación | No documentada. | Implementada (enlace de 48 horas). | Se agregó CU-15. | Nueva sin documentar |
| Recuperación de contraseña | Flujo alternativo breve de CU-01. | Implementada con token persistente de 30 minutos y uso único; requiere SMTP. | Se agregó CU-14. | Nueva sin documentar |
| Panel de administración | No documentado. | Métricas globales y datos globales de solo lectura. | Se agregó CU-16. | Nueva sin documentar |
| CU-01: validación | «Llama al procedimiento almacenado». | La validación se hace en el backend con SQL parametrizado; no hay procedimientos almacenados. | Se corrigió el flujo. | Desactualizada |
| CU-01: postcondición | «Se registra el intento de acceso en la tabla LOG». | No existe tabla de log; solo se actualiza `last_sign_in_at`. | Se corrigió la postcondición y se registró como pendiente. | Pendiente |
| CU-02: flujo alternativo | Titulado «Recuperar contraseña» con pasos de cancelar. | Error de título en el original. | Se reescribió el caso de uso. | Desactualizada |
| CU-03: flujos | Confirmación de cierre y mensaje «No existe una sesión activa». | El cierre es inmediato, sin confirmación; el token no se revoca en el servidor. | Se corrigió CU-03. | Desactualizada |
| CU-04: nombre | «Gestionar grupos» en el texto y «Nuevo grupo» en la tabla. | La interfaz crea y consulta; editar y eliminar solo existen en la API. | Se unificó como «Gestionar grupos» con estado Parcial. | Desactualizada |
| CU-04: grupo duplicado | Mensaje «El grupo ya se encuentra registrado». | No hay validación: se pueden crear grupos con el mismo nombre. | Se documentó como hallazgo. | Pendiente |
| CU-05: duplicado | Se valida por **nombre** del estudiante. | Se valida por **documento** (único); el error se muestra como mensaje genérico. | Se corrigió el flujo excepcional. | Desactualizada |
| CU-06 Gestionar materias | Crear, editar y eliminar; actor Docente. | Crear, buscar y eliminar en la interfaz; editar solo en la API. Disponible para docente y administrador. | Se actualizó con estado Parcial. | Desactualizada |
| CU-07 Asignar docente | Enunciado sin especificación. | Implementado: un docente por materia en cada grupo. | Se escribió la especificación completa. | Nueva sin documentar |
| CU-08 Nueva actividad | Sin campo materia en el formulario; error «fecha no válida». | Incluye materia; acepta fechas pasadas (quedan como vencidas). | Se corrigió el flujo. | Desactualizada |
| CU-09: escala y criterio de aprobación | Escala 0.0–5.0; «Aprobado con nota igual o superior a **5.0**» (error del original: con ese criterio solo aprobaría la nota máxima). | Escala oficial 0.0–5.0 en el backend y la base de datos (decisión registrada el 20/11/2026). La interfaz la presenta en porcentaje (nota × 20) y aprueba desde 3.5 (70 %); la alerta se genera con promedio < 3.0. | Se documentaron la escala oficial, el ciclo de conversión y los umbrales implementados (RN-01 a RN-08B, RN-09). La diferencia de umbrales queda como hallazgo H-01. | Desactualizada |
| CU-09: flujo | Se califica estudiante por estudiante. | Se califica a todo el grupo en una tabla y se guarda en bloque. | Se reescribió el flujo. | Desactualizada |
| CU-10 Registrar observación | Opción de menú «Observaciones»; campos fecha, tipo y descripción; ubicada en el módulo de Análisis. | Se registra desde el detalle del estudiante; la fecha es automática; tipos Académica, Convivencial y Reconocimiento. | Se movió al módulo Observaciones y se corrigió el flujo. | Desactualizada |
| Observaciones: autor y recomendaciones | Debe registrar el docente y recomendaciones pedagógicas. | No se registra el autor ni hay campo de recomendaciones. | Se registró como pendiente. | Pendiente |
| CU-11 Tablero | Promedio grupal, comparativa histórica y alertas; filtro por grupo; precondición «deben existir observaciones». | Dashboard y Análisis con cuatro gráficas y tabla de riesgo; sin filtros; no requiere observaciones. | Se reescribió CU-11. | Desactualizada |
| Análisis: asistencia | El módulo procesaría calificaciones y asistencia. | No existe asistencia. | Se registró como pendiente. | Pendiente |
| CU-12 Generar alerta | Cuatro tipos (bajo rendimiento, inasistencia crítica, riesgo comportamental, deserción) con prioridad asignada. | Solo la regla de bajo rendimiento (promedio < 3.0 en la escala oficial); la prioridad no se almacena. | Se documentó la regla real (RN-09) y lo demás como pendiente. | Pendiente |
| CU-13 Estado de alerta | Activa, En revisión, Resuelta. | Implementado con `active`, `reviewed` y `resolved`. | Se completó la especificación. | Coincide |
| Duplicación de numeración de módulos | Dos módulos numerados como «Módulo 5». | — | Se reorganizaron los 11 módulos. | Desactualizada |
| RF del anexo 1 | RF-08 y RF-09 asociados a CU-12; RF-03 y RF-04 descritos como completos. | Se corrigieron los casos de uso asociados y los estados. | Se reescribió la matriz (25 RF). | Desactualizada |
| Funcionalidades sin RF | — | Recuperación de contraseña, invitaciones, roles, desactivación, materias, asignaciones, métricas, datos globales, Dashboard, páginas públicas. | Se agregaron RF-16 a RF-25. | Nueva sin documentar |
| RNF-05 Exportación PDF/Excel | Requisito. | No existe. | Se mantiene como no implementado. | Pendiente |
| RNF-08 Alertas en tiempo real | Requisito. | No existe. | Se mantiene como no implementado. | Pendiente |
| RNF-11 Escala y fechas | Notas 0–5.0; fechas no anteriores a la creación. | La escala 0.0–5.0 coincide y la protege la base de datos; la interfaz la muestra en porcentaje; no se validan las fechas. | Estado Parcial (por la validación de fechas). | Coincide (escala) / Pendiente (fechas) |
| RNF-12 Inactividad 15 min | Requisito. | Token de 8 horas sin control de inactividad. | Se mantiene como no implementado. | Pendiente |
| RNF-13 duplicado | Aparecía dos veces en el anexo. | — | Se dejó una sola vez. | Desactualizada |
| Arquitectura | Cuatro capas (presentación, lógica, acceso a datos, base de datos); excepciones personalizadas y manejador global de errores. | Tres capas físicas; la lógica y el acceso a datos están juntos en `main.py`; no hay excepciones personalizadas ni manejador global. | Se documentó la arquitectura real. | Desactualizada |
| MER: nombres | `usuario`, `id_usuario`, `correo`, `contrasena`, `rol ENUM`, `estado VARCHAR`. | `usuarios`, `id`, `email`, `password_hash`, `rol_id` (FK a `user_roles`), `activo BOOLEAN`. | Se regeneró el MER desde la base de datos real. | Desactualizada |
| MER: tablas faltantes | 9 tablas. | 12 tablas: se suman `user_roles`, `invitaciones` y `password_reset_tokens`. | Se incorporaron al MER y al diccionario. | Nueva sin documentar |
| Tabla calificaciones | `nota DECIMAL(5,2)`; `id_actividad` obligatorio; sin materia ni periodo. | `nota NUMERIC(3,1)` con CHECK 0–5 (escala oficial con un decimal); `actividad_id` opcional; incluye `materia_id`, `periodo` y `observacion`. | Se actualizó el diccionario. | Desactualizada |
| Tabla alertas | `tipo_alerta ENUM` de 4 valores; `prioridad ENUM`. | `tipo VARCHAR(80)` libre, `mensaje`, `estado`, `fecha_creacion`; sin prioridad. | Se actualizó el diccionario. | Desactualizada |
| Tabla observaciones | Incluye `id_docente`. | No tiene docente; incluye `tipo`. | Se actualizó el diccionario y se registró la falta de autor. | Desactualizada |
| Tabla actividades | `nombre_actividad`; tipo ENUM. | `titulo`, `tipo VARCHAR`, `descripcion`. | Se actualizó el diccionario. | Desactualizada |
| Tabla grupos | `nombre_grupo`, turno Mañana/Tarde. | `nombre`, turno Matutino/Vespertino, `ano_lectivo`. | Se actualizó el diccionario. | Desactualizada |
| Tabla estudiantes | Grupo obligatorio. | `grupo_id` admite nulo (si se elimina el grupo); incluye `activo`. | Se actualizó el diccionario. | Desactualizada |
| Relación Grupo–Actividad | Implícita. | Explícita (`actividades.grupo_id`). | Se documentó. | Coincide |
| Relación Asignación | Docente–Materia–Grupo como núcleo relacional. | Igual, con la restricción de un docente por materia en cada grupo. | Se documentó la restricción. | Coincide |
| Diagrama de casos de uso | 9 óvalos; «Calcular promedio» duplicado; Crear actividad incluye «Analizar reglas de riesgo». | 16 casos de uso; la alerta se incluye desde Registrar calificación. | Se rehízo el diagrama. | Desactualizada |
| Fases de ejecución | Plan futuro («se desarrollará»). | Fases 1 a 3 ejecutadas; fase 4 parcial; fase 5 no iniciada. | Se actualizó el estado de cada fase. | Desactualizada |
| Pruebas | Solo enunciadas. | Verificaciones reales del 20/11/2026; una prueba automatizada de ejemplo. | Se documentaron las evidencias reales. | Nueva sin documentar |
| Interfaces | No incluidas. | 24 capturas de la aplicación en ejecución. | Se agregó el capítulo de interfaces. | Nueva sin documentar |
| Autores | Portada: María Alejandra Guio, Johanna Ortiz, Jan Llanos. Fichas de CU: Alejandra Guio, Andrés Gutiérrez, Johanna Ortiz. | Equipo actual confirmado: Faloon Johanna Ortiz, María Alejandra Guio y Jan Llanos. Andrés Gutiérrez ya no forma parte del grupo. | Se actualizó el equipo en todo el documento y se conservó la autoría de la versión 1.0 como registro histórico. | Desactualizada |

## Documentación anterior del repositorio frente a la implementación

| Documento | Afirmación anterior | Situación verificada | Clasificación |
|---|---|---|---|
| `Docs/backlog.md` | «CRUD de grupos, estudiantes, materias, actividades y calificaciones» terminado. | El CRUD completo existe en la API; en la interfaz faltan editar y eliminar en varios módulos. | Desactualizada |
| `Docs/backlog.md`, `README.md` | Alertas manuales terminadas. | Solo por API; no hay pantalla. | Desactualizada |
| `Docs/README.md` | «Los tokens de recuperación se mantienen en memoria». | Se guardan en la tabla `password_reset_tokens`. | Desactualizada |
| `Docs/README.md` | 7 usuarios activos (1 administrador y 6 docentes). | 8 usuarios activos (1 administrador y 7 docentes). | Desactualizada |
| `README.md` | Datos demo: 2 usuarios, 3 grupos, 20 estudiantes, 35 calificaciones. | 8 usuarios, 10 grupos, 200 estudiantes, 215 calificaciones. | Desactualizada |
| `Docs/conceptos/RFs.md` | 19 de 23 RF implementados totalmente (82,6 %). | Tras las correcciones del 20/11/2026: 14 implementados, 4 con observaciones y 7 parciales de 25. | Desactualizada |
| `Docs/conceptos/NFs.md` | RNF-07 Portabilidad cumplido. | Verificado solo en Chromium; queda Parcial. | Desactualizada |
| `Docs/conceptos/RFs.md` | RF-21 Carga docente solo para el Administrador. | También la puede usar el docente. | Requiere verificación |
| `Docs/pruebas.md` | Validaciones de agosto con métricas de 3 grupos y 20 estudiantes; «31/31 pruebas CLI». | Esas pruebas no están en el repositorio y los datos cambiaron. Se reemplazó por las verificaciones del 20/11/2026. | Desactualizada |
| `Docs/conceptos/restricciones.md` | Lista de restricciones. | Se integró en el capítulo de hallazgos y en el alcance. | Desactualizada |
