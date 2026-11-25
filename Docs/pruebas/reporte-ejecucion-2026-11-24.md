# Reporte de ejecución de pruebas — 24/11/2026

Ejecución completa después de corregir H-08 (permisos por asignación) y H-18 (autoprotección del administrador), retirar dependencias sin uso y ajustar el Dashboard, Materias, Grupos, Actividades y Análisis a los permisos por rol.

## Entorno

| Elemento | Valor |
|---|---|
| Base de datos | `classkids_test`, puerto 5433 (contenedor `classkids_test_db`) |
| Backend | FastAPI en `http://127.0.0.1:8001` |
| Frontend | Vite en `http://localhost:8081` con `VITE_API_URL=http://127.0.0.1:8001` |
| Salvaguardas | `conftest.py` exige `classkids_test` en el puerto 5433; las pruebas de interfaz se detienen si hay una petición al puerto 8000 |

## Resultados

| Suite | Comando | Resultado |
|---|---|---|
| pytest (unitarias, integración y permisos) | `cd backend && venv/Scripts/python.exe -m pytest -q` | **61 de 61** aprobadas |
| Vitest | `cd frontend && npx vitest run` | **49 de 49** aprobadas |
| Playwright | `node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts` | **42 de 42** aprobadas |
| TypeScript | `npx tsc --noEmit -p tsconfig.app.json` | Sin errores |
| ESLint | `npm run lint` | 0 errores, 9 avisos heredados (`react-refresh`, `exhaustive-deps`) |
| Compilación | `npx vite build` | Exitosa |
| Permisos de la API | `python Docs/evidencias/scripts/verificar-permisos-api.py` | **18 de 18** casos cumplen ([detalle](../evidencias/permisos/verificacion-api-permisos.md)) |

**Total: 152 pruebas automatizadas, 152 aprobadas, 0 fallidas, 0 omitidas.**

## Pruebas nuevas

| Archivo | Casos | Qué comprueban |
|---|---:|---|
| `backend/tests/test_permisos.py` | 19 | H-18: el administrador no se cambia el rol ni se desactiva (403) y sí gestiona a otros. H-08: el docente ve solo sus materias, grupos, estudiantes, notas, observaciones y alertas; no consulta, califica ni modifica fuera de sus asignaciones aunque cambie identificadores; catálogo y asignaciones solo para el administrador; el administrador conserva el acceso general. Contra la versión anterior del backend fallan 15 de las 19. |
| `e2e/tests/permisos.spec.ts` | 2 | El docente de Matemáticas ve solo su materia en «Mis asignaciones» y en la gráfica, sin «Nuevo Grupo»; el administrador conserva la visión general y el filtro por materia en Análisis. |
| `e2e/tests/materias.spec.ts` | +1 | El docente solo consulta sus materias, sin acciones de administración. |
| `e2e/tests/renovacion.spec.ts` | +1 | (Del 24/11, antes de esta ejecución) Regresión de H-18 en la interfaz. |

## Pruebas ajustadas al nuevo alcance del docente

Estas pruebas validaban otras reglas, pero fijaban el alcance anterior (el docente veía todo). Se ajustaron sin cambiar lo que verifican:

| Prueba | Ajuste |
|---|---|
| `entorno.spec.ts` | El docente demo ve sus 60 estudiantes (Grado 1A, 2A y 3A), no los 200. |
| `estudiantes.spec.ts` (H-29, H-28) | El filtro recorre los 3 grupos del docente y comprueba que no se ofrecen otros; el estudiante inactivo de prueba pertenece a Grado 3A. |
| `integracion.spec.ts` (H-30/D4, H-25, panel de alertas) | Las actividades vencidas: 52 para el administrador y 17 para el docente. Los conteos de alertas se comparan con lo que la API devuelve a cada rol. |
| `renovacion.spec.ts` (paginación, H-39, H-40) | Paginación sobre 60 estudiantes; la confirmación de borrar materias se prueba con el administrador. |
| `materias.spec.ts` | Crear, eliminar y vincular materias se prueba con el administrador. |
| `backend/tests/test_grupos.py`, `test_entorno.py` | Las escrituras de grupos usan la sesión del administrador. |

## Integridad de las bases de datos

- **Base de pruebas:** se respaldó con `pg_dump` antes de las suites que escriben. Al terminar, todas las tablas eran idénticas al respaldo; solo cambió `usuarios.last_sign_in_at` por los inicios de sesión de prueba (cuentas, roles y estado idénticos).
- **Base real (`classkids`, 5432):** solo se consultó en modo lectura. Conteos sin cambios: 11 grupos, 201 estudiantes, 216 calificaciones, 9 usuarios y 51 asignaciones.

## Módulos verificados de extremo a extremo

Inicio y cierre de sesión, Usuarios (invitación, roles, desactivación con confirmación, autoprotección), Dashboard del administrador y del docente, Grupos, Estudiantes (filtros, paginación, edición), Materias (catálogo y asignaciones), Actividades (fechas, entregas, vencidas), Calificaciones (guardado, equivalencia, entregas), Análisis (filtro por materia), Alertas (resumen, resueltas, detalle), landing (video con música y controles) y modo claro y oscuro.

## Ejecución del cierre definitivo (24/11/2026, tarde)

Después de corregir H-01, H-05, H-09, H-17 y H-43 (CORS en las respuestas 401 y 403):

| Suite | Resultado |
|---|---|
| pytest | **72 de 72** (11 nuevas en `test_hallazgos_cierre.py`; con el backend anterior fallan 7 de esas 11) |
| Vitest | **55 de 55** (6 nuevas: 3 de H-01 y 3 de H-09) |
| Playwright | **43 de 43** (nueva `sesion.spec.ts`: la sesión se cierra con el motivo al cambiar el rol, 4 de 4 repeticiones) |
| Verificación de permisos | 18 de 18 |
| TypeScript, ESLint y compilación | Sin errores (ESLint: 9 avisos heredados) |

**Total: 170 pruebas automatizadas, 170 aprobadas, 0 fallidas, 0 omitidas.** Ninguna prueba está deshabilitada (`skip`).

### Auditoría integral (24/11/2026)

| Suite | Comando | Resultado |
|---|---|---|
| pytest (`classkids_test`) | `python -m pytest` en `backend/` | **156 de 156** |
| pytest sobre la demostración | `python -m pytest tests_demo` en `backend/` (transacción que se deshace) | **11 de 11** |
| Verificación de la demostración | `python demo/generar_demo.py verificar` (solo lectura) | 11 de 11 comprobaciones en 0 |
| Vitest | `npx vitest run` en `frontend/` | **64 de 64** (nueva: H-46) |
| Playwright (entorno de pruebas) | `node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts` | **44 de 44** después de corregir H-45 y H-46 |
| Playwright (demostración) | `... -c e2e/demo/playwright.demo.config.ts -g "panel muestra\|solo sus asignaciones\|indicadores y alertas"` | **3 de 3** (solo lectura). Las 3 que escriben no se ejecutaron: requieren autorización para modificar `classkids_demo` |
| IoT | `python -m pytest ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/pruebas` | **48 de 48** (25/11/2026). Incluye el registro serial de la grabación, el monitor serial copiado de Wokwi (70 %, verde, y ronda vacía) y el receptor en una consola de Windows |
| TypeScript, ESLint y compilación | `npx tsc --noEmit -p tsconfig.app.json`, `npx eslint .`, `npx vite build` | 0 errores; 0 errores y 9 avisos heredados; compilación correcta |

**Antes de las correcciones:**
- **Primera ejecución completa de Playwright:** 43 de 44, con un fallo intermitente en la navegación móvil.
- **Ejecución de diagnóstico con trazas:** 42 de 44. Fallaron la navegación móvil (H-45, el aviso tapaba la barra) y el mensaje de sesión cerrada (H-46).
- **Después de corregirlos:** 44 de 44 en la suite completa, y las especificaciones afectadas pasaron 3 de 3 repeticiones.

### Demostración persistente y escala 0.0–5.0 en la interfaz

Etapa de demostración (`classkids_demo`), con la nota escrita en 0.0–5.0. Guía: [`../demo/guia-demostracion.md`](../demo/guia-demostracion.md).

**Entorno aislado de pruebas:**

| Suite | Resultado |
|---|---|
| pytest | **156 de 156** (28 nuevas del generador) |
| Vitest | **63 de 63** (entrada 0.0–5.0, equivalencias y diferencia en la escala oficial) |
| Playwright | **44 de 44** (Calificaciones y renovación adaptadas a la entrada 0.0–5.0) |

**Base de demostración:**

| Suite | Resultado |
|---|---|
| pytest `tests_demo` | **11 de 11** |
| Playwright `e2e/demo` | **6 de 6** |
| `generar_demo.py verificar` | 11 de 11 comprobaciones en 0 |
| Reproducibilidad | Dos generaciones con la misma semilla y fecha dieron la misma huella (`e5cbe87a…`) |
| Persistencia | La misma huella tras `docker restart` y tras `compose stop` + `up` |

**Total: 263 pruebas en el entorno aislado y 17 sobre la demostración, todas aprobadas.**

### Verificación de la escala de calificaciones (H-44)

Se revisó la escala 0.0–5.0 en todas las capas. El detalle está en [`../evidencias/escala-notas/verificacion-escala.md`](../evidencias/escala-notas/verificacion-escala.md).

| Suite | Resultado |
|---|---|
| pytest | **128 de 128** (56 nuevas en `test_escala_notas.py`; con el backend anterior fallan 12: más de un decimal, `"4.0"` y `true`) |
| Vitest | **59 de 59** (4 nuevas de escala y equivalencias) |
| Playwright | **44 de 44** (nueva prueba de escala en `calificaciones.spec.ts`) |
| TypeScript y ESLint | Sin errores (ESLint: 9 avisos heredados) |

**Total: 231 pruebas automatizadas, 231 aprobadas, 0 fallidas, 0 omitidas.**

**Fallos encontrados durante el cierre, y su corrección:**
- Evaluar la alerta al editar hizo fallar `test_editar_una_nota_no_evalua_la_regla`, que documenta RN-10 (aprobada). Se revirtió ese cambio y H-04 quedó pendiente de decisión funcional.
- La primera versión de `sesion.spec.ts` no veía el 401 porque el middleware respondía sin cabeceras CORS (H-43). Se corrigió el orden de los middlewares.
- La segunda falló una vez por una carrera entre peticiones simultáneas que sobrescribían el motivo. Ahora se conserva el primer motivo, con una prueba unitaria nueva.
- En ningún caso se cambió una expectativa para ocultar un defecto.

**Bases de datos:** la base de pruebas quedó idéntica al respaldo tras cada ejecución con escritura (salvo las horas de inicio de sesión). Cuando una prueba interrumpida dejó un rol cambiado, se restauró y se verificó la base tabla por tabla. La base real solo se consultó en lectura (11/201/216/9).

