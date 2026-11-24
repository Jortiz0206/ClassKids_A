# Informe de cierre de la etapa · renovación visual y criterios de evaluación

Periodo: 20/11/2026 a 24/11/2026 · Rama `stg` · Trabajo en el entorno de pruebas (8081 → 8001 → `classkids_test`). Decisiones y autorizaciones del equipo ClassKids.

## 1. Archivos modificados (48, ya seguidos por Git)

- **Frontend: sistema visual y layout.**
  - Archivos: `index.html`, `tailwind.config.ts` y `src/index.css`.
  - Componentes: `components/layout/` (AppLayout, AppSidebar, AdminLayout, PageHeader, LoadingScreen) y `components/dashboard/` (StatCard, PerformanceChart, AlertsPanel, RecentStudents).
  - Hook: `hooks/use-mobile.tsx`.
- **Frontend: pantallas.**
  - `Auth`, `Dashboard`, `Calificaciones`, `Estudiantes`, `Grupos`, `Actividades`, `Analisis`, `Alertas`, `Materias` y `Landing`.
  - `admin/` (AdminDashboard, AdminUsuarios, AdminDatos).
  - `legal/` (5 archivos).
  - `students/ObservacionesEstudiante.tsx`: solo el tamaño de texto.
- **Documentación:**
  - `README.md` y `Docs/README.md`.
  - `Docs/backlog.md`, `Docs/pruebas.md`, `Docs/manual-usuario.md` y `Docs/hallazgos.md` (estos dos últimos aún sin seguimiento de Git).
  - `Docs/conceptos/casos-de-uso.md` y `reglas-de-negocio.md` (redacción de etiquetas), `Docs/referencia-tecnica/interfaces.md`, `Docs/conclusiones.md` y `Docs/entregable/build_docx.py`.
  - `e2e/tests/entorno.spec.ts`: un selector, por el cambio de rótulo autorizado.
- Los demás modificados (`backend/main.py`, `client.ts`, `types/index.ts` y la documentación de conceptos) vienen de etapas anteriores y se conservaron.

**No se modificó el backend en esta etapa.**

## 2. Archivos nuevos

| Grupo | Archivos |
|---|---|
| Frontend | `src/lib/notas.ts`, `src/components/common/{Mascota,EstadoBadge,Estados}.tsx`, `src/components/layout/{MobileNav.tsx,navegacion.ts}`, `src/hooks/useAlertasActivas.ts`, `src/assets/mascota-classkids.png` |
| Pruebas | `frontend/src/test/{notas,navegacion,tiempo-relativo}.test.ts`, `backend/tests/test_unitarias.py`, `e2e/tests/renovacion.spec.ts` |
| Evidencias | `Docs/evidencias/capturas-v3/` (32 capturas + `indice.json`), `Docs/evidencias/contraste-wcag.md`, `Docs/evidencias/scripts/{capturas-v3.cjs,rotular-capturas.py,contraste-wcag.py}` |
| Diagramas | `Docs/diagramas/uml-y-modelo-relacional.md`, `renderizar_mermaid.cjs` y 5 PNG (modelo relacional, clases del backend y del frontend, componentes, despliegue) |
| Documentación | `Docs/frontend/renovacion-visual.md`, `Docs/pruebas/{plan-de-pruebas,reporte-ejecucion-2026-11-20,registro-defectos}.md`, `Docs/backend/auditoria-backend.md`, `Docs/despliegue.md`, `Docs/deuda-tecnica.md`, `Docs/backends-comparativa.md`, `Docs/repositorio-git.md`, `Docs/iot/propuesta-iot.md`, `Docs/scrum/` (4), `Docs/equipo/` (4) |
| Word | `Docs/entregable/ClassKids_Documento_Proyecto_v3.docx` (la versión 2.0 se conserva) |
| Entrega | `ENTREGA_FINAL_CLASSKIDS/` (índice, matriz, este informe y 14 carpetas de criterio con enlaces) |

## 3. Módulos renovados

Inicio de sesión y recuperación, Dashboard, Estudiantes, Grupos, Materias, Actividades, Calificaciones, Análisis, Alertas, administración (Resumen, Usuarios, Datos globales), navegación de escritorio y celular, landing, páginas legales, página 404 y pantalla de carga.

## 4. Cambios visuales implementados

- **Sistema de tokens:**
  - Paleta Recreo con acentos Cuaderno vivo.
  - Verde ClassKids y azul tinta conservados.
  - Tipografía Bricolage Grotesque + DM Sans.
  - Mascota limitada a bienvenidas, estados vacíos y mensajes positivos.
- **Estados académicos:** fondo suave, texto oscuro e ícono; el rojo queda solo para alertas.
- **Navegación:** menú lateral claro, que se contrae solo en tableta; barra inferior en el celular (Inicio, Estudiantes, Calificaciones, Alertas, Más) con permisos por rol.
- **Calificaciones:**
  - Equivalencia «86 / 100 = 4.3».
  - Fila editada resaltada.
  - Tarjetas y barra de guardado en el celular.
- **Gráficas:** referencias 3.0 y 3.5, barras por nivel y escala en los tooltips.
- **Estados de interfaz:** carga, vacío, sin resultados, error con «Reintentar», validación en el inicio de sesión y mensajes de éxito.
- **Accesibilidad:** contraste 32 de 32 pares AA, texto mínimo de 12 px, foco visible y `lang="es"`.
- **Estudiantes:** paginación de 25 y filtro desde Grupos.

## 5. Funcionalidad conservada

- Autenticación JWT y roles.
- Rutas protegidas.
- Mismos endpoints y payloads.
- Escala 0.0–5.0 con conversión ÷ 20.
- Umbrales 90 / 70 / 3.5 / 3.0.
- Guardado solo de filas modificadas (D2).
- Periodo y observación conservados.
- Compatibilidad de `entregado` sin la columna.
- Conteos H-25.
- Deduplicación D3.
- Alertas resueltas consultables.
- RN-16.
- Cálculo actual del promedio (H-19, explicado en pantalla).

## 6. Pruebas ejecutadas · 7. Resultados

| Suite | Antes | Después (20/11 y repetida el 23/11) |
|---|---:|---:|
| pytest (integración + unitarias sin BD) | 24 | 42 |
| Vitest | 15 | 37 |
| Playwright | 15 | 23 |
| **Total** | **54** | **102 / 102** |

- **Pruebas unitarias reales:** 47 casos distintos.
- **Verificaciones estáticas:**
  - `tsc` sin errores.
  - `vite build` compila, con un aviso de tamaño de bloque.
  - ESLint: 0 errores desde el 24/11 (antes 83, casi todos `any` heredados; H-20). Quedan 12 avisos de `react-refresh` y `exhaustive-deps`.
- **Regresiones:** dos, ambas resueltas sin ocultar defectos (detalle en el reporte de ejecución).
- **Defectos nuevos encontrados y corregidos:** H-34 (pérdida de notas al cambiar el ancho de pantalla), H-35, H-36 y H-37. También se cerraron H-13 y H-15, y H-14 quedó parcialmente resuelto.

## 8. Capturas generadas

32 capturas en `Docs/evidencias/capturas-v3/`, de escritorio y celular, rotuladas con módulo, dispositivo, fecha y entorno. Cubren:
- inicio de sesión;
- Dashboard;
- Estudiantes, con detalle y formulario;
- Grupos, Actividades, Calificaciones (incluida la fila editada), Análisis, Alertas (con su detalle) y Materias;
- administración (3 pantallas);
- navegación móvil y menú «Más» de docente y de administrador;
- estado vacío, sin resultados y de carga;
- validación del inicio de sesión;
- mensaje de éxito;
- página 404.

Las capturas históricas no se tocaron.

## 9. Criterios cumplidos y verificados

7 (plan de pruebas), 8 (pruebas unitarias) y 9 (ejecución y defectos).

## 10. Criterios parciales o pendientes de validación

1, 5, 10 y 11 (implementados, pendientes de validación del equipo); 3, 4 y 12 (parciales, pendientes de autorización); 6 (no implementado, bonificación).

## 11. Pendientes del equipo

- Scrum: puntos, sprints, tareas y retrospectivas reales.
- Roles, distribución del trabajo y retroalimentación de cada integrante.
- Lista oficial de los cuatro backends y la reflexión.
- Formaciones previas para el criterio de arquitectura.
- Decisión sobre IoT.
- Confirmar que el «cuarto backend» es ClassKids.
- A quién pertenece cada cuenta de Git.
- Revisar y aprobar la renovación visual.

## 12. Pendientes de autorización

- Backend: H-17, H-05, manejador global de errores, H-08, H-04 y `utcnow`.
- Regla académica H-01.
- Dockerfiles, compose completo y publicación.
- Migración 001, con respaldo nuevo.
- Commits, PR y push al cierre.

## 13. Riesgos

| Riesgo | Situación |
|---|---|
| El frontend real (8080) comparte el código fuente | Mientras estuvo en ejecución mostró la interfaz renovada (Vite recarga los cambios). Usa los mismos endpoints, así que no cambia datos por sí mismo |
| Datos creados en la base real el 20/11 por la noche desde la aplicación real | El respaldo del 20/11 quedó desactualizado; se necesita un respaldo nuevo antes de migrar |
| Todo el trabajo sigue sin commit | Riesgo de pérdida; conviene hacer los commits pronto, con autorización |
| H-08 (permisos en la API) sigue abierto | Riesgo de seguridad si se publica |

## 14. Estado de Git

- Rama `stg`.
- Sin commits, push, merge ni checkout.
- `ClassKids_presentacion.pdf` sigue en el área de preparación con el mismo contenido (blob `9a291ed5e42ec1ecdbfc74ae6c9a5a79f4b45529`).
- Ningún otro archivo se preparó.

## 15. Estado de la base real

Esta etapa no la modificó y la migración 001 no se ejecutó. El 23/11 una consulta de solo lectura detectó registros creados el 20/11 (9:27–9:29 p. m., hora de Colombia) desde la aplicación real:

| Registros nuevos | Cantidad |
|---|---:|
| Grupo | 1 |
| Estudiante | 1 |
| Calificación | 1 |
| Usuario | 1 |
| Invitación | 1 |

No se identificó a la persona ni se tocaron esos datos. Tras el reinicio del equipo, el contenedor `classkids_db` volvió a arrancar solo; el backend y el frontend reales quedaron apagados y no se reiniciaron.

## 16. Ubicación de la carpeta de entrega

`ENTREGA_FINAL_CLASSKIDS/` en la raíz del repositorio. Empezar por [`00_INDICE_Y_ESTADO/README.md`](README.md) y la [matriz de cumplimiento](matriz-cumplimiento.md).

---

# Etapa final de cierre (23/11/2026)

Encargo: dejar ClassKids listo para la presentación sin rehacer lo que ya cumplía. Antes de cada cambio se comprobó que hacía falta.

## A. Lo que se conservó sin cambios

- Renovación de los módulos internos y navegación móvil.
- Calificaciones y su lógica (D2, ÷ 20, umbrales).
- Backend completo.
- Suites de pruebas existentes.
- Documentación vigente.
- Word 2.0 (histórico).
- Capturas históricas.

## B. Lo nuevo o corregido

| Tema | Qué se hizo | Archivos |
|---|---|---|
| Modo claro y oscuro (obligatorio) | Paleta oscura propia, selector en todas las pantallas y preferencia persistente (`next-themes`, clave `classkids-tema`). Gráficas, notificaciones y diálogos con colores del tema. Contraste 64/64 | `frontend/src/index.css`, `App.tsx`, `components/common/ThemeToggle.tsx`, `lib/tema.ts` y los layouts y páginas que muestran el selector |
| Landing | Rediseño real con el sistema visual. «Ver cómo funciona» llevaba al inicio de sesión (H-38, corregido). Contraste del pie corregido y textos de 8 px eliminados | `frontend/src/pages/Landing.tsx` |
| Páginas sueltas | Logo con fondo blanco reemplazado por el sello de la mascota; colores fijos (`slate`, `bg-white`, hex) reemplazados por tokens para que funcionen en oscuro | `NotFound.tsx`, `ResetPassword.tsx`, `Invitation.tsx`, `Materias.tsx`, `legal/*` |
| Mascota | Se eliminó el halo blanco del recorte (visible en oscuro) | `frontend/src/assets/mascota-classkids.png` |
| Modelo relacional | Verificado contra la **base real** (solo lectura): columnas, tipos, nulos, valores por defecto, PK, FK, índices y `ON DELETE`. Generado en versión editable, PNG y PDF, con diccionario e informe de diferencias. No muestra `entregado` | `Docs/referencia-tecnica/modelo-relacional.md`, `modelo-relacional-diferencias.md`, `Docs/diagramas/modelo-relacional.{png,pdf}`, `Docs/evidencias/scripts/verificacion-mr.sql`, `generar-modelo-relacional.py`, `Docs/evidencias/verificacion-mr-real.txt` |
| IoT | Búsqueda documentada en el repositorio, en los documentos y en las carpetas de este equipo: sin actividades de Arduino. Plantilla para la actividad real | `Docs/iot/propuesta-iot.md` |
| API | Las 49 rutas documentadas se compararon con el `openapi.json` del backend en ejecución: coinciden | `Docs/referencia-tecnica/api-endpoints.md` (sin cambios) |
| Sustentación | Guía de los 14 criterios en palabras sencillas | `00_INDICE_Y_ESTADO/guia-sustentacion.md` |
| Carpeta de entrega | `00_INDICE_Y_CONTROL` renombrada a `00_INDICE_Y_ESTADO`; estados con el vocabulario del encargo; enlaces comprobados | `ENTREGA_FINAL_CLASSKIDS/` |
| Evidencias | Primera tanda V3 en claro y oscuro (reemplazada después por la tanda definitiva fechada; ver la sección F) | `Docs/evidencias/capturas-v3/README.md` |
| Word | Versión 3.0 regenerada con el modelo relacional verificado y el modo oscuro | `Docs/entregable/ClassKids_Documento_Proyecto_v3.docx` |

## C. Limpieza de código (archivos eliminados o modificados)

| Archivo | Acción | Justificación |
|---|---|---|
| `frontend/src/App.css` | Eliminado | No lo importaba ningún archivo (estilos de una plantilla inicial, con colores contradictorios) |
| `frontend/src/test/example.test.ts` | Eliminado | Prueba de ejemplo `expect(true).toBe(true)`: no verificaba nada del sistema e inflaba el conteo |
| `frontend/src/assets/logo-ClassKids.png` | Eliminado | Sin uso tras reemplazarlo por el sello de la mascota. El favicon `public/logo-classkids.png` se conserva |
| `backend/init.sql;C/` | Eliminada (carpeta vacía) | Carpeta vacía con nombre accidental, sin seguimiento de Git |
| `Actividades.tsx`, `Estudiantes.tsx`, `Grupos.tsx` | Importaciones sin uso retiradas (`Badge`, `Progress`) | Quedaron sin uso con el rediseño |
| `Calificaciones.tsx` | Variable sin uso (`actividad`) retirada | Código muerto heredado; no cambia la lógica |

**Se conservaron a propósito:**
- `Docs/entregable/ClassKids_Documento_Proyecto_v2.docx`: histórico, referenciado en `Docs/README.md`.
- Los respaldos de `backend/backups/`.
- Las capturas históricas.
- Los componentes de la librería shadcn/ui que no se usan (en esta etapa). En la etapa siguiente se retiraron 27 tras comprobar que nadie los importaba (ver la sección F).

## D. Pruebas finales (23/11/2026)

| Suite | Línea base | 20/11 | 23/11 |
|---|---:|---:|---:|
| pytest | 24 | 42 | 42 |
| Vitest | 15 | 37 | 39 |
| Playwright | 15 | 23 | 26 |
| **Total** | **54** | **102** | **107** |

- `tsc` sin errores y `vite build` exitoso.
- Contraste 64/64.
- Casos unitarios reales: 50.
- Las pruebas E2E cubren: autenticación y roles (navegación por rol), calificaciones (guardado de filas modificadas, entrega, periodo y observación), alertas (conteo, resueltas y detalle), actividades (fechas, entregas, RN-16), filtros de estudiantes, paginación, modo claro y oscuro, landing y navegación móvil.
- **No cubiertos por pruebas automatizadas (pendiente):** crear o editar grupos, materias, actividades y observaciones desde la interfaz, invitaciones y recuperación de contraseña. Estos flujos se revisaron manualmente y con capturas, sin automatizarlos.
- No se usó la base real para ninguna prueba.

## E. Estado final

- **Git:** sin commits, push, merge ni cambio de rama. `ClassKids_presentacion.pdf` sigue en el área de preparación sin cambios.
- **Base real:** no se modificó; la migración 001 no se ejecutó.
- **Servicios reales:** no los inició ni reinició esta etapa. Al comenzar el 23/11 estaban apagados (tras el reinicio del equipo); al final de la jornada estaban de nuevo en ejecución (backend 8000 y frontend 8080), iniciados fuera de esta sesión.
- **Actividad en la base real:** una consulta de solo lectura al cierre mostró un inicio de sesión registrado el 23/11/2026 a las 16:25 UTC (11:25 a. m., hora de Colombia), hecho desde la aplicación real. Los conteos siguen iguales a los de la mañana (11 grupos, 201 estudiantes, 216 calificaciones, 9 usuarios) y `entregado` no existe. No se identificó a la persona ni se modificó el dato. Como el frontend real comparte el código, ya muestra la interfaz renovada con el modo oscuro.

# F. Organización del código, Scrum y evidencias V3 (23/11/2026)

Trabajo hecho solo en el entorno de pruebas (frontend 8081, API 8001, base `classkids_test` en 5433). No se cambiaron reglas académicas, umbrales, rutas, permisos, contratos de la API ni el diseño aprobado.

## F.1 Organización del código

Diagnóstico completo y plan por etapas en [`Docs/frontend/organizacion-codigo.md`](../../Docs/frontend/organizacion-codigo.md). Etapas ejecutadas, todas de bajo riesgo:

| Etapa | Cambio | Archivos | Verificación |
|---|---|---|---|
| E1 | La normalización de respuestas `items`/`data`/arreglo estaba copiada 33 veces; ahora es una sola función `aLista`, junto con `mapaGrupoPorEstudiante` | `frontend/src/lib/listas.ts` (nuevo) y 11 pantallas o componentes | 4 pruebas nuevas en `listas.test.ts` |
| E2 | `colorPromedio` y `getInitials` duplicados, reemplazados por `clasePromedio` e `iniciales` de `lib/notas.ts` | `Actividades.tsx`, `Estudiantes.tsx`, `lib/notas.ts` | 1 prueba nueva |
| E3 | El panel de inicio pedía 13 veces 6 recursos; ahora comparte la caché con `useRecurso` | `hooks/useRecurso.ts` (nuevo), `Dashboard.tsx`, `AlertsPanel`, `PerformanceChart`, `RecentStudents`, `useAlertasActivas` | Medido: 13 → 6 peticiones |
| E4 | 27 componentes de `components/ui` sin ningún uso, eliminados | `frontend/src/components/ui/` (quedan 19) | `tsc` y `vite build` sin errores |
| E5 | Estructura del repositorio desactualizada en la arquitectura | `Docs/referencia-tecnica/architecture.md` | Revisión contra el árbol real |
| E6 | Defectos H-39 y H-40 (abajo) | `ConfirmarAccion.tsx` (nuevo), `Materias.tsx`, `admin/AdminUsuarios.tsx` | 2 pruebas E2E nuevas |

**No se hizo (requiere autorización o es de mayor riesgo):** dividir `backend/main.py` (810 líneas), dividir las páginas de más de 400 líneas, la validación de la propia cuenta en el backend (H-18; la interfaz ya se corrigió el 24/11) y retirar las dependencias npm de los componentes eliminados.

## F.2 Defectos encontrados durante las capturas

| Id | Defecto | Corrección |
|---|---|---|
| H-39 | Eliminar una materia o desvincular una asignación no pedía confirmación; desactivar un usuario usaba el `confirm()` del navegador | Diálogo de confirmación del sistema visual (`ConfirmarAccion`). El texto dice «Desactivar», porque la API solo marca `activo = FALSE` |
| H-40 | En el celular, la tabla de Usuarios se salía de la pantalla y el botón de desactivar quedaba oculto | Lista de tarjetas en el celular; la tabla se mantiene en escritorio |

## F.3 Pruebas

| Suite | Antes de esta etapa | Después |
|---|---:|---:|
| pytest | 42 | 42 |
| Vitest | 39 | 44 |
| Playwright | 26 | 28 |
| **Total** | **107** | **114** |

Todas aprobadas antes y después de cada etapa. Casos unitarios reales: 55. `tsc` sin errores y `vite build` exitoso.

## F.4 Scrum

- [`etapas-retrospectivas.md`](../../Docs/scrum/etapas-retrospectivas.md): el proceso reconstruido en 6 etapas, cada una con la evidencia que la respalda (commits, documento 1.0, registro de defectos, reportes).
- [`product-backlog.md`](../../Docs/scrum/product-backlog.md): esfuerzo estimado de forma retrospectiva (75), identificado como estimación posterior. Los puntos del equipo y los responsables quedan PENDIENTES.
- [`retrospectiva-cierre.md`](../../Docs/scrum/retrospectiva-cierre.md): aprendizajes verificables y espacio para la reflexión de cada integrante.
- No se inventaron fechas, reuniones, asignaciones, puntos históricos ni compromisos.

## F.5 Evidencias V3

- **94 capturas reales** de 33 vistas: escritorio y celular, claro y oscuro. Índice en [`Docs/evidencias/capturas-v3/README.md`](../../Docs/evidencias/capturas-v3/README.md).
- Formato del nombre: `AAAA-MM-DD_NN_modulo_dispositivo_tema.png`.
- En cada captura se comprobó el tema (clase `dark`) y la ausencia de desplazamiento horizontal: 0 problemas.
- Incluyen estados de carga, vacío, sin resultados, error de conexión, éxito al guardar y confirmación, además del menú «Más» de cada rol.
- El guardado real en la base de pruebas se restauró y se verificó.
- Las capturas V2 (`Docs/evidencias/capturas/`) se conservaron sin tocarlas y se marcaron como **históricas, no vigentes**. (Más tarde dejaron de estar en el repositorio; ver el índice de evidencias.)

## F.6 IoT

**No implementado.** ClassKids no tiene integración IoT. [`propuesta-iot.md`](../../Docs/iot/propuesta-iot.md) contiene la búsqueda realizada y una propuesta de prototipo independiente, marcada como propuesta. No hay capturas, datos ni pruebas de IoT.

## F.7 Control al cierre

- **Base real:** consulta de solo lectura: 11 grupos, 201 estudiantes, 216 calificaciones, 9 usuarios. `entregado` no existe. El último inicio de sesión sigue siendo el de las 16:25 UTC; no hubo cambios.
- **Git:** rama `stg`; sin commits ni push; HEAD `4f7667e`. En el área de preparación solo está `ClassKids_presentacion.pdf`, sin cambios (blob `9a291ed`).

## G. Fase de seguridad, depuración y validación (24/11/2026)

**Seguridad.**
- **H-18:** la API responde 403 si el administrador intenta cambiar su propio rol o desactivarse; la interfaz ya lo impedía.
- **H-08:** cada endpoint toma la identidad del token y aplica permisos por rol y por asignación (tabla `asignaciones`: docente + materia + grupo). El docente ve y modifica solo sus grupos, materias, estudiantes, actividades, calificaciones, observaciones y alertas. Crear, editar o eliminar grupos, materias y asignaciones, y eliminar estudiantes, quedan para el administrador.
- **Limitación documentada:** las alertas no guardan la materia; su visibilidad sigue RN-37.

**Indicadores.** El Dashboard del docente incluye «Mis asignaciones» (promedio de cada materia en cada grupo) y Análisis tiene un filtro por materia. El administrador conserva la visión general. Las fórmulas y los umbrales no cambiaron.

**Interfaz.**
- Materias, Grupos y Actividades se adaptan al rol: el docente no ve acciones de catálogo, y el formulario de actividades ofrece solo sus materias en el grupo elegido.
- El panel de administración corrige dos textos («desactivar» en lugar de «eliminar»; la invitación funciona también sin correo) y el acceso «Vista docente» pasa a llamarse «Gestión académica».
- La nota bajo el video de la landing se simplificó.

**Depuración.**
- Se retiraron 28 dependencias npm y 3 componentes sin uso comprobado.
- La carpeta `frontend/Public` pasó a `frontend/public`: Vite no la encontraba y en un servidor Linux el logo y el video no se habrían publicado. En Git sigue registrada con mayúscula; se corregirá con `git mv` al consolidar.

**Pruebas.** 152 de 152 (pytest 61, Vitest 49, Playwright 42). Reporte: [`reporte-ejecucion-2026-11-24.md`](../../Docs/pruebas/reporte-ejecucion-2026-11-24.md). La base de pruebas quedó idéntica al respaldo y la base real no recibió escrituras.

**Evidencias.** Se retomaron las capturas afectadas por los permisos: 142 vigentes, con nuevas vistas del docente de una materia, del administrador y del filtro por materia. También se hizo la verificación de 18 peticiones reales a la API. El video v2 se grabó antes de H-08; se reemplazó por la v3 (sección H) y queda como respaldo histórico.

## H. Cierre visual, video final, fixtures y consolidación local (24/11/2026)

**Fixtures y entorno.**
- **H-41:** tras reiniciar el equipo, el contenedor de pruebas quedaba detenido (`restart: no`) y pytest fallaba al cargar `conftest.py` con una traza de SQLAlchemy, sin ejecutar ninguna prueba. Ahora la comprobación de la base corre en `pytest_sessionstart` y termina con un mensaje claro, y el contenedor tiene `restart: unless-stopped`.
- **H-42:** el backend respondía 500 en la primera petición después de reiniciar PostgreSQL. `database.py` usa ahora `pool_pre_ping`.
- Las suites de pytest pasan completas, archivo por archivo, en orden inverso y desde la raíz del repositorio.

**Video.**
- La v3 (118 s) reemplaza a la v2. Muestra la landing, al docente con sus asignaciones e indicadores por materia, y al administrador con la visión general, la gestión de materias y Usuarios.
- Conserva la música original (−21,5 LUFS).
- La v2 se guarda en `Docs/evidencias/video-respaldo/`.

**Presentación PDF.** `ClassKids_presentacion.pdf` se eliminó por obsoleto y no se recuperó. Ningún criterio de la rúbrica exige una presentación aparte del documento Word, así que no se generó una nueva.

**Pruebas.**
- pytest 61, Vitest 49 y Playwright 42: **152 de 152**.
- Verificación de permisos: 18 de 18.
- `tsc` sin errores, ESLint sin errores y `vite build` exitoso.
- La base de pruebas quedó idéntica al respaldo y la base real no recibió escrituras.

**Git.** Commits locales en `stg`, integrados con avance rápido en `develop` y en `master`. No hubo push ni despliegue.

