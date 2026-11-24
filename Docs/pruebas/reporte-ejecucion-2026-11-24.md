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
