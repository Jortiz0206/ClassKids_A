# Matriz de cumplimiento de los 14 criterios

Estado verificado el **23/11/2026**. Las rutas son relativas a la raíz del repositorio. Una carpeta de esta entrega no cuenta como cumplimiento: cada estado se apoya en la evidencia indicada.

**Estados:** Cumplido y verificado · Parcial · Pendiente · Requiere validación del equipo · Requiere autorización.

| # | Criterio | Qué solicita | Estado | Implementación real | Documento | Evidencia | Pendientes |
|---|---|---|---|---|---|---|---|
| 1 | Documentación | RF, RNF, diagramas, MER, MR, UML, casos de uso, clases | **Cumplido y verificado** | 25 RF, 17 RNF, 16 CU, 20 HU, MER; MR de 12 tablas verificado contra la base real (tipos, nulos, valores por defecto, PK, FK, índices, `ON DELETE`); clases UML de backend y frontend; Word 3.0 | `Docs/referencia-tecnica/modelo-relacional.md`, `Docs/diagramas/`, `Docs/conceptos/` | `verificacion-mr.sql` y su salida; MR en PNG y PDF; informe de diferencias | Revisión del Word por el equipo |
| 2 | Scrum | Backlog, HU puntuadas, sprints, tareas, retrospectivas | **Parcial · Requiere información del equipo** | Reconstrucción del proceso en 6 etapas con evidencia (no son sprints históricos); backlog de 20 HU con criterios y esfuerzo **estimado retrospectivamente** (75, marcado como tal); retrospectiva de cierre con aprendizajes verificables; plantillas | `Docs/scrum/etapas-retrospectivas.md`, `product-backlog.md`, `retrospectiva-cierre.md` | Commits, documento 1.0, registro de defectos y reportes de ejecución citados en cada etapa | Puntos del equipo, responsables, sprint de cierre y reflexión personal. No se inventaron fechas, reuniones ni asignaciones |
| 3 | Backend | Inicio, rutas, validaciones, errores, códigos HTTP, estados, variables | **Cumplido y verificado** (24/11/2026) | Arranque limpio; 49 rutas; validación de entradas y errores 409/422 (H-05); manejador global; `.env` (H-17); cuenta revalidada en cada petición (H-09); permisos por rol y asignación (H-08); autoprotección del administrador (H-18) | `Docs/backend/auditoria-backend.md`, `Docs/evidencias/permisos/verificacion-api-permisos.md` | 128 pruebas pytest; 18 de 18 peticiones de permisos | H-04 pendiente de decisión funcional |
| 4 | Despliegue | Instalación, dependencias, variables, Docker, local frente a público | **Parcial · Requiere autorización** | PostgreSQL real y de pruebas en Docker; `vite build` exitoso; instalación documentada | `Docs/despliegue.md`, `README.md` | Entorno de pruebas funcionando | Dockerfiles, compose completo, plataforma, migración 001 con respaldo nuevo |
| 5 | Arquitectura | Comunicación React → API → lógica → PostgreSQL y recorrido de una operación | **Cumplido y verificado · Requiere validación del equipo** | Diagramas de capas, componentes y despliegue; recorrido de «guardar una calificación» | `Docs/referencia-tecnica/architecture.md` | `componentes.png`, `despliegue.png`, `arquitectura.png` | Relacionarla con las formaciones previas |
| 6 | IoT (bonificación) | Prototipo, recepción y protocolo | **Pendiente · No implementado** | ClassKids **no tiene integración IoT**. Búsqueda documentada (sin hallazgos); propuesta de prototipo independiente claramente marcada como propuesta | `Docs/iot/propuesta-iot.md` | — (no hay capturas, datos ni pruebas de IoT) | Que el equipo aporte su actividad de Arduino, si existe, o construya el prototipo propuesto |
| 7 | Plan de pruebas | Alcance, ambientes, tipos, casos, resultados | **Cumplido y verificado** | Plan completo; ambiente aislado (5433 / 8001 / 8081) con salvaguardas | `Docs/pruebas/plan-de-pruebas.md` | Reporte de ejecución | Responsable de aprobación |
| 8 | Pruebas unitarias | ≥ 20 unitarias reales y distintas | **Cumplido y verificado** | **55 casos unitarios** (Vitest 44 + pytest 11 funciones sin BD) | `frontend/src/test/`, `backend/tests/test_unitarias.py` | Ejecución del 23/11: todas aprobadas | — |
| 9 | Defectos | Registro completo con seguimiento | **Cumplido y verificado** | H-01 a H-40 con módulo, severidad, prioridad, estado, pasos y evidencia | `Docs/pruebas/registro-defectos.md` | Pruebas que demuestran cada corrección | Responsable de seguimiento |
| 10 | Frontend | Pantallas, rutas, navegación, colores, UX/UI | **Cumplido y verificado** | Rediseño de todas las pantallas, incluida la landing; navegación móvil con «Más»; modo claro y oscuro persistente; contraste 64/64 | `Docs/frontend/renovacion-visual.md`, `Docs/frontend/organizacion-codigo.md` | **142 capturas vigentes** por módulo (claro y oscuro, escritorio y celular) en `Docs/evidencias/capturas-v3/README.md`, insertadas en el Word v3; 28 pruebas E2E | Aprobación del equipo |
| 11 | README y API | README completo; rutas documentadas reales | **Cumplido y verificado** | README actualizado; 49 de 49 rutas verificadas contra el backend en ejecución | `README.md`, `Docs/referencia-tecnica/api-endpoints.md` | Comparación con `openapi.json` (23/11) | Confirmar el «cuarto backend» |
| 12 | Git | Ramas, historial y flujo | **Parcial · Requiere autorización** | Estado documentado y propuesta de commits | `Docs/repositorio-git.md` | `git log`, `git branch -vv` | Commits, PR y push al cierre |
| 13 | Trabajo en equipo | Integrantes, división, participación, retroalimentación | **Pendiente** (información del equipo) | Integrantes actuales y registro histórico; plantillas | `Docs/equipo/` | — | Roles, distribución real, retroalimentación |
| 14 | Backends y deuda técnica | Comparar 4 backends; deuda priorizada | **Pendiente** (backends) · deuda técnica cumplida | Deuda técnica priorizada (18 ítems); comparativa editable con espacios pendientes | `Docs/backends-comparativa.md`, `Docs/deuda-tecnica.md` | Búsqueda documentada | Lista oficial de los 4 backends y reflexión |

## Resumen

| Estado | Criterios |
|---|---|
| Cumplido y verificado | 1, 7, 8, 9, 10, 11 (y 5, con validación del equipo) |
| Parcial · Requiere autorización | 3, 4, 12 |
| Parcial · Requiere información del equipo | 2 |
| Pendiente (información del equipo) | 6 (no implementado), 13, 14 |
