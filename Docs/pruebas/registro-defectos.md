# Registro de defectos de ClassKids

Actualizado el 20/11/2026. Consolida en un formato de seguimiento los hallazgos de [`../hallazgos.md`](../hallazgos.md), que conserva la descripción histórica completa, y agrega los defectos encontrados durante la renovación visual (H-34 a H-37). Un defecto se marca **Corregido** solo cuando existe una prueba que lo demuestra.

**Severidad** (impacto):
- **Crítica:** altera datos o permite acceso indebido.
- **Alta:** una función principal da un resultado incorrecto.
- **Media:** información confusa, rendimiento o mantenimiento.
- **Baja:** presentación.

**Prioridad:** la asignada en `hallazgos.md`.

**Estados:**
- Abierto.
- Corregido.
- Corregido parcialmente.
- Corregido en pruebas (pendiente de migración en la base real).
- Pendiente de autorización.

## 1. Resumen

| ID | Defecto | Módulo | Severidad | Prioridad | Estado | Evidencia |
|---|---|---|---|---|---|---|
| H-01 | La interfaz clasificaba con el promedio redondeado y no coincidía con la alerta del backend en el límite de 3.0 | Calificaciones / Alertas | Alta | Crítica | **Corregido** (24/11): se clasifica con el promedio exacto; los dos umbrales aprobados (3.5 aprobación, 3.0 alerta) no cambian | Vitest `notas.test.ts` (H-01) |
| H-02 | Guardar calificaciones registraba 0 a estudiantes sin nota | Calificaciones | Crítica | Crítica | **Corregido** | Playwright `calificaciones.spec.ts` (3 pruebas) |
| H-03 | Pérdida de precisión al convertir % a un decimal | Calificaciones | Media | Alta | Abierto | `lib/notas.ts` documenta la conversión; Vitest fija el comportamiento actual |
| H-04 | La regla de alerta no se evalúa al editar ni por materia | Alertas (backend) | Alta | Alta | **Pendiente de decisión funcional**: evaluar al editar contradice RN-10 (aprobada) y evaluar por materia contradice RN-09; la parte de duplicados se corrigió con H-32 | Código, RN-09, RN-10 |
| H-05 | Entradas inválidas respondían 500 | Backend | Alta | Alta | **Corregido** (24/11): validación de rangos y longitudes en los esquemas, errores de integridad con 409/422 y manejador global | pytest `test_hallazgos_cierre.py` (5 casos H-05) |
| H-06 | Calificaciones sin actividad o repetidas | Datos | Media | Alta | Abierto | Verificado con `Docs/evidencias/scripts/verificacion-bd.sql` |
| H-07 | Mes equivocado en la tendencia | Análisis | Media | Media | Abierto | Verificado |
| H-08 | El docente tenía acceso total a datos y funciones administrativas en la API | Seguridad (backend) | Crítica | Crítica | **Corregido** (24/11) | `backend/tests/test_permisos.py` (15 casos H-08); `e2e/tests/permisos.spec.ts`; `evidencias/permisos/verificacion-api-permisos.md` |
| H-09 | El token seguía sirviendo tras desactivar la cuenta o cambiar el rol | Seguridad | Alta | Alta | **Corregido** (24/11) para desactivación y cambio de rol (la cuenta se revalida en cada petición y la interfaz cierra la sesión). Cerrar sesión sigue sin revocar el token en el servidor: requiere guardar tokens o versiones de sesión (cambio de esquema, RF-02 parcial) | pytest (3 casos H-09), Vitest `client.test.ts`, Playwright `sesion.spec.ts` |
| H-10 | La interfaz no detecta una sesión vencida | Frontend | Media | Media | Abierto | Código |
| H-11 | Eliminar inexistente responde «eliminado»; borrar estudiante borra historial | Backend | Alta | Alta | Abierto | Verificado |
| H-12 | Operaciones de la API sin interfaz | Frontend | Media | Alta | Abierto | Verificado |
| H-13 | Botones sin acción en Grupos, Actividades y Estudiantes | Frontend | Baja | Baja | **Corregido** | Playwright «Grupos: Ver estudiantes del grupo…» |
| H-14 | Indicadores del Dashboard (conteos, «Activo» fijo, lista, nombre oculto) | Dashboard | Media | Media | **Corregido parcialmente** | Playwright «H-25…», «Panel de alertas…», «Ver todos…»; capturas `02_dashboard_escritorio.png` |
| H-15 | El detalle de la alerta no mostraba el mensaje ni el grupo | Alertas | Baja | Baja | **Corregido** | Playwright «Alertas: el detalle muestra el grupo y el mensaje…» |
| H-16 | Actividades: 107 peticiones y 5,2 s; sin paginación en servidor | Rendimiento | Media | Media | Abierto | Medición del 20/11/2026 |
| H-17 | `DATABASE_URL` del archivo `.env` se ignoraba | Backend | Media | Media | **Corregido** (24/11): `database.py` carga `.env` antes de leer la variable | pytest `test_hallazgos_cierre.py` (2 casos H-17) |
| H-18 | El administrador podía quitarse el rol o desactivarse | Usuarios | Alta | Alta | **Corregido** (24/11, interfaz y API) | Playwright «El administrador no puede cambiarse el rol ni desactivarse… (H-18)»; `test_permisos.py` (4 casos H-18) |
| H-19 | El promedio de la actividad cuenta como 0 a quien no tiene nota | Calificaciones | Media | Media | Abierto (se muestra la aclaración en pantalla) | Vitest `promedioActividad` fija el comportamiento actual |
| H-20 | Tipado débil (`any`) | Calidad | Media | Media | Corregido parcialmente | Suite pasa de 54 a 102 pruebas; 28 avisos `no-explicit-any` siguen |
| H-21 | El inicio de sesión revela si una cuenta existe y está desactivada | Seguridad | Baja | Baja | Abierto | Código |
| H-22 | Fechas y horas en UTC | Frontend | Baja | Baja | Corregido parcialmente | Vitest `tiempo-relativo.test.ts` (fechas relativas); «Última conexión» sigue en UTC |
| H-23 | Configuración de desarrollo expuesta | Despliegue | Media | Media | Abierto | Código; ver `despliegue.md` |
| H-24 | Errores 422 mostrados como «[object Object]» | Frontend | Media | Media | **Corregido** | Vitest `client.test.ts` (7) |
| H-25 | Conteos con criterios distintos | Dashboard / Admin | Baja | Baja | **Corregido** | Vitest `conteos.test.ts`; Playwright «H-25…» |
| H-26 | «Datos globales» mostraba una columna inexistente | Admin | Baja | Baja | **Corregido** | Playwright «H-26…» |
| H-27 | `año_lectivo` / `ano_lectivo` | Grupos | Media | Media | **Corregido** | pytest `test_grupos.py` (4); unitaria del esquema |
| H-28 | Edición de estudiante: grupo vacío y reactivación | Estudiantes | Media | Media | **Corregido** | Playwright (2) |
| H-29 | Filtro por grupo sin resultados | Estudiantes | Alta | Alta | **Corregido** | Playwright (2) |
| H-30 | Actividades: fecha −1 día, entregas duplicadas, vencidas nunca completadas | Actividades | Media | Media | **Corregido parcialmente** (b se conserva por la decisión D4, RN-16) | Vitest `fechas.test.ts`; Playwright (3) |
| H-31 | «Entregado» no persistía y se sobrescribía la observación | Calificaciones | Alta | Alta | **Corregido en pruebas**; en la base real requiere la migración 001 | pytest (6); Playwright (2) |
| H-32 | Alertas demo no coinciden con la regla | Datos | Baja | Baja | Regla corregida (D3); datos sin cambios | pytest `test_alertas.py` (8) |
| H-33 | El periodo cambiaba a 1 al guardar | Calificaciones | Alta | Alta | **Corregido** | pytest (2); Playwright |
| H-34 | Cambiar el ancho de pantalla volvía a montar la página y perdía notas sin guardar | Layout | Alta | Alta | **Corregido** | Playwright «Cambiar el ancho de la ventana no borra las notas…» |
| H-35 | «Ver todos» del Dashboard enlazaba a `/estudiantes` (ruta inexistente) | Dashboard | Media | Media | **Corregido** | Playwright «Dashboard: Ver todos…» |
| H-36 | Alertas mostraba «Hace -1 días» | Alertas | Baja | Baja | **Corregido** | Vitest `tiempo-relativo.test.ts` (4); Playwright |
| H-37 | Estados aprobados o informativos en rojo; textos < 12 px; contraste insuficiente (9 de 16 pares) | Frontend | Media | Media | **Corregido** | `contraste-wcag.md` (64/64, ambos temas); capturas `capturas-v3/` |
| H-38 | Landing: el botón «Ver cómo funciona» llevaba al inicio de sesión; textos del pie con contraste insuficiente | Landing | Baja | Baja | **Corregido** | Playwright «Landing: Ver cómo funciona lleva a la sección…»; `contraste-wcag.md` |
| H-39 | Materias: eliminar una materia o desvincular una asignación ocurría con un solo clic, sin confirmación; Usuarios usaba `confirm()` nativo con un texto inexacto («Eliminar… no se puede deshacer», cuando la API solo desactiva) | Materias / Usuarios | Media | Media | **Corregido** | Playwright «Materias y Usuarios piden confirmación… (H-39)»; capturas 26 y 31 |
| H-40 | Usuarios en celular: la tabla obligaba a desplazarse de lado y el rol y las acciones no se veían | Usuarios | Baja | Media | **Corregido** | Playwright «Usuarios en celular (H-40)»; captura 29 (celular) |
| H-41 | Tras reiniciar el equipo, el contenedor de pruebas quedaba detenido (`restart: no`) y pytest fallaba al cargar `conftest.py` con una traza de SQLAlchemy, sin ejecutar ninguna prueba | Pruebas (fixtures) | Media | Alta | **Corregido** (24/11) | `conftest.py` comprueba la base en `pytest_sessionstart` y sale con código 3 y un mensaje claro; `docker-compose.test.yml` con `restart: unless-stopped` |
| H-42 | El backend respondía 500 en la primera petición después de reiniciar PostgreSQL (conexión muerta en el pool de SQLAlchemy) | Backend | Media | Media | **Corregido** (24/11) | `create_engine(..., pool_pre_ping=True)` en `database.py`; comprobado reiniciando la base de pruebas con el backend encendido: el primer inicio de sesión responde 200 |
| H-43 | Las respuestas 401 y 403 del middleware de autenticación salían sin cabeceras CORS: el navegador las bloqueaba y la interfaz no veía el motivo | Backend | Media | Alta | **Corregido** (24/11): CORS es el middleware más externo | pytest `test_401_y_403_del_middleware_llevan_cabeceras_cors` |

**Conteo:**
- Corregidos: 26 (el 24/11/2026: H-01, H-05, H-08, H-09, H-17, H-18, H-41, H-42 y H-43).
- Corregidos parcialmente o solo en pruebas: 6.
- Abiertos: 10.
- Pendiente de decisión funcional: 1 (H-04).

## 2. Detalle de los defectos de la renovación visual

### H-34. Pérdida de datos al cambiar el ancho de pantalla
- **Severidad / prioridad:** Alta / Alta · **Módulo:** `AppLayout`, `AdminLayout`.
- **Pasos para reproducir:**
  1. Abrir Calificaciones en escritorio.
  2. Escribir una nota sin guardar.
  3. Reducir la ventana por debajo de 768 px, o girar una tableta.
- **Resultado esperado:** la nota digitada se conserva.
- **Resultado obtenido (antes):** la pantalla se volvía a montar. Se perdía la nota y se repetían todas las peticiones (24 adicionales, medidas con el script de depuración).
- **Causa:** el layout devolvía árboles distintos para celular y escritorio, y React desmontaba `<main>`.
- **Corrección:** `<main>` conserva su posición en el árbol; solo cambian los elementos de navegación alrededor.
- **Estado:** Corregido · **Evidencia:** prueba Playwright en `e2e/tests/renovacion.spec.ts`.

### H-35. Enlace «Ver todos» roto
- **Pasos:** Dashboard › «Estudiantes destacados» › «Ver todos».
- **Esperado:** abrir `/app/estudiantes`. **Obtenido (antes):** navegaba a `/estudiantes`, que muestra la página 404.
- **Corrección:** ruta `/app/estudiantes`. La tarjeta pasó a llamarse «Seguimiento de estudiantes», porque muestra los primeros de la lista y no los «destacados».
- **Estado:** Corregido · **Evidencia:** Playwright «Dashboard: Ver todos…».

### H-36. «Hace -1 días»
- **Pasos:** abrir Alertas cuando la fecha de creación queda en el futuro por la zona horaria (servidor en UTC, navegador en UTC-5).
- **Esperado:** «Hoy». **Obtenido (antes):** «Hace -1 días».
- **Corrección:** función `tiempoRelativo` en `lib/fechas.ts`, que compara días de calendario locales y nunca devuelve valores negativos.
- **Estado:** Corregido · **Evidencia:** Vitest (4) y Playwright «Alertas…».

### H-37. Color sin significado y baja legibilidad
- **Pasos:** revisar Grupos («Regular» en rojo con 70–79 %, que es aprobado), Actividades (52 «Vencida» en rojo) y Alertas (tres rojos por tarjeta). En el diagnóstico, 37–40 % de los textos medían menos de 12 px y 9 de 16 pares de color no cumplían WCAG AA.
- **Esperado:** el rojo solo para alertas y errores; texto ≥ 12 px; contraste AA.
- **Corrección:** sistema de tokens nuevo, `EstadoBadge` con ícono y 35 textos llevados a 12 px.
- **Estado:** Corregido · **Evidencia:** [`contraste-wcag.md`](../evidencias/contraste-wcag.md) (32/32) y capturas `capturas-v3/`.

### H-13 (actualización). Botones sin acción
- **Corrección:**
  - Se retiraron los botones «⋮» de Grupos y Actividades, que no tenían ninguna función.
  - «Ver detalle del grupo» pasó a ser «Ver estudiantes del grupo» y abre Estudiantes filtrado (`?grupo=`).
  - La flecha de cada fila de Estudiantes es un ícono decorativo; la fila completa abre el detalle, como antes.
- **Evidencia:** Playwright «Grupos: Ver estudiantes del grupo…».

### H-14 (actualización). Indicadores del Dashboard
- **Resuelto:**
  - Conteos (H-25).
  - Etiqueta fija «Activo»: ahora se muestra el grupo real del estudiante.
  - Nombre de materia oculto: la gráfica horizontal muestra los cinco nombres.
- **Pendiente:** la lista sigue mostrando los primeros seis estudiantes, no los que requieren atención. El título ahora lo explica.

### H-15 (actualización). Detalle de la alerta
- **Corrección:** el detalle muestra el mensaje, el grupo, el tipo, el estado, la prioridad y la fecha de creación.
- **Evidencia:** Playwright «Alertas: el detalle muestra el grupo y el mensaje…».

## 3. Seguimiento

- Los defectos «Pendiente de autorización» requieren cambios en el backend o en reglas académicas (ver [`../backend/auditoria-backend.md`](../backend/auditoria-backend.md)).
- Cada nueva ejecución de pruebas se registra en `Docs/pruebas/reporte-ejecucion-AAAA-MM-DD.md`.
- **Responsable del seguimiento:** pendiente de asignar por el equipo.
