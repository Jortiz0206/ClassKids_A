# Evidencias visuales vigentes

**142 capturas reales** de la versión vigente de ClassKids, tomadas el **24/11/2026**, con los permisos por asignación vigentes, en el entorno de pruebas aislado (frontend 8081, API 8001, base `classkids_test` en el puerto 5433) con los datos de demostración.

- Scripts:
  - [`capturas-plataforma.cjs`](../scripts/capturas-plataforma.cjs) toma todas las vistas, en tema claro y oscuro.
  - [`componer-temas.py`](../scripts/componer-temas.py) arma las comparaciones claro/oscuro.
  - [`rotular-capturas.py`](../scripts/rotular-capturas.py) agrega el pie a cada imagen.
- Nombre de archivo: `AAAA-MM-DD_vista_dispositivo_tema.png`. El dispositivo es `escritorio` (1366 px) o `celular` (390 × 844).
- En cada captura se comprobó el tema (clase `dark` del documento) y que no hubiera desplazamiento horizontal: 0 problemas.
- **Única escritura:** el mensaje de éxito de Calificaciones guarda un cambio en `classkids_test` y lo restaura enseguida. La huella MD5 de la tabla `calificaciones` antes y después fue idéntica.
- Los diálogos de eliminar y desactivar se capturaron y se cancelaron.
- Desde el 24/11/2026 cada docente ve solo sus asignaciones (H-08). Las capturas del docente usan el docente demo (5 materias en 3 grupos); se agregaron vistas de un docente con una sola materia (Matemáticas), del administrador y del filtro por materia en Análisis. Las respuestas de la API ante accesos no autorizados están en [`../permisos/verificacion-api-permisos.md`](../permisos/verificacion-api-permisos.md).
- El video vigente (`frontend/public/video/recorrido-classkids-v3.webm`, grabado después de H-08) muestra al docente con sus asignaciones y al administrador con la visión general; tiene música instrumental original, a volumen bajo, que no suena sola y se controla desde la landing. Las versiones anteriores (v1, v2 y la v3 con la nota en porcentaje) se eliminaron el 25/11/2026.

## Landing · `vigente/landing/` · 24 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Política de privacidad | [ver](vigente/landing/2026-11-24_politica-privacidad_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_politica-privacidad_escritorio_oscuro.png) | — | — |
| Landing completa | [ver](vigente/landing/2026-11-24_pagina-completa_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_pagina-completa_escritorio_oscuro.png) | [ver](vigente/landing/2026-11-24_pagina-completa_celular_claro.png) | [ver](vigente/landing/2026-11-24_pagina-completa_celular_oscuro.png) |
| Portada: mensaje, acciones y panel real integrado | [ver](vigente/landing/2026-11-24_portada_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_portada_escritorio_oscuro.png) | [ver](vigente/landing/2026-11-24_portada_celular_claro.png) | [ver](vigente/landing/2026-11-24_portada_celular_oscuro.png) |
| Franja de funcionalidades | [ver](vigente/landing/2026-11-24_funcionalidades_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_funcionalidades_escritorio_oscuro.png) | [ver](vigente/landing/2026-11-24_funcionalidades_celular_claro.png) | [ver](vigente/landing/2026-11-24_funcionalidades_celular_oscuro.png) |
| Panel real integrado en la portada | [ver](vigente/landing/2026-11-24_panel-en-portada_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_panel-en-portada_escritorio_oscuro.png) | — | — |
| Presentación de los módulos reales | [ver](vigente/landing/2026-11-24_presentacion-modulos_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_presentacion-modulos_escritorio_oscuro.png) | [ver](vigente/landing/2026-11-24_presentacion-modulos_celular_claro.png) | [ver](vigente/landing/2026-11-24_presentacion-modulos_celular_oscuro.png) |
| Flujo de acompañamiento con pantallas reales en el celular | [ver](vigente/landing/2026-11-24_flujo-acompanamiento_escritorio_claro.png) | [ver](vigente/landing/2026-11-24_flujo-acompanamiento_escritorio_oscuro.png) | [ver](vigente/landing/2026-11-24_flujo-acompanamiento_celular_claro.png) | [ver](vigente/landing/2026-11-24_flujo-acompanamiento_celular_oscuro.png) |

## Inicio de sesión · `vigente/login/` · 12 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Inicio de sesión | [ver](vigente/login/2026-11-24_inicio-sesion_escritorio_claro.png) | [ver](vigente/login/2026-11-24_inicio-sesion_escritorio_oscuro.png) | [ver](vigente/login/2026-11-24_inicio-sesion_celular_claro.png) | [ver](vigente/login/2026-11-24_inicio-sesion_celular_oscuro.png) |
| Mensaje de error: credenciales incorrectas | [ver](vigente/login/2026-11-24_error-credenciales_escritorio_claro.png) | [ver](vigente/login/2026-11-24_error-credenciales_escritorio_oscuro.png) | [ver](vigente/login/2026-11-24_error-credenciales_celular_claro.png) | [ver](vigente/login/2026-11-24_error-credenciales_celular_oscuro.png) |
| Formulario de recuperación de contraseña | [ver](vigente/login/2026-11-24_recuperar-contrasena_escritorio_claro.png) | [ver](vigente/login/2026-11-24_recuperar-contrasena_escritorio_oscuro.png) | — | — |
| Ruta inexistente | [ver](vigente/login/2026-11-24_pagina-404_escritorio_claro.png) | [ver](vigente/login/2026-11-24_pagina-404_escritorio_oscuro.png) | — | — |

## Dashboard · `vigente/dashboard/` · 12 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Estado de carga del Dashboard | [ver](vigente/dashboard/2026-11-24_estado-carga_escritorio_claro.png) | [ver](vigente/dashboard/2026-11-24_estado-carga_escritorio_oscuro.png) | — | — |
| Dashboard del docente | [ver](vigente/dashboard/2026-11-24_panel-docente_escritorio_claro.png) | [ver](vigente/dashboard/2026-11-24_panel-docente_escritorio_oscuro.png) | [ver](vigente/dashboard/2026-11-24_panel-docente_celular_claro.png) | [ver](vigente/dashboard/2026-11-24_panel-docente_celular_oscuro.png) |
| Dashboard de un docente con una materia: solo sus grupos, sus notas y sus alertas | [ver](vigente/dashboard/2026-11-24_panel-docente-una-materia_escritorio_claro.png) | [ver](vigente/dashboard/2026-11-24_panel-docente-una-materia_escritorio_oscuro.png) | — | — |
| Menú «Más» del docente (sin módulos de administración) | — | — | [ver](vigente/dashboard/2026-11-24_menu-mas-docente_celular_claro.png) | [ver](vigente/dashboard/2026-11-24_menu-mas-docente_celular_oscuro.png) |
| Dashboard del administrador: visión general del colegio | [ver](vigente/dashboard/2026-11-24_panel-administrador-general_escritorio_claro.png) | [ver](vigente/dashboard/2026-11-24_panel-administrador-general_escritorio_oscuro.png) | — | — |

## Usuarios y administración · `vigente/modulos/usuarios/` · 16 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Panel de administración | [ver](vigente/modulos/usuarios/2026-11-24_panel-administracion_escritorio_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_panel-administracion_escritorio_oscuro.png) | [ver](vigente/modulos/usuarios/2026-11-24_panel-administracion_celular_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_panel-administracion_celular_oscuro.png) |
| Usuarios y roles | [ver](vigente/modulos/usuarios/2026-11-24_usuarios-roles_escritorio_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_usuarios-roles_escritorio_oscuro.png) | [ver](vigente/modulos/usuarios/2026-11-24_usuarios-roles_celular_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_usuarios-roles_celular_oscuro.png) |
| Formulario de invitación | [ver](vigente/modulos/usuarios/2026-11-24_invitar-docente_escritorio_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_invitar-docente_escritorio_oscuro.png) | — | — |
| Confirmación antes de desactivar (se canceló) | [ver](vigente/modulos/usuarios/2026-11-24_confirmar-desactivar_escritorio_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_confirmar-desactivar_escritorio_oscuro.png) | — | — |
| Datos globales | [ver](vigente/modulos/usuarios/2026-11-24_datos-globales_escritorio_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_datos-globales_escritorio_oscuro.png) | — | — |
| Menú «Más» del administrador (incluye Usuarios) | — | — | [ver](vigente/modulos/usuarios/2026-11-24_menu-mas-administrador_celular_claro.png) | [ver](vigente/modulos/usuarios/2026-11-24_menu-mas-administrador_celular_oscuro.png) |

## Grupos · `vigente/modulos/grupos/` · 6 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Grupos | [ver](vigente/modulos/grupos/2026-11-24_lista_escritorio_claro.png) | [ver](vigente/modulos/grupos/2026-11-24_lista_escritorio_oscuro.png) | [ver](vigente/modulos/grupos/2026-11-24_lista_celular_claro.png) | [ver](vigente/modulos/grupos/2026-11-24_lista_celular_oscuro.png) |
| Formulario de nuevo grupo (administrador) | [ver](vigente/modulos/grupos/2026-11-24_formulario-nuevo_escritorio_claro.png) | [ver](vigente/modulos/grupos/2026-11-24_formulario-nuevo_escritorio_oscuro.png) | — | — |

## Estudiantes · `vigente/modulos/estudiantes/` · 12 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Lista de estudiantes de los grupos del docente (página 1) | [ver](vigente/modulos/estudiantes/2026-11-24_lista_escritorio_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_lista_escritorio_oscuro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_lista_celular_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_lista_celular_oscuro.png) |
| Detalle del estudiante y observaciones | [ver](vigente/modulos/estudiantes/2026-11-24_detalle-observaciones_escritorio_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_detalle-observaciones_escritorio_oscuro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_detalle-observaciones_celular_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_detalle-observaciones_celular_oscuro.png) |
| Formulario de nuevo estudiante | [ver](vigente/modulos/estudiantes/2026-11-24_formulario-nuevo_escritorio_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_formulario-nuevo_escritorio_oscuro.png) | — | — |
| Búsqueda sin resultados | [ver](vigente/modulos/estudiantes/2026-11-24_busqueda-sin-resultados_escritorio_claro.png) | [ver](vigente/modulos/estudiantes/2026-11-24_busqueda-sin-resultados_escritorio_oscuro.png) | — | — |

## Materias · `vigente/modulos/materias/` · 14 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Materias asignadas al docente (solo consulta) | [ver](vigente/modulos/materias/2026-11-24_mis-materias-docente_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_mis-materias-docente_escritorio_oscuro.png) | [ver](vigente/modulos/materias/2026-11-24_mis-materias-docente_celular_claro.png) | [ver](vigente/modulos/materias/2026-11-24_mis-materias-docente_celular_oscuro.png) |
| Asignaciones del docente por grupo | [ver](vigente/modulos/materias/2026-11-24_mis-asignaciones-docente_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_mis-asignaciones-docente_escritorio_oscuro.png) | — | — |
| Catálogo de materias (administrador) | [ver](vigente/modulos/materias/2026-11-24_catalogo_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_catalogo_escritorio_oscuro.png) | — | — |
| Confirmación antes de eliminar (se canceló) | [ver](vigente/modulos/materias/2026-11-24_confirmar-eliminar_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_confirmar-eliminar_escritorio_oscuro.png) | — | — |
| Materias asignadas en cada grupo, con su docente | [ver](vigente/modulos/materias/2026-11-24_vista-por-grupos_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_vista-por-grupos_escritorio_oscuro.png) | — | — |
| Formulario para vincular una materia a un grupo | [ver](vigente/modulos/materias/2026-11-24_formulario-vincular_escritorio_claro.png) | [ver](vigente/modulos/materias/2026-11-24_formulario-vincular_escritorio_oscuro.png) | — | — |

## Actividades · `vigente/modulos/actividades/` · 6 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Actividades | [ver](vigente/modulos/actividades/2026-11-24_lista_escritorio_claro.png) | [ver](vigente/modulos/actividades/2026-11-24_lista_escritorio_oscuro.png) | [ver](vigente/modulos/actividades/2026-11-24_lista_celular_claro.png) | [ver](vigente/modulos/actividades/2026-11-24_lista_celular_oscuro.png) |
| Formulario de nueva actividad | [ver](vigente/modulos/actividades/2026-11-24_formulario-nueva_escritorio_claro.png) | [ver](vigente/modulos/actividades/2026-11-24_formulario-nueva_escritorio_oscuro.png) | — | — |

## Calificaciones · `vigente/modulos/calificaciones/` · 10 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Calificaciones antes de elegir grupo (estado vacío) | [ver](vigente/modulos/calificaciones/2026-11-24_sin-seleccion_escritorio_claro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_sin-seleccion_escritorio_oscuro.png) | — | — |
| Calificaciones de Grado 1A · Taller de Sumas y Restas | [ver](vigente/modulos/calificaciones/2026-11-24_tabla-actividad_escritorio_claro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_tabla-actividad_escritorio_oscuro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_tabla-actividad_celular_claro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_tabla-actividad_celular_oscuro.png) |
| Fila editada sin guardar con su equivalencia | [ver](vigente/modulos/calificaciones/2026-11-24_fila-editada-equivalencia_escritorio_claro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_fila-editada-equivalencia_escritorio_oscuro.png) | — | — |
| Mensaje de éxito al guardar | [ver](vigente/modulos/calificaciones/2026-11-24_guardado-exito_escritorio_claro.png) | [ver](vigente/modulos/calificaciones/2026-11-24_guardado-exito_escritorio_oscuro.png) | — | — |

## Análisis · `vigente/modulos/analisis/` · 8 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Análisis de rendimiento | [ver](vigente/modulos/analisis/2026-11-24_rendimiento_escritorio_claro.png) | [ver](vigente/modulos/analisis/2026-11-24_rendimiento_escritorio_oscuro.png) | [ver](vigente/modulos/analisis/2026-11-24_rendimiento_celular_claro.png) | [ver](vigente/modulos/analisis/2026-11-24_rendimiento_celular_oscuro.png) |
| Análisis del docente de Matemáticas: solo su materia y sus grupos | [ver](vigente/modulos/analisis/2026-11-24_rendimiento-docente-una-materia_escritorio_claro.png) | [ver](vigente/modulos/analisis/2026-11-24_rendimiento-docente-una-materia_escritorio_oscuro.png) | — | — |
| Análisis filtrado por una materia (Matemáticas), sin mezclar otras | [ver](vigente/modulos/analisis/2026-11-24_filtro-por-materia_escritorio_claro.png) | [ver](vigente/modulos/analisis/2026-11-24_filtro-por-materia_escritorio_oscuro.png) | — | — |

## Alertas · `vigente/modulos/alertas/` · 8 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Alertas tempranas | [ver](vigente/modulos/alertas/2026-11-24_lista_escritorio_claro.png) | [ver](vigente/modulos/alertas/2026-11-24_lista_escritorio_oscuro.png) | [ver](vigente/modulos/alertas/2026-11-24_lista_celular_claro.png) | [ver](vigente/modulos/alertas/2026-11-24_lista_celular_oscuro.png) |
| Detalle de una alerta | [ver](vigente/modulos/alertas/2026-11-24_detalle_escritorio_claro.png) | [ver](vigente/modulos/alertas/2026-11-24_detalle_escritorio_oscuro.png) | — | — |
| Estado de error de conexión (petición cortada a propósito) | [ver](vigente/modulos/alertas/2026-11-24_error-conexion_escritorio_claro.png) | [ver](vigente/modulos/alertas/2026-11-24_error-conexion_escritorio_oscuro.png) | — | — |

## Modo claro y oscuro · `vigente/temas/` · 10 capturas

| Vista | Escritorio | Celular |
|---|---|---|
| Portada de la landing: modo claro y oscuro (selector persistente) | [ver](vigente/temas/2026-11-24_landing-claro-y-oscuro_escritorio_ambos.png) | [ver](vigente/temas/2026-11-24_landing-claro-y-oscuro_celular_ambos.png) |
| Inicio de sesión: modo claro y oscuro (selector persistente) | [ver](vigente/temas/2026-11-24_login-claro-y-oscuro_escritorio_ambos.png) | [ver](vigente/temas/2026-11-24_login-claro-y-oscuro_celular_ambos.png) |
| Dashboard del docente: modo claro y oscuro (selector persistente) | [ver](vigente/temas/2026-11-24_dashboard-claro-y-oscuro_escritorio_ambos.png) | [ver](vigente/temas/2026-11-24_dashboard-claro-y-oscuro_celular_ambos.png) |
| Calificaciones: modo claro y oscuro (selector persistente) | [ver](vigente/temas/2026-11-24_calificaciones-claro-y-oscuro_escritorio_ambos.png) | [ver](vigente/temas/2026-11-24_calificaciones-claro-y-oscuro_celular_ambos.png) |
| Análisis: modo claro y oscuro (selector persistente) | [ver](vigente/temas/2026-11-24_analisis-claro-y-oscuro_escritorio_ambos.png) | [ver](vigente/temas/2026-11-24_analisis-claro-y-oscuro_celular_ambos.png) |

## Recorrido en video · `vigente/video/` · 4 capturas

| Vista | Escritorio · claro | Escritorio · oscuro | Celular · claro | Celular · oscuro |
|---|---|---|---|---|
| Video del recorrido con música, en reproducción (segundo 6.4), con sus controles de audio | [ver](vigente/video/2026-11-24_reproduciendo_escritorio_claro.png) | [ver](vigente/video/2026-11-24_reproduciendo_escritorio_oscuro.png) | [ver](vigente/video/2026-11-24_reproduciendo_celular_claro.png) | [ver](vigente/video/2026-11-24_reproduciendo_celular_oscuro.png) |

## Depuración de evidencias (23/11/2026)

Las capturas V2 y las 94 capturas V3 anteriores se retiraron intencionalmente porque no representaban fielmente la aplicación. Este conjunto las reemplaza por completo.

El 24/11 se retiró la comparación de la portada con la maqueta: la maqueta fue solo una referencia de estilo y las evidencias muestran únicamente la aplicación real.

El 24/11, después de corregir H-08, se volvieron a tomar todas las capturas afectadas por los permisos (130 → 142): las del docente cambiaron de alcance y las acciones de catálogo se capturan con el administrador.
