# Manual técnico

Guía para instalar, ejecutar y mantener ClassKids en un entorno local. La arquitectura, el modelo de datos y la API se detallan en sus respectivos capítulos.

## 1. Requisitos previos

| Herramienta | Versión de referencia | Uso |
|---|---|---|
| Git | Cualquiera reciente | Obtener el código. |
| Docker Desktop (con Docker Compose) | Cualquiera reciente | Ejecutar PostgreSQL 15. |
| Python | 3.10 o superior (verificado con 3.14) | Backend FastAPI. |
| Node.js | 18 o superior | Frontend. |
| pnpm | 9 o superior | Instalar las dependencias del frontend. |

## 2. Instalación

### 2.1 Base de datos

```bash
cd backend
docker compose up -d
```

Se crea el contenedor `classkids_db` (PostgreSQL 15, puerto 5432, base `classkids`, usuario `postgres`). La primera vez se ejecuta `init.sql`, que crea las 12 tablas y carga los datos demo. Verificar el estado con `docker ps`: debe aparecer como *healthy*.

> `init.sql` solo se ejecuta cuando el volumen está vacío. Para recrear la base desde cero hay que eliminar el volumen (`docker compose down -v`), lo que **borra todos los datos**. Haga un respaldo antes (sección 6).

### 2.2 Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # opcional: personalizar variables
python -m uvicorn main:app --reload
```

La API queda en `http://127.0.0.1:8000` y su documentación interactiva en `http://127.0.0.1:8000/docs`.

### 2.3 Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

La aplicación queda en `http://localhost:8080` (puerto definido en `frontend/vite.config.ts`). Para apuntar a otra URL de la API, defina `VITE_API_URL`.

### 2.4 Cuentas de demostración

`init.sql` crea un administrador y seis docentes. Sus contraseñas se documentan en el archivo local `backend/CREDENCIALES_LOCALES.md`, que está excluido de Git. Para crear usuarios nuevos use el flujo de invitación desde el panel de administración.

## 3. Variables de entorno

Se definen en `backend/.env` (ver `backend/.env.example`).

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | No | Cadena de conexión. Por defecto, la base local de Docker. Se lee de `backend/.env` o del sistema operativo; si existe en ambos, gana la del sistema (H-17 corregido el 24/11/2026). `CLASSKIDS_ENV_FILE` permite indicar otro archivo `.env`. |
| `CLASSKIDS_ENTORNO` | No | `real`, `test` o `demo`. Si se define, el backend comprueba al arrancar que `DATABASE_URL` apunte a `classkids`, `classkids_test` o `classkids_demo`, respectivamente, y no arranca si no coincide. `GET /` muestra el entorno y la base. |
| `CORS_ORIGINS` | No | Orígenes permitidos, separados por comas. |
| `JWT_SECRET` | Sí en producción | Clave de firma de los tokens. Si no se define en desarrollo, se genera una nueva en cada arranque y las sesiones se pierden al reiniciar. **Se recomienda definirla siempre.** |
| `ENVIRONMENT` | No | `development` o `production`. En `production` el backend no arranca sin `JWT_SECRET`. |
| `FRONTEND_URL` | No | URL base de los enlaces de invitación y recuperación. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | No | Servidor de correo (STARTTLS). Sin `SMTP_HOST` no se envían correos. |

## 4. Comandos útiles

| Tarea | Comando | Carpeta |
|---|---|---|
| Pruebas de lógica del frontend (Vitest, 15) | `pnpm test` | `frontend` |
| Pruebas de la API (pytest, 24) | `venv/Scripts/python.exe -m pytest tests -q` (requiere la base de pruebas) | `backend` |
| Pruebas de interfaz (Playwright, 15) | `node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts` (requiere el entorno de pruebas) | raíz |
| Análisis de código | `pnpm run lint` | `frontend` |
| Verificación de tipos | `npx tsc --noEmit -p tsconfig.app.json` | `frontend` |
| Compilar para producción | `pnpm run build` (genera `dist/`) | `frontend` |
| Consola de la base de datos | `docker exec -it classkids_db psql -U postgres -d classkids` | cualquiera |
| Verificaciones de la API | `CK_DOCENTE_PASS=... bash Docs/evidencias/scripts/verificacion-api.sh` | raíz |

## 5. Entorno de pruebas aislado y migraciones

- Las pruebas automatizadas se ejecutan contra una base de pruebas independiente (`classkids_test`, contenedor `classkids_test_db`, puerto 5433), un backend de pruebas (8001) y un frontend de pruebas (8081). Instrucciones y salvaguardas: [`../e2e/README.md`](../e2e/README.md).
- La base de pruebas se crea con `backend/docker-compose.test.yml` a partir de `init.sql` y de las migraciones de `backend/migrations/`. Se puede borrar y recrear sin afectar la base real.
- Inicie el backend de pruebas **sin** `--reload`: en Windows se observó una recarga automática que nunca terminó y el proceso siguió con el código anterior.
- **Migraciones:** `backend/migrations/001_calificaciones_entregado.sql` agrega la columna `calificaciones.entregado`. Está aplicada en la base de pruebas y **no en la base real**. Su preparación (respaldo, ensayo, verificación y reversión) está en [`migraciones/001-informe-preparacion.md`](migraciones/001-informe-preparacion.md). El backend detecta la columna al iniciar; después de aplicar o revertir la migración hay que reiniciarlo.

## 5.1 Entorno de demostración

Base persistente `classkids_demo` (contenedor `classkids_demo_db`, puerto 5434, volumen `classkids_demo_data`), backend en 8002 (`CLASSKIDS_ENV_FILE=.env.demo`) y frontend en 8082 (`npm run demo`).

- **Generación:** los datos se crean con `backend/demo/generar_demo.py` (preparar, generar, verificar), que usa la API real en el mismo proceso.
- **Protección:** el generador se niega a escribir fuera de `classkids_demo`.
- **Guía completa:** [`demo/guia-demostracion.md`](demo/guia-demostracion.md).

## 5.2 Estructura y convenciones del código

- **Backend:** todo está en `backend/main.py`. Cada endpoint recibe un esquema Pydantic, ejecuta SQL parametrizado con `text()` y confirma con `db.commit()`. Para agregar un endpoint privado, su ruta debe empezar por uno de los prefijos de `PRIVATE_PREFIXES`; si es administrativo, también por uno de `ADMIN_PREFIXES`.
- **Frontend:** una página por módulo en `src/pages`. Todas las peticiones pasan por `src/api/client.ts`. Las rutas se declaran en `src/App.tsx` dentro de `ProtectedRoute` o `AdminRoute`.
- **Base de datos:** los cambios de esquema se hacen hoy en `init.sql`; no hay herramienta de migraciones.

## 6. Consulta de la base de datos con DBeaver

| Parámetro | Valor |
|---|---|
| Tipo de conexión | PostgreSQL |
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `classkids` |
| Usuario | `postgres` |
| Contraseña | La definida en `backend/docker-compose.yml` |

En el equipo de desarrollo, el puerto 5432 lo atienden Docker Desktop (IPv4) y `wslrelay` (IPv6). Se verificó que ambas rutas llegan al mismo contenedor `classkids_db`. Para comprobar que DBeaver ve los mismos datos que documenta este proyecto, ejecute `Docs/evidencias/scripts/verificacion-bd.sql` (Alt + X) y compare los resultados con la sección «Verificación en DBeaver» del capítulo de modelo de datos. Use DBeaver solo para consultar: cualquier cambio manual en los datos alteraría los conteos documentados.

## 7. Respaldo y restauración

```bash
# Respaldo
docker exec classkids_db pg_dump -U postgres classkids > backend/backups/classkids_AAAAMMDD.sql
# Restauración (sobre una base vacía)
docker exec -i classkids_db psql -U postgres -d classkids < backend/backups/classkids_AAAAMMDD.sql
```

La carpeta `backend/backups/` está excluida de Git.

**Respaldos verificados el 24/11/2026** (restaurados en una base temporal del contenedor de pruebas, sin errores):

| Archivo | Contenido (grupos/estudiantes/calificaciones/usuarios) |
|---|---|
| `classkids_real_cierre_20261124.dump` | Base real: 11/201/216/9 |
| `classkids_test_cierre_20261124.dump` | Base de pruebas: 10/200/215/7 |
| `classkids_pre_001_20261120.dump` | Base real antes de la migración 001: 10/200/215/8 |
| `classkids_pre_recreate_20260901_132214.sql` | Respaldo de septiembre: 3/20/35/2 |
| `git/classkids-todas-las-ramas-20261124.bundle` | Todas las ramas y etiquetas de Git (`git bundle verify`: correcto) |

Restaurar un respaldo `.dump`: `docker exec -i <contenedor> pg_restore -U postgres -d <base_vacía> < archivo.dump`.

## 8. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Todas las pantallas muestran «Error al cargar…» después de reiniciar el backend | El backend generó un nuevo `JWT_SECRET` y el token guardado ya no es válido. | Cerrar sesión e ingresar de nuevo; definir `JWT_SECRET` en `.env`. |
| Error de CORS en la consola del navegador | El origen del frontend no está en `CORS_ORIGINS`. | Agregar el origen y reiniciar el backend. |
| La aplicación vuelve al inicio de sesión con «Tu cuenta ya no está activa» o «Tu rol cambió» | El administrador desactivó la cuenta o cambió su rol (H-09). | Volver a iniciar sesión; si la cuenta está desactivada, pedir al administrador que la reactive con una invitación. |
| pytest se detiene con «La base de pruebas classkids_test … no responde» | El contenedor de pruebas está detenido. | `docker compose -f docker-compose.test.yml up -d` en `backend/`. |
| El backend no conecta con la base de datos | El contenedor no está activo. | `docker compose up -d` en `backend/` y verificar con `docker ps`. |
| No llegan los correos | `SMTP_HOST` no está definido o las credenciales son incorrectas. | Configurar las variables SMTP; mientras tanto, usar el enlace que muestra la pantalla de invitación. |
| El puerto 8080 está ocupado | Otra aplicación usa el puerto. | Liberarlo o cambiarlo en `vite.config.ts` y agregar el nuevo origen a `CORS_ORIGINS`. |

## 9. Consideraciones antes de un despliegue

Antes de llevar el sistema a un servidor deben resolverse los hallazgos de seguridad pendientes (H-23; H-08, H-09 y H-18 se corrigieron el 24/11/2026), definir `JWT_SECRET` y `ENVIRONMENT=production`, cambiar la contraseña de PostgreSQL y no publicar su puerto, restringir `/docs`, usar HTTPS y programar respaldos automáticos.
