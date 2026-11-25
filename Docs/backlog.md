
# Backlog técnico de ClassKids

**Proyecto:** ClassKids – Sistema de Seguimiento Académico  
**Estado actualizado:** 24 de noviembre de 2026  
**Tipo de documento:** Seguimiento técnico de implementación, hallazgos y mejoras.

## 1. Introducción

Este documento reúne las tareas técnicas relacionadas con el desarrollo, mantenimiento, corrección y preparación de ClassKids. Incluye los hallazgos identificados durante las revisiones, las correcciones realizadas, las pruebas ejecutadas, las evidencias disponibles y las actividades que todavía requieren atención.

Su organización toma como referencia las columnas del GitHub Project:

- **Done:** tareas y correcciones completadas.
- **Evidence:** verificaciones y soportes del trabajo realizado.
- **In progress:** actividades iniciadas que todavía no se han cerrado.
- **Backlog:** tareas técnicas pendientes y mejoras futuras.

Los identificadores H-xx corresponden a los hallazgos documentados en `hallazgos.md`.

Este documento complementa el `product-backlog.md`, pero no lo reemplaza:

- `product-backlog.md`: contiene las historias de usuario, su estimación, prioridad y estado de cumplimiento.
- `backlog.md`: contiene las tareas técnicas, hallazgos, correcciones, pruebas, evidencias y pendientes de implementación.

## 2. Done – Actividades completadas

### 2.1. Autenticación y seguridad

- [x] Autenticación de administrador y docente mediante JWT, con contraseñas protegidas mediante PBKDF2 (8 horas registradas).
- [x] Protección de rutas privadas y rutas administrativas según el rol.
- [x] Invitación de usuarios y activación de cuentas (CU-02, CU-15).
- [x] Recuperación de contraseña mediante token persistente con vigencia de 30 minutos (CU-14).
- [x] Cambio de rol y desactivación lógica de usuarios.
- [x] Corrección de la autoprotección del administrador en la interfaz (H-18, 24/11/2026), con comparación de identificadores usando el mismo tipo de dato y prueba E2E.
- [x] Implementación de la protección correspondiente en el backend (H-18, 24/11/2026), con respuesta 403 en la API.
- [x] Corrección de la revalidación de la cuenta en cada petición (H-09, 24/11/2026).
- [x] Corrección de la configuración del archivo `.env` (H-17, 24/11/2026).
- [x] Corrección de CORS en respuestas 401 y 403 (H-43, 24/11/2026).

### 2.2. Módulos académicos

- [x] Grupos: creación y consulta con indicadores (CU-04).
- [x] Estudiantes: registro, edición, búsqueda, filtrado y consulta de detalles (CU-05).
- [x] Materias: creación, búsqueda y eliminación (CU-06).
- [x] Asignaciones docente–materia–grupo con control de duplicados (CU-07).
- [x] Actividades: creación y consulta con estado y progreso (CU-08).
- [x] Registro de calificaciones por actividad para todo el grupo (CU-09).
- [x] Registro de observaciones por estudiante (CU-10).
- [x] Dashboard del docente y tablero de análisis (CU-11).
- [x] Generación de alertas automáticas por promedio inferior a 3.0 (CU-12).
- [x] Cambio de estado de las alertas (CU-13).
- [x] Panel de administración con métricas y datos globales (CU-16).
- [x] Páginas públicas y políticas legales.
- [x] Datos de demostración: 10 grupos, 200 estudiantes, 52 actividades y 215 calificaciones.

### 2.3. Correcciones de hallazgos

- [x] Corrección de H-02, H-24, H-25, H-26, H-27, H-28, H-29, H-31 y H-33, con verificaciones en código y base de pruebas.
- [x] Corrección parcial de H-30, relacionada con D4.
- [x] Ajuste de la regla de H-32, relacionado con D3.
- [x] Corrección de H-01, relacionada con la clasificación del promedio exacto (24/11/2026).
- [x] Corrección de H-05, relacionada con validaciones y respuestas de error del backend (24/11/2026).
- [x] Corrección de H-09, relacionada con la revalidación de la cuenta (24/11/2026).
- [x] Corrección de H-17, relacionada con `.env` (24/11/2026).
- [x] Corrección de H-43, relacionada con CORS en respuestas 401 y 403 (24/11/2026).
- [x] Panel «Alertas Tempranas» con visualización de alertas activas y acceso al historial de alertas resueltas.
- [x] Correcciones verificadas durante la renovación visual: H-13, H-15, H-34, H-35, H-36 y H-37.
- [x] Corrección parcial de H-14.

**Nota:** los hallazgos con cumplimiento parcial conservan sus actividades residuales en la sección de pendientes. No se consideran completamente cerrados por haber recibido una corrección parcial.

### 2.4. Pruebas y calidad

- [x] Suite inicial de 54 pruebas automatizadas: pytest (24), Vitest (15) y Playwright (15), todas aprobadas en esa etapa.
- [x] Ampliación de la suite a 102 pruebas: pytest (42), Vitest (37) y Playwright (23), todas aprobadas en esa etapa.
- [x] Identificación de 47 casos unitarios reales dentro de la revisión correspondiente.
- [x] Ampliación posterior de la suite a 107 pruebas.
- [x] Organización del código y actualización de la suite a 114 pruebas.
- [x] Organización de utilidades compartidas.
- [x] Reducción de peticiones del Dashboard, de 13 a 6.
- [x] Retiro de 27 componentes sin uso.
- [x] Confirmaciones de cambios relacionadas con H-39.
- [x] Corrección de la visualización de Usuarios en dispositivos celulares (H-40).

Las cantidades anteriores corresponden a diferentes etapas de ejecución. El último registro disponible indica una suite de 114 pruebas. No deben sumarse entre sí porque representan la evolución de la misma suite.

### 2.5. Renovación visual y organización del código

- [x] Renovación visual completa del frontend en el entorno de pruebas (23/11/2026).
- [x] Implementación del modo claro y oscuro en la plataforma.
- [x] Rediseño de la landing page.
- [x] Verificación del modelo relacional frente a la base de datos real.
- [x] Generación del modelo relacional en PNG y PDF, junto con su diccionario de datos.
- [x] Organización del código en las etapas E1–E6.
- [x] Documentación de la renovación visual en `frontend/renovacion-visual.md`.
- [x] Organización de evidencias de la versión 3, con 94 capturas.
- [x] Reconstrucción documental de Scrum a partir de las etapas reales del proyecto.

### 2.6. Documentación y entrega

- [x] Documentación versión 2.0 alineada con el código: documento Word, carpeta Docs y README.
- [x] Informe de preparación de la migración 001 en `migraciones/001-informe-preparacion.md`.
- [x] Documentación de los 14 criterios de evaluación.
- [x] Organización de la carpeta de entrega final en `../ENTREGA_FINAL_CLASSKIDS/`.
- [x] Actualización de las evidencias y documentos correspondientes a la versión 3.

## 3. Evidence – Evidencias disponibles

Las siguientes referencias permiten consultar los soportes técnicos y documentales del proyecto.

| Evidencia | Ubicación o referencia |
|---|---|
| Verificaciones del 20/11/2026: 34 verificaciones, 14 aprobadas, 18 fallidas y 2 observaciones | `pruebas.md` |
| Auditoría de integración entre capas | `referencia-tecnica/integracion.md` |
| Verificación de base de datos en DBeaver | `evidencias/scripts/verificacion-bd.sql` |
| Capturas de pantallas de la versión 3 | `evidencias/capturas-v3/README.md` |
| Scripts reproducibles | `evidencias/scripts/` |
| Diagramas generados desde la implementación | `diagramas/` |
| Informe de preparación de migración | `migraciones/001-informe-preparacion.md` |
| Documentación de renovación visual | `frontend/renovacion-visual.md` |
| Evidencias de la versión 3 | `evidencias/capturas-v3/` |
| Carpeta de entrega final | `../ENTREGA_FINAL_CLASSKIDS/00_INDICE_Y_ESTADO/README.md` |

**Observación:** las capturas de la versión 2 ya no están en el repositorio como evidencia vigente. La referencia actual corresponde a las capturas de la versión 3.

## 4. In progress – Actividades en curso

- [ ] Aplicar la migración 001 en la base de datos real, pendiente de autorización.
- [ ] Definir y documentar la decisión funcional correspondiente a H-04, relacionada con la evaluación de alertas al editar calificaciones y por materia.
- [ ] Completar las actividades pendientes de cierre que dependan de decisiones o autorizaciones del equipo.

### Decisión sobre la escala académica

El 20/11/2026 se registró la decisión de utilizar la escala académica oficial de 0.0 a 5.0, que corresponde a la escala utilizada por el backend y la base de datos.

Esta decisión debe mantenerse como referencia para las validaciones, promedios, indicadores y alertas del sistema.

## 5. Backlog – Actividades pendientes

Las siguientes tareas corresponden a actividades técnicas que requieren implementación, revisión, autorización o decisión.

### 5.1. Prioridad crítica

- [ ] Resolver la diferencia pendiente entre los umbrales de la interfaz y la regla de alertas del backend, únicamente si la revisión funcional confirma que todavía existe una inconsistencia.
- [x] Restringir por rol las materias, asignaciones y gestión de grupos, y filtrar por las asignaciones del docente (H-08, 24/11/2026).

### 5.2. Prioridad alta

- [ ] Definir la regla definitiva de alertas por materia y establecer si deben evaluarse nuevamente cuando se actualizan las calificaciones (H-04).
- [ ] Evaluar, según la decisión funcional, la incorporación de `materia_id` en la tabla `alertas` para evitar depender del texto del mensaje al determinar la materia relacionada (RN-37).
- [ ] Responder 404 al eliminar registros inexistentes y revisar la implementación de la baja lógica de estudiantes (H-11).
- [ ] Incorporar en la interfaz las opciones pendientes de edición y eliminación de grupos, actividades y materias, desactivación de estudiantes y creación manual de alertas (H-12).
- [ ] Revisar la precisión de las notas y depurar calificaciones duplicadas o sin actividad, únicamente con la autorización correspondiente (H-03 y H-06).
- [ ] Ampliar las pruebas automatizadas a los módulos que todavía no cuentan con cobertura suficiente.
- [ ] Ejecutar los casos pendientes del plan de pruebas y registrar sus resultados.

### 5.3. Prioridad media

- [ ] Corregir el mes mostrado en la tendencia del tablero (H-07).
- [ ] Incorporar filtros adicionales al tablero de análisis.
- [ ] Manejar adecuadamente el vencimiento del token en la interfaz (H-10).
- [ ] Definir y documentar la configuración segura de `JWT_SECRET` para los entornos de ejecución y despliegue.
- [ ] Completar los aspectos pendientes de H-14, relacionados con la etiqueta fija «Activo» y la visualización limitada a los seis primeros estudiantes.
- [ ] Revisar el cálculo del promedio de la actividad (H-19).
- [ ] Reducir las peticiones del módulo de Actividades (H-16), si la revisión del estado actual confirma que todavía existe margen de optimización.
- [ ] Reducir los usos de `any` y resolver los errores pendientes de ESLint (H-20).
- [ ] Endurecer la configuración de seguridad antes de realizar un despliegue (H-23).

### 5.4. Prioridad baja

- [ ] Revisar las alertas de los datos de demostración que no siguen la regla establecida (H-32). Cualquier modificación de estos datos requiere autorización.
- [ ] Completar las actividades residuales de los hallazgos que tengan cumplimiento parcial, después de verificar su estado actual.

### 5.5. Nuevas funcionalidades fuera del alcance actual del MVP

Las siguientes propuestas se consideran posibles ampliaciones del sistema. No forman parte de las funcionalidades necesarias para cerrar el alcance actual del MVP.

- [ ] Módulo de asistencia y alertas de inasistencia.
- [ ] Registro del docente autor en observaciones, alertas y actividades.
- [ ] Exportación de reportes a PDF y Excel.
- [ ] Notificaciones de alertas por correo electrónico o en tiempo real.
- [ ] Implementación de migraciones de base de datos versionadas con Alembic.
- [ ] Configuración de escalas de calificación y umbrales por institución.
- [ ] Historial de alertas propio en el Dashboard. Actualmente se consulta desde la pantalla de Alertas mediante el filtro «Resueltas».

## 6. Criterio de cierre del MVP

El MVP de ClassKids se considera listo cuando se cumplen las siguientes condiciones:

1. El administrador puede preparar la estructura académica y realizar las asignaciones correspondientes.
2. El docente puede registrar y consultar el seguimiento académico de sus estudiantes.
3. El sistema permite consultar métricas y atender alertas desde el navegador.
4. Los hallazgos críticos y altos que afectan el funcionamiento del MVP están corregidos o cuentan con una decisión documentada y justificada.
5. Las pruebas automatizadas demuestran el funcionamiento de los módulos y procesos incluidos en el alcance.
6. La documentación y las evidencias corresponden con la versión realmente implementada.
7. La base de datos y el entorno de ejecución cuentan con las autorizaciones y configuraciones necesarias para su puesta en funcionamiento.

El cumplimiento del criterio debe verificarse con evidencias. La existencia de pruebas aprobadas no significa que todos los módulos o escenarios pendientes estén validados.

## 7. Relación con otros documentos

| Documento | Responsabilidad |
|---|---|
| `product-backlog.md` | Historias de usuario, estimaciones, prioridades y estado de cumplimiento funcional. |
| `hallazgos.md` | Registro y descripción de los hallazgos H-xx. |
| `pruebas.md` | Verificaciones y resultados de las pruebas. |
| `sprints.md` | Reconstrucción de las etapas y bloques de trabajo del proyecto. |
| `retrospectivas.md` | Reflexiones y oportunidades de mejora del equipo. |
| `migraciones/001-informe-preparacion.md` | Preparación de la migración de base de datos. |
| `frontend/renovacion-visual.md` | Registro de los cambios visuales del frontend. |
| `evidencias/` | Soportes técnicos, capturas, scripts y diagramas. |

## 8. Conclusión

El backlog técnico permite mantener identificadas las actividades realizadas y las que todavía requieren atención durante el desarrollo de ClassKids.

La organización de las tareas facilita distinguir entre correcciones completadas, verificaciones disponibles, actividades pendientes y funcionalidades que podrían incorporarse en futuras versiones.

Este documento complementa el Product Backlog y los demás registros del proyecto, manteniendo separado el seguimiento funcional de las historias de usuario y el seguimiento técnico de la implementación.

**Última actualización:** 24/11/2026.
