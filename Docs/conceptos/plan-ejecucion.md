# Ejecución del proyecto por fases

El documento original planteaba cinco fases de trabajo. Esta tabla conserva esas fases y registra lo que realmente se ejecutó hasta el 20/11/2026.

| Fase | Tareas planteadas | Lo realizado | Estado |
|---|---|---|---|
| 1. Análisis y planeación | Requerimientos, actores, módulos, alcance, casos de uso, entidades, metodología y arquitectura. | Idea de negocio, problema, objetivos, 13 casos de uso, requisitos funcionales y no funcionales, MER inicial (documento versión 1.0, noviembre de 2025). En esta versión 2.0 se actualizó todo contra la implementación. | Completada |
| 2. Diseño del sistema | MER, arquitectura en capas, interfaces, flujo de procesos, reglas de negocio y validaciones. | MER y diccionario iniciales; arquitectura cliente-servidor con React, FastAPI y PostgreSQL; sistema de diseño con shadcn/ui. Las reglas de negocio se formalizaron en esta versión a partir del código. | Completada (actualizada) |
| 3. Desarrollo | Entorno, base de datos, módulos de usuarios, grupos, estudiantes, académico, observaciones y alertas; validaciones; excepciones personalizadas; manejador global de errores; integración. | Entorno con Docker; base de datos de 12 tablas con datos demo; API de 49 operaciones; 19 pantallas; autenticación JWT, invitaciones y recuperación de contraseña; panel de administración y páginas legales. No se implementaron excepciones personalizadas ni un manejador global de errores, y la validación de entradas en el backend es mínima. | Completada con pendientes |
| 4. Pruebas y validación | Pruebas de funcionamiento, validación de datos, alertas y calificaciones; identificación y corrección de errores. | 34 verificaciones manuales, auditoría de integración entre capas, verificación de la base de datos en DBeaver y recorrido de las 24 pantallas; 33 hallazgos identificados. Entorno de pruebas aislado y 54 pruebas automatizadas aprobadas. Corregidos con pruebas: H-02, H-24 a H-29, H-31 y H-33; H-30 en parte y la regla de H-32. Falta aplicar la migración 001 en la base real (pendiente de autorización), corregir los demás hallazgos y ampliar las pruebas. | En curso |
| 5. Implementación y seguimiento | Instalación, capacitación, seguimiento, evaluación y ajustes. | El sistema se ejecuta en un entorno local. Se elaboraron el manual de usuario y el manual técnico. No hay despliegue en servidor ni capacitación. | No iniciada |

## Siguientes pasos recomendados

1. La escala académica oficial quedó definida como 0.0–5.0, la que implementan el backend y la base de datos.
2. Decidir la aplicación de la migración 001 en la base real (informe de preparación listo).
3. Corregir los hallazgos críticos pendientes: diferencia de umbrales entre la interfaz y la alerta (H-01, **hecho el 24/11/2026**) y control de acceso por rol y asignación (H-08, **hecho el 24/11/2026**).
4. Corregir los hallazgos de prioridad alta pendientes: validación en el backend (H-05, **hecho el 24/11/2026**), regla de alertas al editar y por materia (H-04, **pendiente de decisión funcional**), autoprotección del administrador (H-18, **hecho el 24/11/2026**), operaciones sin interfaz (H-12), vigencia del token (H-09) y eliminaciones (H-11).
5. Ampliar la suite automatizada a los módulos sin pruebas y ejecutar el plan de pruebas pendientes en el entorno aislado.
6. Actualizar esta documentación con los resultados.
