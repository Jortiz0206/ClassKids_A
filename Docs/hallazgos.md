# Hallazgos: errores y funcionalidades incompletas

Este capítulo reúne los defectos y las funcionalidades incompletas encontrados al revisar el código, la base de datos y la aplicación en ejecución, y en la auditoría de integración entre capas, entre el 19 y el 20 de noviembre de 2026. Durante la actualización de la documentación no se corrigió ninguno. Después, con autorización, se corrigieron los hallazgos de integración aprobados (ver «Estado de las correcciones»): un hallazgo solo se marca como corregido cuando existe una prueba automatizada que lo demuestra.

**Prioridad.** *Crítica*: compromete la integridad de los datos o la seguridad. *Alta*: funcionalidad importante con errores o incompleta. *Media*: afecta la calidad o la experiencia. *Baja*: ajuste menor.

**Evidencia.** *Verificado*: comprobado en ejecución (API, base de datos o captura). *Código*: identificado leyendo el código, no ejecutado para no alterar los datos.

## Resumen

| ID | Hallazgo | Prioridad | Evidencia |
|---|---|---|---|
| H-01 | La interfaz y el backend usan umbrales distintos sobre la escala oficial 0.0–5.0: la interfaz aprueba desde 3.5 (70 %) y la alerta se genera por debajo de 3.0. | Crítica | Verificado |
| H-02 | Guardar calificaciones registra nota 0 a los estudiantes que no fueron calificados. | Crítica | Código |
| H-03 | Al convertir el porcentaje digitado a la escala oficial (un decimal) se pierde precisión. | Alta | Código |
| H-04 | La regla de alerta automática está incompleta. | Alta | Código y datos |
| H-05 | El backend no valida los datos de entrada y responde con error 500. | Alta | Verificado |
| H-06 | Hay calificaciones sin actividad y calificaciones repetidas para la misma actividad. | Alta | Verificado |
| H-07 | La gráfica de tendencia muestra un mes equivocado. | Media | Verificado |
| H-08 | El docente tenía acceso total a los datos y a funciones administrativas. | Crítica | Corregido (24/11/2026) |
| H-09 | El token sigue siendo válido después de cerrar sesión, desactivar al usuario o cambiar su rol. | Alta | Código |
| H-10 | La interfaz no detecta una sesión vencida. | Media | Código |
| H-11 | Eliminar un registro inexistente responde «eliminado» y eliminar un estudiante borra su historial. | Alta | Verificado |
| H-12 | Operaciones que existen en la API pero no en la interfaz. | Alta | Verificado |
| H-13 | Botones sin acción en Grupos, Actividades y Estudiantes. | Baja | Código |
| H-14 | Inconsistencias en los indicadores del Dashboard. | Media | Verificado |
| H-15 | El detalle de la alerta no muestra el mensaje ni el grupo. | Baja | Código |
| H-16 | Carga ineficiente de datos: Actividades tarda 5,2 s y hace 107 peticiones. | Media | Verificado |
| H-17 | La variable `DATABASE_URL` del archivo `.env` se ignora. | Media | Código |
| H-18 | El administrador podía quitarse el rol o desactivar su propia cuenta. | Alta | Corregido (24/11/2026) |
| H-19 | El promedio de una actividad cuenta como 0 a los estudiantes sin nota. | Media | Verificado |
| H-20 | Calidad del código: tipado débil y ausencia de pruebas. | Media | Verificado |
| H-21 | El inicio de sesión revela si una cuenta existe y está desactivada. | Baja | Código |
| H-22 | Las fechas y horas se muestran en UTC. | Baja | Verificado |
| H-23 | Configuración de desarrollo expuesta (base de datos y documentación de la API). | Media | Código |
| H-24 | Los errores de validación (422) se muestran como «[object Object]». | Media | Verificado (formato de la API) y código |
| H-25 | El Dashboard y el panel de administración cuentan estudiantes y alertas con criterios distintos. | Baja | Código |
| H-26 | «Datos globales» muestra la fecha de creación de los grupos, una columna que no existe. | Baja | Verificado |
| H-27 | El año lectivo se llama `año_lectivo` al enviarlo y `ano_lectivo` al recibirlo. | Media | Verificado |
| H-28 | Al editar un estudiante el selector de grupo aparece vacío, y la edición reactiva al estudiante. | Media | Verificado |
| H-29 | El filtro por grupo de la pantalla Estudiantes no devuelve resultados. | Alta | Verificado |
| H-30 | Actividades muestra la fecha de entrega un día antes, nunca marca como completada una actividad vencida y cuenta entregas duplicadas. | Media | Verificado |
| H-31 | El interruptor «Entregado» no se lee de vuelta y guardar sobrescribe la observación de cada calificación. | Alta | Código |
| H-32 | Las alertas de los datos demo no coinciden exactamente con la regla automática. | Baja | Verificado |
| H-33 | Guardar una calificación existente cambiaba su periodo a 1. | Alta | Verificado (código y datos) |
| H-34 | Cambiar el ancho de la pantalla volvía a montar la página y perdía las notas sin guardar. | Alta | Verificado (script y prueba E2E) |
| H-35 | «Ver todos» del Dashboard enlazaba a una ruta inexistente (`/estudiantes`). | Media | Código y prueba E2E |
| H-36 | Alertas mostraba «Hace -1 días» por la diferencia de zona horaria. | Baja | Verificado |
| H-37 | Estados aprobados e informativos en rojo, textos menores de 12 px y 9 de 16 pares de color sin contraste AA. | Media | Diagnóstico visual (capturas y medición) |
| H-38 | En la landing, «Ver cómo funciona» llevaba al inicio de sesión en lugar de a la explicación, y el pie tenía textos con contraste insuficiente. | Baja | Código y prueba E2E |
| H-39 | Materias eliminaba o desvinculaba sin confirmación; Usuarios usaba `confirm()` nativo con un texto que decía «eliminar» cuando la API solo desactiva. | Media | Código y prueba E2E |
| H-40 | En el celular, la tabla de Usuarios obligaba a desplazarse de lado y ocultaba el rol y las acciones. | Baja | Captura y prueba E2E |
| H-41 | Tras reiniciar el equipo, la base de pruebas quedaba detenida y pytest fallaba al cargar los fixtures. | Media | Corregido (24/11/2026) |
| H-42 | El backend respondía 500 en la primera petición tras reiniciar PostgreSQL. | Media | Corregido (24/11/2026) |

Los hallazgos H-24 a H-33 provienen de la auditoría de integración entre capas (ver el capítulo correspondiente).

## Estado de las correcciones (20/11/2026)

Las correcciones se probaron en el entorno aislado `classkids_test` (ver el capítulo de pruebas). La base real `classkids` no se modificó.

| ID | Estado | Qué cambió | Pruebas que lo demuestran |
|---|---|---|---|
| H-02 | **Corregido** | La pantalla Calificaciones guarda solo las filas modificadas; un estudiante sin nota aparece vacío y no recibe un 0. | Playwright: «sin cambios no se puede guardar…», «cambiar una nota guarda solo esa fila…», «calificar a un estudiante sin nota crea solo su calificación…» |
| H-24 | **Corregido** | `client.ts` convierte los errores 422 en texto legible. | Vitest: 7 pruebas de `client.test.ts` |
| H-25 | **Corregido** | Dashboard y panel de alertas cuentan con el criterio del panel administrativo (alertas `active`, estudiantes activos). El panel de alertas lista solo las activas y enlaza a las resueltas. | Vitest: 2 de `conteos.test.ts` · Playwright: «H-25…» y «Panel de alertas…» |
| H-26 | **Corregido** | «Datos globales» muestra «Año lectivo» en lugar de «Creado» y los estados de alerta en español. | Playwright: «H-26…» |
| H-27 | **Corregido** | La API acepta `ano_lectivo` (y el nombre anterior `año_lectivo`); todas las capas usan `ano_lectivo`. | pytest: 4 de `test_grupos.py` |
| H-28 | **Corregido** | Al editar un estudiante, el selector muestra su grupo y se conserva su estado `activo`. | Playwright: 2 pruebas «H-28…» |
| H-29 | **Corregido** | El filtro por grupo de Estudiantes muestra los 20 estudiantes de cada grupo. | Playwright: 2 pruebas «H-29…» |
| H-30 | **Corregido parcialmente** | (a) La fecha de entrega se muestra el mismo día. (c) Las entregas cuentan estudiantes distintos (5/20 en ambas pantallas). (b) Por la decisión D4 se conserva RN-16: una actividad vencida no se marca como completada. | Vitest: 5 de `fechas.test.ts` · Playwright: «H-30a…», «H-30c…», «H-30 / D4…» |
| H-31 | **Corregido en el código y en la base de pruebas** | Al editar una calificación se conservan su observación y su periodo; «Entregado» se guarda en la columna `entregado` y se lee de vuelta. En la base real la conservación de observaciones ya funciona, pero «Entregado» **no persiste hasta aplicar la migración 001** (no autorizada todavía). | pytest: 6 de `test_calificaciones.py` (incluida la compatibilidad sin la columna) · Playwright: «H-02/H-31/H-33…», «H-31: el estado Entregado…» |
| H-32 | **Regla corregida; datos demo sin cambios** | Decisión D3: no se crea otra alerta si ya existe una de bajo rendimiento (`low_grade` o «Bajo Rendimiento») activa o en revisión. Las alertas existentes no se modificaron, por lo que la diferencia de los datos demo descrita en el detalle se mantiene. | pytest: 8 de `test_alertas.py` |
| H-33 | **Corregido** | `PUT /calificaciones/{id}` actualiza solo los campos enviados; el periodo existente se conserva. | pytest: 2 de `test_calificaciones.py` · Playwright: «H-02/H-31/H-33…» |
| H-13 | **Corregido** (renovación visual) | Se retiraron los botones «⋮» sin función; «Ver detalle del grupo» abre Estudiantes filtrado por el grupo. | Playwright: «Grupos: Ver estudiantes del grupo…» |
| H-14 | **Corregido parcialmente** | Además de H-25: el panel muestra el grupo real (no «Activo») y la gráfica muestra los cinco nombres. Pendiente: la lista muestra los primeros seis estudiantes (ahora el título lo aclara). | Playwright: «H-25…», «Panel de alertas…» |
| H-15 | **Corregido** | El detalle de la alerta muestra mensaje, grupo, tipo, estado, prioridad y fecha. | Playwright: «Alertas: el detalle muestra el grupo y el mensaje…» |
| H-34 | **Corregido** | `<main>` conserva su posición en el árbol de React al cambiar entre celular y escritorio. | Playwright: «Cambiar el ancho de la ventana no borra las notas…» |
| H-35 | **Corregido** | Ruta `/app/estudiantes`. | Playwright: «Dashboard: Ver todos…» |
| H-36 | **Corregido** | Función `tiempoRelativo` (días de calendario, sin negativos). | Vitest: 4 de `tiempo-relativo.test.ts` · Playwright: «Alertas…» |
| H-37 | **Corregido** | Sistema visual nuevo: rojo solo para alertas, estados con ícono, texto mínimo de 12 px, contraste AA en ambos temas (64/64). | `Docs/evidencias/contraste-wcag.md` · capturas `Docs/evidencias/capturas-v3/` |
| H-38 | **Corregido** | «Ver cómo funciona» lleva a la sección `#metodo`; el pie usa colores del tema con contraste AA. | Playwright: «Landing: Ver cómo funciona…» |
| H-39 | **Corregido** | Diálogo de confirmación común (`ConfirmarAccion`) en Materias y Usuarios; el texto de Usuarios dice «Desactivar», que es lo que hace la API. | Playwright: «Materias y Usuarios piden confirmación… (H-39)» |
| H-40 | **Corregido** | En el celular, Usuarios muestra una tarjeta por persona con el rol y la acción visibles. | Playwright: «Usuarios en celular (H-40)» |
| H-41 | **Corregido** | `conftest.py` comprueba la base en `pytest_sessionstart` y termina con un mensaje claro si no responde; el contenedor de pruebas se reinicia con Docker. | pytest con la base apagada: salida 3 con instrucciones; con la base encendida: 61 de 61 |
| H-42 | **Corregido** | `database.py` crea el motor con `pool_pre_ping=True`: tras reiniciar PostgreSQL la primera petición ya no responde 500. | Reinicio de la base de pruebas con el backend encendido: inicio de sesión 200 |

**Siguen pendientes**, entre otros: **H-01** (umbrales distintos: 3.5 en la interfaz y 3.0 en la alerta), **H-04** (la regla de alerta no se evalúa al editar ni por materia) y **H-19** (el promedio de una actividad cuenta como 0 a los estudiantes sin nota). También H-03 y H-05 a H-23. H-14 queda parcialmente resuelto (ver su fila). El registro de seguimiento con severidad y estado está en [`pruebas/registro-defectos.md`](pruebas/registro-defectos.md).

## Detalle

Cada detalle describe el problema tal como se encontró en la auditoría. Para saber si ya se corrigió, consulte la tabla «Estado de las correcciones».

### H-01. Umbrales distintos en la interfaz y en el backend

- **Escala:** ambos trabajan sobre la escala oficial 0.0–5.0 (la interfaz la muestra multiplicada por 20). La diferencia está en el **umbral**, no en la escala.
- **Dónde:** `backend/main.py`, función `registrar_calificacion`: alerta si el promedio acumulado es menor a **3.0**. `Calificaciones.tsx`, `Estudiantes.tsx`, `Analisis.tsx`, `Grupos.tsx`, `PerformanceChart.tsx` y `RecentStudents.tsx`: aprobado desde **70 %** (3.5) y «En riesgo» por debajo de ese valor.
- **Qué ocurre:** un estudiante con promedio entre 3.0 y 3.4 (60 % a 69 %) aparece «En riesgo» en las pantallas, pero nunca recibe una alerta automática. En los datos demo, Análisis muestra 66 estudiantes en riesgo y solo existen 32 alertas.
- **Efecto del redondeo:** la interfaz redondea los promedios a porcentajes enteros, mientras que el backend compara el promedio sin redondear. Por ejemplo, un promedio de 2.99 se muestra como 60 % (En riesgo, no Crítico) aunque sí genera alerta.
- **Estado:** se documenta tal como está implementado; no se corrigió.

### H-02. Guardar calificaciones registra ceros

- **Dónde:** `frontend/src/pages/Calificaciones.tsx` (líneas 99–109 y 130–144).
- **Qué ocurre:** los estudiantes sin nota se muestran con 0 y, al pulsar «Guardar cambios», se envían **todas** las filas. Si el docente califica a 3 de 20 estudiantes, los otros 17 quedan con nota 0.0 en la base de datos, lo que baja su promedio y puede generar alertas que no corresponden.
- **Pendiente:** guardar solo las filas con nota ingresada o modificada y distinguir «sin nota» de «nota 0». Es la primera prueba que debe ejecutarse en un entorno de pruebas.

### H-03. Pérdida de precisión en la nota

- **Dónde:** `Calificaciones.tsx` (línea 135) y `calificaciones.nota NUMERIC(3,1)`.
- **Qué ocurre:** la escala oficial admite un decimal (pasos de 0.1), que en la visualización equivalen a pasos de 2 puntos porcentuales. La interfaz permite digitar cualquier porcentaje: si el docente escribe 73, la conversión da 3.65, se guarda con un decimal (3.6 o 3.7, según el redondeo de JavaScript) y al recargar aparece 72 o 74. Solo los porcentajes pares se conservan exactamente.

### H-04. Regla de alerta automática incompleta

- **Dónde:** `backend/main.py`, `registrar_calificacion` y `actualizar_calificacion`.
- **Qué ocurre:**
  1. Solo se evalúa al **crear** una calificación, no al actualizarla.
  2. Usa el promedio de todas las materias juntas, no el de cada materia.
  3. Para evitar duplicados busca alertas con tipo `low_grade`, pero las alertas de los datos demo tienen tipo «Bajo Rendimiento»; un mismo estudiante puede terminar con dos alertas de bajo rendimiento activas.
  4. No existen las reglas de inasistencia, riesgo comportamental ni deserción que planteaba el diseño original.

### H-05. El backend no valida los datos de entrada

- **Dónde:** esquemas Pydantic de `backend/main.py` (líneas 50–124) y endpoints de creación.
- **Qué ocurre:** los esquemas no limitan rangos, longitudes ni formatos (la nota es un `float` sin rango y el correo un `str` sin formato), y los errores de la base de datos no se capturan. Verificado: nota 7 → 500; estudiante inexistente → 500; documento duplicado → 500. La interfaz muestra un mensaje genérico, sin indicar la causa.

### H-06. Calificaciones sin actividad y repetidas

- **Dónde:** datos de `backend/init.sql` y tabla `calificaciones`.
- **Qué ocurre:** 183 de las 215 calificaciones demo no tienen actividad asociada, por lo que no aparecen en la pantalla Calificaciones. Además hay estudiantes con dos calificaciones en la misma actividad (por ejemplo, el estudiante 1 en la actividad 1), porque no existe una restricción única.

### H-07. Mes equivocado en la tendencia

- **Dónde:** `frontend/src/pages/Analisis.tsx` (líneas 156–164).
- **Qué ocurre:** el mes se guarda con numeración desde 0 (septiembre = 08) y luego se vuelve a leer como fecha, de modo que septiembre se muestra como agosto o, por la zona horaria, como julio. La captura de Análisis muestra «Jul 26» con datos de septiembre.

### H-08. Acceso total del docente

- **Dónde:** `backend/main.py`, constante `ADMIN_PREFIXES` (línea 161); `AppSidebar.tsx`.
- **Qué ocurre:** solo `/usuarios`, `/docentes` y `/admins` exigen rol administrador. Cualquier docente puede consultar y modificar todos los grupos, estudiantes, actividades, calificaciones y alertas, aunque no los tenga asignados, y puede crear materias y asignaciones, que según el diseño son tareas del administrador. Verificado: el docente demo consulta los 10 grupos y accede a `/asignaciones`.

**Estado (24/11/2026): corregido.** La API toma la identidad del token y aplica permisos por rol y por asignación (tabla `asignaciones`: docente + materia + grupo). El docente solo ve y modifica sus grupos, materias, estudiantes, actividades, calificaciones, observaciones y alertas; crear, editar o eliminar grupos, materias y asignaciones, y eliminar estudiantes, son del administrador. Fuera de ámbito la API responde 403 sin modificar datos. Pruebas: `backend/tests/test_permisos.py` (fallan 15 de 19 contra la versión anterior y pasan las 19 con la corrección), `e2e/tests/permisos.spec.ts`; evidencia: `evidencias/permisos/verificacion-api-permisos.md`. **Limitación documentada:** la tabla `alertas` no guarda la materia; la visibilidad de las alertas se resuelve como indica RN-37. Guardar la materia en la alerta requeriría una migración (pendiente de decisión).

### H-09. Token vigente tras cambios de la cuenta

- **Dónde:** middleware `require_authentication` (`backend/main.py`, líneas 169–183).
- **Qué ocurre:** el middleware solo valida la firma y el vencimiento del token, sin consultar la base de datos. Un usuario desactivado, o un administrador al que se le quitó el rol, conserva sus permisos hasta 8 horas. Cerrar sesión tampoco invalida el token.

### H-10. Sesión vencida no detectada

- **Dónde:** `frontend/src/api/client.ts` (líneas 14–17) y `backend/main.py` (líneas 145–157).
- **Qué ocurre:** si no se define `JWT_SECRET`, el backend genera una clave nueva en cada arranque y todos los tokens anteriores dejan de servir. La interfaz no maneja la respuesta 401: el usuario sigue «dentro», pero todas las pantallas muestran errores hasta que cierra sesión manualmente.

### H-11. Eliminaciones

- **Dónde:** endpoints `DELETE` de estudiantes, actividades, calificaciones, observaciones y alertas.
- **Qué ocurre:** eliminar un identificador inexistente responde 200 «eliminado» (verificado con `DELETE /estudiantes/999999`). Eliminar un estudiante borra en cascada sus calificaciones, observaciones y alertas, aunque existe el campo `activo` para una baja lógica.

### H-12. Operaciones sin interfaz

| Operación | Disponible en la API | Disponible en la interfaz |
|---|---|---|
| Editar y eliminar grupos | Sí | No |
| Eliminar o desactivar estudiantes | Sí (eliminación física) | No |
| Editar materias y registrar su código | Sí | No |
| Editar y eliminar actividades | Sí | No |
| Eliminar calificaciones | Sí | No |
| Crear alertas manuales y eliminarlas | Sí | No |
| Editar datos de un usuario, reactivarlo o ver los inactivos | No | No |
| Elegir el periodo de una calificación | Sí (campo `periodo`) | No |
| Consultar el listado de calificaciones de un estudiante | Sí (filtrando) | No |

### H-13. Botones sin acción

El botón «⋮» y el botón «Ver detalle del grupo» de las tarjetas de Grupos, el botón «⋮» de las tarjetas de Actividades y la flecha de cada fila de Estudiantes no tienen una acción propia (en Estudiantes, el clic sobre la fila sí abre el detalle).

### H-14. Indicadores del Dashboard

- La tarjeta «Alertas Activas» y el contador «N activas» del panel cuentan **todas** las alertas, incluidas las resueltas (`Dashboard.tsx`, `AlertsPanel.tsx`).
- El panel de alertas muestra la etiqueta fija «Activo» en todas las alertas.
- La lista de estudiantes muestra los seis primeros registros, no los más recientes ni los que requieren atención (`RecentStudents.tsx`).
- En la gráfica por materia, el nombre de una materia puede ocultarse por falta de espacio.

### H-15. Detalle de la alerta

En `Alertas.tsx`, el recuadro del detalle muestra el tipo de la alerta en lugar del mensaje, y el grupo del estudiante siempre queda vacío.

### H-16. Carga de datos

- La pantalla Actividades hace dos peticiones por cada actividad (`Actividades.tsx`, líneas 479–486). Medido el 20/11/2026: con 52 actividades realiza **107 peticiones** y tarda **5,2 segundos** en mostrar los datos, por encima del objetivo de 3 segundos de RNF-02.
- Todas las pantallas descargan las tablas completas y calculan en el navegador, sin paginación. Funciona con los datos demo, pero no escala a miles de registros.

### H-17. `DATABASE_URL` ignorada

`backend/main.py` importa `database.py` (línea 19) antes de cargar el archivo `.env` (línea 21), y `database.py` lee la variable al importarse. Una `DATABASE_URL` definida en `.env` no tiene efecto; hoy funciona porque se usa el valor por defecto.

### H-18. Autodesactivación del administrador

`AdminUsuarios.tsx` (línea 154) compara el identificador del usuario de la tabla (texto) con el del usuario en sesión (número) usando `===`, por lo que la protección de la propia cuenta nunca se activa: la fila del administrador no muestra «(tú)» y sus controles quedan habilitados (verificado en la captura). El backend tampoco lo impide. Un administrador puede quitarse el rol o desactivarse, e incluso dejar el sistema sin administradores.

**Estado (24/11/2026):** corregido en la interfaz: la comparación convierte ambos identificadores a texto, la fila propia muestra «(tú)» y sus controles quedan deshabilitados (prueba E2E de regresión). **Completado el 24/11/2026:** el backend también lo impide: `PUT /usuarios/{id}/rol` y `DELETE /usuarios/{id}` responden 403 cuando el id es el del token (`test_permisos.py`, 4 casos).

### H-19. Promedio de la actividad

En `Calificaciones.tsx` el promedio y la columna de estado tratan como 0 a los estudiantes sin nota. En la captura, una actividad con 5 de 20 notas registradas muestra un promedio de 20 %.

### H-20. Calidad del código

- ESLint reporta 121 errores, de los cuales 118 son usos de `any`; TypeScript está configurado en modo no estricto. **Estado (24/11/2026):** `npm run lint` termina con 0 errores (quedan 12 avisos de `react-refresh` y `exhaustive-deps`); las pantallas usan los tipos de `src/types` en lugar de `any`. TypeScript sigue en modo no estricto.
- El fragmento `Array.isArray(x) ? x : x?.items` y la conversión `nota × 20` se repiten en varias pantallas.
- Toda la API está en un único archivo de 763 líneas.
- Solo existe una prueba automatizada, de ejemplo.

### H-21. Mensaje de cuenta desactivada

El login verifica si la cuenta está activa antes de comprobar la contraseña. Con una contraseña cualquiera, la respuesta 403 «cuenta deshabilitada» confirma que el correo existe.

### H-22. Fechas en UTC

PostgreSQL registra las fechas en UTC sin zona horaria y la interfaz las muestra sin convertir. En la captura de Usuarios, un ingreso realizado a las 13:53 (hora de Colombia) aparece como 18:53.

### H-23. Configuración de desarrollo expuesta

`docker-compose.yml` publica PostgreSQL en el puerto 5432 de todas las interfaces de red con una contraseña fija, y la documentación interactiva de la API (`/docs`) es pública. Es aceptable en desarrollo local, pero debe cambiarse antes de cualquier despliegue.

### H-24. Errores de validación ilegibles

Cuando FastAPI rechaza un dato con 422, responde `{"detail": [ {…} ]}`, con `detail` en forma de lista (verificado enviando `nota: "abc"`). `client.ts` crea el error con `new Error(errorData.detail)`, y las pantallas que muestran `error.message` (Actividades, Alertas, Usuarios, Invitación, Recuperación) mostrarían «[object Object]».

### H-25. Criterios de conteo distintos

El Dashboard cuenta todos los registros de `GET /estudiantes` y `GET /alertas`, mientras que el panel de administración usa `/estudiantes/count` (solo activos) y `/alertas/activas/count` (solo estado `active`). Hoy los valores coinciden (200 y 32) porque no hay estudiantes inactivos ni alertas resueltas; dejarán de coincidir en cuanto se resuelva una alerta.

### H-26. Columna inexistente en «Datos globales»

`AdminDatos.tsx` muestra en la pestaña Grupos la columna «Creado» con `g.created_at`, pero la tabla `grupos` no tiene ese campo: todos los grupos muestran «N/A» (verificado en la captura 23). La pestaña Alertas muestra el estado técnico (`active`) en lugar de «Activa».

### H-27. Nombre del año lectivo

El esquema `GrupoSchema` recibe `año_lectivo` y la columna se llama `ano_lectivo`; `GET /grupos` devuelve `ano_lectivo` (verificado). Si un cliente reenvía en `PUT /grupos/{id}` el objeto que recibió, el campo no se reconoce y el año vuelve al valor por defecto 2026. La interfaz actual no edita grupos, por lo que el efecto es latente. `types/index.ts` declara `año_lectivo`.

### H-28. Edición de estudiantes

- El formulario guarda el grupo como texto (`"1"`), pero las opciones del selector tienen el ID como número: el selector aparece vacío al editar (verificado en el navegador). Si se guarda sin tocarlo, el grupo se conserva, porque el backend convierte el texto a número.
- La edición siempre envía `activo: true`, por lo que editar un estudiante inactivo lo reactivaría.

### H-29. Filtro por grupo en Estudiantes

`Estudiantes.tsx` compara el grupo elegido en el filtro (número) con `e.grupo_id`, que se guardó como texto, usando `===`. Verificado: al filtrar por «Grado 1A» la tabla muestra 0 filas en lugar de 20. El mismo filtro funciona en Actividades, donde ambos valores son números.

### H-30. Fechas y estados en Actividades

- `fecha_entrega` llega como `"2026-09-05"` y se convierte con `new Date()`, que la interpreta en UTC; en Colombia se muestra «4 sep» (verificado).
- El backend devuelve `vencida` para toda actividad con fecha pasada y la interfaz solo marca «Completada» cuando el estado es `pendiente`: una actividad vencida nunca aparece como completada. En los datos demo las 52 actividades están vencidas y el indicador «Completadas» es 0.
- «Entregados» cuenta filas de calificación, incluidas las duplicadas: la actividad 1 muestra 7/20, mientras que la pantalla Calificaciones muestra 5/20 para la misma actividad (7 filas, 5 estudiantes distintos).

### H-31. Interruptor «Entregado» y observaciones de la calificación

Al guardar, `Calificaciones.tsx` escribe en `calificaciones.observacion` el texto «Actividad entregada» o `null`, según el interruptor. Al recargar, el interruptor no lee ese campo: se enciende si la nota existe. Por eso apagar «Entregado» no se refleja después de guardar. Además, guardar reemplaza la observación que tenía cada calificación (por ejemplo, «Excelente manejo conceptual» en los datos demo), lo que implica pérdida de información.

### H-32. Alertas de los datos demo frente a la regla

Las 29 alertas de «Bajo Rendimiento» de `init.sql` se cargaron manualmente, no las generó la regla automática (RN-09). Verificado con la consulta V-13: 28 estudiantes tienen promedio acumulado menor a 3.0; 27 tienen alerta; Nicolas Vargas (2.90) no la tiene, y Mateo Rodríguez (3.08) y Tomás Gutiérrez (3.25) tienen alerta con promedio mayor o igual a 3.0 (sus alertas se refieren a una materia o periodo concreto).

### H-33. El periodo cambiaba a 1 al guardar

- **Dónde:** `Calificaciones.tsx` (el payload no incluía `periodo`), `CalificacionSchema` (`periodo` con valor por defecto 1) y `PUT /calificaciones/{id}` (actualizaba todas las columnas).
- **Qué ocurría:** al guardar una calificación existente, su periodo se reemplazaba por 1. Las 5 calificaciones del periodo 2 asociadas a una actividad (ids 30, 31, 33, 34 y 35) son las que la pantalla muestra cuando hay duplicados, por lo que guardar esas actividades habría alterado la tendencia de esos estudiantes.
- **Estado:** corregido (ver «Estado de las correcciones»).

## Funcionalidades del diseño original que no se construyeron

| Funcionalidad | Situación |
|---|---|
| Control de asistencia y alertas de inasistencia crítica | No existe. |
| Alertas de riesgo comportamental y de deserción | No existen. |
| Prioridad de alerta almacenada | Se deriva del tipo en la interfaz. |
| Registro del docente que escribe una observación y campo de recomendaciones | No existe. |
| Tabla de LOG de accesos | No existe. |
| Exportación a PDF y Excel | No existe. |
| Notificación de alertas en tiempo real | No existe. |
| Cierre de sesión por inactividad (15 minutos) | No existe. |
| Respaldo diario automático | No existe. |
| Filtro del tablero por grupo | No existe. |

## Mejoras futuras (no son requisitos de la versión actual)

| Mejora | Descripción |
|---|---|
| Historial de alertas en el Dashboard | El panel «Alertas Tempranas» muestra solo las alertas activas. Las resueltas se consultan en la pantalla Alertas con el filtro «Resueltas» (enlace «Ver alertas resueltas»). Un historial propio en el Dashboard no se construyó porque no estaba autorizado. |
| Escala configurable por institución | Hoy la escala 0.0–5.0, la conversión a porcentaje y los umbrales están fijos en el código y en la base de datos. Una versión futura podría permitir que cada institución configure su escala (por ejemplo, 1–10 o 0–100) y sus umbrales de aprobación y alerta. |
