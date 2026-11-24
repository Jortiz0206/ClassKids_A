# Pruebas y evidencias

Este capítulo documenta únicamente las pruebas que **realmente existen o se ejecutaron**. Las pruebas que todavía no se han ejecutado aparecen como *Pendiente*; ninguna se marca como aprobada sin haberse ejecutado.

## Entorno de las verificaciones

| Elemento | Valor |
|---|---|
| Fecha | 20/11/2026 |
| Sistema operativo | Windows 11 Pro |
| Base de datos | PostgreSQL 15 en Docker (`classkids_db`) con los datos demo |
| Backend | FastAPI en `http://127.0.0.1:8000`, Python 3.14 |
| Frontend | Vite en `http://localhost:8080` |
| Navegador | Chromium (Playwright) |
| Scripts | [`evidencias/scripts/verificacion-api.sh`](evidencias/scripts/verificacion-api.sh) y [`evidencias/scripts/capturas.cjs`](evidencias/scripts/capturas.cjs) |

Para no alterar la información, solo se ejecutaron pruebas de lectura y pruebas que el sistema rechaza antes de guardar. Se comprobó que los conteos de la base de datos no cambiaron (215 calificaciones, 200 estudiantes y 32 alertas). El único efecto fue la actualización de la fecha de último ingreso de las cuentas demo al iniciar sesión.

## Pruebas automatizadas

Al inicio de la auditoría el proyecto tenía una sola prueba de ejemplo (`expect(true).toBe(true)`). Durante las correcciones de integración se construyó una suite de **54 pruebas automatizadas** que se ejecutan en un entorno aislado: base de datos `classkids_test` (puerto 5433), backend de pruebas (8001) y frontend de pruebas (8081). Ninguna prueba usa la base real `classkids`.

### Salvaguardas del entorno de pruebas

- pytest se detiene si la conexión no apunta a `classkids_test` en el puerto 5433 (comprobado: al apuntarlo a la base real, la ejecución se detuvo antes de conectarse).
- Cada prueba de pytest se ejecuta dentro de una transacción que se deshace al terminar.
- Las pruebas de interfaz fallan si el navegador envía alguna petición al backend real (puerto 8000).
- Las pruebas de interfaz que escriben datos restauran los valores originales al terminar. Tras ejecutar la suite completa, las huellas de calificaciones, alertas, estudiantes y grupos de la base de pruebas son idénticas a las de los datos iniciales.

Instrucciones para ejecutarlas: [`../e2e/README.md`](../e2e/README.md).

### Resultado posterior a la renovación visual (20/11/2026): 102 de 102 aprobadas

pytest 42 (24 de integración + 18 unitarias), Vitest 37 y Playwright 23. Detalle, regresiones encontradas y verificaciones estáticas en [`pruebas/reporte-ejecucion-2026-11-20.md`](pruebas/reporte-ejecucion-2026-11-20.md); plan en [`pruebas/plan-de-pruebas.md`](pruebas/plan-de-pruebas.md); defectos en [`pruebas/registro-defectos.md`](pruebas/registro-defectos.md). La tabla siguiente conserva la línea base anterior a la renovación.

### Resultado del 20/11/2026 (línea base anterior a la renovación): 54 de 54 aprobadas

| Suite | Herramienta | Pruebas | Aprobadas |
|---|---|---|---|
| API (backend) | pytest | 24 | 24 |
| Lógica del frontend | Vitest | 15 | 15 |
| Interfaz (de extremo a extremo) | Playwright | 15 | 15 |
| **Total** | | **54** | **54** |

### Detalle de las pruebas

| Archivo | N.° | Qué verifica | Hallazgo |
|---|---|---|---|
| `backend/tests/test_entorno.py` | 4 | La conexión es `classkids_test`; están los datos demo; las escrituras de una prueba se deshacen. | Entorno |
| `backend/tests/test_calificaciones.py` | 8 | Editar sin enviar periodo ni observación los conserva; solo cambian los campos enviados; «Entregado» se guarda y se lee; las notas nuevas van al periodo 1; un PUT explícito sigue funcionando; compatibilidad con una base sin la columna `entregado`; 404 para una calificación inexistente. | H-31, H-33 |
| `backend/tests/test_alertas.py` | 8 | Una alerta de bajo rendimiento activa o en revisión impide un duplicado; una resuelta no; un estudiante sin alerta la recibe al bajar de 3.0; el umbral no cambió (3.0 exacto no genera alerta); editar no evalúa la regla; las alertas existentes no se modifican. | H-32 |
| `backend/tests/test_grupos.py` | 4 | `GET` devuelve `ano_lectivo`; reenviar lo recibido conserva el año; el nombre anterior `año_lectivo` sigue funcionando; un grupo nuevo usa 2026. | H-27 |
| `frontend/src/test/example.test.ts` | 1 | Prueba de ejemplo del proyecto (retirada el 23/11/2026: no verificaba nada del sistema). | — |
| `frontend/src/test/client.test.ts` | 7 | Los errores 422 se convierten en texto legible y nunca en «[object Object]»; los mensajes de texto del backend se conservan. | H-24 |
| `frontend/src/test/conteos.test.ts` | 2 | Se cuentan solo las alertas `active` y los estudiantes activos. | H-25 |
| `frontend/src/test/fechas.test.ts` | 5 | Una fecha «AAAA-MM-DD» se muestra el mismo día en Colombia (UTC-5); reproduce el error anterior. | H-30a |
| `e2e/tests/entorno.spec.ts` | 1 | El frontend de pruebas usa el backend de pruebas y carga datos. | Entorno |
| `e2e/tests/estudiantes.spec.ts` | 4 | El filtro por grupo muestra 20 estudiantes en cada uno de los 10 grupos y se combina con el filtro por estado; al editar se ve el grupo actual y se conserva; editar a un estudiante inactivo no lo reactiva. | H-29, H-28 |
| `e2e/tests/calificaciones.spec.ts` | 4 | Sin cambios no se puede guardar y los estudiantes sin nota aparecen vacíos; cambiar una nota guarda solo esa fila y conserva las 7 observaciones y los periodos de la actividad; «Entregado» se guarda, se lee tras recargar y no borra la observación; calificar a un estudiante sin nota crea solo su calificación, en el periodo 1. | H-02, H-31, H-33 |
| `e2e/tests/integracion.spec.ts` | 6 | La fecha se muestra el mismo día; Actividades y Calificaciones muestran las mismas entregas (5/20); las actividades vencidas siguen vencidas (D4); Dashboard y panel administrativo cuentan 31 alertas activas cuando una está resuelta; «Datos globales» muestra «Año lectivo» y estados en español; el panel de alertas lista solo las activas y enlaza a las resueltas sin eliminarlas. | H-30, H-25, H-26 |

Además, el análisis estático después de las correcciones no aumentó los errores de ESLint en ninguno de los archivos modificados, y `tsc` no reporta errores.

## Análisis estático

| Verificación | Comando | Resultado |
|---|---|---|
| Compilación de tipos | `npx tsc --noEmit -p tsconfig.app.json` | Sin errores (TypeScript en modo no estricto). |
| Análisis de código | `npx eslint .` | 132 problemas: 121 errores y 11 advertencias. 118 errores son usos de `any`. |

## Verificaciones funcionales y de seguridad ejecutadas

| ID | Módulo | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|---|
| P-AUT-01 | Autenticación | Inicio de sesión válido de docente | Cuenta demo docente | Token y datos del usuario | Token recibido; redirección al Dashboard en el navegador | Aprobada | |
| P-AUT-02 | Autenticación | Contraseña incorrecta | docente@classkids.local / «incorrecta» | 401 con mensaje genérico | 401 «Correo o contraseña incorrectos» | Aprobada | |
| P-AUT-03 | Autenticación | Correo inexistente | noexiste@x.com | 401 con el mismo mensaje | 401 «Correo o contraseña incorrectos» | Aprobada | No revela si el correo existe. |
| P-AUT-04 | Autenticación | Inicio de sesión de administrador | Cuenta demo admin | Acceso a `/admin` | Panel de administración cargado | Aprobada | Recorrido de capturas. |
| P-AUT-05 | Cierre de sesión | Cerrar sesión desde la barra lateral | — | Vuelve a la pantalla de login | Sesión cerrada; se pudo iniciar con otra cuenta | Aprobada | Recorrido de capturas. |
| P-SEG-01 | Rutas privadas | Petición sin token | `GET /estudiantes` | 401 | 401 | Aprobada | |
| P-SEG-02 | Rutas privadas | Token falso | `Bearer abc` | 401 | 401 | Aprobada | |
| P-SEG-03 | Roles | Docente en ruta administrativa | `GET /usuarios` con token de docente | 403 | 403 «Permisos insuficientes» | Aprobada | |
| P-SEG-04 | Roles | Docente consulta grupos | `GET /grupos` | Según el diseño, solo sus grupos asignados | 20/11: veía los 10 grupos. 24/11: el docente de Matemáticas ve sus 7 grupos | Aprobada (24/11) | H-08 corregido; `test_permisos.py`. |
| P-SEG-05 | Roles | Docente consulta asignaciones | `GET /asignaciones`, `POST /asignaciones` | El docente solo ve las suyas y no puede crear ni eliminar | 20/11: veía y creaba todas. 24/11: solo las suyas; crear responde 403 | Aprobada (24/11) | H-08 corregido; `test_permisos.py`. |
| P-SEG-06 | Exposición | Documentación de la API | `GET /docs` | Restringida en producción | 200 (pública) | Observación | Aceptable en desarrollo (H-23). |
| P-SEG-07 | Roles | Autoprotección del administrador | Fila propia en Usuarios y `PUT`/`DELETE /usuarios/{propio id}` | Controles deshabilitados, etiqueta «(tú)» y 403 en la API | 20/11: controles habilitados. 24/11: deshabilitados y 403 | Aprobada (24/11) | H-18 corregido; Playwright y `test_permisos.py`. |
| P-VAL-01 | Calificaciones | Nota fuera de rango | `nota: 7` | 422 con mensaje claro | 500 | Fallida | La base de datos la rechaza; no se guardó nada (H-05). |
| P-VAL-02 | Calificaciones | Estudiante inexistente | `estudiante_id: 999999` | 404 o 422 | 500 | Fallida | H-05. |
| P-VAL-03 | Estudiantes | Documento duplicado | `documento: 100101` | 409 | 500 | Fallida | H-05. |
| P-VAL-04 | Alertas | Estado inválido | `estado: "xyz"` | 422 | 422 «Estado de alerta inválido» | Aprobada | |
| P-VAL-05 | Estudiantes | Eliminar inexistente | `DELETE /estudiantes/999999` | 404 | 200 «Estudiante eliminado» | Fallida | No se eliminó nada (H-11). |
| P-INT-01 | Integración | Las pantallas muestran datos reales de PostgreSQL | Datos demo | Los totales coinciden con la base de datos | Dashboard y panel admin muestran 10 grupos, 200 estudiantes, 52 actividades y 32 alertas, iguales a los conteos SQL | Aprobada | |
| P-INT-02 | Integración | Recorrido de navegación de las 24 pantallas, con 1,2 s de espera por pantalla | Cuentas demo | Cada pantalla muestra sus datos | 23 pantallas mostraron sus datos; Actividades seguía en «Cargando actividades...» | Fallida | Corregido el registro inicial, que la daba por aprobada. Se repitió la captura esperando la carga (ver P-REN-01 y H-16). |
| P-UI-01 | Interfaz | Vista móvil (390 px) | Dashboard | Diseño adaptado | Barra lateral reducida a íconos y tarjetas en una columna | Aprobada | Solo Chromium. |
| P-UI-02 | Análisis | Etiqueta del mes en la tendencia | Notas de septiembre | «Sep 26» | «Jul 26» | Fallida | H-07. |
| P-UI-03 | Análisis | Coherencia entre estudiantes en riesgo y alertas | Datos demo | Mismo criterio | 66 en riesgo (< 70 %) frente a 32 alertas (< 3.0) | Fallida | H-01. |
| P-UI-04 | Calificaciones | Promedio de una actividad con notas parciales | Actividad con 5 de 20 notas | Promedio de las notas registradas | 20 % (cuenta los vacíos como 0) | Fallida | H-19. |

### Verificaciones de integración entre capas (20/11/2026)

| ID | Módulo | Escenario | Datos de entrada | Resultado esperado | Resultado obtenido | Estado | Observaciones |
|---|---|---|---|---|---|---|---|
| P-INT-03 | Base de datos | DBeaver, backend y Docker usan el mismo servidor | Conexiones por `127.0.0.1`, `::1` y `localhost` | Mismo servidor y mismos datos | Mismo identificador de sistema (`7681334033728598050`) y mismos conteos | Aprobada | Ver el capítulo de integración. |
| P-INT-04 | Base de datos | Integridad entre tablas | Script V-15 | 0 en las cuatro comprobaciones | 0, 0, 0, 0 | Aprobada | |
| P-INT-05 | API | Tipo de la nota en la respuesta | `GET /calificaciones` | Número en escala 0.0–5.0 | `float` (por ejemplo, 3.0) | Aprobada | |
| P-INT-06 | Manejo de errores | Formato del error 422 | `nota: "abc"` | Mensaje legible en la interfaz | La API devuelve `detail` como lista; `client.ts` lo mostraría como «[object Object]» | Fallida | H-24. No se guardó nada. |
| P-INT-07 | Estudiantes | Filtro por grupo | Grado 1A | 20 filas | 0 filas | Fallida | H-29. |
| P-INT-08 | Estudiantes | Selector de grupo al editar | Mateo Rodríguez (Grado 1A) | Selector con «Grado 1A» | Selector vacío | Fallida | H-28. No se guardó. |
| P-INT-09 | Actividades | Fecha de entrega | Taller de Sumas y Restas (`2026-09-05`) | «5 sep» | «4 sep» | Fallida | H-30. |
| P-INT-10 | Datos globales | Columna «Creado» de grupos | 10 grupos | Fecha de creación | «N/A» en todos | Fallida | H-26. |
| P-INT-11 | Actividades / Calificaciones | Entregas de la actividad 1 | 7 filas, 5 estudiantes distintos | El mismo valor en ambas pantallas | 7/20 en Actividades y 5/20 en Calificaciones | Fallida | H-30, H-06. |
| P-REN-01 | Rendimiento | Tiempo de carga de Actividades | 52 actividades | Menos de 3 s (RNF-02) | 5,2 s y 107 peticiones | Fallida | H-16. |
| P-DAT-01 | Datos demo | Alertas frente a la regla automática | Script V-13 | Alertas = estudiantes con promedio < 3.0 | 28 estudiantes con promedio < 3.0; 27 con alerta; 2 alertas con promedio ≥ 3.0 | Observación | H-32. |

**Resumen:** 34 verificaciones ejecutadas: 14 aprobadas, 18 fallidas y 2 observaciones.

### Seguimiento de las verificaciones fallidas

Las verificaciones de la tabla anterior se ejecutaron **antes** de las correcciones y se conservan como evidencia del estado inicial. Su seguimiento después de las correcciones:

| Verificación | Hallazgo | Situación tras las correcciones | Evidencia |
|---|---|---|---|
| P-INT-06 (formato 422) | H-24 | Corregido | `client.test.ts` |
| P-INT-07 (filtro por grupo) | H-29 | Corregido | `estudiantes.spec.ts` |
| P-INT-08 (selector al editar) | H-28 | Corregido | `estudiantes.spec.ts` |
| P-INT-09 (fecha de entrega) | H-30a | Corregido | `fechas.test.ts`, `integracion.spec.ts` |
| P-INT-10 (columna «Creado») | H-26 | Corregido | `integracion.spec.ts` |
| P-INT-11 (entregas 7/20 frente a 5/20) | H-30c | Corregido | `integracion.spec.ts` |
| P-SEG-07 (autoprotección del administrador) | H-18 | Corregido (24/11/2026) | `renovacion.spec.ts`, `test_permisos.py` |
| P-SEG-04 y P-SEG-05 (acceso del docente) | H-08 | Corregido (24/11/2026) | `test_permisos.py`, `permisos.spec.ts`, `evidencias/permisos/verificacion-api-permisos.md` |
| P-VAL-01 a P-VAL-03 (errores 500) | H-05 | Corregido (24/11/2026) | `test_hallazgos_cierre.py` |
| P-VAL-05 (eliminar inexistente) | H-11 | Pendiente | — |
| P-UI-02 (mes de la tendencia) | H-07 | Pendiente | — |
| P-UI-03 (riesgo frente a alertas) | H-01 | Corregido (24/11/2026): misma clasificación que el backend; la diferencia de cantidades es esperada (RN-09, RN-10) | `notas.test.ts` |
| P-UI-04 (promedio con vacíos) | H-19 | Pendiente | — |
| P-REN-01 y P-INT-02 (carga de Actividades) | H-16 | Pendiente | — |
| P-DAT-01 (alertas demo) | H-32 | Regla corregida; datos demo sin cambios por decisión | `test_alertas.py` |

## Verificación de la base de datos en DBeaver

El script [`evidencias/scripts/verificacion-bd.sql`](evidencias/scripts/verificacion-bd.sql) contiene 16 consultas de solo lectura (V-01 a V-16). Sus resultados del 20/11/2026 están en el capítulo de modelo de datos, sección «Verificación en DBeaver», y se pueden comparar directamente al ejecutar el script en DBeaver.

## Plan de pruebas pendientes

Estas pruebas están diseñadas pero **no se han ejecutado**. Algunas ya quedaron cubiertas por la suite automatizada: T-11 (calificar 3 de 20) y T-12 (editar una nota), ahora aprobadas; T-13 (nota baja genera alerta), aprobada; y T-14 (editar una nota a un valor bajo), que confirma que la regla no se evalúa al editar (RN-10): el comportamiento esperado en T-14 sigue sin cumplirse porque H-04 está pendiente.

| ID | Módulo | Escenario | Datos de entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|
| T-01 | Usuarios | Invitar un docente y activar la cuenta | Correo nuevo | Usuario activo con rol Docente | Pendiente |
| T-02 | Usuarios | Invitar un correo ya registrado | Correo existente | 409 «El usuario ya existe» | Pendiente |
| T-03 | Usuarios | Desactivar un usuario e intentar iniciar sesión | Usuario de prueba | 403 en el login | Pendiente |
| T-04 | Grupos | Crear un grupo | 2B, Vespertino | Aparece en la lista y en la base de datos | Pendiente |
| T-05 | Grupos | Crear un grupo con nombre repetido | Grado 1A | Rechazo | Pendiente (se espera que falle) |
| T-06 | Estudiantes | Registrar y editar un estudiante | Documento nuevo | Guardado en la base de datos | Pendiente |
| T-07 | Estudiantes | Campos con solo espacios | Nombre «   » | Rechazo | Pendiente |
| T-08 | Estudiantes | Caracteres especiales | «O'Brien», «Núñez», `<script>` | Se guardan y se muestran sin ejecutarse | Pendiente |
| T-09 | Actividades | Crear un examen | Grado 1A, Matemáticas | Aparece con tipo y fecha | Pendiente |
| T-10 | Actividades | Título de 300 caracteres | Texto largo | 422 | Pendiente (se espera 500) |
| T-11 | Calificaciones | Calificar 3 de 20 estudiantes y guardar | 85, 60, 90 | Solo 3 calificaciones nuevas | Pendiente (se espera que falle: H-02) |
| T-12 | Calificaciones | Editar una nota existente | 90 → 40 | Nota actualizada | Pendiente |
| T-13 | Alertas | Nota baja a un estudiante sin alertas | Promedio resultante < 3.0 | Una alerta `low_grade` activa | Pendiente |
| T-14 | Alertas | Editar una nota a un valor bajo | PUT con nota 1.0 | Se genera la alerta | Pendiente de decisión funcional (RN-10 excluye las ediciones; H-04) |
| T-15 | Alertas | Marcar como revisada y resolver | Alerta activa | Estados `reviewed` y `resolved` | Pendiente |
| T-16 | Observaciones | Registrar y eliminar una observación | Tipo Académica | Visible y luego eliminada | Pendiente |
| T-17 | Materias | Eliminar una materia con actividades | Matemáticas | 409 y mensaje de error | Pendiente |
| T-18 | Asignaciones | Asignar una materia que ya tiene docente en el grupo | Matemáticas, 1A | Mensaje «Esta asignación ya existe» | Pendiente |
| T-19 | Sesión | Reiniciar el backend con la interfaz abierta | — | Redirige al login | Pendiente (se espera que falle: H-10) |
| T-20 | Sesión | Usar el token de un usuario después de desactivarlo | — | 401 | Aprobada (24/11/2026): 401 inmediato (`test_h09_cuenta_desactivada_pierde_el_acceso_de_inmediato`) |
| T-21 | Recuperación | Solicitar y usar un enlace de recuperación (con SMTP de pruebas) | Correo de un usuario activo | Contraseña actualizada; el enlace no se puede reutilizar | Pendiente |
| T-22 | Interfaz | Revisar las pantallas en Firefox y Edge | — | Mismo comportamiento que en Chromium | Pendiente |
| T-23 | Rendimiento | Tiempo de carga de Análisis y Estudiantes (Actividades ya se midió: P-REN-01) | Datos demo | Menos de 3 segundos | Pendiente |

## Historial

El registro anterior de pruebas (28 de agosto de 2026) describía validaciones manuales sobre un conjunto de datos menor (3 grupos y 20 estudiantes) y una «suite de 31 pruebas de consola» que no está en el repositorio. Como esas pruebas no se pueden reproducir, se reemplazaron por las verificaciones de esta fecha.
