# Requisitos funcionales

Los requisitos RF-01 a RF-15 provienen del documento original del proyecto; en esta versión se corrigió el caso de uso asociado a cada uno y su estado. Los requisitos RF-16 a RF-25 se agregaron para documentar funcionalidades que ya existían en el sistema pero no estaban registradas. RF-26 se agregó el 24/11/2026 con el control de acceso por asignación (H-08). El estado se verificó contra el código del frontend, el backend y la base de datos el 20/11/2026.

**Convenciones de estado.** *Implementado*: disponible en la interfaz y persistido en la base de datos. *Parcial*: parte de la funcionalidad existe solo en la API o falta una operación. *Con observaciones*: funciona, pero tiene un hallazgo registrado.

## Módulo 1. Seguridad y acceso

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-01 | CU-01 | Iniciar sesión | Autenticar al usuario con correo y contraseña, verificar que esté activo y emitir un token de sesión con su rol. | Docente, Administrador | Implementado (`POST /auth/login`, JWT de 8 h, contraseñas PBKDF2). |
| RF-02 | CU-03 | Cerrar sesión | Finalizar la sesión del usuario. | Docente, Administrador | Parcial: elimina la sesión del navegador; el token no se revoca en el servidor. |
| RF-16 | CU-14 | Recuperar contraseña | Solicitar un enlace de restablecimiento por correo y definir una nueva contraseña. | Docente, Administrador | Implementado (`POST /auth/forgot-password`, `POST /auth/reset-password`); requiere SMTP para que el enlace llegue. |
| RF-26 | CU-01, CU-04 a CU-13 | Control de acceso por rol y por asignación | El administrador consulta y gestiona toda la información. Cada docente consulta y modifica solo lo que corresponde a sus asignaciones (docente + materia + grupo): sus materias, los grupos donde las dicta, los estudiantes de esos grupos, las actividades y calificaciones de su materia en ese grupo, las observaciones de sus estudiantes y las alertas de su ámbito. Las restricciones se aplican en la API con la identidad del token, también ante peticiones directas que cambien identificadores. | Docente, Administrador | Implementado (24/11/2026). Pruebas: `backend/tests/test_permisos.py` (19), `e2e/tests/permisos.spec.ts` (2); evidencia `evidencias/permisos/verificacion-api-permisos.md`. |
| RF-17 | CU-02, CU-15 | Invitar y activar usuarios | El administrador invita por correo a docentes o administradores; el invitado activa su cuenta definiendo sus datos y contraseña. | Administrador, Usuario invitado | Implementado (`POST /usuarios/invitar`, `GET` y `POST /invitaciones/{token}`). |

## Módulo 2. Administración de usuarios

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-18 | CU-02 | Modificar rol | Cambiar el rol de un usuario entre Docente y Administrador. El administrador no puede cambiar su propio rol. | Administrador | Implementado (`PUT /usuarios/{id}/rol`; responde 403 sobre la propia cuenta, H-18 corregido en interfaz y API). |
| RF-19 | CU-02 | Desactivar usuario | Inactivar la cuenta de un usuario sin borrarla. El administrador no puede desactivar su propia cuenta. | Administrador | Implementado (`DELETE /usuarios/{id}`, baja lógica; responde 403 sobre la propia cuenta, H-18). |
| RF-22 | CU-16 | Métricas globales | Consultar el número de docentes, administradores, grupos, estudiantes, actividades y alertas activas. | Administrador | Implementado (seis endpoints `/…/count`). |
| RF-23 | CU-16 | Datos globales | Consultar en modo lectura los grupos, estudiantes y alertas de toda la plataforma. | Administrador | Implementado (`AdminDatos.tsx`; H-26 corregido: muestra el año lectivo). |

## Módulo 3. Grupos

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-03 | CU-04 | Gestionar grupos | Crear, consultar, editar y eliminar grupos académicos (nombre, grado, turno y año lectivo). El administrador gestiona todos los grupos; el docente solo consulta los grupos donde tiene materias asignadas. | Administrador (gestión), Docente (consulta) | Parcial: la interfaz permite crear (administrador), consultar y filtrar; editar y eliminar solo existen en la API, reservadas al administrador. |

## Módulo 4. Estudiantes

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-04 | CU-05 | Gestionar estudiantes | Registrar, editar y eliminar estudiantes y asociarlos a un grupo. El docente registra y edita estudiantes solo en sus grupos; eliminar es del administrador. | Docente, Administrador | Parcial: la interfaz permite registrar y editar; eliminar solo existe en la API (borrado físico, solo administrador). |
| RF-05 | CU-05 | Consultar estudiantes | Listar los estudiantes con su grupo, promedio, tendencia, estado y alertas, con búsqueda y filtros. El docente ve solo los estudiantes de sus grupos, con promedios calculados con las notas de sus materias. | Docente, Administrador | Implementado (el filtro por grupo se corrigió: H-29; alcance por asignación: RF-26). |
| RF-09 | CU-05 | Consultar historial académico | Consultar el detalle académico de un estudiante. | Docente | Parcial: el detalle muestra promedio, estado, tendencia, alertas activas y observaciones, pero no el listado de sus calificaciones individuales. |

## Módulo 5. Materias y asignaciones

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-20 | CU-06 | Gestionar materias | Crear, consultar, editar y eliminar materias. El administrador gestiona el catálogo; el docente consulta solo sus materias asignadas. | Administrador (gestión), Docente (consulta) | Parcial: la interfaz permite crear, buscar y eliminar (administrador); editar solo existe en la API. |
| RF-21 | CU-07 | Asignar docente a materia y grupo | Registrar y eliminar la asignación de un docente por materia en cada grupo. El docente solo consulta sus propias asignaciones. | Administrador | Implementado (H-08 corregido: crear y eliminar responden 403 al docente). |

## Módulo 6. Actividades

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-06 | CU-08 | Registrar actividad | Crear actividades (tarea, examen, proyecto o participación) con materia, grupo, fecha de entrega y descripción, y consultarlas con su estado. El docente solo crea y consulta actividades de una materia que tiene asignada en ese grupo. | Docente, Administrador | Parcial: crear y consultar en la interfaz (el formulario ofrece solo las materias del docente en el grupo elegido); editar y eliminar solo en la API. |

## Módulo 7. Calificaciones

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-07 | CU-09 | Registrar calificación | Registrar y actualizar la calificación de cada estudiante en una actividad. El docente solo califica a estudiantes de un grupo donde tiene asignada esa materia. | Docente | Implementado con observaciones. Corregidos: H-02 (solo se guardan las filas modificadas), H-31 y H-33 (se conservan observación y periodo; «Entregado» en su propia columna). Pendientes: H-03, H-05 y H-19. En la base real, «Entregado» persiste solo tras la migración 001. |
| RF-08 | CU-09, CU-11 | Calcular promedio académico | Calcular los promedios por estudiante, grupo, materia, actividad y tipo de actividad. | Sistema | Implementado: el frontend calcula los promedios de visualización y el backend calcula el promedio acumulado para la regla de alerta. |

## Módulo 8. Observaciones

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-14 | CU-10 | Registrar observación | Registrar observaciones académicas, convivenciales o de reconocimiento sobre un estudiante de sus grupos. | Docente | Implementado (sin registro del autor). |
| RF-15 | CU-10 | Consultar observaciones | Consultar el historial de observaciones de un estudiante y eliminarlas. | Docente | Implementado (sin edición). |

## Módulo 9. Análisis de rendimiento

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-10 | CU-11 | Analizar desempeño académico | Visualizar indicadores y gráficas de rendimiento: por grupo, distribución, tendencia mensual, por tipo de actividad y estudiantes en riesgo, para todas las materias o filtrados por una materia. El docente ve solo los datos de sus asignaciones. | Docente, Administrador | Implementado con observaciones: filtro por materia agregado el 24/11/2026; etiqueta del mes (H-07). |
| RF-24 | CU-11 | Resumen al ingresar (Dashboard) | Mostrar al ingresar un resumen con totales, rendimiento por materia, alertas recientes, estudiantes y buscador. Para el docente, todo se calcula con sus asignaciones e incluye «Mis asignaciones»: cada materia en cada grupo con su promedio, sin mezclar materias. El administrador ve los totales del colegio. | Docente, Administrador | Implementado con observaciones (H-14). |

## Módulo 10. Alertas académicas

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-11 | CU-12 | Generar alerta académica | Generar alertas automáticamente ante bajo rendimiento, o registrarlas manualmente. | Sistema, Docente | Parcial: la regla automática (promedio < 3.0) funciona y ya no crea duplicados si existe una alerta de bajo rendimiento activa o en revisión (H-32, decisión D3); la creación manual solo existe en la API. |
| RF-12 | CU-13 | Consultar alertas | Consultar las alertas con filtros por tipo y estado. El docente ve las alertas de los estudiantes de sus grupos; si el mensaje de la alerta nombra una materia, solo la ve el docente de esa materia en ese grupo. | Docente, Administrador | Implementado (alcance por asignación: RF-26). |
| RF-13 | CU-13 | Actualizar estado de alerta | Cambiar el estado de una alerta visible para el usuario a En revisión o Resuelta. | Docente, Administrador | Implementado (403 sobre alertas fuera del ámbito del docente). |

## Módulo 11. Información pública

| RF | CU | Nombre | Descripción | Actor | Estado |
|---|---|---|---|---|---|
| RF-25 | — | Consultar información pública | Mostrar la página de inicio del producto y las políticas de términos, privacidad, cookies y protección de datos sin necesidad de iniciar sesión. | Visitante | Implementado (`/`, `/legal/*`). |

## Resumen

| Estado | Cantidad | Requisitos |
|---|---|---|
| Implementado | 16 | RF-01, RF-05, RF-08, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-21, RF-22, RF-23, RF-25, RF-26 |
| Implementado con observaciones | 3 | RF-07, RF-10, RF-24 |
| Parcial | 7 | RF-02, RF-03, RF-04, RF-06, RF-09, RF-11, RF-20 |
| No implementado | 0 | — |
| **Total** | **26** | |

> Nota: el correo de contacto publicado en la landing y en las políticas (`contacto@classkids.edu.co`) es un valor de ejemplo definido en `frontend/src/lib/contact.ts` y debe reemplazarse por el correo real de la institución.
