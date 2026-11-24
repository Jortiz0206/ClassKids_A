# Requisitos no funcionales

Los requisitos RNF-01 a RNF-13 provienen del documento original. Los requisitos RNF-14 a RNF-17 se agregaron para cubrir aspectos de seguridad, mantenibilidad y confiabilidad presentes en la implementación. RNF-18 se agregó el 24/11/2026 con la confidencialidad por asignación (H-08); RNF-14 y RNF-16 se actualizaron ese día. El estado se verificó el 20/11/2026 contra el código y el entorno local en ejecución.

**Convenciones de estado.** *Cumplido*, *Parcial*, *No implementado* y *No verificado* (no existe evidencia medible en el proyecto).

| RNF | Categoría | Descripción | CU relacionados | Estado y evidencia |
|---|---|---|---|---|
| RNF-01 | Seguridad | La autenticación y el cierre de sesión deben ser seguros, con cifrado de contraseñas. | CU-01, CU-03 | Parcial. Las contraseñas se almacenan con hash PBKDF2 (`passlib`) y el login solo acepta coincidencias con el hash. El cierre de sesión elimina el token del navegador, pero no lo revoca en el servidor. |
| RNF-02 | Rendimiento | Responder en menos de 3 segundos al 95 % de las consultas con hasta 50 usuarios concurrentes. | Todos | No verificado. No existen pruebas de carga. Con los datos demo (200 estudiantes) las pantallas cargan sin demoras perceptibles en el entorno local, pero la pantalla Actividades realiza alrededor de 107 peticiones al cargar (hallazgo H-16). |
| RNF-03 | Persistencia | Guardar la información en una base de datos relacional. | CU-04 a CU-13 | Cumplido. PostgreSQL 15 con 12 tablas, claves primarias, claves foráneas, restricciones UNIQUE y CHECK. |
| RNF-04 | Usabilidad | La interfaz debe ser intuitiva, clara y consistente. | CU-04 a CU-11 | Cumplido. Componentes uniformes (shadcn/ui), formularios en ventanas modales, mensajes de confirmación y error (Sonner) y navegación lateral fija. |
| RNF-05 | Usabilidad | Exportar reportes y tableros a PDF y Excel. | CU-11 | No implementado. |
| RNF-06 | Auditoría | Registrar fecha, usuario y cambios de observaciones y alertas. | CU-10, CU-12, CU-13 | Parcial. Se registra la fecha (`fecha`, `fecha_creacion`), pero no el usuario que crea o modifica, ni el historial de cambios. |
| RNF-07 | Portabilidad | Funcionar en navegadores modernos y en dispositivos móviles. | Todos | Parcial. Aplicación web estándar (React/Vite) con diseño adaptable: en pantallas pequeñas la barra lateral se reduce a íconos. Verificado en Chromium a 1366 px y 390 px de ancho; no se probó en Firefox, Edge ni Safari. |
| RNF-08 | Disponibilidad | Notificar las alertas en tiempo real. | CU-12 | No implementado. Las alertas se ven al abrir o recargar la pantalla. |
| RNF-09 | Disponibilidad | Respaldo diario y recuperación ante fallos. | CU-02, CU-04, CU-05 | No implementado. Los datos persisten en el volumen Docker `postgres_data`; no hay respaldos automáticos. |
| RNF-10 | Usabilidad | Interfaz y mensajes en español. | Todos | Cumplido. |
| RNF-11 | Integridad de datos | Notas numéricas entre 0.0 y 5.0 con decimales; fechas de entrega válidas y no anteriores a la creación. | CU-08, CU-09 | Parcial. Desde el 24/11/2026 la API valida rangos y longitudes y responde 409/422 en lugar de 500 (H-05). La escala oficial 0.0–5.0 se cumple: la base de datos restringe la nota con `CHECK (nota >= 0 AND nota <= 5)` y un decimal (`NUMERIC(3,1)`); la interfaz la presenta en porcentaje y convierte al guardar. Desde el 24/11/2026 la API también rechaza notas fuera de 0–5, con más de un decimal o que no sean números (H-05, H-44). No se valida que la fecha de entrega sea futura. |
| RNF-12 | Seguridad | Cerrar la sesión tras 15 minutos de inactividad. | CU-01 | No implementado. El token vence a las 8 horas, sin control de inactividad. |
| RNF-13 | Disponibilidad | Disponibilidad del 99 % en la jornada escolar (7:00 a. m. – 3:00 p. m.). | Todos | No aplica en la versión actual: el sistema se ejecuta en un entorno local de desarrollo, sin servidor de producción ni monitoreo. |
| RNF-14 | Seguridad | Controlar el acceso a la API por autenticación y rol. Criterio verificable: sin token toda ruta privada responde 401; las rutas de usuarios, métricas de usuarios y catálogo de docentes responden 403 a un docente; crear, editar o eliminar grupos, materias y asignaciones, y eliminar estudiantes, responden 403 a un docente; el administrador no puede cambiar su propio rol ni desactivarse (403). | Todos | Cumplido (24/11/2026). Verificado con `backend/tests/test_permisos.py` y `Docs/evidencias/permisos/verificacion-api-permisos.md` (18 de 18 casos). |
| RNF-18 | Confidencialidad | Un docente solo accede a la información académica de sus asignaciones (docente + materia + grupo). Criterio verificable: las listas que recibe excluyen grupos, materias, estudiantes, actividades, calificaciones, observaciones y alertas fuera de su ámbito, y toda petición que apunte a un registro ajeno (por ejemplo, cambiando `grupo_id`, `actividad_id`, `estudiante_id` o `materia_id`) responde 403 sin modificar datos. La identidad se toma del token, nunca del cliente. | CU-04 a CU-13 | Cumplido (24/11/2026). 19 pruebas de API con casos permitidos y denegados, 2 pruebas de interfaz y evidencia de 18 peticiones reales. Limitación: la tabla `alertas` no guarda la materia (ver RN-37). |
| RNF-15 | Seguridad | Restringir los orígenes permitidos (CORS). | Todos | Cumplido. Configurable con `CORS_ORIGINS`; por defecto solo se permiten los puertos locales del frontend (8080 y 5173). |
| RNF-16 | Mantenibilidad | Contar con pruebas automatizadas. | Todos | Parcial. Suite ejecutada el 24/11/2026 en el entorno de pruebas aislado: 128 pruebas de API (pytest), 59 de lógica (Vitest) y 44 de interfaz (Playwright), todas aprobadas; ninguna omitida ni deshabilitada. No hay medición de cobertura. |
| RNF-17 | Confiabilidad | Los tokens de recuperación deben persistir y expirar. | CU-14 | Cumplido. Se guardan en `password_reset_tokens` con vencimiento de 30 minutos y uso único. Limitación operativa: sin SMTP configurado el enlace no llega al usuario. |

## Resumen

| Estado | Cantidad | Requisitos |
|---|---|---|
| Cumplido | 7 | RNF-03, RNF-04, RNF-10, RNF-14, RNF-15, RNF-17, RNF-18 |
| Parcial | 5 | RNF-01, RNF-06, RNF-07, RNF-11, RNF-16 |
| No implementado | 4 | RNF-05, RNF-08, RNF-09, RNF-12 |
| No verificado o no aplica | 2 | RNF-02, RNF-13 |
| **Total** | **18** | |
