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
| [`03_BACKEND_API`](../03_BACKEND_API/README.md) | Backend | Cumplido y verificado |
| [`04_DESPLIEGUE`](../04_DESPLIEGUE/README.md) | Despliegue | Parcial · Requiere autorización |
| [`05_ARQUITECTURA`](../05_ARQUITECTURA/README.md) | Arquitectura | Cumplido y verificado |
| [`06_IOT_BONIFICACION`](../06_IOT_BONIFICACION/README.md) | IoT (bonificación) | Cumplido y verificado: simulado en Wokwi; 9 de 9 pruebas manuales y 48 automáticas |
| [`07_PLAN_DE_PRUEBAS`](../07_PLAN_DE_PRUEBAS/README.md) | Plan de pruebas | Cumplido y verificado |
| [`08_PRUEBAS_UNITARIAS`](../08_PRUEBAS_UNITARIAS/README.md) | Pruebas unitarias | Cumplido y verificado |
| [`09_DEFECTOS`](../09_DEFECTOS/README.md) | Defectos | Cumplido y verificado |
| [`10_FRONTEND_EVIDENCIAS`](../10_FRONTEND_EVIDENCIAS/README.md) | Frontend | Cumplido y verificado |
| [`11_README_DOCUMENTACION_API`](../11_README_DOCUMENTACION_API/README.md) | README y API | Cumplido y verificado |
| [`12_REPOSITORIO_GIT`](../12_REPOSITORIO_GIT/README.md) | Git | Parcial · Requiere autorización |
| [`13_TRABAJO_EN_EQUIPO`](../13_TRABAJO_EN_EQUIPO/README.md) | Trabajo en equipo | Parcial · Requiere información del equipo |
| [`14_COMPARATIVA_BACKENDS`](../14_COMPARATIVA_BACKENDS/README.md) | Backends y deuda técnica | Pendiente (backends) · deuda técnica cumplida |

## Control

| Dato | Valor |
|---|---|
| Fecha de esta versión | 24/11/2026 (auditoría integral) |
| Rama | `stg`, `develop` y `master` sincronizadas en `9a8e5e4`; los cambios de las etapas de demostración y de auditoría están sin commit (ver criterio 12) |
| Pruebas automatizadas | 24/11/2026 (auditoría integral): pytest 156 de 156, Vitest 64 de 64, Playwright 44 de 44, pytest sobre la demostración 11 de 11, recorrido de la demostración 3 de 3 (solo lectura), IoT 38 de 38; `tsc` y ESLint sin errores (9 avisos heredados); `vite build` exitoso. Reporte: [`Docs/pruebas/reporte-ejecucion-2026-11-24.md`](../../Docs/pruebas/reporte-ejecucion-2026-11-24.md) |
| Evidencias visuales vigentes | 142 capturas reales de la versión vigente: landing, inicio de sesión, Dashboard, los ocho módulos (en `modulos/`), modo claro y oscuro y video; escritorio y celular, en [`Docs/evidencias/capturas-v3/vigente/`](../../Docs/evidencias/capturas-v3/README.md) |
| Entorno donde se validó | Pruebas aislado: frontend 8081, API 8001, base `classkids_test` (5433) |
| Base de datos real | No se modificó; migración 001 **no ejecutada**. Se detectaron registros creados desde la aplicación real el 20/11 por la noche (ver el informe de cierre); se requiere un respaldo nuevo antes de migrar |
| Requiere información del equipo | Scrum (2), formaciones previas (5), trabajo en equipo (13), los cuatro backends (14) |
| Requiere autorización | Dockerfiles y publicación (4), migración 001, commits y push (12), eliminación de los dos scripts obsoletos de capturas |
