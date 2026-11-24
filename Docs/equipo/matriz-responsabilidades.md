# Matriz de responsabilidades y actividades

Reconstrucción del 24/11/2026 a partir de los documentos, el historial de Git y las evidencias del repositorio.

**Criterio:**
- Se distingue lo **asignado formalmente** (no hay registro: los roles y responsables figuran como «PENDIENTE» en [`README.md`](README.md), [`../scrum/sprints.md`](../scrum/sprints.md) y [`../scrum/product-backlog.md`](../scrum/product-backlog.md)) de lo **comprobable** con evidencia.
- La autoría de un commit no prueba quién hizo el trabajo: indica con qué cuenta de Git se registró.
- No se asignan porcentajes de participación.

## 1. Integrantes

| Integrante | Rol documentado | Responsabilidades asignadas | Actividades comprobables | Módulos | Entregables | Evidencia |
|---|---|---|---|---|---|---|
| Johanna Ortiz (Faloon Johanna Ortiz) | No registrado (PENDIENTE) | No registradas (PENDIENTE) | Coautora de las fichas de casos de uso de la versión 1.0. Aprendiz en la portada de la versión 1.0. La identidad Git «Faloon Johanna Ortiz» registra el commit de recuperación de contraseña (16/10/2026) y los de la versión 3 (24/11/2026). | Casos de uso (v1.0); en Git: backend, frontend, pruebas y documentación de la v3 | Documento del proyecto v1.0 (casos de uso) | `Docs/conceptos/casos-de-uso.md` (autores de la v1.0), `Docs/equipo/README.md` (portada v1.0), `git shortlog` |
| Jan Llanos | No registrado (PENDIENTE) | No registradas (PENDIENTE) | Aprendiz en la portada de la versión 1.0. **No hay otra evidencia en el repositorio** (sin commits ni autoría registrada en documentos). | Sin evidencia | Sin evidencia individual | `Docs/equipo/README.md` (portada v1.0) |
| María Alejandra Guio | No registrado (PENDIENTE) | No registradas (PENDIENTE) | Coautora de las fichas de casos de uso de la versión 1.0 (como «Alejandra Guio»). Aprendiz en la portada de la versión 1.0. Sin commits en el repositorio. | Casos de uso (v1.0) | Documento del proyecto v1.0 (casos de uso) | `Docs/conceptos/casos-de-uso.md`, `Docs/equipo/README.md` |

**Cuentas de Git sin persona confirmada:**
- **«Jortiz0206»:** 4 commits del 01/09/2026 al 03/09/2026: versión completa, datos demo y políticas legales, correcciones de seguridad. Es también la cuenta propietaria del repositorio en GitHub. El nombre sugiere a Johanna Ortiz, pero ningún documento lo confirma.
- **«Fervelop»:** 1 commit del 07/09/2026 en `develop` (`7c98b7d`, «Actualizacion Backend»).

El equipo debe confirmar a quién pertenece cada cuenta.

**Registro histórico:** Andrés Gutiérrez figura como coautor de las fichas de casos de uso de la versión 1.0 y ya no forma parte del equipo.

## 2. Actividades y entregables

| Actividad | Entregables | Responsable asignado | Evidencia comprobable |
|---|---|---|---|
| Análisis del problema | Descripción general, objetivos y alcance | No registrado | `Docs/conceptos/descripcion-general.md` (v2.0 «Equipo ClassKids») |
| Requisitos | RF, RNF, reglas de negocio | No registrado | `Docs/conceptos/RFs.md`, `NFs.md`, `reglas-de-negocio.md` |
| Historias y casos de uso | HU-01 a HU-22, CU-01 a CU-16 | Casos de uso v1.0: Alejandra Guio, Andrés Gutiérrez y Johanna Ortiz | `Docs/conceptos/casos-de-uso.md` (autoría v1.0), `HUs.md` |
| Diseño y arquitectura | Arquitectura, diagramas UML, despliegue | No registrado | `Docs/referencia-tecnica/architecture.md`, `Docs/diagramas/` |
| Base de datos | `init.sql`, MER, diccionario, migración 001 | No registrado | `backend/init.sql`, `Docs/referencia-tecnica/database-schema.md`; commits de «Jortiz0206» (datos demo) y «Fervelop» (`7c98b7d`) |
| Backend | API FastAPI, permisos, validaciones | No registrado | `backend/main.py`; commits de «Jortiz0206» (septiembre) y de «Faloon Johanna Ortiz» (octubre y noviembre) |
| Frontend | Pantallas, landing, modo claro y oscuro | No registrado | `frontend/src/`; commits de «Jortiz0206» y de «Faloon Johanna Ortiz» |
| Seguridad | JWT, permisos por rol y asignación, H-08, H-09, H-18 | No registrado | `backend/tests/test_permisos.py`, `test_hallazgos_cierre.py`; `Docs/evidencias/permisos/` |
| Pruebas | pytest, Vitest y Playwright; plan y reportes | No registrado (plan: «Pendiente de asignar por el equipo») | `Docs/pruebas/`, `backend/tests/`, `frontend/src/test/`, `e2e/tests/` |
| Documentación | Word v3.1, manuales, trazabilidad | v1.0: aprendices de la portada; v2.0 y v3.x: «Equipo ClassKids» | `Docs/entregable/build_docx.py` (historial de versiones) |
| Evidencias | Capturas, video del recorrido, verificación de permisos | No registrado | `Docs/evidencias/` |
| Integración y control de versiones | Ramas `stg`, `develop` y `master` | No registrado | `Docs/repositorio-git.md`, historial de Git |
| Publicación | Repositorio en GitHub | No registrado | `origin`: `github.com/Jortiz0206/ClassKids_A` |

**Pendiente del equipo:** completar los roles y responsables en `README.md`, `scrum/sprints.md` y `product-backlog.md`, y confirmar las cuentas de Git. Sin ese registro, este documento no puede atribuir responsabilidades individuales más allá de lo indicado.
