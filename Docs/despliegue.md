# Despliegue (criterio 4)

Estado del 20/11/2026. ClassKids **no está publicado en internet**: se ejecuta en entorno local, con un entorno real y otro de pruebas aislado. Este documento describe lo que existe, cómo se ejecuta y qué falta para un despliegue apropiado. **No se publicó nada ni se modificaron servicios reales.**

## 1. Qué existe

| Pieza | Archivo | Estado |
|---|---|---|
| Base de datos real en Docker | `backend/docker-compose.yml` (PostgreSQL 15-alpine, puerto 5432, volumen `postgres_data`, `init.sql`, *healthcheck*) | Funciona |
| Base de datos de pruebas en Docker | `backend/docker-compose.test.yml` (proyecto `classkids-test`, puerto 5433, `init.sql` + migración 001) | Funciona |
| Variables del backend | `backend/.env.example` (10 variables documentadas) | Documentado; ver H-17 |
| Variable del frontend | `VITE_API_URL` (en `frontend/src/api/client.ts`; por defecto `http://127.0.0.1:8000`) | Funciona; probada con `:8001` |
| Compilación de producción del frontend | `vite build` | Compila (aviso de bloque > 500 kB) |
| Migraciones | `backend/migrations/001_calificaciones_entregado.sql` + informe `Docs/migraciones/001-informe-preparacion.md` | Aplicada solo en pruebas; pendiente de autorización en la base real |
| Respaldo previo a la migración | `backend/backups/` (fuera de Git) | Existe; se requiere un respaldo nuevo justo antes de migrar |

## 2. Ejecución actual (local)

```bash
# Base de datos (backend/)
docker compose up -d

# Backend (backend/), con variables del sistema o .env
python -m venv venv && venv/Scripts/pip install -r requirements.txt
venv/Scripts/python -m uvicorn main:app --port 8000

# Frontend (frontend/)
pnpm install
pnpm dev            # http://localhost:8080
# Producción: VITE_API_URL=https://<api> pnpm build  → carpeta dist/
```

El entorno de pruebas se levanta igual, con otros puertos y variables (ver [`../e2e/README.md`](../e2e/README.md)).

## 3. Qué falta para un despliegue apropiado

| Falta | Por qué importa | Propuesta |
|---|---|---|
| Dockerfile del backend | Hoy el backend depende del Python instalado en el equipo | Imagen `python:3.12-slim` con `uvicorn main:app --host 0.0.0.0` |
| Dockerfile del frontend | `dist/` se debe servir con un servidor web | Construcción multietapa: `node` → `nginx` sirviendo `dist/` con *fallback* a `index.html` |
| `docker-compose` completo (db + api + web) | Levantar todo con un comando y variables por entorno | `docker-compose.prod.yml` con `env_file` |
| Corregir H-17 | `DATABASE_URL` del `.env` se ignora | Cargar `.env` antes de crear el motor (requiere autorización) |
| Configuración segura (H-23) | Credenciales por defecto de PostgreSQL, `/docs` público, `ENVIRONMENT` en desarrollo | Secretos fuera del código, `ENVIRONMENT=production`, `JWT_SECRET` largo, CORS limitado al dominio real |
| HTTPS y dominio | Los tokens viajan en cada petición | Proxy inverso con TLS |
| Migración 001 en la base real | La columna `entregado` falta en producción | Ejecutar con respaldo nuevo y autorización; reiniciar el backend después |
| Plataforma de publicación | No se ha elegido | Decisión del equipo (requiere cuentas externas) |

## 4. Lista de verificación para el día del despliegue

1. Respaldo con `pg_dump` y verificación de su integridad.
2. Variables de producción definidas: `ENVIRONMENT`, `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGINS`, `FRONTEND_URL` y SMTP si aplica.
3. `VITE_API_URL` apuntando a la URL pública de la API antes de `pnpm build`.
4. Migración 001 aplicada (autorizada) y backend reiniciado.
5. Pruebas de humo: inicio de sesión, Dashboard, guardar una calificación de prueba y revertirla.

## 5. Decisiones pendientes del equipo

- ¿Basta con un despliegue local en contenedores para la sustentación, o se publicará?
- Si se publica: plataforma y responsable de las cuentas.
- Autorización para crear los Dockerfiles y el compose completo (archivos nuevos, sin cambiar la lógica).
