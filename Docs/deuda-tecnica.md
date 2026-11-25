# Deuda técnica de ClassKids (priorizada)

Actualizada el 20/11/2026 y revisada el 25/11/2026 (estado de cada hallazgo según `hallazgos.md`) a partir del [registro de defectos](pruebas/registro-defectos.md), la [auditoría del backend](backend/auditoria-backend.md) y la renovación visual.

**Cómo se priorizó:** prioridad = impacto × riesgo.
- **Impacto:** qué se daña si falla. Alto = datos o seguridad; medio = experiencia o rendimiento; bajo = mantenimiento.
- **Riesgo:** probabilidad de que ocurra con el uso normal.

| # | Deuda | Impacto | Riesgo | Prioridad | Origen | Requiere |
|---|---|---|---|---|---|---|
| 1 | ~~Permisos solo por prefijo de ruta (H-08)~~ **Resuelto el 24/11/2026**: permisos por rol y por asignación. Queda la visibilidad de alertas por texto del mensaje (RN-37) | Bajo | Medio | P3 | Backend + base de datos | Autorización |
| 2 | ~~Diferencia de umbrales entre la interfaz y la alerta (H-01)~~ **Resuelto el 24/11/2026**: los dos umbrales aprobados se conservan (3.5 para aprobar y 3.0 para la alerta) y la interfaz clasifica con el promedio exacto | — | — | — | Regla académica | — |
| 3 | Migración 001 sin aplicar en la base real: «Entregado» no persiste en producción (H-31) | Alto | Alto | **P1** | Base de datos | Autorización y respaldo |
| 4 | ~~Entradas inválidas o duplicadas responden 500 (H-05)~~ **Resuelto el 24/11/2026**: validación de rangos y formatos; los errores de integridad responden 409 o 422. Queda: no hay manejador global de errores | Bajo | Medio | P3 | Backend | — |
| 5 | Token vigente tras cerrar sesión (H-09). **Resuelto en parte el 24/11/2026**: la desactivación y el cambio de rol invalidan la sesión en la siguiente petición. Queda: cerrar sesión no revoca el token en el servidor | Medio | Bajo | P3 | Seguridad | Autorización |
| 6 | La regla de alerta no se evalúa al editar ni por materia (H-04) | Alto | Medio | **P2** | Backend | Autorización |
| 7 | ~~El administrador puede quitarse el rol o desactivarse (H-18)~~ **Resuelto el 24/11/2026** en interfaz y API | — | — | — | Backend + frontend | Autorización |
| 8 | Eliminar registros: «eliminado» aunque no exista; borrar un estudiante borra su historial (H-11) | Alto | Bajo | **P2** | Backend | Autorización |
| 9 | ~~`DATABASE_URL` del `.env` se ignora (H-17)~~ **Resuelto el 24/11/2026**. Queda: la configuración de desarrollo expuesta (H-23) | Medio | Medio | **P3** | Despliegue | Autorización |
| 10 | Sin Dockerfiles ni compose completo; sin despliegue público | Medio | Medio | **P3** | Despliegue | Decisión del equipo |
| 11 | Rendimiento: Actividades hace 107 peticiones (5,2 s) y todas las pantallas descargan tablas completas (H-16) | Medio | Medio | **P3** | Frontend + API | Diseño de endpoints agregados |
| 12 | Promedio de la actividad cuenta como 0 a quien no tiene nota (H-19). La pérdida de precisión al convertir (H-03) **se resolvió el 24/11/2026**: la nota se escribe directamente de 0.0 a 5.0 | Medio | Medio | **P3** | Regla de cálculo | Decisión académica |
| 13 | `main.py` monolítico (810 líneas); `datetime.utcnow()` obsoleto | Bajo | Medio | **P4** | Backend | — |
| 14 | Tipado débil: 28 `no-explicit-any` en el frontend (H-20) | Bajo | Medio | **P4** | Frontend | — |
| 15 | Paquete JavaScript de más de 500 kB sin división por rutas | Bajo | Bajo | **P4** | Frontend | — |
| 16 | Sesión vencida no detectada en la interfaz (H-10); fechas de «Última conexión» en UTC (H-22) | Bajo | Medio | **P4** | Frontend | — |
| 17 | Base de datos: índice único duplicado en `asignaciones` y sin índices en las columnas FK (ver `referencia-tecnica/modelo-relacional-diferencias.md`) | Bajo | Bajo | **P4** | Base de datos | Autorización (cambio de esquema) |
| 18 | `password_reset_tokens.email` sin llave foránea hacia `usuarios` (relación solo lógica) | Bajo | Bajo | **P4** | Base de datos | Autorización (cambio de esquema) |

## Deuda saldada en esta etapa (20/11/2026)

- Interfaz sin sistema visual: contraste insuficiente, textos menores de 12 px y estilos paralelos (H-37).
- Pérdida de datos al cambiar el ancho de pantalla (H-34).
- Enlace roto «Ver todos» (H-35).
- Fecha «Hace -1 días» (H-36).
- Botones sin acción (H-13).
- Detalle de alerta incompleto (H-15).
- Suite de pruebas: pasó de 54 a 102 pruebas, con 47 casos unitarios reales.
