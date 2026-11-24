# Verificación de permisos de la API (H-08 y H-18)

Peticiones reales al backend de pruebas (`http://127.0.0.1:8001`, base `classkids_test`), ejecutadas el 24/11/2026 con [`verificar-permisos-api.py`](../scripts/verificar-permisos-api.py). Sesiones: administrador, docente demo (5 materias en 3 grupos) y docente de Matemáticas (1 materia en 7 grupos).

**Resultado: 18 de 18 casos cumplen.** Los intentos denegados no modificaron datos.

| Sesión | Petición | Caso | Esperado | Obtenido | Respuesta | Resultado |
|---|---|---|---|---|---|---|
| Administrador | `PUT /usuarios/1/rol` | Cambiar su propio rol | 403 | 403 | No puedes cambiar tu propio rol | Cumple |
| Administrador | `DELETE /usuarios/1` | Desactivar su propia cuenta | 403 | 403 | No puedes desactivar tu propia cuenta | Cumple |
| Administrador | `GET /grupos` | Visión general | 200 | 200 | 10 registros | Cumple |
| Docente de Matemáticas | `GET /grupos` | Solo sus grupos | 200 | 200 | 7 registros | Cumple |
| Docente de Matemáticas | `GET /materias` | Solo sus materias | 200 | 200 | 1 registros | Cumple |
| Docente demo | `GET /materias` | Solo sus materias | 200 | 200 | 5 registros | Cumple |
| Docente de Matemáticas | `GET /calificaciones` | Solo notas de su materia en sus grupos | 200 | 200 | 28 registros | Cumple |
| Docente de Matemáticas | `GET /alertas` | Solo alertas de sus estudiantes | 200 | 200 | 3 registros | Cumple |
| Administrador | `GET /alertas` | Todas las alertas | 200 | 200 | 32 registros | Cumple |
| Docente de Matemáticas | `GET /estudiantes?grupo_id=1` | Estudiantes de un grupo ajeno | 403 | 403 | No tienes asignado este grupo | Cumple |
| Docente de Matemáticas | `GET /calificaciones?actividad_id=5` | Notas de una actividad de otra materia | 403 | 403 | La actividad no pertenece a tus asignaciones | Cumple |
| Docente de Matemáticas | `POST /calificaciones` | Calificar otra materia a su estudiante | 403 | 403 | No tienes asignada esta materia en el grupo del estudiante | Cumple |
| Docente de Matemáticas | `POST /calificaciones` | Calificar a un estudiante de otro grupo | 403 | 403 | No tienes asignada esta materia en el grupo del estudiante | Cumple |
| Docente de Matemáticas | `PUT /actividades/5` | Modificar una actividad ajena | 403 | 403 | La actividad no pertenece a tus asignaciones | Cumple |
| Docente de Matemáticas | `PUT /alertas/9/estado` | Resolver una alerta ajena | 403 | 403 | Esta alerta no corresponde a tus asignaciones | Cumple |
| Docente de Matemáticas | `POST /grupos` | Crear un grupo | 403 | 403 | Solo el administrador puede realizar esta acción | Cumple |
| Docente de Matemáticas | `POST /materias` | Crear una materia | 403 | 403 | Solo el administrador puede realizar esta acción | Cumple |
| Docente de Matemáticas | `GET /catalogo/docentes` | Catálogo de docentes | 403 | 403 | Permisos insuficientes | Cumple |

Las pruebas automatizadas equivalentes están en `backend/tests/test_permisos.py` (19 casos) y `e2e/tests/permisos.spec.ts`.
