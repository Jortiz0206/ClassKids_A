
# SCRUM – CRITERIO 2
## Proyecto ClassKids – Sistema de Seguimiento Académico

**Fecha de actualización:** 24/11/2026  
**Integrantes:** Johanna Ortiz, Jan Llanos y María Alejandra Guio  
**Metodología de referencia:** Scrum  
**Estado del criterio:** Parcial

---

## 1. Introducción

ClassKids es un sistema de seguimiento académico desarrollado como proyecto de formación del programa Análisis y Desarrollo de Software (ADSO) del SENA.

Durante su desarrollo se realizaron actividades de análisis, diseño, programación, integración, pruebas y documentación. Para organizar las funcionalidades se utilizaron historias de usuario, un Product Backlog y mecanismos de seguimiento de los avances.

En la documentación inicial del proyecto, correspondiente a la versión 1.0 de noviembre de 2025, se estableció una metodología de desarrollo por fases y una arquitectura en capas. Por esta razón, no se presenta el proceso completo como una aplicación histórica de Scrum, ya que no existen registros suficientes que permitan demostrar la ejecución formal de todos sus eventos.

Este documento reúne los elementos de organización relacionados con Scrum, explica cómo se relacionan con el desarrollo de ClassKids y diferencia las evidencias disponibles de las reconstrucciones retrospectivas.

## 2. Objetivo de la aplicación de Scrum

Organizar el desarrollo de ClassKids mediante elementos de planificación, seguimiento y revisión que permitan identificar las funcionalidades necesarias, reconocer los avances del producto y establecer oportunidades de mejora.

Entre los objetivos específicos se encuentran:

- Organizar las funcionalidades mediante historias de usuario.
- Mantener un Product Backlog que permita consultar las necesidades del sistema.
- Relacionar las funcionalidades con los requisitos y casos de uso.
- Identificar el estado de implementación de cada historia.
- Revisar los avances y detectar aspectos que necesitan ajustes.
- Fortalecer la comunicación y la colaboración entre los integrantes.
- Reconocer los aprendizajes obtenidos durante el desarrollo.

## 3. Fundamentos de Scrum

Scrum es un marco de trabajo ágil que permite organizar proyectos mediante ciclos de trabajo, colaboración, revisión frecuente y adaptación.

Sus elementos principales son:

| Elemento | Descripción | Relación con ClassKids |
|---|---|---|
| Product Backlog | Lista ordenada de funcionalidades y necesidades del producto. | Se consolidaron 22 historias de usuario. |
| Sprint | Periodo de trabajo con un objetivo definido. | El desarrollo se organizó históricamente por fases; no se cuenta con registros suficientes de sprints formales. |
| Sprint Planning | Espacio para definir el objetivo y el trabajo del sprint. | No hay actas históricas de planificación formal. |
| Daily Scrum | Reunión breve para revisar el avance y ajustar el trabajo. | No se encontraron registros verificables de reuniones diarias. |
| Sprint Review | Revisión del incremento del producto. | Se realizaron verificaciones funcionales, pero no hay actas formales de revisión de sprint. |
| Sprint Retrospective | Reflexión sobre el proceso y definición de mejoras. | Se elaboró una retrospectiva de cierre basada en los aprendizajes del proyecto. |
| Incremento | Resultado funcional que se incorpora al producto. | Se construyeron módulos y funcionalidades que conforman ClassKids. |

Estos conceptos permiten explicar la relación entre Scrum y las actividades desarrolladas, sin confundir las fases del proyecto con los sprints formales.

## 4. Organización de los roles

Scrum contempla tres responsabilidades principales: Product Owner, Scrum Master y Developers.

En los documentos históricos de ClassKids no se encontró una asignación formal de estos roles. Por lo tanto, se presenta la siguiente matriz como una descripción de las responsabilidades y la participación del equipo, no como una designación histórica comprobada de roles Scrum.

| Responsabilidad Scrum | Aplicación en el proyecto |
|---|---|
| Product Owner | No se documentó una persona designada formalmente. La definición de necesidades y funcionalidades se trabajó mediante el análisis del proyecto y las historias de usuario. |
| Scrum Master | No se documentó una persona designada formalmente. La organización y el seguimiento del proceso se abordaron mediante los documentos y actividades de desarrollo. |
| Developers | Johanna Ortiz, Jan Llanos y María Alejandra Guio, como integrantes del equipo encargado de construir y revisar el producto. |

### 4.1. Participación del equipo

Las responsabilidades de referencia se organizaron de manera complementaria:

| Integrante | Áreas de participación |
|---|---|
| Johanna Ortiz | Desarrollo, integración, revisión funcional y consolidación de documentación. |
| Jan Llanos | Aspectos de estructura técnica, diseño y revisión del proyecto. |
| María Alejandra Guio | Análisis, organización de requisitos y documentación. |
| Equipo completo | Revisión general, apoyo entre integrantes y preparación de la presentación del proyecto. |

Esta distribución busca reconocer las diferentes áreas de participación sin establecer comparaciones entre los integrantes ni atribuir tareas individuales que no estén respaldadas por registros.

## 5. Product Backlog

El Product Backlog es el documento que reúne las funcionalidades que se consideran necesarias para ClassKids.

Se consolidaron 22 historias de usuario, relacionadas con los casos de uso y requisitos funcionales del sistema.

Las historias abarcan las siguientes áreas:

| Área funcional | Historias relacionadas | Funcionalidades |
|---|---|---|
| Acceso y usuarios | HU-01 a HU-06 | Inicio y cierre de sesión, recuperación de contraseña, invitaciones, roles y desactivación de usuarios. |
| Gestión académica | HU-07 a HU-14 | Grupos, estudiantes, materias, asignación de docentes, actividades, calificaciones, expedientes y observaciones. |
| Análisis y seguimiento | HU-15 a HU-20 | Tablero de rendimiento, alertas, seguimiento de alertas, métricas, datos globales y resumen docente. |
| Control y supervisión | HU-21 y HU-22 | Trabajo dentro de las asignaciones y supervisión general. |

### 5.1. Estimación del esfuerzo

El 23/11/2026 se elaboró una estimación retrospectiva del esfuerzo de las historias utilizando la escala Fibonacci:

**1, 2, 3, 5 y 8.**

El resultado fue de 86 puntos estimados:

- HU-01 a HU-20: 75 puntos.
- HU-21 y HU-22: 11 puntos.

Esta estimación se realizó a partir de la complejidad de las funcionalidades construidas, los endpoints, las pantallas y las reglas de negocio.

Es importante aclarar que los 86 puntos no corresponden a una estimación histórica realizada por el equipo durante una ceremonia de Sprint Planning. Se utilizan como referencia técnica retrospectiva.

El detalle de cada historia, su estado, su esfuerzo estimado y su relación con los requisitos se encuentra en:

`product-backlog.md`

## 6. Organización del desarrollo por etapas

La revisión del proceso permitió reconstruir seis etapas, identificadas como E-1 a E-6.

Estas etapas representan la evolución del proyecto y permiten relacionar las actividades realizadas con los resultados disponibles.

No deben interpretarse como seis sprints históricos de Scrum.

| Etapa | Actividad principal | Resultado |
|---|---|---|
| E-1 | Análisis y definición | Identificación de la necesidad y alcance inicial del sistema. |
| E-2 | Diseño y organización | Definición de requisitos, estructura y elementos de diseño. |
| E-3 | Desarrollo inicial | Construcción de funcionalidades principales. |
| E-4 | Integración y ampliación | Incorporación de módulos y conexión de componentes. |
| E-5 | Pruebas y ajustes | Identificación de defectos y correcciones. |
| E-6 | Mejoras y cierre | Fortalecimiento de permisos, supervisión y consolidación del proyecto. |

La reconstrucción detallada se encuentra en:

`etapas-retrospectivas.md`

## 7. Sprint Planning y organización del trabajo

La planificación de un sprint permite establecer un objetivo y seleccionar el trabajo que se realizará durante un periodo determinado.

En ClassKids no se encontraron actas históricas que permitan confirmar la realización de ceremonias formales de planificación de sprints.

Sin embargo, el proyecto cuenta con elementos que permiten comprender cómo se organizó el trabajo:

- Identificación de las necesidades del sistema.
- Elaboración de historias de usuario.
- Organización de funcionalidades en un backlog.
- Desarrollo progresivo de los módulos.
- Revisión de funcionalidades y corrección de defectos.
- Organización de las mejoras para el cierre del proyecto.

### 7.1. Relación entre las etapas y el trabajo desarrollado

| Etapa | Objetivo de trabajo | Resultado relacionado |
|---|---|---|
| E-1 y E-2 | Definir el problema, los requisitos y la estructura del sistema. | Documentación inicial y diseño. |
| E-3 y E-4 | Construir e integrar las funcionalidades principales. | Módulos académicos y administrativos. |
| E-5 | Revisar el funcionamiento e identificar defectos. | Registro de hallazgos y pruebas. |
| E-6 | Fortalecer el sistema y consolidar los resultados. | Ajustes de permisos, supervisión y documentación. |

Esta organización es retrospectiva y no reemplaza un registro de planificación de sprints que no existe.

## 8. Sprint Backlog y seguimiento de tareas

El Sprint Backlog contiene el trabajo seleccionado para alcanzar el objetivo de un sprint.

En el desarrollo histórico de ClassKids no se encontró un registro completo que permita reconstruir tareas, responsables y compromisos de cada sprint.

Para el seguimiento del proyecto se dispone de otros elementos:

| Elemento | Utilidad |
|---|---|
| Historias de usuario | Identificar las funcionalidades solicitadas. |
| Product Backlog | Consultar el conjunto de necesidades y su estado. |
| Historial de Git | Revisar los cambios registrados en el repositorio. |
| Registro de defectos | Identificar problemas y correcciones. |
| Documentación de pruebas | Consultar las verificaciones realizadas. |
| Etapas retrospectivas | Comprender la evolución del desarrollo. |

La relación entre las tareas, sus responsables y las evidencias individuales debe interpretarse de acuerdo con los registros disponibles. No se atribuyen asignaciones históricas sin respaldo documental.

## 9. Incrementos del producto

Un incremento representa una parte funcional del producto que se incorpora al sistema.

Durante el desarrollo de ClassKids se construyeron funcionalidades correspondientes a diferentes áreas.

La siguiente tabla agrupa los resultados funcionales identificados en el Product Backlog. No representa una secuencia de entregas por sprint, sino una descripción de los componentes del producto.

| Incremento funcional | Funcionalidades incluidas | Estado general |
|---|---|---|
| Acceso y administración | Autenticación, usuarios, invitaciones, roles y recuperación de contraseña. | Mixto: historias cumplidas y parciales. |
| Gestión académica | Grupos, estudiantes, materias, docentes, actividades y calificaciones. | Parcial. |
| Expediente y observaciones | Consulta del expediente académico y registro de observaciones. | Parcial. |
| Análisis del rendimiento | Tablero, indicadores y resumen docente. | Mixto: historias cumplidas y parciales. |
| Alertas académicas | Generación y seguimiento de alertas. | Mixto: generación parcial y seguimiento cumplido. |
| Control y supervisión | Filtros por asignación y supervisión general. | Cumple según las verificaciones registradas. |

La clasificación se basa en los estados individuales de las historias de usuario. Por eso, un área puede incluir funcionalidades terminadas y otras que todavía requieren ajustes.

## 10. Verificación y revisión del producto

La revisión del producto permite comprobar si las funcionalidades desarrolladas responden a las necesidades establecidas.

En ClassKids se realizaron actividades de revisión funcional y técnica que permitieron identificar comportamientos implementados, defectos y necesidades de ajuste.

Entre los aspectos revisados se encuentran:

- Funcionamiento de los módulos principales.
- Acceso y permisos de los usuarios.
- Gestión de estudiantes y grupos.
- Registro y consulta de información académica.
- Comportamiento de las calificaciones.
- Generación y seguimiento de alertas.
- Indicadores y visualización de información.
- Coherencia entre el código y la documentación.

También se registraron correcciones relacionadas con H-01, H-05, H-08, H-09 y H-17 el 24/11/2026.

Estas verificaciones sirven como evidencia de revisión del producto, pero no deben confundirse con actas formales de Sprint Review.

## 11. Retrospectiva y mejora continua

La retrospectiva permite reflexionar sobre el proceso de desarrollo, identificar dificultades y reconocer oportunidades de mejora.

Para ClassKids se elaboró una retrospectiva de cierre basada en los aprendizajes y situaciones identificadas durante el proyecto.

### 11.1. Aspectos positivos

- Se logró construir una plataforma con diferentes módulos para el seguimiento académico.
- Las historias de usuario permitieron organizar las funcionalidades.
- La integración de componentes permitió avanzar hacia un sistema más completo.
- Las revisiones ayudaron a identificar errores y realizar correcciones.
- La documentación se fortaleció para mantener coherencia con el producto.
- El desarrollo permitió adquirir experiencia en programación, análisis, pruebas y trabajo en equipo.

### 11.2. Dificultades identificadas

- La organización inicial se documentó por fases y no mediante registros completos de Scrum.
- No se conservaron actas de todas las actividades de seguimiento.
- Algunas funcionalidades necesitaron ajustes después de su implementación.
- Fue necesario revisar la relación entre requisitos, historias de usuario y código.
- La distribución individual de algunas actividades no quedó registrada de manera completa.

### 11.3. Oportunidades de mejora

- Definir objetivos concretos para cada ciclo de trabajo.
- Registrar las tareas y responsabilidades del equipo.
- Mantener actualizado el Product Backlog.
- Realizar revisiones periódicas de las funcionalidades.
- Documentar los acuerdos y decisiones importantes.
- Fortalecer la comunicación y el apoyo entre los integrantes.

El documento ampliado se encuentra en:

`retrospectiva-cierre.md`

## 12. Organización del cierre del proyecto

Para la etapa final de ClassKids se establece como objetivo consolidar el producto, revisar los elementos pendientes y preparar la sustentación.

Esta organización corresponde a una propuesta de cierre y no a un sprint histórico ya ejecutado.

| Actividad de cierre | Resultado esperado |
|---|---|
| Revisar las historias de usuario | Mantener sus estados de acuerdo con el código. |
| Revisar las correcciones | Comprobar los defectos corregidos y sus evidencias. |
| Verificar la documentación | Mantener coherencia entre requisitos, código y entregables. |
| Revisar el funcionamiento | Preparar una demostración de los módulos disponibles. |
| Preparar la sustentación | Organizar la explicación del proyecto y la participación de los integrantes. |
| Identificar pendientes | Reconocer las decisiones y autorizaciones que todavía se necesitan. |

La migración 001 en la base de datos real, la decisión funcional sobre H-04 y el despliegue con contenedores se mantienen identificados como pendientes según el registro técnico.

## 13. Estado documental de los eventos Scrum

La siguiente tabla resume qué elementos se encuentran documentados y cuáles no cuentan con evidencia histórica suficiente.

| Evento o elemento | Estado | Observación |
|---|---|---|
| Product Backlog | Elaborado | Contiene 22 historias de usuario. |
| Sprint Planning | Sin registro formal | Se cuenta con planificación por etapas. |
| Sprint Backlog | Parcial | Existen historias, estados y evidencias, pero no un registro histórico completo de tareas por sprint. |
| Daily Scrum | Sin registro disponible | No se encontraron actas de reuniones diarias. |
| Incrementos | Identificados | Se describen las funcionalidades construidas y sus estados. |
| Sprint Review | Verificación funcional disponible | No se encontraron actas formales de revisión de sprint. |
| Sprint Retrospective | Retrospectiva de cierre elaborada | No se presentan retrospectivas históricas sin evidencia. |

## 14. Evidencias y documentos relacionados

Los siguientes archivos complementan la información presentada en este criterio:

| Documento | Contenido |
|---|---|
| `../conceptos/HUs.md` | Historias de usuario y criterios de aceptación. |
| `product-backlog.md` | Historias, estados y estimación retrospectiva del esfuerzo. |
| `sprints.md` | Organización y reconstrucción del proceso por etapas. |
| `etapas-retrospectivas.md` | Descripción de las etapas E-1 a E-6. |
| `retrospectiva-cierre.md` | Aprendizajes, dificultades y oportunidades de mejora. |
| `retrospectivas.md` | Formato de apoyo para registrar retrospectivas. |
| `../backlog.md` | Seguimiento de funcionalidades y tareas técnicas. |
| `../repositorio-git.md` | Referencia al historial de cambios del repositorio. |
| `../pruebas/registro-defectos.md` | Registro de defectos y correcciones. |

## 15. Conclusiones

El desarrollo de ClassKids permitió aplicar elementos de organización ágil para identificar las necesidades del sistema, estructurar sus funcionalidades y revisar progresivamente los resultados.

La construcción del Product Backlog y las historias de usuario facilitó la identificación de las funcionalidades principales. La revisión del código y las pruebas permitieron reconocer avances, corregir defectos y establecer necesidades de mejora.

Aunque no se dispone de registros suficientes para demostrar la ejecución formal de todos los eventos de Scrum, la reconstrucción del proceso permite comprender cómo evolucionó el producto y qué herramientas de organización se utilizaron.

El proyecto también permitió reconocer la importancia de mantener una comunicación constante, distribuir responsabilidades, documentar los acuerdos y revisar periódicamente los resultados.

Como equipo, Johanna Ortiz, Jan Llanos y María Alejandra Guio cuentan con una base de trabajo que reúne el producto desarrollado, su documentación y los aprendizajes obtenidos durante el proceso formativo.

**Estado final del criterio: Parcial.**

La documentación de los artefactos y de la evolución del producto está consolidada; la evidencia histórica de ceremonias y sprints formales continúa siendo limitada.

---

**Documento actualizado:** 24 de noviembre de 2026.  
**Proyecto:** ClassKids – Sistema de Seguimiento Académico.  
**Programa:** Análisis y Desarrollo de Software (ADSO) – SENA.
