
# SPRINTS Y TAREAS
## Proyecto ClassKids – Sistema de Seguimiento Académico

**Fecha de actualización:** 24/11/2026  
**Integrantes:** Johanna Ortiz, Jan Llanos y María Alejandra Guio  
**Estado documental:** Reconstrucción retrospectiva y planificación de cierre.

## 1. Introducción

Este documento presenta la reconstrucción académica de los bloques de trabajo identificados durante el desarrollo de ClassKids, organizados utilizando la estructura de referencia de Scrum.

La documentación inicial del proyecto estableció un desarrollo por fases. Posteriormente, la evolución de la versión 3 permitió identificar diferentes bloques de trabajo mediante los documentos, los cambios del repositorio, las pruebas y los entregables disponibles.

Por esta razón, los seis bloques presentados a continuación se denominan sprints reconstruidos, pero no representan sprints históricos cuya planificación y ejecución formal hayan sido registradas.

Las fechas son estimadas, los responsables son referencias de organización y los objetivos se describen a partir de los resultados identificados.

## 2. Método de reconstrucción

Para organizar los bloques de trabajo se tuvieron en cuenta los siguientes elementos:

- Documento inicial de ClassKids, versión 1.0.
- Plan de ejecución por fases.
- Historias de usuario y requisitos funcionales.
- Historial de cambios del repositorio Git.
- Registro de hallazgos y defectos.
- Pruebas realizadas.
- Documentación técnica y entregables de la versión 3.

La reconstrucción permite explicar la evolución del proyecto, pero no reemplaza registros históricos de planificación, reuniones, estimaciones o asignaciones individuales.

## 3. Reconstrucción académica de los sprints

| Sprint reconstruido | Periodo estimado | Objetivo | Historias relacionadas | Entregable identificado | Responsable de referencia | Estado documental |
|---|---|---|---|---|---|---|
| S1. Análisis | Octubre de 2025 | Identificar el problema, los objetivos y los requisitos del sistema. | Definición inicial de HU-01 a HU-20 | Casos de uso y requisitos de la versión 1.0. | María Alejandra Guio | Entregable identificado |
| S2. Diseño | Octubre-noviembre de 2025 | Definir el modelo de datos y la arquitectura. | Base de las historias del sistema | MER, diccionario de datos y arquitectura en capas (04/11/2025). | Jan Llanos | Entregable identificado |
| S3. Construcción | Agosto-septiembre de 2026 | Avanzar en la construcción del backend, base de datos y frontend. | HU-01 a HU-20 | Registro inicial de desarrollo, commit `30da6ba` del 01/09/2026. | Johanna Ortiz, como referencia | Evidencia de desarrollo |
| S4. Ajustes y seguridad | Septiembre-octubre de 2026 | Incorporar ajustes técnicos, seguridad y funcionalidades complementarias. | HU-02, HU-04, HU-07 y HU-08, entre otras relacionadas | Cambios registrados entre septiembre y octubre de 2026. | Johanna Ortiz, como referencia | Evidencia de cambios |
| S5. Pruebas y defectos | Noviembre de 2026 | Revisar el funcionamiento, identificar defectos y realizar correcciones. | HU-07, HU-08, HU-11, HU-12, HU-15 y HU-17 | Registro de hallazgos, defectos D1-D7 y documentación de pruebas. | Johanna Ortiz, como referencia | Evidencias de revisión |
| S6. Renovación, cierre y demostración | Noviembre de 2026 | Mejorar la presentación del sistema, fortalecer permisos y preparar la entrega. | Historias relacionadas con la interfaz y funcionalidades del sistema. | Versión 3, documentación Word, carpeta de entrega y base de demostración. | Johanna Ortiz, como referencia de ejecución declarada; IoT: Jan Llanos, propuesto. | Avances identificados; actividades pendientes por cerrar |

**Nota sobre los responsables:** los nombres incluidos corresponden a referencias de organización reconstruidas a partir de la información disponible. No constituyen un registro histórico de asignaciones formales ni una medición de la participación individual.

### 3.1. Resultados de la reconstrucción

La organización de los seis bloques permite identificar la evolución general de ClassKids:

1. Definición de las necesidades del sistema.
2. Diseño de la estructura y los datos.
3. Construcción de las funcionalidades.
4. Incorporación de ajustes técnicos y de seguridad.
5. Revisión del funcionamiento y corrección de defectos.
6. Renovación, documentación y preparación de la entrega.

Esta reconstrucción muestra el recorrido del proyecto desde su documentación inicial hasta la versión 3.

## 4. Historias de usuario relacionadas

Los bloques de trabajo se relacionan con las historias de usuario del Product Backlog.

Las historias HU-01 a HU-20 corresponden al conjunto principal de funcionalidades. Posteriormente, HU-21 y HU-22 incorporaron necesidades de control de asignaciones y supervisión general durante E-6.

La relación completa se encuentra en:

`product-backlog.md`

Los criterios de aceptación se encuentran en:

`../conceptos/HUs.md`

Los estados de cumplimiento se mantienen de acuerdo con la verificación de la implementación y no se modifican únicamente por aparecer en un sprint reconstruido.

## 5. Estimación y seguimiento

No se encontraron registros históricos suficientes para determinar los puntos de historia comprometidos y terminados en cada uno de los bloques.

El Product Backlog contiene una estimación retrospectiva de 86 puntos, elaborada el 23/11/2026.

Esta estimación sirve como referencia técnica, pero no permite afirmar que el equipo haya comprometido o completado esa cantidad de puntos durante sprints anteriores.

| Elemento de seguimiento | Situación documental |
|---|---|
| Historias de usuario | 22 historias consolidadas. |
| Puntos históricos por sprint | No disponibles. |
| Estimación retrospectiva | 86 puntos. |
| Tareas históricas por responsable | No existe un registro completo. |
| Horas estimadas y reales | No disponibles. |
| Evidencias de desarrollo | Documentación, repositorio y pruebas. |
| Seguimiento diario | No se encontraron registros verificables. |

## 6. Ceremonias Scrum

Durante la revisión documental no se encontraron actas que permitan confirmar la realización de ceremonias formales de Scrum para los bloques reconstruidos.

| Ceremonia | Estado | Observación |
|---|---|---|
| Sprint Planning | Sin registro histórico | No se encontraron actas de planificación. |
| Daily Scrum | Sin registro histórico | No se dispone de seguimiento diario documentado. |
| Sprint Review | Sin actas formales | Existen verificaciones funcionales del producto. |
| Sprint Retrospective | Sin registros por sprint | Se elaboró una retrospectiva de cierre del proyecto. |

Las actividades de revisión y los documentos disponibles permiten explicar el seguimiento del producto, pero no deben presentarse como evidencia de ceremonias que no fueron registradas.

## 7. Propuesta de organización para el cierre

Con base en las actividades identificadas en la revisión del proyecto, se establece una propuesta de trabajo para la etapa final.

Esta propuesta no representa una asignación histórica ni una declaración de actividades ya realizadas. Su objetivo es organizar los aspectos que requieren revisión, validación o decisión del equipo.

| Actividad | Criterio de evaluación | Insumo disponible | Resultado esperado |
|---|---:|---|---|
| Revisar la renovación visual en el entorno de pruebas | 10 | `Docs/frontend/renovacion-visual.md` y `Docs/evidencias/capturas-v3/` | Validación del diseño y su coherencia con la plataforma. |
| Consolidar la documentación Scrum | 2 | `product-backlog.md`, `sprints.md` y `retrospectivas.md` | Documentación organizada y coherente. |
| Completar la retroalimentación individual | 13 | `Docs/equipo/` | Reflexiones elaboradas y confirmadas por cada integrante. |
| Revisar los cuatro backends del programa y la reflexión | 14 | `Docs/backends-comparativa.md` | Comparación y explicación de los conocimientos adquiridos. |
| Revisar la propuesta IoT | 6 | `Docs/iot/propuesta-iot.md` | Decisión sobre su alcance y posible demostración. |
| Revisar la auditoría de backend y la migración 001 | 3 y 4 | `Docs/backend/auditoria-backend.md` y `Docs/despliegue.md` | Decisión técnica y autorización correspondiente. |
| Revisar el README y la carpeta de entrega | 11 | `README.md` y `ENTREGA_FINAL_CLASSKIDS/` | Entrega organizada y documentación actualizada. |
| Revisar commits y flujo de ramas | 12 | `Docs/repositorio-git.md` | Revisión final del historial y organización del repositorio. |

### 7.1. Criterios para cerrar las actividades

Para considerar cerrada cada actividad se deberá comprobar que:

- El resultado esperado esté disponible.
- La documentación coincida con la implementación.
- Las evidencias correspondan a la versión revisada.
- Las decisiones pendientes estén identificadas.
- Los integrantes conozcan los resultados y puedan explicarlos durante la sustentación.

## 8. Relación con otros documentos

Este documento se complementa con los siguientes archivos:

| Archivo | Relación |
|---|---|
| `product-backlog.md` | Historias de usuario, estados y esfuerzo estimado. |
| `etapas-retrospectivas.md` | Reconstrucción detallada de las etapas E-1 a E-6. |
| `retrospectiva-cierre.md` | Aprendizajes y oportunidades de mejora. |
| `retrospectivas.md` | Formato para registrar futuras retrospectivas. |
| `../conceptos/HUs.md` | Historias de usuario y criterios de aceptación. |
| `../conceptos/plan-ejecucion.md` | Organización inicial del desarrollo por fases. |
| `../repositorio-git.md` | Evidencias del historial de cambios. |
| `../pruebas/registro-defectos.md` | Registro de defectos y correcciones. |

## 9. Conclusión

La reconstrucción de los bloques de trabajo permite comprender cómo evolucionó ClassKids desde el análisis y diseño inicial hasta la construcción, revisión y preparación de la entrega.

Aunque el desarrollo no cuenta con registros históricos completos de sprints y ceremonias Scrum, sí existen elementos que permiten identificar las funcionalidades construidas, los cambios realizados y los resultados obtenidos.

La organización retrospectiva facilita explicar el proceso de desarrollo, reconocer las responsabilidades complementarias y establecer una propuesta para el cierre del proyecto.

También permite identificar una oportunidad de mejora para futuros proyectos: registrar desde el inicio los objetivos de cada sprint, las tareas, los responsables, las estimaciones, las revisiones y las retrospectivas.

**Estado documental al 24/11/2026:** reconstrucción académica elaborada y propuesta de cierre identificada. No se certifica la ejecución histórica de seis sprints formales.

---
**Proyecto:** ClassKids – Sistema de Seguimiento Académico  
**Programa:** Análisis y Desarrollo de Software (ADSO) – SENA  
**Integrantes:** Johanna Ortiz, Jan Llanos y María Alejandra Guio
