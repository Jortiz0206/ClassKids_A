# Restricciones

Este documento resume las condiciones que limitan el alcance de la versión actual. Los defectos concretos están en [`../hallazgos.md`](../hallazgos.md) y las funcionalidades fuera de alcance, en [`descripcion-general.md`](descripcion-general.md).

## Restricciones de alcance

- Proyecto académico (MVP) para un solo colegio: no hay separación de datos entre instituciones.
- Los estudiantes y acudientes no ingresan a la plataforma; el rol *Acudiente* está reservado.
- No hay control de asistencia, exportación de reportes ni notificaciones en tiempo real.

## Restricciones técnicas

- El sistema se ejecuta en un entorno local (Uvicorn con recarga automática, Vite y Docker). No existe un despliegue productivo.
- El esquema de la base de datos se crea con `init.sql` la primera vez que se crea el contenedor; no se usa una herramienta de migraciones.
- La API está en un solo archivo (`main.py`) y no tiene una capa de servicios separada.
- Los indicadores se calculan en el navegador a partir de las tablas completas, sin paginación.
- El envío de correos depende de que se configure un servidor SMTP.

## Restricciones de negocio vigentes

- Escala académica oficial 0.0–5.0, con un decimal; la interfaz las registra y muestra en esa escala, con el porcentaje como dato secundario. La escala y los umbrales son fijos para todas las instituciones; hacerlos configurables es una mejora futura.
- Un solo docente por materia en cada grupo.
- Acceso únicamente por invitación del administrador.
- Las calificaciones registradas desde la interfaz pertenecen al periodo 1.

## Restricciones de seguridad conocidas

- El token se guarda en el almacenamiento local del navegador y no se revoca al cerrar sesión.
- No hay límite de intentos de inicio de sesión.
- La autorización combina el rol y las asignaciones del docente (H-08 corregido el 24/11/2026). Las alertas no guardan la materia, así que su visibilidad depende del texto del mensaje cuando este nombra una materia (RN-37).
