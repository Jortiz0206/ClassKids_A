# Reconstrucción retrospectiva del proceso por etapas

> **Qué es este documento.** Una reconstrucción, hecha el 23/11/2026, de cómo evolucionó ClassKids a partir de la evidencia disponible: documento versión 1.0, historial de Git, hallazgos, pruebas y documentación. **No son sprints históricos formales:** no hay registros de planeaciones, reuniones, puntos ni compromisos de la época. Las fechas solo se indican cuando un archivo o un commit las respalda.

Equipo actual: Faloon Johanna Ortiz, María Alejandra Guio y Jan Llanos. Andrés Gutiérrez figura solo como autor histórico de las fichas de casos de uso de la versión 1.0.

## Resumen

| Etapa | Periodo con evidencia | Producto principal | Evidencia verificable |
|---|---|---|---|
| E-1. Análisis y requisitos | Hasta el 04/11/2025 (fecha del documento 1.0) | Idea de negocio, problema, objetivos, 13 casos de uso, requisitos | Documento versión 1.0 (archivo del equipo `ClassKids.pdf`); [`../comparativa-documentacion.md`](../comparativa-documentacion.md) |
| E-2. Diseño de la solución | Hasta el 04/11/2025 | MER inicial, diccionario de datos y arquitectura en capas; flujo del proceso | Documento versión 1.0, capítulos 5 y 6 |
| E-3 y E-4. Backend, base de datos, frontend e integración | Primer commit el 01/09/2026 (`30da6ba`, 123 archivos) | API FastAPI, `init.sql` con 12 tablas, aplicación React con 16 páginas | `git show --stat 30da6ba`. **El backend y el frontend llegaron juntos en un solo commit**, así que el historial no permite separar cuándo se hizo cada uno |
| E-4 (continuación). Ajustes y seguridad | 03/09/2026 a 16/10/2026 (commits `e5e0f75`, `c810388`, `872f55a`, `7c98b7d`, `4f7667e`) | Más grupos y datos demo, políticas legales, corrección de *open redirect* y SQL, condición de carrera en `/admin`, correo de recuperación | `git log --all` |
| E-5. Pruebas y corrección de defectos | 20/11/2026 | Auditoría (33 hallazgos), entorno de pruebas aislado, correcciones autorizadas D1–D7, migración 001 preparada (no ejecutada en la base real), 54 pruebas automatizadas | [`../hallazgos.md`](../hallazgos.md), [`../pruebas.md`](../pruebas.md), [`../migraciones/001-informe-preparacion.md`](../migraciones/001-informe-preparacion.md) |
| E-6. Renovación visual, documentación y entrega | 20/11/2026 a 23/11/2026 | Rediseño completo, modo claro y oscuro, navegación móvil, modelo relacional verificado, organización del código, 112 pruebas, carpeta de entrega | [`../frontend/renovacion-visual.md`](../frontend/renovacion-visual.md), [`../frontend/organizacion-codigo.md`](../frontend/organizacion-codigo.md), [`../pruebas/reporte-ejecucion-2026-11-20.md`](../pruebas/reporte-ejecucion-2026-11-20.md) |

Las decisiones y autorizaciones de las etapas E-5 y E-6 son del equipo.

## Historias de usuario por etapa

Las historias completas, con sus criterios de aceptación y su estado verificado, están en [`../conceptos/HUs.md`](../conceptos/HUs.md) y en el [Product Backlog](product-backlog.md).

| Etapa | Historias que materializa |
|---|---|
| E-1 y E-2 | Definición de todas las historias (HU-01 a HU-20) a partir de los casos de uso |
| E-3 y E-4 | HU-01 a HU-20: implementación inicial (inicio de sesión, usuarios, grupos, estudiantes, materias, asignaciones, actividades, calificaciones, observaciones, tablero, alertas y administración) |
| E-4 (continuación) | HU-02 (recuperación de contraseña), HU-04 (invitaciones), HU-07 y HU-08 (más grupos y estudiantes demo), políticas legales |
| E-5 | HU-12 (guardar solo lo modificado, entrega, periodo), HU-15 y HU-17 (conteos y panel de alertas), HU-07 (año lectivo), HU-08 (edición y filtros), HU-11 (fechas) |
| E-6 | Todas las historias con interfaz: rediseño, accesibilidad, celular y modo oscuro, sin cambiar sus reglas |

## Propuesta de organización para lo que queda (sprint de cierre)

Para el trabajo que falta hasta la sustentación, se propone **un sprint de cierre registrado de verdad** (plantilla en [`sprints.md`](sprints.md)), con estos elementos ya identificados:

| Elemento | Criterio | Quién lo decide o aporta |
|---|---|---|
| Revisar y aprobar la renovación visual en el entorno de pruebas | 10 | Equipo |
| Escribir la retroalimentación individual y la distribución real del trabajo | 13 | Cada integrante |
| Confirmar los cuatro backends y redactar la reflexión | 14 | Equipo |
| Aportar la actividad IoT de la formación, si existe | 6 | Equipo |
| Autorizar o no: cambios de backend, migración 001, contenedores | 3, 4 | Equipo |
| Commits por grupo lógico, PR y push | 12 | Equipo (con autorización) |
