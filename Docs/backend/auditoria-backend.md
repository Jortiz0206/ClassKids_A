# Auditoría del backend (criterio 3)

Revisión del 20/11/2026 sobre `backend/main.py` (810 líneas) y `backend/database.py` (18 líneas). **En esta etapa no se modificó el backend.** Los cambios que propone este documento requieren autorización previa, porque alteran el comportamiento de la API.

## 1. Inicio sin errores

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Arranque del backend de pruebas | `Application startup complete` y `Uvicorn running on http://127.0.0.1:8001`, sin trazas de error | Registro del proceso de pruebas (20/11/2026) |
| Arranque en modo producción sin `JWT_SECRET` | Se detiene con `RuntimeError` a propósito: no permite firmar tokens con una clave por defecto | `main.py`, líneas 150–157 |
| Arranque en desarrollo sin `JWT_SECRET` | Genera una clave aleatoria por proceso y muestra un aviso en texto ASCII (evita el error de codificación en consolas Windows) | `main.py`, líneas 157–163 |
| Advertencias en ejecución | `datetime.utcnow()` está obsoleto en Python 3.12+ (`main.py:170`); avisos de librerías de prueba (httpx/starlette, pytest) | `pytest -W default` |

## 2. Manejo de errores y códigos HTTP

- Se cuentan 27 respuestas con `HTTPException`: 400 (3), 401 (4), 403 (2), 404 (11), 409 (4), 422 (3) y 500 (2).
- Los 401 y 403 los aplica el middleware `require_authentication`: sin token o con token inválido responde 401, y con rol insuficiente en `/usuarios`, `/docentes` y `/admins` responde 403.
- Las violaciones de integridad se traducen a 409 en dos lugares: eliminar un grupo o una materia con dependencias (`IntegrityError`).
- Los mensajes de error están en español («Estado de alerta inválido», «Rol no configurado», …).
- El frontend convierte los errores 422 en texto legible (H-24, corregido).

| Observación | Impacto | Hallazgo | Propuesta (requiere autorización) |
|---|---|---|---|
| Entradas inválidas o duplicadas (por ejemplo, documento de estudiante repetido) llegan a PostgreSQL y responden **500** | El usuario ve un error genérico y la API no explica qué corregir | H-05 | Validar con Pydantic (`Field(min_length…)`, rangos de nota 0.0–5.0) y traducir `IntegrityError` a 409 con un mensaje claro |
| No hay un manejador global de excepciones | Un error inesperado devuelve el formato por defecto de Starlette | `plan-ejecucion.md` | `@app.exception_handler(Exception)` que registre el error y responda `{"detail": "Error interno. Intenta de nuevo."}` |
| Eliminar un registro inexistente responde «eliminado» | El cliente no distingue un éxito de un error | H-11 | Responder 404 cuando `rowcount == 0` |
| El inicio de sesión distingue «desactivada» de «credenciales incorrectas» | Permite saber si un correo existe | H-21 | Mensaje genérico |

## 3. Estados

- **Alertas:** `active`, `reviewed` y `resolved`. `normalize_alert_status` acepta además los estados históricos en español («Pendiente», «Activa», «En revisión», «Revisada», «Resuelta») y rechaza cualquier otro con 422. Lo cubren las pruebas unitarias de `test_unitarias.py`.
- **Usuarios:** `activo` (desactivación lógica). **Estudiantes:** `activo`.
- **Actividades:** `vencida` o `pendiente`, calculado en la consulta (`fecha_entrega < CURRENT_DATE`). RN-16 no cambia.
- **Calificaciones:** `entregado` solo si la columna existe (`columna_existe`, con caché por proceso). Tras aplicar la migración 001 hay que reiniciar el backend.

## 4. Variables de entorno

| Variable | Uso | Valor por defecto | Observación |
|---|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg://postgres:postgrespassword@localhost:5432/classkids` | **H-17:** `main.py` importa `database.py` (línea 19) antes de `load_dotenv()` (línea 21), así que el valor del archivo `.env` se ignora. Sí funciona como variable del sistema (así se usa en pruebas) |
| `JWT_SECRET` | Firma de tokens | Aleatorio en desarrollo | Obligatoria en producción |
| `ENVIRONMENT` | `development` o `production` | `development` | |
| `CORS_ORIGINS` | Orígenes permitidos y validación de `redirect_to` | Puertos 8080 y 5173 | |
| `FRONTEND_URL` | Enlaces de invitación y recuperación | `http://127.0.0.1:8080` | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío de correos | Sin SMTP no se envían correos | |

La plantilla documentada está en `backend/.env.example`. `.env` está excluido de Git (`.gitignore`).

**H-17 corregido el 24/11/2026.** Corrección aplicada: mover `load_dotenv()` antes de `from database import get_db`, o llamarla dentro de `database.py`.

## 5. Conexión a PostgreSQL

- Motor `create_engine(DATABASE_URL)` y `SessionLocal` con `get_db()` como dependencia de FastAPI: abre y cierra la sesión por petición.
- SQL parametrizado con `sqlalchemy.text()`: los valores van como parámetros. El único SQL armado dinámicamente usa nombres de columna de una lista cerrada (`_COLUMNAS_EDITABLES_CALIFICACION`).
- Sin *pool* configurado: se usan los valores por defecto de SQLAlchemy, suficientes para el volumen actual.

## 6. Organización del código

| Aspecto | Estado | Recomendación |
|---|---|---|
| Un solo módulo (`main.py`, 810 líneas) con esquemas, seguridad, correo y 49 endpoints | Funciona, pero es difícil de mantener | Separar en `routers/` (auth, usuarios, académico, alertas), `schemas.py`, `security.py` y `services/` |
| Sin ORM; SQL a mano | Consciente y probado | Mantener, centralizando las consultas repetidas |
| Pruebas | 24 de integración + 18 unitarias | Agregar pruebas para usuarios, invitaciones y materias |
| Permisos por rol solo en el prefijo de la ruta | **H-08 (crítico):** un docente podía usar endpoints de datos de cualquier grupo y algunas funciones administrativas | **Resuelto el 24/11/2026:** cada endpoint verifica el rol y la asignación docente–materia–grupo con la identidad del token (`sesion_actual`) |

## 7. Pendientes que requieren autorización

1. H-17: cargar `.env` antes de crear el motor.
2. H-05: validación de entradas y errores 409/422 con mensajes claros.
3. Manejador global de errores.
4. ~~H-08: permisos por rol y por asignación en la API.~~ Hecho el 24/11/2026 (con H-18).
5. H-04: evaluar la regla de alerta al editar una calificación y por materia.
6. Reemplazar `datetime.utcnow()` por `datetime.now(timezone.utc)`.

Ninguno cambia la escala académica ni los umbrales. H-01 (3.5 frente a 3.0) es una regla académica y se decide aparte.
