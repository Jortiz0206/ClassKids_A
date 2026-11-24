# Referencia de la API

La API REST de ClassKids está implementada en `backend/main.py` con FastAPI y expone **49 operaciones**. La lista se verificó contra el documento `openapi.json` del backend en ejecución el 20/11/2026. La documentación interactiva está disponible en `http://127.0.0.1:8000/docs`.

**Acceso.** *Público*: no requiere token. *Sesión*: requiere el encabezado `Authorization: Bearer <token>` de cualquier usuario activo (docente o administrador). *Admin*: requiere token con rol administrador. *Asignación* (24/11/2026): requiere sesión; el administrador ve y modifica todo, y al docente la API le filtra la respuesta o le valida el registro destino según sus asignaciones (RF-26, RN-33 a RN-38). Sin token o con token inválido la API responde 401; con rol insuficiente o fuera de su ámbito, 403.

**Uso desde la interfaz.** Indica si alguna pantalla del frontend llama al endpoint.

## Inicio y autenticación

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/` | Público | Estado del servicio. | No |
| POST | `/auth/login` | Público | Recibe `{email, password}`; devuelve `access_token` (JWT de 8 h) y los datos del usuario con su rol. 401 si las credenciales son incorrectas, 403 si la cuenta está desactivada. | Sí (`Auth.tsx`) |
| POST | `/auth/forgot-password` | Público | Recibe `{email, redirect_to?}`; si el usuario existe y está activo crea un token de 30 min y envía el enlace por SMTP. Respuesta siempre genérica. `redirect_to` solo se acepta si su origen está en `CORS_ORIGINS`. | Sí (`Auth.tsx`) |
| POST | `/auth/reset-password` | Público | Recibe `{token, password}` (mín. 6 caracteres); actualiza la contraseña y marca el token como usado. | Sí (`ResetPassword.tsx`) |

## Usuarios e invitaciones

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/usuarios` | Admin | Lista los usuarios activos con su rol, fecha de creación y último ingreso. | Sí (`AdminUsuarios.tsx`) |
| POST | `/usuarios/invitar` | Admin | Recibe `{email, role}`; crea una invitación de 48 h y devuelve `invitation_url` y `email_sent`. 409 si el correo ya pertenece a un usuario activo. | Sí |
| PUT | `/usuarios/{user_id}/rol` | Admin | Recibe `{role}` (`admin` o `docente`). 403 si es la propia cuenta (H-18). | Sí |
| DELETE | `/usuarios/{user_id}` | Admin | Desactiva el usuario (baja lógica). 403 si es la propia cuenta (H-18). | Sí |
| GET | `/docentes/count` | Admin | Número de docentes activos. | Sí (`AdminDashboard.tsx`) |
| GET | `/admins/count` | Admin | Número de administradores activos. | Sí |
| GET | `/catalogo/docentes` | Admin | Docentes activos para el formulario de asignaciones. | Sí (`Materias.tsx`) |
| GET | `/invitaciones/{token}` | Público | Valida una invitación vigente y devuelve el correo y el rol. | Sí (`Invitation.tsx`) |
| POST | `/invitaciones/{token}/aceptar` | Público | Recibe `{nombre, apellido?, password}`; crea o reactiva el usuario. | Sí |
| GET | `/roles` | Sesión | Catálogo de roles. | No |

## Grupos

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/grupos` | Asignación | Lista todos los grupos. | Sí |
| POST | `/grupos` | Admin | Recibe `{nombre, grado?, turno?, ano_lectivo?}` (también acepta el nombre anterior `año_lectivo`; por defecto 2026). | Sí (`Grupos.tsx`) |
| PUT | `/grupos/{id}` | Admin | Actualiza un grupo. Acepta `ano_lectivo` o `año_lectivo`, por lo que reenviar el objeto recibido en `GET` conserva el año (H-27). | No |
| DELETE | `/grupos/{id}` | Admin | Elimina un grupo; 409 si tiene actividades o asignaciones. | No |
| GET | `/grupos/count` | Asignación | Número de grupos. | Sí (`AdminDashboard.tsx`) |

## Estudiantes

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/estudiantes?grupo_id=` | Asignación | Lista los estudiantes con el nombre del grupo; filtro opcional por grupo. | Sí |
| POST | `/estudiantes` | Asignación | Recibe `{documento, nombre, apellido, grupo_id?, activo?}`. Documento duplicado: error 500. | Sí (`Estudiantes.tsx`) |
| PUT | `/estudiantes/{id}` | Asignación | Actualiza un estudiante. | Sí |
| DELETE | `/estudiantes/{id}` | Admin | Elimina el estudiante y, en cascada, sus calificaciones, observaciones y alertas. | No |
| GET | `/estudiantes/count` | Asignación | Número de estudiantes activos. | Sí (`AdminDashboard.tsx`) |

## Materias y asignaciones

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/materias` | Asignación | Lista las materias. | Sí |
| POST | `/materias` | Admin | Recibe `{nombre, codigo?}`. | Sí (`Materias.tsx`) |
| PUT | `/materias/{id}` | Admin | Actualiza una materia. | No |
| DELETE | `/materias/{id}` | Admin | Elimina una materia; 409 si tiene registros asociados. | Sí |
| GET | `/asignaciones` | Asignación | Lista las asignaciones con nombres de docente, materia y grupo. | Sí |
| POST | `/asignaciones` | Admin | Recibe `{docente_id, materia_id, grupo_id}`; 404 si el docente no existe o no está activo, 409 si la materia ya tiene docente en ese grupo. | Sí |
| DELETE | `/asignaciones/{id}` | Admin | Elimina una asignación. | Sí |

## Actividades

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/actividades?grupo_id=` | Asignación | Lista las actividades con materia, grupo y estado calculado (`vencida` o `pendiente`). | Sí |
| POST | `/actividades` | Asignación | Recibe `{materia_id, grupo_id, titulo, tipo, descripcion?, fecha_entrega?}`. | Sí (`Actividades.tsx`) |
| PUT | `/actividades/{id}` | Asignación | Actualiza una actividad. | No |
| DELETE | `/actividades/{id}` | Asignación | Elimina una actividad. | No |
| GET | `/actividades/count` | Asignación | Número de actividades. | Sí (`AdminDashboard.tsx`) |

## Calificaciones

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/calificaciones?actividad_id=` | Asignación | Lista las calificaciones con nombre del estudiante y de la materia. | Sí |
| POST | `/calificaciones` | Asignación | Recibe `{estudiante_id, materia_id, actividad_id?, nota, periodo?, observacion?, entregado?}` (periodo 1 por defecto). Guarda `entregado` si la base tiene la columna (migración 001). Evalúa la regla de alerta automática sin crear duplicados (D3). Nota fuera de 0–5 o estudiante inexistente: error 500. | Sí (`Calificaciones.tsx`) |
| PUT | `/calificaciones/{id}` | Asignación | **Actualiza solo los campos enviados**: si no se envían `periodo` u `observacion`, se conservan (H-31, H-33). `entregado` se guarda si la columna existe. No evalúa alertas. 404 si no existe. | Sí |
| DELETE | `/calificaciones/{id}` | Asignación | Elimina una calificación. | No |

## Observaciones

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/observaciones` | Asignación | Lista todas las observaciones (la interfaz filtra por estudiante). | Sí |
| POST | `/observaciones` | Asignación | Recibe `{estudiante_id, tipo?, descripcion}`. | Sí (`ObservacionesEstudiante.tsx`) |
| DELETE | `/observaciones/{id}` | Asignación | Elimina una observación. | Sí |

## Alertas

| Método | Ruta | Acceso | Descripción | Uso desde la interfaz |
|---|---|---|---|---|
| GET | `/alertas` | Asignación | Lista las alertas con el nombre del estudiante. | Sí |
| POST | `/alertas` | Asignación | Crea una alerta manual `{estudiante_id, tipo, mensaje, estado?}`. | No |
| PUT | `/alertas/{id}?estado=` | Asignación | Cambia el estado (parámetro en la URL). | No |
| PUT | `/alertas/{id}/estado` | Asignación | Cambia el estado con cuerpo `{estado}`; 422 si el estado no es válido. | Sí (`Alertas.tsx`) |
| DELETE | `/alertas/{id}` | Asignación | Elimina una alerta. | No |
| GET | `/alertas/activas/count` | Asignación | Número de alertas en estado `active`. | Sí (`AdminDashboard.tsx`) |

## Comportamiento verificado

| Prueba (20/11/2026) | Resultado |
|---|---|
| `GET /estudiantes` sin token | 401 «Autenticación requerida» |
| `GET /estudiantes` con token falso | 401 «Token inválido o expirado» |
| `GET /usuarios` con token de docente | 403 «Permisos insuficientes» |
| `POST /auth/login` con contraseña incorrecta o correo inexistente | 401 con el mismo mensaje genérico |
| `PUT /alertas/999999/estado` con estado «xyz» | 422 «Estado de alerta inválido» |
| `POST /calificaciones` con nota 7 | 500 (la restricción CHECK de la base de datos rechaza el valor) |
| `POST /estudiantes` con documento duplicado | 500 (la restricción UNIQUE rechaza el valor) |
| `DELETE /estudiantes/999999` (inexistente) | 200 «Estudiante eliminado» |
| `POST /calificaciones` con `nota: "abc"` | 422 con `detail` en forma de lista (la interfaz lo muestra como «nota: Input should be a valid number» desde la corrección de H-24) |

Los resultados 500 y el 200 sobre un registro inexistente se documentan como hallazgos.

### Permisos verificados el 24/11/2026 (H-08 y H-18)

| Petición | Sesión | Resultado |
|---|---|---|
| `PUT /usuarios/{propio id}/rol`, `DELETE /usuarios/{propio id}` | Administrador | 403 «No puedes cambiar tu propio rol» / «No puedes desactivar tu propia cuenta» |
| `GET /grupos`, `/materias`, `/calificaciones`, `/alertas` | Docente de Matemáticas | 200 solo con sus 7 grupos, su materia, sus 28 notas y sus 3 alertas |
| `GET /estudiantes?grupo_id={ajeno}`, `GET /calificaciones?actividad_id={ajena}` | Docente | 403 |
| `POST /calificaciones` de otra materia o de un estudiante de otro grupo | Docente | 403 «No tienes asignada esta materia en el grupo del estudiante» |
| `PUT /actividades/{ajena}`, `PUT /alertas/{ajena}/estado` | Docente | 403 |
| `POST /grupos`, `POST /materias`, `GET /catalogo/docentes` | Docente | 403 |

Detalle y script reproducible: [`../evidencias/permisos/verificacion-api-permisos.md`](../evidencias/permisos/verificacion-api-permisos.md).
