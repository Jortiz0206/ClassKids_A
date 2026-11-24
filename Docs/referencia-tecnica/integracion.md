# Integración entre capas

Este capítulo verifica que una operación iniciada en la interfaz llegue al backend, se procese con sus reglas, se guarde o consulte en PostgreSQL y vuelva correctamente a la pantalla. Para cada módulo se siguió el recorrido completo:

**Frontend → api/client.ts → endpoint FastAPI → validación y lógica → SQL → PostgreSQL → respuesta → visualización.**

La auditoría se hizo el 20/11/2026 combinando tres fuentes: lectura del código de cada capa, consultas en vivo a la API (forma, tipos y códigos de cada respuesta) y pruebas en el navegador que solo usaron filtros y diálogos, sin guardar datos. La matriz de este capítulo registra el estado **encontrado en la auditoría**; después se corrigieron los hallazgos aprobados (ver la sección siguiente).

## Estado tras las correcciones

| Módulo | Resultado en la auditoría | Resultado actual | Evidencia |
|---|---|---|---|
| Manejo de errores | Falla (H-24) | OK: 422 y 409 con mensajes claros (H-05 corregido el 24/11/2026) | `client.test.ts` |
| Métricas y Dashboard | Observaciones (H-25) | OK: mismos criterios de conteo; el panel de alertas lista solo las activas | `conteos.test.ts`, `integracion.spec.ts` |
| Datos globales | Falla (H-26) | OK | `integracion.spec.ts` |
| Grupos | Observaciones (H-27) | OK en el nombre del campo; editar y eliminar siguen sin pantalla (H-12) | `test_grupos.py` |
| Estudiantes: crear, editar y filtros | Observaciones y Falla (H-28, H-29) | OK | `estudiantes.spec.ts` |
| Actividades: listado | Falla (H-30, H-16) | OK en fecha y entregas; «Completada» se conserva por D4; la carga lenta sigue pendiente (H-16) | `fechas.test.ts`, `integracion.spec.ts` |
| Calificaciones: guardado | Falla (H-02, H-31, H-33) | OK en la base de pruebas. En la base real, la conservación de observaciones y periodos funciona; «Entregado» persiste solo tras la migración 001 | `test_calificaciones.py`, `calificaciones.spec.ts` |
| Alertas | OK con H-32 | Regla sin duplicados (D3); los datos demo no se modificaron | `test_alertas.py` |
| Usuarios (autoprotección) | Falla (H-18) | Sin cambios: pendiente | — |
| Sesión y autorización | Observaciones (H-08, H-09, H-10) | H-08 y H-09 corregidos el 24/11/2026 (permisos por asignación y cuenta revalidada); H-10 pendiente | `test_permisos.py`, `test_hallazgos_cierre.py` |

## Base de datos verificada (la misma que muestra DBeaver)

La conexión `classkids` de DBeaver apunta a `localhost:5432`, base `classkids`. En el equipo de desarrollo escuchan dos procesos en ese puerto: Docker Desktop (IPv4) y `wslrelay` (IPv6). Se comprobó que las tres rutas (`127.0.0.1`, `::1` y `localhost`) llegan al **mismo servidor**: el contenedor `classkids_db`, PostgreSQL 15.19, con identificador de sistema `7681334033728598050` y los mismos datos. Por lo tanto, DBeaver, el backend y esta documentación se refieren a la misma base de datos.

El script [`../evidencias/scripts/verificacion-bd.sql`](../evidencias/scripts/verificacion-bd.sql) se puede ejecutar en DBeaver para comprobar, consulta por consulta, los valores documentados en el capítulo de modelo de datos.

## Matriz de integración por módulo (estado de la auditoría)

**Resultado:** *OK*, el recorrido completo funciona; *Observaciones*, funciona con un defecto; *Falla*, el dato no llega, no se guarda correctamente o se muestra mal; *Parcial*, una parte del recorrido no existe en la interfaz.

| Módulo | Frontend | Backend | Base de datos | Resultado de integración | Hallazgo | Acción recomendada |
|---|---|---|---|---|---|---|
| Inicio de sesión | `Auth.tsx` → `POST /auth/login`; guarda token y usuario en localStorage | Valida activo y hash PBKDF2; emite JWT de 8 h con `role` | `usuarios`, `user_roles` | OK (verificado) | El login devuelve `id` como número. Un usuario sin rol o con rol Acudiente entraría como docente (hoy no existe ninguno). | Rechazar roles distintos de Administrador y Docente. |
| Sesión y autorización | `client.ts` envía el token; `ProtectedRoute` y `AdminRoute` | El middleware valida la firma y exige rol admin solo en `/usuarios`, `/docentes` y `/admins` | — | Observaciones | No se maneja el 401 (H-10); el token no se revalida en la base de datos (H-09); el docente accede a todo (H-08). | Interceptar el 401; revalidar el usuario; ampliar las rutas administrativas. |
| Manejo de errores | `client.ts` crea `new Error(detail)` | Pydantic responde 422 con `detail` en forma de **lista**; los errores de la base de datos dan 500 | CHECK, UNIQUE, FK | Falla | H-24: con un 422 la interfaz muestra «[object Object]». H-05: los 500 se muestran con un mensaje genérico. | Convertir la lista `detail` en texto; capturar los errores de integridad. |
| Recuperación de contraseña | `Auth.tsx` envía `redirect_to=/reset-password`; `ResetPassword.tsx` lee `?token` | Construye `redirect_to?token=…`; token de 30 min | `password_reset_tokens` | OK (código) | Sin SMTP el enlace no llega. | Configurar un SMTP de pruebas. |
| Invitaciones | `AdminUsuarios.tsx` invita; `Invitation.tsx` lee `?token` | Enlace `FRONTEND_URL/invitacion?token=…`; reactiva usuarios inactivos | `invitaciones`, `usuarios` | OK (código) | — | — |
| Usuarios (administración) | Tabla con `r.user_id`, selector de rol, eliminar | `GET /usuarios` devuelve `user_id` como **texto** (`u.id::text`) | `usuarios.activo` | Falla | H-18: el ID de la tabla (texto) se compara con el de la sesión (número) y la autoprotección nunca se activa. | Usar el mismo tipo en ambos lados. |
| Métricas del panel admin | Seis llamadas a `/…/count` | `estudiantes/count` cuenta solo activos; `alertas/activas/count` solo `active` | — | Observaciones | H-25: el Dashboard del docente cuenta todos los estudiantes y todas las alertas; hoy coinciden (200 y 32) solo porque no hay inactivos ni resueltas. | Unificar el criterio de conteo. |
| Datos globales | Pestaña Grupos con la columna «Creado» (`g.created_at`) | `SELECT * FROM grupos` | `grupos` no tiene `created_at` | Falla | H-26: la columna «Creado» muestra «N/A» en todos los grupos. La pestaña Alertas muestra el estado sin traducir (`active`). | Quitar la columna o agregar el campo; traducir el estado. |
| Grupos | Crear `{nombre, grado, turno}`; listado y filtros | Entrada `año_lectivo` (con ñ) → columna `ano_lectivo` | `grupos.ano_lectivo` | Observaciones | H-27: `GET` devuelve `ano_lectivo` y `PUT` espera `año_lectivo`; un cliente que reenvíe lo recibido reinicia el año a 2026 (latente: la interfaz no edita grupos). Editar y eliminar no tienen pantalla (H-12). | Unificar el nombre del campo. |
| Estudiantes: crear y editar | `grupo_id` número al crear y texto al editar | Pydantic convierte `"1"` en 1 | `estudiantes` (documento UNIQUE) | Observaciones | H-28: al editar, el selector de grupo aparece vacío (el grupo se conserva al guardar); editar siempre envía `activo: true`. | Usar el mismo tipo en el estado y en las opciones. |
| Estudiantes: filtros | `filterGrupo` (número) frente a `e.grupo_id` (texto) con `===` | — | — | Falla | H-29: el filtro por grupo devuelve 0 de 20 estudiantes. | Igualar los tipos en la comparación. |
| Estudiantes: eliminar | Sin pantalla | `DELETE` responde 200 aunque el registro no exista | CASCADE a calificaciones, observaciones y alertas | Parcial | H-11, H-12. | — |
| Materias | IDs convertidos a texto; crear y eliminar | `POST`; `DELETE` con 409 si hay registros asociados | `materias` | OK (código) | Editar no tiene pantalla (H-12). | — |
| Asignaciones | Valida duplicados por materia y grupo | Las mismas validaciones (404 y 409) | Índice único `(materia_id, grupo_id)` | OK; validación duplicada pero coherente | Disponible para el docente (H-08). | — |
| Actividades: listado | Dos peticiones por actividad; fecha con `new Date("AAAA-MM-DD")` | `estado` calculado en SQL (`vencida` o `pendiente`) | `actividades.fecha_entrega DATE` | Falla | H-30: la fecha se muestra un día antes (5 sep → «4 sep»); «Completada» nunca aparece en actividades vencidas; «Entregados» cuenta filas duplicadas (7/20 frente a 5/20 en Calificaciones). H-16: carga en 5,2 s con 107 peticiones. | Interpretar la fecha como local; contar estudiantes distintos; endpoint de resumen. |
| Actividades: crear | `{titulo, tipo, grupo_id, materia_id, fecha_entrega, descripcion}` | `ActividadSchema`, sin validar la asignación del docente | FK obligatorias | OK (código) | Editar y eliminar no tienen pantalla. | — |
| Calificaciones: lectura | Pide todas las calificaciones y filtra por actividad; muestra `nota × 20` | La nota llega como número decimal (verificado: `3.0`) | `NUMERIC(3,1)` | Observaciones | H-06: 183 notas sin actividad no aparecen; con duplicados, la pantalla solo muestra una. | Usar `?actividad_id=` y depurar duplicados. |
| Calificaciones: guardado | Envía todas las filas: `nota = % ÷ 20`, `observacion = «Actividad entregada» o null` | `POST`/`PUT` sin validar; alerta solo en `POST` | `calificaciones.observacion` | Falla | H-02 (ceros). H-31: «Entregado» se escribe en `observacion` pero al recargar se calcula por la existencia de la nota, y guardar sobrescribe la observación real de cada calificación. | No reutilizar `observacion` para la entrega. |
| Observaciones | Pide todas y filtra por estudiante; `POST`, `DELETE` | Sin `PUT` ni autor | `observaciones` | OK (código) | Descarga todas las observaciones. | Filtrar por estudiante en la API. |
| Análisis y Dashboard | Calcula en el navegador con `nota × 20` | Listas completas | — | Observaciones | H-07 (mes), H-22 (zona horaria), H-25 (conteos), H-01 (umbral). | — |
| Alertas | `PUT /alertas/{id}/estado {estado}`; tipo inferido por palabras | Normaliza el estado; 422 si no es válido | `alertas.estado VARCHAR` | OK (verificado: 404 y 422) | H-15 (detalle), H-12 (sin creación manual), H-32 (alertas demo que no siguen la regla). | — |

## Nombres de campos y tipos entre capas

| Dato | Frontend | API | Base de datos | Efecto |
|---|---|---|---|---|
| Año lectivo | `año_lectivo` (`types/index.ts`) | Entrada `año_lectivo`, salida `ano_lectivo` | `ano_lectivo` | Latente en edición (H-27) |
| ID de usuario | `user.id` (número) y `r.user_id` | `id` número en el login; `user_id` texto en `/usuarios` | `SERIAL` | Autoprotección inoperante (H-18) |
| `grupo_id` en Estudiantes | Mezcla texto y número | Convierte texto a número | `INTEGER` | Filtro roto y selector vacío (H-28, H-29) |
| Creación del grupo | `g.created_at` | No existe | No existe | «N/A» (H-26) |
| Entrega de la actividad | Interruptor «Entregado» | `observacion` | `observacion TEXT` | No se lee de vuelta y sobrescribe datos (H-31) |
| `fecha_entrega` | `new Date("AAAA-MM-DD")` (UTC) | Texto de fecha | `DATE` | Un día menos (H-30) |
| Fechas con hora | `new Date()` sin zona | ISO sin zona | `TIMESTAMP` (UTC) | Hora desfasada 5 horas (H-22) |
| `calificacion` | Respaldo `c.calificacion ?? nota × 20` | No existe | No existe | Código sin efecto |
| Respuesta envuelta (`items`, `data`) | Respaldo en unas 30 llamadas | La API devuelve listas | — | Código sin efecto |
| Nota | Número | Número decimal (`Decimal` → `float`) | `NUMERIC(3,1)` | Coherente |

## Comprobaciones coherentes

- Todas las notas viajan como número en la escala oficial 0.0–5.0, sin pérdida entre la API y la base de datos.
- Las consultas con JOIN usan llaves foráneas obligatorias, por lo que no se pierden registros en los listados.
- Integridad entre capas (consulta V-15): 0 calificaciones con materia distinta a la de su actividad, 0 calificaciones de estudiantes fuera del grupo de la actividad, 0 asignaciones con docentes inactivos o sin rol docente y 0 estudiantes sin grupo.
- Los códigos 201 (creación), 401, 403, 404 (actualización de un registro inexistente) y 422 se devuelven correctamente donde existen.
- Los IDs que la interfaz envía como texto (`"21"`) los convierte correctamente Pydantic a número.
