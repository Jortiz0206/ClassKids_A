# ClassKids · Entrega final para evaluación

Proyecto formativo ADSO (SENA) · Equipo: Faloon Johanna Ortiz, María Alejandra Guio y Jan Llanos.

Esta carpeta es un **índice**. No reemplaza los archivos oficiales del proyecto: cada criterio enlaza a su ubicación en el repositorio (`backend/`, `frontend/`, `e2e/`, `Docs/`, `README.md`). No se copiaron archivos, para no crear versiones duplicadas.

## Cómo revisar

1. [`matriz-cumplimiento.md`](matriz-cumplimiento.md): estado honesto de cada criterio, su evidencia y lo que falta.
2. [`guia-sustentacion.md`](guia-sustentacion.md): cada criterio explicado en palabras sencillas y cómo demostrarlo.
3. [`informe-cierre.md`](informe-cierre.md): lo que se hizo, las pruebas, los riesgos y el estado de Git y de la base real.
4. La carpeta de cada criterio:

| Carpeta | Criterio | Estado |
|---|---|---|
| [`01_DOCUMENTACION`](../01_DOCUMENTACION/README.md) | Documentación | Cumplido y verificado |
| [`02_SCRUM_EQUIPO`](../02_SCRUM_EQUIPO/README.md) | Scrum | Parcial · Requiere información del equipo |
| [`03_BACKEND_API`](../03_BACKEND_API/README.md) | Backend | Parcial · Requiere autorización |
| [`04_DESPLIEGUE`](../04_DESPLIEGUE/README.md) | Despliegue | Parcial · Requiere autorización |
| [`05_ARQUITECTURA`](../05_ARQUITECTURA/README.md) | Arquitectura | Cumplido y verificado · Requiere validación del equipo |
| [`06_IOT_BONIFICACION`](../06_IOT_BONIFICACION/README.md) | IoT (bonificación) | Pendiente · No implementado |
| [`07_PLAN_DE_PRUEBAS`](../07_PLAN_DE_PRUEBAS/README.md) | Plan de pruebas | Cumplido y verificado |
| [`08_PRUEBAS_UNITARIAS`](../08_PRUEBAS_UNITARIAS/README.md) | Pruebas unitarias | Cumplido y verificado |
| [`09_DEFECTOS`](../09_DEFECTOS/README.md) | Defectos | Cumplido y verificado |
| [`10_FRONTEND_EVIDENCIAS`](../10_FRONTEND_EVIDENCIAS/README.md) | Frontend | Cumplido y verificado |
| [`11_README_DOCUMENTACION_API`](../11_README_DOCUMENTACION_API/README.md) | README y API | Cumplido y verificado |
| [`12_REPOSITORIO_GIT`](../12_REPOSITORIO_GIT/README.md) | Git | Parcial · Requiere autorización |
| [`13_TRABAJO_EN_EQUIPO`](../13_TRABAJO_EN_EQUIPO/README.md) | Trabajo en equipo | Pendiente (información del equipo) |
| [`14_COMPARATIVA_BACKENDS`](../14_COMPARATIVA_BACKENDS/README.md) | Backends y deuda técnica | Pendiente (backends) · deuda técnica cumplida |

## Control

| Dato | Valor |
|---|---|
| Fecha de esta versión | 23/11/2026 |
| Rama | `stg` (cambios locales sin commit; ver criterio 12) |
| Pruebas automatizadas | **152 de 152** aprobadas el 24/11/2026 (pytest 61, Vitest 49, Playwright 42); `tsc` sin errores, ESLint sin errores y `vite build` exitoso. Reporte: [`Docs/pruebas/reporte-ejecucion-2026-11-24.md`](../../Docs/pruebas/reporte-ejecucion-2026-11-24.md) |
| Evidencias visuales vigentes | 142 capturas reales de la versión vigente: landing, inicio de sesión, Dashboard, los ocho módulos (en `modulos/`), modo claro y oscuro y video; escritorio y celular, en [`Docs/evidencias/capturas-v3/vigente/`](../../Docs/evidencias/capturas-v3/README.md) |
| Entorno donde se validó | Pruebas aislado: frontend 8081, API 8001, base `classkids_test` (5433) |
| Base de datos real | No se modificó; migración 001 **no ejecutada**. Se detectaron registros creados desde la aplicación real el 20/11 por la noche (ver el informe de cierre); se requiere un respaldo nuevo antes de migrar |
| Requiere información del equipo | Scrum (2), formaciones previas (5), IoT (6), trabajo en equipo (13), los cuatro backends (14) |
| Requiere autorización | Cambios de backend (3), Dockerfiles y publicación (4), migración 001, commits y push (12) |
