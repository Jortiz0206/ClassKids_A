# Backlog de ClassKids

Estado revisado: 20 de noviembre de 2026. Organizado para las columnas del GitHub Project: `Done`, `Evidence`, `In progress` y `Backlog`. Los identificadores H-xx remiten a [`hallazgos.md`](hallazgos.md).

## Done

- [x] Autenticación de administrador y docente con JWT (8 horas) y contraseñas PBKDF2.
- [x] Protección de rutas privadas y de rutas administrativas por rol.
- [x] Invitación de usuarios y activación de cuenta (CU-02, CU-15).
- [x] Recuperación de contraseña con token persistente de 30 minutos (CU-14).
- [x] Cambio de rol y desactivación lógica de usuarios.
- [x] Grupos: crear y consultar con indicadores (CU-04).
- [x] Estudiantes: registrar, editar, buscar, filtrar y ver detalle (CU-05).
- [x] Materias: crear, buscar y eliminar (CU-06).
- [x] Asignaciones docente–materia–grupo con control de duplicados (CU-07).
- [x] Actividades: crear y consultar con estado y progreso (CU-08).
- [x] Calificaciones por actividad para todo el grupo (CU-09).
- [x] Observaciones por estudiante (CU-10).
- [x] Dashboard del docente y tablero de análisis (CU-11).
- [x] Alerta automática por promedio menor a 3.0 (CU-12) y cambio de estado de alertas (CU-13).
- [x] Panel de administración: métricas y datos globales (CU-16).
- [x] Páginas públicas y políticas legales.
- [x] Datos demo: 10 grupos, 200 estudiantes, 52 actividades, 215 calificaciones.
- [x] Documentación versión 2.0 alineada con el código (documento Word, Docs y README).
- [x] Entorno de pruebas aislado (`classkids_test`, backend 8001, frontend 8081) con salvaguardas.
- [x] Suite de 54 pruebas automatizadas (pytest 24, Vitest 15, Playwright 15), todas aprobadas.
- [x] Corregidos con pruebas: H-02, H-24, H-25, H-26, H-27, H-28, H-29, H-31 (en código y base de pruebas), H-33; H-30 parcialmente (D4); regla de H-32 (D3).
- [x] Panel «Alertas Tempranas» con solo las alertas activas y enlace al historial de resueltas.
- [x] Informe de preparación de la migración 001: [`migraciones/001-informe-preparacion.md`](migraciones/001-informe-preparacion.md).
- [x] Renovación visual completa del frontend en el entorno de pruebas (23/11/2026): [`frontend/renovacion-visual.md`](frontend/renovacion-visual.md).
- [x] Suite ampliada a 102 pruebas (pytest 42, Vitest 37, Playwright 23), todas aprobadas; 47 casos unitarios reales.
- [x] Corregidos con pruebas en la renovación: H-13, H-15, H-34, H-35, H-36 y H-37; H-14 parcialmente.
- [x] Modo claro y oscuro en toda la plataforma, landing rediseñada, modelo relacional verificado contra la base real (PNG, PDF y diccionario) y limpieza de código (23/11/2026). Suite: 107 pruebas (114 tras la organización del código).
- [x] Organización del código (etapas E1–E6: utilidades compartidas, Dashboard de 13 a 6 peticiones, 27 componentes sin uso retirados), confirmaciones (H-39), Usuarios en celular (H-40), Scrum reconstruido por etapas y evidencias V3 (94 capturas). Suite: 114 pruebas.
- [x] Documentación de los 14 criterios y carpeta [`../ENTREGA_FINAL_CLASSKIDS/`](../ENTREGA_FINAL_CLASSKIDS/00_INDICE_Y_ESTADO/README.md).

## Evidence

- [x] Verificaciones del 20/11/2026: [`pruebas.md`](pruebas.md) (34 verificaciones; 14 aprobadas, 18 fallidas, 2 observaciones).
- [x] Auditoría de integración entre capas: [`referencia-tecnica/integracion.md`](referencia-tecnica/integracion.md).
- [x] Verificación de la base de datos en DBeaver: [`evidencias/scripts/verificacion-bd.sql`](evidencias/scripts/verificacion-bd.sql).
- [x] Capturas de las 24 pantallas (V2; ya no están en el repositorio; vigentes en [`evidencias/capturas-v3/`](evidencias/capturas-v3/README.md)).
- [x] Scripts reproducibles: [`evidencias/scripts/`](evidencias/scripts/).
- [x] Diagramas generados desde la implementación: [`diagramas/`](diagramas/).

## In progress

- [ ] Aplicar la migración 001 en la base real (pendiente de autorización).
- Decisión registrada el 20/11/2026: la escala académica oficial es 0.0–5.0, la que usan el backend y la base de datos.

## Backlog

### Prioridad crítica

- [ ] Resolver la diferencia de umbrales entre la interfaz (3.5) y la alerta del backend (3.0) (H-01).
- [x] Restringir por rol las materias, asignaciones y gestión de grupos, y filtrar por asignación del docente (H-08, 24/11/2026).

### Prioridad alta

- [ ] Validar datos de entrada en el backend y responder 404, 409 o 422 en lugar de 500 (H-05).
- [ ] Completar la regla de alertas: evaluar al actualizar y por materia (H-04; los duplicados ya se corrigieron con H-32).
- [x] Corregir la autoprotección del administrador en la interfaz (H-18, 24/11: la comparación de identificadores usa texto en ambos lados; prueba E2E).
- [x] Añadir la misma protección en el backend (H-18, 24/11/2026: 403 en la API).
- [ ] Guardar la materia en cada alerta (columna `alertas.materia_id`) para que su visibilidad no dependa del texto del mensaje (RN-37). Requiere una migración y una decisión sobre la regla de alertas por materia (H-04).
- [ ] Revalidar en cada petición que el usuario siga activo y con el mismo rol (H-09).
- [ ] Responder 404 al eliminar registros inexistentes y usar baja lógica de estudiantes (H-11).
- [ ] Agregar en la interfaz editar y eliminar grupos, actividades y materias, desactivar estudiantes y crear alertas manuales (H-12).
- [ ] Corregir la precisión de la nota (H-03) y depurar calificaciones duplicadas o sin actividad, con autorización (H-06).
- [ ] Ampliar las pruebas automatizadas al resto de los módulos y ejecutar el plan de pruebas pendientes.

### Prioridad media

- [ ] Corregir el mes de la tendencia (H-07) y agregar filtros al tablero.
- [ ] Manejar el token vencido en la interfaz y definir `JWT_SECRET` (H-10, H-17).
- [ ] Corregir lo que queda de H-14 (etiqueta fija «Activo», lista de los seis primeros estudiantes) y el promedio de la actividad (H-19).
- [ ] Reducir las peticiones de Actividades (H-16).
- [ ] Reducir los usos de `any` y los errores de ESLint (H-20).
- [ ] Endurecer la configuración antes de un despliegue (H-23).

### Prioridad baja

- [ ] Botones sin acción (H-13), detalle de alerta (H-15), mensaje de cuenta desactivada (H-21) y zona horaria (H-22).
- [ ] Alertas de los datos demo que no siguen la regla (H-32): requiere autorización para modificar datos.

### Nuevas funcionalidades (fuera del alcance actual)

- [ ] Módulo de asistencia y alertas de inasistencia.
- [ ] Registro del docente autor en observaciones, alertas y actividades.
- [ ] Exportación de reportes a PDF y Excel.
- [ ] Notificaciones de alertas por correo o en tiempo real.
- [ ] Migraciones versionadas (Alembic).
- [ ] Escala de calificación y umbrales configurables por institución.
- [ ] Historial de alertas propio en el Dashboard (hoy se consulta en la pantalla Alertas con el filtro «Resueltas»).

## Criterio de cierre del MVP

El MVP se considera listo cuando el administrador prepara la estructura académica y asigna docentes, el docente registra el seguimiento de sus estudiantes, consulta métricas y atiende alertas desde el navegador, los hallazgos críticos y altos están corregidos y existe una suite de pruebas automatizadas que lo demuestra.
