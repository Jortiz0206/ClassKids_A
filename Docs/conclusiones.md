# Conclusiones

1. **ClassKids es un sistema funcional de extremo a extremo.** Los módulos de usuarios, grupos, estudiantes, materias, asignaciones, actividades, calificaciones, observaciones, análisis y alertas están construidos sobre una API real y una base de datos PostgreSQL. Ninguna pantalla trabaja con datos simulados: los indicadores que muestran coinciden con los conteos de la base de datos.

2. **El sistema creció más allá del diseño original.** Se incorporaron funcionalidades que no estaban documentadas: incorporación de usuarios por invitación, recuperación de contraseña, panel de administración con métricas y datos globales, asignación de docentes por materia y grupo, Dashboard del docente, páginas legales y datos demo de un colegio completo. Esta versión del documento las registra como CU-14 a CU-16 y RF-16 a RF-25.

3. **El enfoque se concretó.** El diseño original hablaba de seguimiento conductual y de dificultades atencionales; lo construido es un sistema de seguimiento académico con alertas tempranas por bajo rendimiento, complementado con observaciones cualitativas. El documento se ajustó para describir lo que el sistema hace realmente.

4. **La seguridad tiene una base adecuada para un MVP:** contraseñas con hash PBKDF2, tokens JWT con vencimiento, consultas SQL parametrizadas, rutas protegidas y respuestas que no revelan qué correos existen en la recuperación de contraseña. Falta controlar el acceso según las asignaciones del docente y revalidar el usuario en cada petición.

5. **Se corrigieron los defectos de integración más graves, y quedan otros pendientes.** El guardado de calificaciones ya no registra ceros ni borra observaciones o periodos, el filtro por grupo funciona, las alertas automáticas no se duplican y los conteos coinciden entre pantallas; cada corrección tiene pruebas automatizadas. Sigue pendiente de decisión funcional la regla de alerta al editar y por materia (H-04), y sigue abierto el promedio con estudiantes sin nota (H-19). El 24/11/2026 se corrigieron la clasificación frente al umbral de alerta (H-01), la validación del backend (H-05), el control de acceso por asignación (H-08), la cuenta revalidada en cada petición (H-09), la lectura del `.env` (H-17) y la autoprotección del administrador (H-18). La persistencia de «Entregado» en la base real depende de la migración 001, ya preparada y pendiente de autorización.

6. **Las evidencias de pruebas son reales y reproducibles.** Además de 34 verificaciones manuales, la auditoría de integración y el recorrido de las interfaces, el proyecto cuenta ahora con un entorno de pruebas aislado y 54 pruebas automatizadas (API, lógica del frontend e interfaz), todas aprobadas, que se ejecutan sin tocar la base real. La tarea pendiente es extenderlas a los módulos que aún no tienen pruebas.

7. **Las tres capas están conectadas, pero no siempre hablan el mismo idioma.** Todas las operaciones que ofrece la interfaz llegan al backend y a PostgreSQL, y la integridad entre tablas es correcta. Los defectos de integración están en los bordes: tipos de datos que cambian entre capas (texto frente a número), nombres de campos distintos (`año_lectivo` y `ano_lectivo`), fechas sin zona horaria y un campo (`observacion`) reutilizado para otro propósito. Se documentaron en el capítulo de integración como hallazgos H-24 a H-33, y los aprobados se corrigieron con pruebas.

8. **La documentación quedó alineada con el código y con la base de datos.** Este documento, el README y la carpeta `Docs/` se generan a partir de la misma información verificada, con diagramas y diccionario de datos obtenidos de la implementación. La información de la base de datos coincide con la que se consulta en DBeaver y se puede comprobar con un script de verificación, de modo que la documentación describe ClassKids tal como está construido.

9. **La renovación visual le dio a ClassKids una identidad propia sin cambiar sus reglas.** La interfaz pasó de un estilo plano a un sistema visual coherente en todos los módulos:
   - paleta fresca con significado y rojo reservado para alertas;
   - tipografía propia y mascota con medida;
   - navegación inferior en el celular;
   - contraste WCAG AA en 32 de 32 pares;
   - equivalencia de las notas en la escala oficial.

   Se implementó y validó en el entorno de pruebas y se descubrieron y corrigieron cuatro defectos nuevos (H-34 a H-37). La suite creció de 54 a 102 pruebas, con 47 casos unitarios reales. La escala 0.0–5.0, los umbrales 3.0 y 3.5 y las reglas académicas no cambiaron.

10. **Lo que falta depende de información o autorización, no de trabajo oculto.** Quedan pendientes:
    - información del equipo: Scrum, retroalimentación, los cuatro backends y la decisión sobre IoT;
    - autorizaciones: cambios de backend, migración 001, contenedores y despliegue, y commits al cierre.

    Cada pendiente está identificado en la matriz de cumplimiento de `ENTREGA_FINAL_CLASSKIDS/`.
