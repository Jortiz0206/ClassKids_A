# Interfaces del sistema

Este capítulo recoge **capturas reales de la versión vigente** de ClassKids, tomadas el 24/11/2026, con los permisos por asignación vigentes, en el entorno de pruebas aislado (frontend 8081, API 8001, base `classkids_test` en el puerto 5433) con los datos de demostración. Los nombres de personas que aparecen son ficticios.

- Cada captura lleva un pie con la vista, el dispositivo, el tema, la fecha y el entorno.
- El conjunto completo está en [`../evidencias/capturas-v3/vigente/`](../evidencias/capturas-v3/README.md). Son 142 imágenes: escritorio y celular, modo claro y oscuro.
- Aquí se muestra la versión de escritorio en modo claro, salvo que se indique otra cosa.
- El docente de las capturas es el docente de demostración, con 5 materias asignadas en 3 grupos (Grado 1A, 2A y 3A). Desde el 24/11/2026 cada docente ve solo sus asignaciones (RF-26); también se incluyen vistas de un docente con una sola materia y del administrador.

## 1. Landing (página pública)

**Función:** presenta ClassKids con el lema «Aprender · Crecer · Avanzar», explica su propósito, muestra los módulos reales y el recorrido en video, y lleva al inicio de sesión.

![Portada: mensaje, acciones y panel real integrado](../evidencias/capturas-v3/vigente/landing/2026-11-24_portada_escritorio_claro.png)

![Franja de funcionalidades](../evidencias/capturas-v3/vigente/landing/2026-11-24_funcionalidades_escritorio_claro.png)

![Flujo de acompañamiento: calificación, alerta y seguimiento, con pantallas reales de la app en el celular](../evidencias/capturas-v3/vigente/landing/2026-11-24_flujo-acompanamiento_escritorio_claro.png)

![Presentación de los módulos reales](../evidencias/capturas-v3/vigente/landing/2026-11-24_presentacion-modulos_escritorio_claro.png)

![Portada en el celular](../evidencias/capturas-v3/vigente/landing/2026-11-24_portada_celular_claro.png)

**Qué demuestra:**
- La portada presenta el mensaje a la izquierda y el panel real del docente a la derecha, con la plantica original de ClassKids.
- La experiencia se cuenta con capturas reales de la aplicación, en escritorio y en celular, y explicaciones breves. La landing no presenta cifras ni gráficas propias.
- Las funcionalidades y los módulos descritos son los que existen.
- En el celular la página se adapta sin desplazamiento lateral.
- La landing completa, en página entera, está en `vigente/landing/2026-11-24_pagina-completa_*`.

## 2. Inicio de sesión

**Función:** permite el ingreso con correo y contraseña y la recuperación de la contraseña. No hay registro público: el acceso es por invitación.

![Inicio de sesión](../evidencias/capturas-v3/vigente/login/2026-11-24_inicio-sesion_escritorio_claro.png)

![Mensaje de error con credenciales incorrectas](../evidencias/capturas-v3/vigente/login/2026-11-24_error-credenciales_escritorio_claro.png)

![Recuperación de contraseña](../evidencias/capturas-v3/vigente/login/2026-11-24_recuperar-contrasena_escritorio_claro.png)

![Inicio de sesión en el celular, modo oscuro](../evidencias/capturas-v3/vigente/login/2026-11-24_inicio-sesion_celular_oscuro.png)

**Qué demuestra:**
- El error de credenciales se muestra en pantalla (intento real con una clave incorrecta).
- La recuperación se abre desde el mismo formulario.
- El fondo usa degradados suaves, sin puntos ni retícula.
- Las rutas inexistentes muestran una página 404 propia (`vigente/login/…_pagina-404_*`).

## 3. Dashboard

**Función:** resume la jornada. El docente ve sus totales, «Mis asignaciones» (el promedio de cada materia en cada grupo, sin mezclar materias), el rendimiento de sus materias y sus alertas. El administrador ve los totales y la gráfica de todo el colegio. Ambos tienen los accesos «Nueva actividad» y «Revisar alertas».

![Dashboard del docente demo: 5 materias en 3 grupos](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_panel-docente_escritorio_claro.png)

![Dashboard de un docente con una sola materia (Matemáticas en 7 grupos)](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_panel-docente-una-materia_escritorio_claro.png)

![Dashboard del administrador: visión general del colegio](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_panel-administrador-general_escritorio_claro.png)

![Estado de carga (respuesta real retrasada 4 s)](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_estado-carga_escritorio_claro.png)

![Dashboard en el celular con la navegación inferior](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_panel-docente_celular_claro.png)

![Menú «Más» del docente en el celular](../evidencias/capturas-v3/vigente/dashboard/2026-11-24_menu-mas-docente_celular_claro.png)

**Qué demuestra:**
- La gráfica marca las referencias 3.0 (alerta) y 3.5 (aprobación) y ocupa el mismo alto que el panel de alertas.
- El panel de alertas resume las cinco más recientes, con el total en el contador y un enlace a la lista completa.
- Cada docente ve solo sus asignaciones: el docente de Matemáticas ve 7 grupos, 140 estudiantes y solo Matemáticas en la gráfica; el administrador ve los 10 grupos y los 200 estudiantes.
- La interfaz muestra un estado de carga mientras llegan los datos.
- En el celular, la navegación inferior y el menú «Más» del docente no incluyen los módulos de administración.

## 4. Usuarios y administración

**Función:** solo para el rol administrador. El administrador no puede cambiar su propio rol ni desactivarse: su fila aparece marcada «(tú)» con esos controles deshabilitados, y la API responde 403 (H-18). Reúne:
- un resumen con las métricas globales;
- la gestión de usuarios: invitar por correo, cambiar el rol y desactivar el acceso;
- los datos globales, en modo de solo lectura.

![Panel de administración](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_panel-administracion_escritorio_claro.png)

![Usuarios y roles](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_usuarios-roles_escritorio_claro.png)

![Formulario de invitación](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_invitar-docente_escritorio_claro.png)

![Confirmación antes de desactivar (se canceló)](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_confirmar-desactivar_escritorio_claro.png)

![Datos globales](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_datos-globales_escritorio_claro.png)

![Usuarios en el celular: tarjetas con rol y acción](../evidencias/capturas-v3/vigente/modulos/usuarios/2026-11-24_usuarios-roles_celular_claro.png)

**Qué demuestra:**
- El administrador tiene su propio panel.
- Desactivar un usuario pide confirmación. La acción se capturó y se canceló: no se desactivó a nadie.
- En el celular, la lista se adapta a tarjetas.
- El menú «Más» del administrador incluye Usuarios y el Panel de administración (`…_menu-mas-administrador_*`).

## 5. Grupos

**Función:** organiza los cursos. Cada uno muestra sus estudiantes, actividades, promedio, nivel de rendimiento y alertas abiertas; hay filtros por grado y turno.

![Grupos](../evidencias/capturas-v3/vigente/modulos/grupos/2026-11-24_lista_escritorio_claro.png)

![Formulario de nuevo grupo](../evidencias/capturas-v3/vigente/modulos/grupos/2026-11-24_formulario-nuevo_escritorio_claro.png)

**Qué demuestra:**
- El promedio de cada grupo se muestra en % y en la escala 0.0 – 5.0.
- Las alertas abiertas se ven por grupo.
- Los grupos se crean desde la misma pantalla.

## 6. Estudiantes

**Función:** lista los estudiantes con su grupo, promedio, tendencia, estado y alertas, con búsqueda, filtros y paginación. Cada estudiante tiene una ficha con observaciones de seguimiento.

![Lista de estudiantes](../evidencias/capturas-v3/vigente/modulos/estudiantes/2026-11-24_lista_escritorio_claro.png)

![Detalle del estudiante y observaciones](../evidencias/capturas-v3/vigente/modulos/estudiantes/2026-11-24_detalle-observaciones_escritorio_claro.png)

![Formulario de nuevo estudiante](../evidencias/capturas-v3/vigente/modulos/estudiantes/2026-11-24_formulario-nuevo_escritorio_claro.png)

![Búsqueda sin resultados](../evidencias/capturas-v3/vigente/modulos/estudiantes/2026-11-24_busqueda-sin-resultados_escritorio_claro.png)

**Qué demuestra:**
- Los estados son Activo, En riesgo y Crítico.
- La ficha incluye las observaciones de seguimiento.
- El registro de estudiantes se hace en un formulario propio.
- Una búsqueda sin coincidencias muestra un mensaje claro.

## 7. Materias

**Función:** el administrador gestiona el catálogo de asignaturas y su vínculo con cada grupo y docente. El docente consulta sus materias y sus asignaciones, sin acciones de catálogo.

![Materias del docente (solo consulta)](../evidencias/capturas-v3/vigente/modulos/materias/2026-11-24_mis-materias-docente_escritorio_claro.png)

![Catálogo de materias (administrador)](../evidencias/capturas-v3/vigente/modulos/materias/2026-11-24_catalogo_escritorio_claro.png)

![Vista por grupos con el docente de cada materia](../evidencias/capturas-v3/vigente/modulos/materias/2026-11-24_vista-por-grupos_escritorio_claro.png)

![Formulario para vincular una materia a un grupo](../evidencias/capturas-v3/vigente/modulos/materias/2026-11-24_formulario-vincular_escritorio_claro.png)

![Confirmación antes de eliminar (se canceló)](../evidencias/capturas-v3/vigente/modulos/materias/2026-11-24_confirmar-eliminar_escritorio_claro.png)

**Qué demuestra:**
- El catálogo y la vista por grupos son dos vistas del mismo módulo.
- Cada vínculo une una materia, un grupo y un docente.
- Eliminar una materia pide confirmación. La acción se capturó y se canceló.
- El docente no ve «Nueva Materia», «Vincular a Grupo» ni los botones de eliminar; la API también se lo impide (403).

## 8. Actividades

**Función:** registra tareas, exámenes, proyectos y participaciones por grupo, con su fecha de entrega, el avance de las entregas y el promedio.

![Actividades](../evidencias/capturas-v3/vigente/modulos/actividades/2026-11-24_lista_escritorio_claro.png)

![Formulario de nueva actividad](../evidencias/capturas-v3/vigente/modulos/actividades/2026-11-24_formulario-nueva_escritorio_claro.png)

**Qué demuestra:**
- Hay totales por estado y filtros por tipo, estado y grupo.
- Cada actividad muestra el progreso de entrega y su promedio.

## 9. Calificaciones

**Función:** el docente elige un grupo y una actividad, escribe las notas de 0.0 a 5.0 y marca las entregas. Las notas se guardan tal como se escriben, en la escala oficial.

![Antes de elegir grupo y actividad](../evidencias/capturas-v3/vigente/modulos/calificaciones/2026-11-24_sin-seleccion_escritorio_claro.png)

![Tabla de una actividad](../evidencias/capturas-v3/vigente/modulos/calificaciones/2026-11-24_tabla-actividad_escritorio_claro.png)

![Fila modificada sin guardar, con su equivalencia](../evidencias/capturas-v3/vigente/modulos/calificaciones/2026-11-24_fila-editada-equivalencia_escritorio_claro.png)

![Mensaje de confirmación al guardar](../evidencias/capturas-v3/vigente/modulos/calificaciones/2026-11-24_guardado-exito_escritorio_claro.png)

![Calificaciones en el celular con la barra de guardado](../evidencias/capturas-v3/vigente/modulos/calificaciones/2026-11-24_tabla-actividad_celular_claro.png)

**Qué demuestra:**
- Las equivalencias aparecen al instante, por ejemplo «76 % · 15.2 / 20» para 3.8. Un valor inválido se marca en rojo con el motivo.
- Las filas modificadas se resaltan y solo se guardan esas.
- El mensaje de éxito es real: se guardó un cambio en la base de pruebas y se restauró enseguida, y se comprobó que la tabla de calificaciones quedó idéntica.

## 10. Análisis

**Función:** muestra la lectura pedagógica del rendimiento: indicadores generales, promedio por grupo, distribución por nivel, tendencia mensual, rendimiento por tipo de actividad y estudiantes en riesgo.

![Análisis de rendimiento](../evidencias/capturas-v3/vigente/modulos/analisis/2026-11-24_rendimiento_escritorio_claro.png)

![Análisis filtrado por una materia (administrador)](../evidencias/capturas-v3/vigente/modulos/analisis/2026-11-24_filtro-por-materia_escritorio_claro.png)

![Análisis en el celular](../evidencias/capturas-v3/vigente/modulos/analisis/2026-11-24_rendimiento_celular_claro.png)

**Qué demuestra:**
- Las gráficas usan las referencias 3.0 y 3.5.
- Los promedios se muestran en % y en la escala oficial.
- El selector «Materia» permite leer los indicadores de una sola materia, sin mezclarla con otras. Al docente con una sola materia no se le muestra, porque sus datos ya son de esa materia.

## 11. Alertas

**Función:** reúne las alertas tempranas, con totales por estado y filtros. Al registrar una nota, si el promedio acumulado del estudiante baja de 3.0, se crea una alerta. El docente la revisa y la resuelve.

![Alertas tempranas](../evidencias/capturas-v3/vigente/modulos/alertas/2026-11-24_lista_escritorio_claro.png)

![Detalle de una alerta con las acciones de seguimiento](../evidencias/capturas-v3/vigente/modulos/alertas/2026-11-24_detalle_escritorio_claro.png)

![Estado de error de conexión (petición cortada a propósito)](../evidencias/capturas-v3/vigente/modulos/alertas/2026-11-24_error-conexion_escritorio_claro.png)

**Qué demuestra:**
- Cada alerta muestra su estado, prioridad y grupo.
- El detalle permite marcarla «en revisión» o «resuelta».
- Si falla la conexión, la interfaz lo informa con la opción de reintentar.

## 12. Permisos por rol y por asignación

**Función:** la API entrega a cada docente solo la información de sus asignaciones y rechaza con 403 cualquier operación fuera de ellas, incluso cuando se llama directamente cambiando identificadores. El administrador conserva la visión general.

| Caso comprobado con peticiones reales | Resultado |
|---|---|
| Administrador cambia su propio rol o se desactiva | 403 |
| Docente de Matemáticas consulta grupos, materias, notas y alertas | Solo sus 7 grupos, su materia, sus 28 notas y sus 3 alertas |
| Docente consulta estudiantes de un grupo ajeno o notas de una actividad ajena | 403 |
| Docente califica otra materia o a un estudiante de otro grupo | 403, sin guardar |
| Docente modifica una actividad ajena o resuelve una alerta ajena | 403 |
| Docente crea un grupo o una materia, o consulta el catálogo de docentes | 403 |

**Qué demuestra:** los permisos no dependen de ocultar botones; la API los aplica con la identidad del token. La tabla completa (18 de 18 casos) está en [`../evidencias/permisos/verificacion-api-permisos.md`](../evidencias/permisos/verificacion-api-permisos.md) y las pruebas automatizadas, en `backend/tests/test_permisos.py` y `e2e/tests/permisos.spec.ts`.

## 13. Modo claro y oscuro

**Función:** el selector de tema cambia toda la plataforma y la preferencia se mantiene al navegar y al recargar.

![Dashboard: modo claro y oscuro](../evidencias/capturas-v3/vigente/temas/2026-11-24_dashboard-claro-y-oscuro_escritorio_ambos.png)

![Inicio de sesión: modo claro y oscuro](../evidencias/capturas-v3/vigente/temas/2026-11-24_login-claro-y-oscuro_escritorio_ambos.png)

**Qué demuestra:**
- La misma identidad visual funciona en los dos temas.
- En cada captura se verificó que la página estuviera realmente en el tema indicado.
- `vigente/temas/` tiene también las comparaciones de la landing, Calificaciones y Análisis, en escritorio y celular.

## 14. Recorrido en video

**Función:** la sección «Conoce cómo funciona ClassKids» de la landing reproduce el recorrido vigente (v3, regrabado el 24/11/2026 con la nota de 0.0 a 5.0): 140 segundos de uso real de la aplicación (1280 × 720), con música instrumental original.

- **Contenido:** el recorrido empieza y termina con una placa «ClassKids · Aprender · Crecer · Avanzar» con la plantica original. Entre las dos muestra la landing; el inicio de sesión del docente de demostración con sus asignaciones (3 grupos, 60 estudiantes, «Mis asignaciones» con el promedio de cada materia en cada grupo); la búsqueda y la ficha de un estudiante; una nota de 0.0 a 5.0 escrita sin guardar (3.8), con su equivalencia en porcentaje y sobre 20; Análisis filtrado por una materia; el detalle de una alerta; sus grupos, actividades y materias (solo consulta); el inicio de sesión del administrador con la visión general (10 grupos, 200 estudiantes), la gestión de materias, el panel de administración y Usuarios; y el cambio a modo oscuro.
- **Grabación:** se hizo en el entorno de pruebas con los datos de demostración. El script se detiene si intenta escribir en la base, así que no se guardó ningún cambio.
- **Reproducción:** el video nunca se reproduce solo. Empieza al pulsar «Ver video» o el control del reproductor.
- **Música:** suena a volumen bajo (40 % al empezar). Se silencia con el botón de la música y se ajusta con el control «Volumen», además de los controles del navegador.

![Video del recorrido con música en reproducción, con los controles del reproductor y de la música](../evidencias/capturas-v3/vigente/video/2026-11-24_reproduciendo_escritorio_claro.png)

**Qué demuestra:** el video y su música se reproducen de verdad. La captura se tomó en el segundo 6.4, tras pulsar «Ver video». En ese momento el navegador ya había decodificado 110 944 bytes de audio, con el volumen en 40 % y el sonido activado.

**Música:** es una composición instrumental original de ClassKids, sintetizada por código en [`montar-recorrido.py`](../evidencias/scripts/montar-recorrido.py), sin muestras de terceros. Está en Fa mayor, a 92 pulsos por minuto, con acordes, arpegio, bajo y percusión suave. Mide −21,5 LUFS, con picos de −8,6 dBFS.

**Versiones anteriores:** la v1 (sin audio), la v2 (anterior a H-08: en ella el docente demo veía los 10 grupos) y la v3 con la nota en porcentaje se eliminadas el 25/11/2026 por decisión del equipo: mostraban la nota de 0 a 100 o en porcentaje y el comportamiento anterior a H-08, y no se usan en la plataforma. El único video vigente es el de la landing.
