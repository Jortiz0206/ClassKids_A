# Matriz de cumplimiento de los 14 criterios

**Fecha de verificación:** 24/11/2026 (auditoría integral). Las rutas son relativas a la raíz del repositorio.

**Cómo leer la matriz:**
- Los criterios y lo que solicitan son los de la rúbrica de la evaluación (20/11/2026).
- Una carpeta de esta entrega no cuenta como cumplimiento: cada estado se apoya en la evidencia indicada.

**Columna I · D · P · E:**
- **I:** implementado.
- **D:** documentado.
- **P:** probado.
- **E:** evidenciado.
- **–:** no aplica o no existe.

**Estados:** Cumplido y verificado · Parcial · Pendiente (información del equipo) · Requiere autorización.

| # | Criterio | Qué solicita | Implementación real | Documento | Evidencia | I · D · P · E | Estado | Pendiente |
|---|---|---|---|---|---|---|---|---|
| 1 | Documentación | RF, RNF, diagramas, MER, MR, UML, casos de uso, clases | 26 RF, 18 RNF, 16 CU, 22 HU, MER, MR de 12 tablas verificado contra la base real, clases UML; Word v3 (27 capítulos y 16 anexos) | `Docs/conceptos/`, `Docs/diagramas/`, `Docs/referencia-tecnica/modelo-relacional.md`, `Docs/entregable/` | `verificacion-mr.sql` y su salida | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Revisión del Word por el equipo |
| 2 | Scrum | Backlog, HU puntuadas, sprints, tareas, retrospectivas | Backlog de 22 HU con criterios y esfuerzo estimado retrospectivamente; sprints **reconstruidos** a partir de las etapas reales; retrospectiva de cierre basada en evidencia; plantillas | `Docs/scrum/` (`sprints.md`, `product-backlog.md`, `etapas-retrospectivas.md`, `retrospectiva-cierre.md`) | Commits y entregables citados en cada sprint reconstruido | – · ✓ · – · ✓ | **Parcial · Pendiente (equipo)** | Puntos del equipo, tareas con responsable real y retrospectivas de sprint (no hay ceremonias registradas) |
| 3 | Backend | Inicio, rutas, validaciones, errores, códigos HTTP, estados, variables | 49 rutas FastAPI; validación con Pydantic (escala 0.0–5.0 estricta); errores 401/403/404/409/422/500; `.env` por entorno con verificación de `CLASSKIDS_ENTORNO`; permisos por rol y asignación | `Docs/backend/auditoria-backend.md`, `Docs/referencia-tecnica/api-endpoints.md` | 156 pruebas pytest (24/11/2026); 18 de 18 peticiones de permisos | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | H-04, pendiente de decisión funcional |
| 4 | Despliegue | Instalación, dependencias, variables, Docker, local frente a público | PostgreSQL en Docker para los entornos real, de pruebas y de demostración; `vite build` correcto; instalación y demostración reproducibles documentadas | `Docs/despliegue.md`, `README.md`, `Docs/demo/guia-demostracion.md` | `backend/docker-compose*.yml`; demostración reconstruida tres veces con la misma huella | ✓ · ✓ · ✓ · ✓ (local) | **Parcial · Requiere autorización** | Despliegue público (Dockerfiles del backend y del frontend, plataforma); migración 001 en la base real |
| 5 | Arquitectura | Comunicación React → API → lógica → PostgreSQL y recorrido de una operación | Capas, componentes y despliegue; recorrido de «guardar una calificación» | `Docs/referencia-tecnica/architecture.md` | Diagramas en `Docs/diagramas/` | ✓ · ✓ · – · ✓ | **Cumplido y verificado** | Relacionarla con las formaciones previas (equipo) |
| 6 | IoT (bonificación) | Prototipo, recepción y protocolo | **Semáforo de Comprensión:** Arduino UNO en Wokwi (LCD I2C, botones, LED y zumbador), protocolo JSON por serial a 9600 baudios y receptor en Python que valida y guarda un CSV. Independiente de ClassKids (no integrado) | `Docs/iot/propuesta-iot.md`, `ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/README.md`, `06_IOT_BONIFICACION/Propuesta-sustentacion-iot.md` | Proyecto en Wokwi; grabación de 106 s, fotogramas y captura; monitor serial copiado de Wokwi y procesado por el receptor (`registro-wokwi.txt` → `resumenes.csv`: 70 %, verde; ronda vacía; 0 inválidas); 48 pruebas automáticas; 9 de 9 manuales | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Cerrado con las evidencias disponibles: la grabación respalda el funcionamiento general; las pruebas 6 y 8 (70 % y ronda vacía) se sustentan en el registro serial, el CSV del receptor y las pruebas automáticas. La grabación original se conserva en local; en Git va una copia ligera de 3 MB |
| 7 | Plan de pruebas | Alcance, ambientes, tipos, casos, resultados | Plan con tres entornos separados (pruebas, demostración y real protegido) y salvaguardas | `Docs/pruebas/plan-de-pruebas.md` | `Docs/pruebas/reporte-ejecucion-2026-11-24.md` | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Responsable de aprobación (equipo) |
| 8 | Pruebas unitarias | ≥ 20 unitarias reales y distintas | 64 Vitest (funciones del frontend) y 11 funciones pytest sin base de datos (18 ejecuciones). No se cuentan las de integración ni las E2E | `frontend/src/test/`, `backend/tests/test_unitarias.py` | Ejecución del 24/11/2026: todas aprobadas | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | — |
| 9 | Defectos | Registro completo con seguimiento | H-01 a H-48 con módulo, severidad, prioridad, estado y evidencia; 32 corregidos, 7 parciales, 8 abiertos y 1 pendiente de decisión | `Docs/pruebas/registro-defectos.md`, `Docs/hallazgos.md` | Pruebas que demuestran cada corrección | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Responsable de seguimiento (equipo) |
| 10 | Frontend | Pantallas, rutas, navegación, colores, UX/UI | Todas las pantallas renovadas; nota de 0.0 a 5.0; modo claro y oscuro; navegación móvil; contraste 64/64 | `Docs/frontend/` | 142 capturas vigentes; video de 140 s; 44 pruebas E2E | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Aprobación del equipo |
| 11 | README y API | README completo; rutas documentadas reales | README con instalación, entornos, demostración y pruebas; 49 de 49 rutas documentadas | `README.md`, `Docs/referencia-tecnica/api-endpoints.md` | Comparación con `openapi.json` | ✓ · ✓ · ✓ · ✓ | **Cumplido y verificado** | Confirmar el «cuarto backend» (criterio 14) |
| 12 | Git | Ramas, historial y flujo | `stg`, `develop` y `master` sincronizadas en `9a8e5e4`, local y remoto, sin forzar; historial conservado (incluido el commit de «Fervelop»); skills locales excluidas | `Docs/repositorio-git.md` | `git log`, `git ls-remote` | ✓ · ✓ · – · ✓ | **Parcial · Requiere autorización** | Publicar los cambios de las etapas de demostración y de auditoría (commit y push autorizados por el equipo) |
| 13 | Trabajo en equipo | Integrantes, división, participación, retroalimentación | Integrantes actuales; matriz de asignación propuesta frente a ejecutada; planificación retrospectiva de reuniones (sin actas); formatos de acta y de retroalimentación | `Docs/equipo/` (`matriz-responsabilidades.md`, `planificacion-y-actas.md`) | Autorías de la v1.0 e identidad Git en los commits de la v3 | – · ✓ · – · parcial | **Parcial · Pendiente (equipo)** | Retroalimentación de cada integrante, participación comprobable de Jan y María Alejandra, confirmación de las cuentas de Git |
| 14 | Backends y deuda técnica | Comparar 4 backends; deuda priorizada | Deuda técnica priorizada; comparativa con 2 candidatos verificables | `Docs/backends-comparativa.md`, `Docs/deuda-tecnica.md` | Búsqueda documentada | – · ✓ · – · parcial | **Pendiente (equipo)** en backends · deuda cumplida | Lista oficial de los 4 backends de la formación y reflexión |

## Resumen

| Estado | Criterios |
|---|---|
| Cumplido y verificado | 1, 3, 5, 6, 7, 8, 9, 10, 11 |
| Parcial · Requiere autorización | 4, 12 |
| Parcial o pendiente · Requiere información del equipo | 2, 13, 14 |
