
# PRODUCT BACKLOG SEGUIMIENTO FUNCIONAL
## Proyecto ClassKids – Sistema de Seguimiento Académico

**Fecha de actualización:** 24/11/2026  
**Equipo de trabajo:** Johanna Ortiz, Jan Llanos y María Alejandra Guio  
**Metodología:** Scrum  

## 1. Descripción

El Product Backlog reúne las historias de usuario que orientaron el desarrollo de ClassKids. Su propósito es organizar las funcionalidades del sistema, establecer su relación con los requisitos funcionales y los casos de uso, y facilitar el seguimiento de su implementación.

Las historias de usuario fueron tomadas del documento `../conceptos/HUs.md`, donde se encuentran sus descripciones y criterios de aceptación completos.

El backlog fue revisado frente a la implementación disponible y actualizado para reflejar el estado funcional identificado durante las verificaciones del proyecto.

## 2. Criterios de estimación y seguimiento

Para complementar la planificación del proyecto, se realizó una estimación retrospectiva del esfuerzo de cada historia de usuario, utilizando como referencia la escala Fibonacci (1, 2, 3, 5 y 8).

Esta estimación se elaboró el 23/11/2026 teniendo en cuenta la complejidad de las funcionalidades construidas, los endpoints, las pantallas, las reglas de negocio y las validaciones relacionadas.

Los valores representan una referencia de esfuerzo técnico basada en la implementación existente; no corresponden a puntos históricos registrados durante las sesiones de planificación del equipo.

Los estados se interpretan de la siguiente manera:

- **Cumple:** la funcionalidad verificada satisface el comportamiento esperado.
- **Parcial:** existe una implementación, pero presenta funcionalidades incompletas o ajustes pendientes.
- **Pendiente:** requiere una decisión, autorización o implementación adicional.

## 3. Historias de usuario

| ID | Historia de usuario | Casos de uso / RF | Estado verificado | Esfuerzo estimado | Base de la estimación | Prioridad | Puntos del equipo | Etapa | Responsable |
|---|---|---|---|---:|---|---|---|---|---|
| HU-01 | Inicio de sesión | CU-01, RF-01 | Cumple | 3 | JWT, PBKDF2 y pantalla de acceso | Alta | No registrado | E-3/E-4 | Equipo |
| HU-02 | Recuperación de contraseña | CU-14, RF-16 | Parcial | 5 | Token de 30 minutos, correo SMTP y dos pantallas | Media | No registrado | E-3/E-4 | Equipo |
| HU-03 | Cierre de sesión | CU-03, RF-02 | Parcial | 1 | Eliminación de sesión local | Alta | No registrado | E-3/E-4 | Equipo |
| HU-04 | Invitación e incorporación de usuarios | CU-02, CU-15, RF-17 | Cumple | 5 | Token de 48 horas, correo y activación | Alta | No registrado | E-3/E-4 | Equipo |
| HU-05 | Gestión de roles | CU-02, RF-18 | Parcial | 2 | Endpoint y selector de roles | Alta | No registrado | E-3/E-4 | Equipo |
| HU-06 | Desactivación de usuarios | CU-02, RF-19 | Parcial | 2 | Endpoint y borrado lógico | Media | No registrado | E-3/E-4 | Equipo |
| HU-07 | Administración de grupos | CU-04, RF-03 | Parcial | 3 | Operaciones CRUD e indicadores por grupo | Alta | No registrado | E-3/E-4 | Equipo |
| HU-08 | Registro de estudiantes | CU-05, RF-04, RF-05 | Parcial | 5 | Registro, edición, filtros y detalle | Alta | No registrado | E-3/E-4 | Equipo |
| HU-09 | Configuración de materias | CU-06, RF-20 | Parcial | 3 | Catálogo, búsqueda y eliminación | Alta | No registrado | E-3/E-4 | Equipo |
| HU-10 | Asignación de docentes | CU-07, RF-21 | Parcial | 3 | Restricción única materia-grupo | Alta | No registrado | E-3/E-4 | Equipo |
| HU-11 | Planificación de actividades | CU-08, RF-06 | Parcial | 5 | Estados de actividades y progreso de entregas | Alta | No registrado | E-3/E-4 | Equipo |
| HU-12 | Registro de calificaciones | CU-09, RF-07, RF-08 | Parcial | 8 | Conversión de calificaciones, guardado y compatibilidad con migración 001 | Alta | No registrado | E-3/E-4 | Equipo |
| HU-13 | Consulta del expediente académico | CU-05, RF-09 | Parcial | 3 | Detalle, promedio, estado y tendencia | Media | No registrado | E-3/E-4 | Equipo |
| HU-14 | Observaciones pedagógicas | CU-10, RF-14, RF-15 | Parcial | 3 | Registro y consulta por estudiante | Media | No registrado | E-3/E-4 | Equipo |
| HU-15 | Tablero de rendimiento | CU-11, RF-10 | Parcial | 8 | Cuatro gráficas y agregados calculados en el cliente | Alta | No registrado | E-3/E-4 | Equipo |
| HU-16 | Alertas automáticas | CU-12, RF-11 | Parcial | 5 | Regla de rendimiento y deduplicación D3 | Alta | No registrado | E-3/E-4 | Equipo |
| HU-17 | Seguimiento de alertas | CU-13, RF-12, RF-13 | Cumple | 3 | Cambio de estado e historial | Alta | No registrado | E-3/E-4 | Equipo |
| HU-18 | Métricas globales | CU-16, RF-22 | Cumple | 2 | Seis conteos generales | Media | No registrado | E-3/E-4 | Equipo |
| HU-19 | Datos globales | CU-16, RF-23 | Cumple | 3 | Tablas de consulta con pestañas | Media | No registrado | E-3/E-4 | Equipo |
| HU-20 | Resumen del docente | CU-11, RF-24 | Cumple | 3 | Indicadores y paneles del dashboard | Media | No registrado | E-3/E-4 | Equipo |
| HU-21 | Trabajo dentro de mis asignaciones | CU-04 a CU-13, RF-26 | Cumple | 8 | Filtros por asignación y pruebas de permisos | Alta | No registrado | E-6 | Equipo |
| HU-22 | Supervisión general | CU-16, RF-22, RF-26 | Cumple | 3 | Vista global del administrador y filtro por materia | Alta | No registrado | E-6 | Equipo |

**Esfuerzo retrospectivo total estimado: 86 puntos.**

- HU-01 a HU-20: 75 puntos.
- HU-21 y HU-22: 11 puntos.

El resultado corresponde a una estimación de referencia elaborada a partir de la complejidad técnica de las funcionalidades. No representa una puntuación histórica acordada en una sesión de planificación.

## 4. Organización por etapas

Las historias se organizaron de acuerdo con las etapas retrospectivas del desarrollo:

| Etapa | Historias relacionadas | Descripción |
|---|---|---|
| E-3/E-4 | HU-01 a HU-20 | Desarrollo de las funcionalidades principales del sistema. |
| E-5 | HU-01 a HU-20 | Ajustes, correcciones y mejoras sobre las funcionalidades implementadas. |
| E-6 | HU-01 a HU-20, HU-21 y HU-22 | Fortalecimiento de permisos, supervisión, asignaciones y ajustes generales. |

La distribución permite identificar cómo evolucionó el producto desde sus funcionalidades principales hasta la incorporación de controles de acceso y herramientas de supervisión.

La reconstrucción de estas etapas se encuentra ampliada en `etapas-retrospectivas.md`.

## 5. Elementos técnicos del backlog

Además de las historias de usuario, durante el desarrollo se identificaron actividades técnicas necesarias para mejorar la estabilidad, presentación y funcionamiento de ClassKids.

Estos elementos se gestionaron como tareas técnicas y no como historias de usuario independientes.

| Elemento técnico | Estado | Observación |
|---|---|---|
| Renovación visual del frontend | Terminada en entorno de pruebas | Se realizó la actualización visual de la plataforma. |
| Migración 001 en la base de datos real | Pendiente | Requiere autorización antes de su aplicación. |
| Corrección de H-01, H-05, H-08, H-09 y H-17 | Realizada | Correcciones registradas el 24/11/2026. |
| Decisión sobre H-04 | Pendiente | Requiere definición funcional del equipo. |
| Despliegue con contenedores | Pendiente | Su ejecución depende de la decisión del equipo. |

## 6. Trabajo colaborativo y seguimiento

El Product Backlog fue utilizado como referencia para organizar las funcionalidades, identificar necesidades técnicas y revisar el avance general de ClassKids.

La revisión del producto contempló diferentes áreas de trabajo:

- Análisis y organización de las historias de usuario.
- Relación entre historias, requisitos funcionales y casos de uso.
- Desarrollo e integración de las funcionalidades.
- Revisión de reglas de negocio y validaciones.
- Identificación de defectos y necesidades de ajuste.
- Actualización de la documentación técnica.
- Verificación del estado de las funcionalidades.

La participación de Johanna Ortiz, Jan Llanos y María Alejandra Guio se entiende dentro del desarrollo conjunto del proyecto, con responsabilidades complementarias y apoyo en las diferentes actividades.

Los responsables individuales y los puntos históricos de planificación no se atribuyen cuando no existe un registro que permita verificarlos.

## 7. Resultado de la revisión

La revisión del Product Backlog permitió consolidar 22 historias de usuario relacionadas con las funcionalidades principales y complementarias de ClassKids.

También permitió:

1. Identificar las funcionalidades implementadas y aquellas que requieren ajustes.
2. Relacionar las historias de usuario con sus respectivos casos de uso y requisitos funcionales.
3. Establecer una referencia de esfuerzo técnico para las historias.
4. Reconocer las tareas técnicas adicionales que acompañaron el desarrollo.
5. Identificar decisiones pendientes y condiciones necesarias para continuar con el proyecto.
6. Mantener una referencia común para la revisión y preparación de la sustentación.

## 8. Conclusión

El Product Backlog permitió organizar y hacer seguimiento a las funcionalidades de ClassKids durante su desarrollo. Su actualización reúne las historias de usuario, los requisitos relacionados, el estado de implementación y las necesidades técnicas identificadas.

Este documento constituye una referencia para comprender la evolución del sistema y el trabajo realizado por el equipo. También permite reconocer los aspectos que requieren decisiones o validaciones adicionales, manteniendo la coherencia entre el producto desarrollado y su documentación.

**Documento actualizado el 24 de noviembre de 2026.**
