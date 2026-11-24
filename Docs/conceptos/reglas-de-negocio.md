# Reglas de negocio

Las reglas de este capítulo describen el comportamiento **implementado** en el código. Cada regla indica dónde está programada. Cuando una regla del documento original no coincide con la implementación, la diferencia se registra en el capítulo de comparación y, si es un defecto, en el de hallazgos.

## Escala académica oficial

**La escala académica oficial de ClassKids es de 0.0 a 5.0**, con un decimal. Es la escala en la que el backend recibe las calificaciones, la base de datos las almacena y se evalúa la alerta automática. La interfaz del docente presenta esos mismos valores en porcentaje (0 a 100), como una forma de visualización: el porcentaje no se almacena en ningún lugar.

### Ciclo de una calificación

| Etapa | Qué ocurre | Escala | Dónde |
|---|---|---|---|
| 1. Registro | El docente digita la calificación en la tabla de la pantalla Calificaciones. El campo acepta valores de 0 a 100 y la interfaz limita cualquier valor fuera de ese rango. Un estudiante sin calificación aparece con el campo vacío. | 0 a 100 (porcentaje) | `Calificaciones.tsx` (`updateCalificacion`) |
| 2. Conversión | Al pulsar «Guardar cambios», la interfaz toma **solo las filas modificadas**, divide el porcentaje entre 20 y lo redondea a un decimal, la mitad hacia arriba: `nota = round(porcentaje ÷ 2) ÷ 10`. Ejemplos: 70 → 3.5; 86 → 4.3; 87 → 4.4; 100 → 5.0. Lo digitado fuera de 0–100 se limita antes (150 → 100). | 0 a 100 → 0.0 a 5.0 | `aEscala5` y `normalizarEntradaNota` (`frontend/src/lib/notas.ts`), usadas en `Calificaciones.tsx` (`handleSave`) |
| 3. Envío | La nota convertida se envía a la API en el campo `nota`, junto con `entregado`. Una calificación nueva usa `POST` (periodo 1); una existente usa `PUT`, que actualiza solo los campos enviados y conserva el periodo y la observación. El backend valida la nota antes de guardarla: debe ser un número (no texto ni booleano), estar entre 0 y 5 y tener un solo decimal. Si no, responde 422 sin guardar (por ejemplo, 80, 100, 5.1, -0.1 o 2.96). | 0.0 a 5.0 | `CalificacionSchema.nota` y `nota_con_un_decimal` (`backend/main.py`) |
| 4. Almacenamiento | PostgreSQL guarda la nota en `calificaciones.nota NUMERIC(3,1)`, con la restricción `CHECK (nota >= 0 AND nota <= 5)`. Es la última barrera: aunque se escriba directamente en la base, -0.1, 5.1 y 80 violan el CHECK, y 100 ni siquiera cabe en `NUMERIC(3,1)` (máximo 99.9). | 0.0 a 5.0 | `backend/init.sql` |
| 5. Evaluación de alerta | Al crear la calificación, el backend calcula el promedio acumulado del estudiante **en escala 0.0–5.0, sin redondear**, y genera una alerta si es menor a 3.0. El mensaje muestra el promedio con dos decimales (por ejemplo, «Promedio académico bajo: 2.85»). | 0.0 a 5.0 | `registrar_calificacion` (`backend/main.py`) |
| 6. Consulta | La API devuelve la nota tal como está almacenada (por ejemplo, `4.3`). | 0.0 a 5.0 | `GET /calificaciones` |
| 7. Visualización | Cada pantalla multiplica la nota por 20 para mostrarla en porcentaje y redondea los promedios a números enteros (el promedio general de Análisis se muestra con un decimal). Ejemplo: 4.3 → 86 %. | 0.0 a 5.0 → 0 a 100 | Calificaciones, Estudiantes, Grupos, Actividades, Análisis, Dashboard |

### Conversiones entre escalas

| Escala oficial (0.0–5.0) | Sobre 100 (nota × 20) | Sobre 20 (nota × 4) |
|---|---|---|
| 0.0 | 0 | 0 |
| 2.5 | 50 | 10 |
| 3.0 | 60 | 12 |
| 4.0 | 80 | 16 |
| 5.0 | 100 | 20 |

- La interfaz usa solo la escala sobre 100: digita y muestra porcentajes (`aPorcentaje` = nota × 20; `aEscala5` = porcentaje ÷ 20 con un decimal).
- La escala sobre 20 no se usa en ninguna pantalla ni en la API. Se documenta como equivalencia.
- Un número como 80 o 100 nunca se guarda como nota oficial: en la interfaz es un porcentaje que se convierte a 4.0 o 5.0, y la API y la base lo rechazan si llega sin convertir.
- Con un decimal, cada décima equivale a 2 puntos porcentuales. Un porcentaje impar queda a mitad de camino y se redondea hacia arriba: 59 % se guarda como 3.0, igual que lo haría PostgreSQL. El umbral de alerta no cambia (promedio menor que 3.0).

### Equivalencias entre la escala oficial y la visualización

| Escala oficial (0.0–5.0) | Visualización (%) | Clasificación en la interfaz | Comportamiento del backend |
|---|---|---|---|
| 4.5 a 5.0 | 90 a 100 | Excelente | — |
| 4.0 a 4.4 | 80 a 89 | Bueno | — |
| 3.5 a 3.9 | 70 a 79 | Regular / Aprobado | — |
| 3.0 a 3.4 | 60 a 69 | En riesgo | No genera alerta |
| 0.0 a 2.9 | 0 a 59 | En riesgo (Crítico en la tabla de Análisis) | Genera alerta si el **promedio acumulado** es menor a 3.0 |

> Los dos umbrales son reglas aprobadas y no se contradicen: 3.5 (70 %) define la aprobación y 3.0 (60 %) define la alerta. «En riesgo» es estar por debajo de la aprobación y «Crítico», por debajo del umbral de alerta. Desde el 24/11/2026 la interfaz clasifica con el promedio exacto, igual que el backend (H-01).

### Reglas de calificación y rendimiento

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-01 | La escala oficial es de 0.0 a 5.0 con un decimal. La API rechaza con 422 los valores fuera de ese rango o con más de un decimal, y la base de datos rechaza los valores fuera de rango. | `CalificacionSchema` (`backend/main.py`); `calificaciones.nota NUMERIC(3,1)` con `CHECK (nota >= 0 AND nota <= 5)` (`backend/init.sql`). |
| RN-02 | La interfaz registra y muestra las calificaciones en porcentaje (nota × 20). Al guardar, convierte el porcentaje a la escala oficial dividiéndolo entre 20 y redondeando a un decimal, la mitad hacia arriba. | `lib/notas.ts` (`aEscala5`, `aPorcentaje`), `Calificaciones.tsx` y las pantallas que muestran promedios. |
| RN-03 | En la interfaz, una calificación se considera **aprobada** cuando es mayor o igual a 70 %, es decir, 3.5 en la escala oficial. | `Calificaciones.tsx` (indicador «Aprobados (≥70)»). |
| RN-04 | El nivel de rendimiento que muestra la interfaz se clasifica así: Excelente ≥ 90 % (4.5), Bueno ≥ 80 % (4.0), Regular ≥ 70 % (3.5) y En riesgo < 70 % (< 3.5). En la tabla de estudiantes en riesgo de Análisis, un promedio menor a 60 % (3.0) se marca como Crítico. | `Grupos.tsx`, `Analisis.tsx`, `PerformanceChart.tsx`, `RecentStudents.tsx`. |
| RN-05 | Estado del estudiante en la pantalla Estudiantes: **Crítico** si tiene alertas abiertas y promedio menor a 60 % (3.0); **En riesgo** si tiene alertas abiertas o promedio menor a 70 % (3.5); **Activo** en los demás casos. Una alerta está abierta si no está resuelta. | `Estudiantes.tsx`. |
| RN-06 | La tendencia del estudiante compara el promedio de su primer periodo con calificaciones y el del último. Si mejora, se muestra en ascenso; si empeora, en descenso; si no cambia o solo hay un periodo, estable. El margen es de 0.1 puntos de la escala oficial en Estudiantes y Dashboard, y de 2 puntos porcentuales (0.1 en la escala oficial) en Análisis. | `Estudiantes.tsx`, `RecentStudents.tsx`, `Analisis.tsx`. |
| RN-07 | Los promedios se calculan como media aritmética simple de las calificaciones; no hay ponderación por tipo de actividad ni por periodo. | Frontend (pantallas de consulta) y backend (regla de alerta). |
| RN-08 | Las calificaciones **nuevas** registradas desde la interfaz se guardan en el periodo 1; la interfaz no permite elegir el periodo. Al **editar** una calificación existente, su periodo se conserva (antes volvía a 1: H-33, corregido). | `Calificaciones.tsx` (no envía `periodo`); `POST` aplica 1 por defecto y `PUT` solo actualiza los campos enviados. |
| RN-08A | En la tabla de Calificaciones, un estudiante sin calificación se muestra con el campo vacío («—») y estado «Sin calificar» (antes «Sin calif.»), y no se guarda mientras el docente no le asigne una nota (antes se mostraba con 0 y se guardaba como 0: H-02, corregido). Una calificación almacenada de 0.0 se muestra como 0 y su estado sigue apareciendo como «Sin calificar». En los indicadores de la actividad, un estudiante sin nota sigue contando como 0 en el promedio (hallazgo H-19, pendiente). | `Calificaciones.tsx`. |
| RN-08C | Al guardar, solo se envían las calificaciones que el docente modificó (nota o «Entregado»); las demás no se tocan. Si no hay cambios, el botón «Guardar cambios» está desactivado y muestra entre paréntesis cuántas filas cambiaron. Al editar, la observación de la calificación se conserva. | `Calificaciones.tsx`, `PUT /calificaciones/{id}` (decisión D2). |
| RN-08B | La escala es fija para todo el sistema: no existe configuración para que una institución use otra escala o umbral. Adaptarla a otras instituciones se considera una mejora futura. | Valores definidos en el código y en la base de datos. |

## Alertas académicas

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-09 | **Alerta automática por bajo rendimiento.** Al crear una calificación, el sistema calcula el promedio de todas las calificaciones del estudiante (todas las materias y periodos). Si es menor a 3.0 y el estudiante **no tiene ya una alerta de bajo rendimiento abierta**, crea una alerta de tipo `low_grade`, estado `active` y mensaje «Promedio académico bajo: X.XX». Desde la decisión D3 (H-32), se consideran alertas de bajo rendimiento las de tipo `low_grade` y «Bajo Rendimiento», y se consideran abiertas las activas y las que están en revisión. Una alerta resuelta no impide crear una nueva. El umbral (3.0) y el promedio global no cambiaron. | `POST /calificaciones` (`backend/main.py`). |
| RN-10 | La regla RN-09 no se evalúa al actualizar una calificación existente, y una alerta no se resuelve automáticamente cuando el promedio mejora. | `PUT /calificaciones/{id}`. |
| RN-11 | Una alerta tiene tres estados: `active` (Activa), `reviewed` (En revisión) y `resolved` (Resuelta). El backend acepta también los nombres en español (Pendiente, Activa, En revisión, Revisada, Resuelta) y los convierte; cualquier otro valor se rechaza con error 422. | `normalize_alert_status` (`backend/main.py`). |
| RN-12 | Desde la interfaz, una alerta activa puede marcarse como revisada o resuelta, y una revisada puede resolverse. Una alerta resuelta no se puede reabrir. | `Alertas.tsx`. |
| RN-13 | El tipo de alerta es texto libre en la base de datos. La interfaz lo clasifica por palabras clave: «crítico» → Crítico; «bajo rendimiento», «low_grade» o «calificación» → Calificación baja; «inasistencia» o «asistencia» → Asistencia; cualquier otro → Tendencia. | `Alertas.tsx`. |
| RN-14 | La prioridad de la alerta no se almacena; se deriva del tipo: Crítico y Calificación baja → alta; Asistencia → media; Tendencia → baja. | `Alertas.tsx`. |

## Actividades y entregas

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-15 | Los tipos de actividad que ofrece la interfaz son tarea, examen, proyecto y participación. | `Actividades.tsx`. |
| RN-16 | Una actividad está **vencida** si su fecha de entrega es anterior a la fecha actual; en caso contrario está **pendiente**. La interfaz la marca como **completada** cuando está pendiente y todos los estudiantes del grupo tienen la entrega registrada (contando estudiantes distintos, RN-17). Una actividad vencida se sigue mostrando como vencida aunque esté completa (regla conservada por la decisión D4). La fecha de entrega se muestra en la zona horaria local, el mismo día que en la base de datos (H-30a). | `GET /actividades` (backend) y `Actividades.tsx`. |
| RN-17 | La entrega de una actividad se registra con el interruptor «Entregado» de cada calificación y se guarda en la columna `calificaciones.entregado` (H-31, corregido). Ya no se escribe en la observación. En Actividades, «entregados» cuenta **estudiantes distintos** del grupo con la entrega marcada (H-30c). **Base real:** mientras no se aplique la migración 001, la columna no existe; el backend ignora el valor y toda calificación registrada cuenta como entregada, como antes. | `Calificaciones.tsx`, `Actividades.tsx`, `backend/main.py`, migración 001. |
| RN-17A | Los indicadores del Dashboard y del panel de alertas usan los mismos criterios que el panel de administración: estudiantes con `activo = true` y alertas en estado `active` (H-25, decisión D5). El panel «Alertas tempranas» resume las cinco alertas activas más recientes, con el total en el contador y un enlace a la lista completa; las resueltas se conservan en la base de datos y se consultan en la pantalla Alertas con el filtro «Resueltas». Desde el 24/11/2026 los totales del docente se calculan solo con sus asignaciones (RN-34); los del administrador, con todo el colegio. | `lib/conteos.ts`, `Dashboard.tsx`, `AlertsPanel.tsx`, `Alertas.tsx`. |

## Estructura académica

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-18 | Al crear un grupo, la interfaz ofrece los cursos de 1.° a 5.°, secciones A y B, y los turnos Matutino y Vespertino. El año lectivo por defecto es 2026. | `Grupos.tsx`, `GrupoSchema`. |
| RN-19 | Cada estudiante pertenece a un solo grupo, y su documento es único en el sistema. | `estudiantes.grupo_id`, `UNIQUE (documento)`. |
| RN-20 | Cada materia puede tener un solo docente asignado en un mismo grupo. Un docente puede tener varias materias y varios grupos. Solo se pueden asignar usuarios activos con rol Docente. | Índice único `(materia_id, grupo_id)` y validación en `POST /asignaciones`. |
| RN-21 | Las observaciones se clasifican como Académica, Convivencial o Reconocimiento; el tipo por defecto es Convivencial. | `ObservacionesEstudiante.tsx`, columna `observaciones.tipo`. |

## Usuarios y seguridad

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-22 | No existe registro público: solo un administrador puede incorporar usuarios, mediante invitación. La invitación vence a las 48 horas y se usa una sola vez. | `POST /usuarios/invitar`, `POST /invitaciones/{token}/aceptar`. |
| RN-23 | El correo del usuario es único. No se puede invitar un correo que ya pertenece a un usuario activo. Si pertenece a un usuario desactivado, al aceptar la invitación la cuenta se reactiva con los nuevos datos. | `UNIQUE (email)`, `POST /usuarios/invitar`, `ON CONFLICT` en la aceptación. |
| RN-24 | La contraseña debe tener como mínimo 6 caracteres y se almacena con hash PBKDF2. La interfaz no permite copiar ni pegar en los campos de contraseña. | Backend (validación y hash) y `lib/passwordField.ts`. |
| RN-25 | El enlace de recuperación de contraseña vence a los 30 minutos y se usa una sola vez. La respuesta es la misma exista o no el correo, para no revelar qué cuentas existen. | `POST /auth/forgot-password`, `POST /auth/reset-password`. |
| RN-26 | Desactivar un usuario es una baja lógica (`activo = false`). Un usuario desactivado no puede iniciar sesión. | `DELETE /usuarios/{id}`, `POST /auth/login`. |
| RN-27 | La sesión dura 8 horas. Toda ruta privada de la API exige un token válido y, en cada petición, comprueba que la cuenta siga activa y con el mismo rol (H-09); si no, responde 401 y la interfaz cierra la sesión; las rutas de gestión de usuarios, métricas de usuarios y catálogo de docentes exigen rol Administrador. El permiso por asignación del docente se describe en RN-33 a RN-37. | Middleware `require_authentication` y dependencia `sesion_actual` (`main.py`). |
| RN-28 | El administrador no puede cambiar su propio rol ni desactivar su propia cuenta. **Se cumple (24/11/2026):** la API responde 403 aunque se llame directamente (compara el id del token con el de la ruta) y la interfaz deshabilita esos controles en la fila propia, marcada «(tú)» (H-18). | `PUT /usuarios/{id}/rol`, `DELETE /usuarios/{id}`, `AdminUsuarios.tsx` (`isSelf`). |

## Acceso por rol y por asignación (24/11/2026, H-08)

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-33 | El **administrador** tiene acceso general: consulta toda la información y es el único que crea, edita o elimina grupos, materias y asignaciones, y elimina estudiantes. | `solo_admin()` en las rutas de grupos, materias, asignaciones y `DELETE /estudiantes/{id}`. |
| RN-34 | El **docente** trabaja solo con sus asignaciones (tabla `asignaciones`: docente + materia + grupo). Ve las materias que tiene asignadas, los grupos donde tiene al menos una asignación y los estudiantes de esos grupos. Puede registrar y editar estudiantes solo dentro de esos grupos. | Filtros `_GRUPOS_DEL_DOCENTE` y `_MATERIAS_DEL_DOCENTE` en `GET /grupos`, `/materias`, `/estudiantes`, `/observaciones` y los conteos. |
| RN-35 | Las **actividades y calificaciones** se consultan, crean, editan y eliminan solo para una materia que el docente tiene asignada en ese grupo. Al calificar, el estudiante debe pertenecer a un grupo donde el docente tiene esa materia; si la nota se asocia a una actividad, la actividad también debe ser suya. | `tiene_asignacion()`, `exigir_calificar()`, `_exigir_actividad()`, `_exigir_calificacion()`. |
| RN-36 | Los **indicadores del docente** se calculan solo con los datos de sus asignaciones. El promedio de cada materia en cada grupo se presenta por separado («Mis asignaciones» en el Dashboard) y Análisis permite filtrar por una materia. Las fórmulas, escalas y umbrales no cambian (RN-01 a RN-14). | `MisAsignaciones.tsx`, `PerformanceChart.tsx`, `Analisis.tsx` (filtro «Materia»); la API ya entrega los datos acotados. |
| RN-37 | Un docente ve y gestiona las **alertas** de los estudiantes de sus grupos. La tabla `alertas` no guarda la materia: cuando el mensaje de la alerta nombra una materia, solo la ve el docente de esa materia en ese grupo; las alertas automáticas («Promedio académico bajo»), que se calculan con el promedio acumulado de todas las materias (RN-09, sin cambios), las ven todos los docentes del grupo. | Filtro `_ALERTA_VISIBLE` en `GET /alertas`, `/alertas/activas/count` y `_exigir_alerta()`. |
| RN-38 | Toda comprobación usa la identidad del token (`sub` y `role`); los identificadores que envía el cliente solo se aceptan si pertenecen al ámbito del usuario. Un intento fuera de ámbito responde 403 y no modifica datos. | `sesion_actual()` en `main.py`. |

## Eliminación de información

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-29 | No se puede eliminar un grupo que tenga actividades o asignaciones; al eliminar un grupo sin ellas, sus estudiantes quedan sin grupo. | `DELETE /grupos/{id}` y `ON DELETE SET NULL` en `estudiantes.grupo_id`. |
| RN-30 | Al eliminar un estudiante se eliminan también sus calificaciones, observaciones y alertas de todas las materias. Esta operación solo está disponible en la API y solo para el administrador. | `ON DELETE CASCADE` en las tablas dependientes. |
| RN-31 | No se puede eliminar una materia que tenga actividades, calificaciones o asignaciones. | `DELETE /materias/{id}`. |
| RN-32 | Al eliminar una actividad (solo por API), sus calificaciones se conservan sin actividad asociada. | `ON DELETE SET NULL` en `calificaciones.actividad_id`. |
