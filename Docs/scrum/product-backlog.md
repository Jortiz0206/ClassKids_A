# Product Backlog

Historias tomadas de [`../conceptos/HUs.md`](../conceptos/HUs.md); los criterios de aceptación completos están allí. El **estado** proviene de la verificación contra el código (20/11/2026). Las columnas de **puntos, prioridad, sprint y responsable** quedan para el equipo: no se inventan.

> **Esfuerzo retrospectivo (estimado):** estimación relativa en escala Fibonacci (1, 2, 3, 5, 8), elaborada el **23/11/2026** a partir de la complejidad del código ya construido (endpoints, pantallas y reglas que implica cada historia). **No son puntos históricos del equipo** ni reemplazan su estimación: sirven como referencia para que el equipo la valide o la corrija en la columna «Puntos (equipo)».

| ID | Historia de usuario | Casos de uso / RF | Estado verificado | Esfuerzo retrospectivo (estimado) | Base de la estimación | Prioridad | Puntos (equipo) | Etapa | Responsable |
|---|---|---|---|---:|---|---|---|---|---|
| HU-01 | Inicio de sesión | CU-01, RF-01 | Cumple | 3 | JWT + PBKDF2, 1 pantalla | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-02 | Recuperación de contraseña | CU-14, RF-16 | Parcial | 5 | token de 30 min, correo SMTP, 2 pantallas | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-03 | Cierre de sesión | CU-03, RF-02 | Parcial | 1 | solo borra la sesión local | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-04 | Invitación e incorporación de usuarios | CU-02, CU-15, RF-17 | Cumple | 5 | token de 48 h, correo, pantalla de activación | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-05 | Gestión de roles | CU-02, RF-18 | Parcial | 2 | 1 endpoint y un selector | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-06 | Desactivación de usuarios | CU-02, RF-19 | Parcial | 2 | 1 endpoint, borrado lógico | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-07 | Administración de grupos | CU-04, RF-03 | Parcial | 3 | CRUD parcial, indicadores por grupo | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-08 | Registro de estudiantes | CU-05, RF-04, RF-05 | Parcial | 5 | registro, edición, filtros combinados, detalle | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-09 | Configuración de materias | CU-06, RF-20 | Parcial | 3 | catálogo con búsqueda y eliminación | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-10 | Asignación de docentes | CU-07, RF-21 | Parcial | 3 | restricción única materia–grupo | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-11 | Planificación de actividades | CU-08, RF-06 | Parcial | 5 | estado vencida/pendiente, progreso de entregas | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-12 | Registro de calificaciones | CU-09, RF-07, RF-08 | Parcial (falta elegir periodo; H-03) | 8 | conversión ÷ 20, guardado parcial, entrega, compatibilidad con la migración 001 | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-13 | Consulta del expediente académico | CU-05, RF-09 | Parcial | 3 | detalle con promedio, estado y tendencia | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-14 | Observaciones pedagógicas | CU-10, RF-14, RF-15 | Parcial | 3 | alta y listado por estudiante | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-15 | Tablero de rendimiento | CU-11, RF-10 | Parcial | 8 | 4 gráficas y agregados calculados en el cliente | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-16 | Alertas automáticas | CU-12, RF-11 | Parcial (H-04 pendiente de decisión; H-01 corregido) | 5 | regla < 3.0 y deduplicación D3 | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-17 | Seguimiento de alertas | CU-13, RF-12, RF-13 | Cumple | 3 | cambio de estado e historial | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-18 | Métricas globales | CU-16, RF-22 | Cumple | 2 | 6 conteos | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-19 | Datos globales | CU-16, RF-23 | Cumple | 3 | tablas de solo lectura con pestañas | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |
| HU-20 | Resumen del docente | CU-11, RF-24 | Cumple | 3 | indicadores y paneles del Dashboard | PENDIENTE | PENDIENTE | E-3/E-4 | PENDIENTE |

Esfuerzo retrospectivo total estimado: **75** (referencia relativa, no histórica). Etapa: todas las historias se implementaron en E-3/E-4 y se ajustaron en E-5 y E-6 (ver [`etapas-retrospectivas.md`](etapas-retrospectivas.md)).

## Elementos técnicos del backlog (no son historias)

Estos elementos provienen de [`../backlog.md`](../backlog.md) y del [registro de defectos](../pruebas/registro-defectos.md).

| Elemento | Estado | Requiere |
|---|---|---|
| Renovación visual del frontend | Terminada en el entorno de pruebas (20/11/2026) | Revisión del equipo |
| Migración 001 en la base real | Pendiente | Autorización |
| Corrección de H-01, H-05, H-08, H-09 y H-17 | Hecho (24/11/2026) | — |
| Decisión sobre H-04 | Pendiente | Decisión funcional del equipo |
| Despliegue con contenedores | Pendiente | Decisión del equipo |
