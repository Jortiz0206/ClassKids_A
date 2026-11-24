# Historias de usuario

Las historias de usuario expresan los requisitos desde la perspectiva de quien usa el sistema. Cada criterio de aceptación indica si la implementación actual lo **cumple** o **no lo cumple** (verificado el 20/11/2026).

## HU-01 Inicio de sesión (CU-01, RF-01)

**Como** docente o administrador, **quiero** ingresar con mi correo y contraseña **para** acceder a las funciones de mi rol.

| Criterio de aceptación | Resultado |
|---|---|
| Con credenciales válidas ingreso al Dashboard. | Cumple |
| Con credenciales inválidas veo un mensaje que no revela si el correo existe. | Cumple |
| Una cuenta desactivada no puede ingresar. | Cumple |
| El administrador ve además el acceso al panel de administración. | Cumple |

## HU-02 Recuperación de contraseña (CU-14, RF-16)

**Como** usuario, **quiero** restablecer mi contraseña desde un enlace enviado a mi correo **para** recuperar el acceso si la olvido.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo solicitar el enlace desde la pantalla de inicio de sesión. | Cumple |
| El enlace vence a los 30 minutos y solo se puede usar una vez. | Cumple |
| Recibo el enlace en mi correo. | Cumple solo si el servidor tiene SMTP configurado |

## HU-03 Cierre de sesión (CU-03, RF-02)

**Como** usuario, **quiero** cerrar mi sesión **para** proteger mi información en equipos compartidos.

| Criterio de aceptación | Resultado |
|---|---|
| Al cerrar sesión vuelvo a la pantalla de inicio de sesión. | Cumple |
| El token deja de ser válido en el servidor. | No cumple (vence a las 8 horas) |
| La sesión se cierra tras 15 minutos de inactividad. | No cumple |

## HU-04 Invitación e incorporación de usuarios (CU-02, CU-15, RF-17)

**Como** administrador, **quiero** invitar por correo a docentes y administradores **para** que creen su propia contraseña sin que yo la conozca.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo invitar indicando correo y rol. | Cumple |
| No puedo invitar un correo que ya pertenece a un usuario activo. | Cumple |
| Si no hay servidor de correo, puedo copiar el enlace de invitación. | Cumple |
| El invitado activa su cuenta con nombres, apellidos y contraseña; el enlace vence en 48 horas. | Cumple |

## HU-05 Gestión de roles (CU-02, RF-18)

**Como** administrador, **quiero** cambiar el rol de un usuario **para** otorgar o retirar permisos administrativos.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo cambiar el rol entre Docente y Administrador. | Cumple |
| No puedo cambiar mi propio rol. | Cumple (H-18: la interfaz lo deshabilita y la API responde 403) |
| El cambio aplica de inmediato. | No cumple: el usuario conserva el rol anterior en su token hasta 8 horas (H-09) |

## HU-06 Desactivación de usuarios (CU-02, RF-19)

**Como** administrador, **quiero** desactivar cuentas **para** retirar el acceso sin perder la información.

| Criterio de aceptación | Resultado |
|---|---|
| La desactivación es lógica y el usuario no puede volver a ingresar. | Cumple |
| No puedo desactivar mi propia cuenta. | Cumple (H-18: la interfaz lo deshabilita y la API responde 403) |
| Puedo reactivar una cuenta desde la pantalla. | No cumple (solo reinvitando el correo) |

## HU-07 Administración de grupos (CU-04, RF-03)

**Como** administrador, **quiero** crear y consultar los grupos **para** organizar a los estudiantes y las actividades. **Como** docente, **quiero** consultar los grupos donde dicto mis materias **para** organizar mi trabajo.

| Criterio de aceptación | Resultado |
|---|---|
| (Administrador) Puedo crear un grupo eligiendo curso y turno. | Cumple |
| (Docente) Solo veo los grupos donde tengo materias asignadas. | Cumple (RF-26) |
| Veo por grupo sus estudiantes, actividades, promedio y alertas. | Cumple |
| Puedo editar y eliminar grupos. | No cumple en la interfaz (solo API) |
| El sistema impide crear un grupo repetido. | No cumple |

## HU-08 Registro de estudiantes (CU-05, RF-04, RF-05)

**Como** docente, **quiero** registrar estudiantes y asociarlos a un grupo **para** hacer su seguimiento.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo registrar y editar documento, nombres, apellidos y grupo. | Cumple |
| El documento no se puede repetir. | Cumple (con mensaje genérico) |
| Puedo buscar por nombre y filtrar por estado. | Cumple |
| Puedo filtrar por grupo. | Cumple (H-29 corregido) |
| Al editar veo el grupo actual del estudiante. | Cumple (H-28 corregido) |
| Puedo eliminar o desactivar un estudiante. | No cumple en la interfaz |

## HU-09 Configuración de materias (CU-06, RF-20)

**Como** administrador, **quiero** administrar el catálogo de materias **para** asociarlas a actividades y asignaciones. **Como** docente, **quiero** consultar las materias que tengo asignadas.

| Criterio de aceptación | Resultado |
|---|---|
| (Administrador) Puedo crear, buscar y eliminar materias. | Cumple |
| (Docente) Solo consulto mis materias y no veo acciones de catálogo. | Cumple (RF-26) |
| No puedo eliminar una materia con registros asociados. | Cumple |
| Puedo editar el nombre y el código. | No cumple en la interfaz |

## HU-10 Asignación de docentes (CU-07, RF-21)

**Como** administrador, **quiero** asignar un docente a cada materia en cada grupo **para** saber quién es responsable de cada asignatura.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo vincular y desvincular docente, materia y grupo. | Cumple |
| Cada materia tiene un solo docente por grupo. | Cumple |
| Solo el administrador puede hacer asignaciones. | Cumple (H-08 corregido: la API responde 403 al docente) |

## HU-11 Planificación de actividades (CU-08, RF-06)

**Como** docente, **quiero** crear actividades evaluativas **para** registrar luego sus calificaciones.

| Criterio de aceptación | Resultado |
|---|---|
| Puedo crear tareas, exámenes, proyectos y participaciones con materia, grupo y fecha. | Cumple |
| Veo el estado (pendiente, completada, vencida) y el progreso de entrega. | Cumple |
| Puedo editar y eliminar actividades. | No cumple en la interfaz |
| La fecha de entrega no puede ser anterior a hoy. | No cumple |

## HU-12 Registro de calificaciones (CU-09, RF-07, RF-08)

**Como** docente, **quiero** registrar las notas de todo un grupo en una actividad **para** ahorrar tiempo y mantener el historial.

| Criterio de aceptación | Resultado |
|---|---|
| Veo la lista del grupo y registro las notas en una sola pantalla. | Cumple |
| Puedo actualizar notas ya registradas. | Cumple |
| Solo se guardan las notas que ingresé. | Cumple (H-02 corregido) |
| La nota se conserva exactamente como la digité. | No cumple (H-03) |
| El estado «Entregado» se conserva al recargar y no altera otros datos. | Cumple en la base de pruebas (H-31 corregido); en la base real, la entrega persiste solo tras la migración 001 |
| Puedo elegir el periodo. | No cumple |

## HU-13 Consulta del expediente académico (CU-05, RF-09)

**Como** docente, **quiero** ver el detalle de un estudiante **para** conocer su situación antes de tomar decisiones.

| Criterio de aceptación | Resultado |
|---|---|
| Veo su promedio, estado, tendencia, alertas activas y observaciones. | Cumple |
| Veo el listado de sus calificaciones por actividad y materia. | No cumple |

## HU-14 Observaciones pedagógicas (CU-10, RF-14, RF-15)

**Como** docente, **quiero** registrar observaciones sobre un estudiante **para** complementar la información de las notas.

| Criterio de aceptación | Resultado |
|---|---|
| Registro observaciones de tipo Académica, Convivencial o Reconocimiento con fecha automática. | Cumple |
| Consulto el historial y puedo eliminar observaciones. | Cumple |
| Queda registrado qué docente escribió la observación. | No cumple |

## HU-15 Tablero de rendimiento (CU-11, RF-10)

**Como** docente, **quiero** ver indicadores y gráficas de rendimiento **para** identificar a tiempo a los estudiantes en riesgo.

| Criterio de aceptación | Resultado |
|---|---|
| Veo el promedio general, rendimiento por grupo, distribución, tendencia y rendimiento por tipo de actividad. | Cumple |
| Veo la lista de estudiantes en riesgo ordenada por promedio. | Cumple |
| Puedo filtrar por grupo, materia o periodo. | No cumple |
| La tendencia muestra el mes correcto. | No cumple (H-07) |

## HU-16 Alertas automáticas (CU-12, RF-11)

**Como** docente, **quiero** que el sistema me alerte cuando un estudiante tenga bajo rendimiento **para** intervenir a tiempo.

| Criterio de aceptación | Resultado |
|---|---|
| Al registrar una nota que deja el promedio por debajo de 3.0 se crea una alerta. | Cumple |
| No se crean alertas duplicadas para el mismo estudiante. | Cumple (H-32, decisión D3) |
| El umbral de la alerta coincide con el de «en riesgo» de las pantallas. | No cumple (H-01) |
| Existen alertas por inasistencia y comportamiento. | No cumple |
| Puedo crear una alerta manualmente. | No cumple en la interfaz |

## HU-17 Seguimiento de alertas (CU-13, RF-12, RF-13)

**Como** docente, **quiero** registrar el avance de cada alerta **para** organizar el acompañamiento.

| Criterio de aceptación | Resultado |
|---|---|
| Filtro las alertas por tipo y estado. | Cumple |
| Cambio el estado a En revisión y a Resuelta. | Cumple |

## HU-18 Métricas globales (CU-16, RF-22)

**Como** administrador, **quiero** ver las métricas de toda la plataforma **para** supervisar su uso.

| Criterio de aceptación | Resultado |
|---|---|
| Veo el número de docentes, administradores, grupos, estudiantes, actividades y alertas activas. | Cumple |

## HU-19 Datos globales (CU-16, RF-23)

**Como** administrador, **quiero** consultar los grupos, estudiantes y alertas de toda la plataforma **para** supervisar la información sin modificarla.

| Criterio de aceptación | Resultado |
|---|---|
| Veo las pestañas de grupos, estudiantes y alertas en modo de solo lectura. | Cumple |
| Todas las columnas muestran datos reales de la base de datos. | Cumple (H-26 corregido) |

## HU-20 Resumen del docente (CU-11, RF-24)

**Como** docente, **quiero** ver un resumen al ingresar **para** saber rápidamente qué requiere atención.

| Criterio de aceptación | Resultado |
|---|---|
| Veo los totales, el rendimiento por materia y las alertas recientes. | Cumple |
| Puedo buscar un estudiante desde el resumen. | Cumple |
| El total de alertas cuenta solo las activas. | Cumple (H-25 corregido) |
| Veo cada materia que dicto en cada grupo con su promedio, sin mezclar materias («Mis asignaciones»). | Cumple (RF-24, RN-36) |
| Los totales y las alertas corresponden solo a mis asignaciones. | Cumple (RF-26) |

## HU-21 Trabajo dentro de mis asignaciones (CU-04 a CU-13, RF-26)

**Como** docente, **quiero** ver y registrar solo la información de las materias y grupos que tengo asignados **para** trabajar con mis estudiantes sin acceder a datos de otros docentes.

| Criterio de aceptación | Resultado |
|---|---|
| Veo solo mis materias, los grupos donde las dicto y los estudiantes de esos grupos. | Cumple |
| Solo registro actividades y notas de una materia que tengo en ese grupo. | Cumple |
| Las alertas que veo corresponden a mis estudiantes y, si nombran una materia, a la mía. | Cumple (RN-37) |
| Si cambio un identificador en una petición a la API, recibo 403 y no se modifica nada. | Cumple (`test_permisos.py`) |

## HU-22 Supervisión general (CU-16, RF-22, RF-26)

**Como** administrador, **quiero** conservar la visión de todo el colegio **para** supervisar y gestionar grupos, materias, asignaciones y usuarios.

| Criterio de aceptación | Resultado |
|---|---|
| Veo todos los grupos, estudiantes, notas y alertas. | Cumple |
| Soy el único que crea, edita o elimina grupos, materias y asignaciones. | Cumple |
| En Análisis puedo filtrar los indicadores por materia. | Cumple |

## Resumen

| Estado | Historias |
|---|---|
| Todos los criterios cumplidos | HU-01, HU-04, HU-10, HU-17, HU-18, HU-19, HU-20, HU-21, HU-22 |
| Cumplimiento parcial | HU-02, HU-03, HU-05, HU-06, HU-07, HU-08, HU-09, HU-11, HU-12, HU-13, HU-14, HU-15, HU-16 |
