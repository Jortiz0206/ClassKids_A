# Matriz de trazabilidad

Relaciona cada requisito funcional con su caso de uso, historia de usuario, pantalla, endpoints, tablas, estado y hallazgos asociados. Verificada el 20/11/2026 y actualizada el 24/11/2026 con los permisos por asignación (H-08) y la autoprotección del administrador (H-18).

| RF | CU | HU | Pantalla (frontend) | Endpoints | Tablas | Estado | Hallazgos |
|---|---|---|---|---|---|---|---|
| RF-01 Iniciar sesión | CU-01 | HU-01 | `Auth.tsx` | `POST /auth/login` | usuarios, user_roles | Implementado | H-21 |
| RF-02 Cerrar sesión | CU-03 | HU-03 | `AppSidebar.tsx`, `AdminLayout.tsx` | — (cliente) | — | Parcial | H-09 |
| RF-03 Gestionar grupos | CU-04 | HU-07 | `Grupos.tsx` | `GET/POST/PUT/DELETE /grupos` | grupos | Parcial | H-12, H-13 (pendientes); H-27 corregido |
| RF-04 Gestionar estudiantes | CU-05 | HU-08 | `Estudiantes.tsx` | `GET/POST/PUT/DELETE /estudiantes` | estudiantes | Parcial | H-11, H-12 (pendientes); H-05 y H-28 corregido |
| RF-05 Consultar estudiantes | CU-05 | HU-08 | `Estudiantes.tsx` | `GET /estudiantes`, `/calificaciones`, `/alertas` | estudiantes, calificaciones, alertas | Implementado | H-01 (pendiente); H-29 corregido |
| RF-06 Registrar actividad | CU-08 | HU-11 | `Actividades.tsx` | `GET/POST/PUT/DELETE /actividades` | actividades | Parcial | H-12 (pendiente); H-16 y H-30 corregidos parcialmente |
| RF-07 Registrar calificación | CU-09 | HU-12 | `Calificaciones.tsx` | `GET/POST/PUT /calificaciones` | calificaciones | Con observaciones | Corregidos: H-02, H-03, H-05, H-24, H-31, H-33, H-44. Pendientes: H-06, H-19 |
| RF-08 Calcular promedio | CU-09, CU-11 | HU-12 | Varias pantallas | `POST /calificaciones` (promedio para la alerta) | calificaciones | Implementado | H-01 |
| RF-09 Consultar historial | CU-05 | HU-13 | Detalle en `Estudiantes.tsx` | `GET /calificaciones`, `/observaciones` | calificaciones, observaciones | Parcial | H-12 |
| RF-10 Analizar desempeño | CU-11 | HU-15 | `Analisis.tsx` | `GET /grupos`, `/estudiantes`, `/calificaciones`, `/actividades` | varias | Con observaciones | H-01, H-07 |
| RF-11 Generar alerta | CU-12 | HU-16 | — (automática) | `POST /calificaciones`, `POST /alertas` | alertas | Parcial | H-04 (decisión funcional), H-12 (pendientes); H-01 y H-32 corregida |
| RF-12 Consultar alertas | CU-13 | HU-17 | `Alertas.tsx`, `AlertsPanel.tsx` | `GET /alertas` | alertas | Implementado | H-15 |
| RF-13 Actualizar estado de alerta | CU-13 | HU-17 | `Alertas.tsx` | `PUT /alertas/{id}/estado` | alertas | Implementado | — |
| RF-14 Registrar observación | CU-10 | HU-14 | `ObservacionesEstudiante.tsx` | `POST /observaciones` | observaciones | Implementado | — |
| RF-15 Consultar observaciones | CU-10 | HU-14 | `ObservacionesEstudiante.tsx` | `GET`, `DELETE /observaciones` | observaciones | Implementado | — |
| RF-16 Recuperar contraseña | CU-14 | HU-02 | `Auth.tsx`, `ResetPassword.tsx` | `POST /auth/forgot-password`, `/auth/reset-password` | password_reset_tokens, usuarios | Implementado | — |
| RF-17 Invitar y activar usuarios | CU-02, CU-15 | HU-04 | `AdminUsuarios.tsx`, `Invitation.tsx` | `POST /usuarios/invitar`, `GET/POST /invitaciones/{token}` | invitaciones, usuarios | Implementado | — |
| RF-18 Modificar rol | CU-02 | HU-05 | `AdminUsuarios.tsx` | `PUT /usuarios/{id}/rol` | usuarios | Implementado | H-09 y H-18 corregidos |
| RF-19 Desactivar usuario | CU-02 | HU-06 | `AdminUsuarios.tsx` | `DELETE /usuarios/{id}` | usuarios | Implementado | H-09 y H-18 corregidos |
| RF-20 Gestionar materias | CU-06 | HU-09 | `Materias.tsx` | `GET/POST/PUT/DELETE /materias` | materias | Parcial | H-12 |
| RF-21 Asignar docente | CU-07 | HU-10 | `Materias.tsx` | `GET/POST/DELETE /asignaciones`, `GET /catalogo/docentes` | asignaciones | Implementado | H-08 corregido |
| RF-22 Métricas globales | CU-16 | HU-18 | `AdminDashboard.tsx` | 6 endpoints `/…/count` | varias | Implementado | H-25 corregido |
| RF-23 Datos globales | CU-16 | HU-19 | `AdminDatos.tsx` | `GET /grupos`, `/estudiantes`, `/alertas` | varias | Implementado | H-26 corregido |
| RF-24 Resumen del docente | CU-11 | HU-20 | `Dashboard.tsx` y `components/dashboard/*` | `GET /grupos`, `/estudiantes`, `/actividades`, `/alertas`, `/materias`, `/calificaciones` | varias | Con observaciones | H-14 (pendiente); H-25 corregido |
| RF-25 Información pública | — | — | `Landing.tsx`, `legal/*` | — | — | Implementado | — |
| RF-26 Control de acceso por asignación | CU-01, CU-04 a CU-13 | HU-21, HU-22 | Todas las pantallas de `/app`; `MisAsignaciones.tsx` | Todas las rutas de datos (`sesion_actual`, filtros por asignación) | asignaciones y tablas académicas | Implementado | H-08 corregido |

## Requisitos no funcionales y evidencia

| RNF | Evidencia en el proyecto | Estado |
|---|---|---|
| RNF-01 Seguridad de autenticación | `pwd_context` (PBKDF2) y `create_access_token` en `main.py` | Parcial |
| RNF-02 Rendimiento | Sin pruebas de carga | No verificado |
| RNF-03 Persistencia relacional | PostgreSQL 15, `init.sql` | Cumplido |
| RNF-04 Usabilidad | shadcn/ui, Sonner, capturas de interfaces | Cumplido |
| RNF-05 Exportación | — | No implementado |
| RNF-06 Auditoría | Solo columnas de fecha | Parcial |
| RNF-07 Portabilidad | Captura móvil 390 px (Chromium) | Parcial |
| RNF-08 Tiempo real | — | No implementado |
| RNF-09 Respaldos | Procedimiento manual en el manual técnico | No implementado |
| RNF-10 Español | Toda la interfaz | Cumplido |
| RNF-11 Integridad de datos | `CHECK` de nota | Parcial |
| RNF-12 Inactividad | Token de 8 horas | No implementado |
| RNF-13 Disponibilidad | Entorno local | No aplica |
| RNF-14 Control de acceso | Middleware `require_authentication`, `sesion_actual`, `solo_admin`; `test_permisos.py`; P-SEG-01 a P-SEG-07 | Cumplido |
| RNF-18 Confidencialidad por asignación | Filtros por asignación en `main.py`; `test_permisos.py` (19), `permisos.spec.ts` (2); `evidencias/permisos/verificacion-api-permisos.md` | Cumplido |
| RNF-15 CORS | `CORSMiddleware` con `CORS_ORIGINS` | Cumplido |
| RNF-16 Pruebas automatizadas | 264 pruebas el 24/11/2026 en el entorno aislado (156 pytest, 64 Vitest y 44 Playwright) y 17 sobre la demostración (11 pytest y 6 Playwright) | Parcial |
| RNF-17 Tokens de recuperación | Tabla `password_reset_tokens` | Cumplido |

## Trazabilidad de los permisos (24/11/2026)

Cadena completa de cada cambio de seguridad: requisito → regla de negocio → caso de uso → implementación → prueba → evidencia.

| Requisito | Regla | Caso de uso | Implementación | Prueba | Evidencia |
|---|---|---|---|---|---|
| RF-18, RF-19 (H-18): el administrador no se cambia el rol ni se desactiva | RN-28 | CU-02 (A4) | `actualizar_rol_usuario`, `desactivar_usuario` (403 si el id es el del token); `isSelf` en `AdminUsuarios.tsx` | `test_h18_*` (4) en `test_permisos.py`; Playwright «El administrador no puede cambiarse el rol ni desactivarse… (H-18)» | `verificacion-api-permisos.md` (casos 1 y 2); captura `modulos/usuarios/…usuarios-roles…` |
| RF-26 / RNF-18: el docente ve solo sus grupos, materias y estudiantes | RN-34, RN-38 | CU-04, CU-05, CU-06 | `GET /grupos`, `/materias`, `/estudiantes`, `/observaciones` filtrados por `asignaciones` | `test_h08_docente_ve_solo_sus_materias`, `…_sus_grupos`, `…_no_ve_estudiantes_de_otro_grupo`, `…_observaciones_solo_de_sus_grupos` | `verificacion-api-permisos.md`; capturas `modulos/materias/…mis-materias-docente…`, `modulos/grupos/…lista…` |
| RF-06, RF-07, RF-26: actividades y notas solo en la materia y el grupo asignados | RN-35 | CU-08, CU-09 | `tiene_asignacion`, `exigir_calificar`, `_exigir_actividad`, `_exigir_calificacion`; formulario de actividades filtrado por asignación | `test_h08_califica_dentro_de_su_asignacion`, `…_no_califica_otra_materia`, `…_no_califica_estudiante_de_otro_grupo`, `…_no_modifica_ni_borra_notas_ajenas`, `…_actividades_solo_en_sus_asignaciones` | `verificacion-api-permisos.md` |
| RF-12, RF-13, RF-26: alertas del ámbito del docente | RN-37 | CU-13 | `_ALERTA_VISIBLE` en `GET /alertas`, conteo y `_exigir_alerta` | `test_h08_alertas_solo_de_sus_estudiantes_y_su_materia`, `…_alertas_y_observaciones_ajenas_no_se_modifican` | `verificacion-api-permisos.md`; capturas `modulos/alertas/…` |
| RF-10, RF-24: indicadores del docente por materia | RN-36 | CU-11 | `MisAsignaciones.tsx`, `PerformanceChart.tsx`, filtro «Materia» en `Analisis.tsx` | `test_h08_calificaciones_solo_de_su_materia_y_sus_grupos`; Playwright `permisos.spec.ts` (2) | capturas `dashboard/…panel-docente-una-materia…`, `modulos/analisis/…filtro-por-materia…` |
| RF-03, RF-20, RF-21: catálogo y asignaciones solo para el administrador | RN-33 | CU-04, CU-06, CU-07 | `solo_admin()` en grupos, materias, asignaciones y eliminación de estudiantes; `/catalogo` en `ADMIN_PREFIXES` | `test_h08_catalogo_y_asignaciones_solo_administrador`; Playwright «Materias: el docente solo consulta…» | `verificacion-api-permisos.md`; capturas `modulos/materias/…catalogo…` (administrador) |
| RF-22, RF-23, RF-24: el administrador conserva la visión general | RN-33 | CU-16, CU-11 | Sin filtros para el rol administrador | `test_h08_admin_conserva_acceso_general`; Playwright «el administrador conserva la visión general…» | capturas `dashboard/…panel-administrador-general…`, `modulos/usuarios/…panel-administracion…` |

## Trazabilidad de los hallazgos del cierre (24/11/2026)

| Hallazgo | Requisito o regla | Implementación | Prueba | Evidencia |
|---|---|---|---|---|
| H-01 | RN-03, RN-09; RF-05, RF-10 | `promedioExacto` en `lib/notas.ts`; `Estudiantes.tsx`, `Analisis.tsx`, `RecentStudents.tsx`, `MisAsignaciones.tsx` | Vitest `notas.test.ts` (3 casos) | `Docs/pruebas/reporte-ejecucion-2026-11-24.md` |
| H-05 | RNF-11; RF-04, RF-07 | Esquemas con `Field(...)`, manejadores de `IntegrityError`, `DataError` y global en `main.py` | pytest `test_hallazgos_cierre.py` (5 casos) | Reporte del 24/11 |
| H-09 | RNF-14, RN-27; RF-18, RF-19 | `_estado_cuenta` en el middleware; `cerrarSesionLocal` en `api/client.ts`; motivo en `Auth.tsx` | pytest (3), Vitest `client.test.ts` (2), Playwright `sesion.spec.ts` | Reporte del 24/11 |
| H-17 | Manual técnico (configuración) | `load_dotenv` en `database.py` | pytest (2 casos) | Reporte del 24/11 |
| H-43 | RNF-15 | CORS como middleware más externo | pytest (1 caso) | Reporte del 24/11 |
| H-44 | RN-01, RN-02, RNF-11; RF-07 | `CalificacionSchema.nota` y `nota_con_un_decimal` en `main.py`; `aEscala5` en `lib/notas.ts` | pytest `test_escala_notas.py` (56), Vitest `notas.test.ts` (4), Playwright `calificaciones.spec.ts` (1) | `Docs/evidencias/escala-notas/verificacion-escala.md` |
| H-04 | RN-09, RN-10 | Sin cambios (decisión pendiente) | `test_alertas.py::test_editar_una_nota_no_evalua_la_regla` documenta RN-10 | `Docs/hallazgos.md` |
