# Entorno de pruebas aislado de ClassKids

Las pruebas **nunca** usan la base real `classkids`. Todo se ejecuta contra la base de pruebas `classkids_test`:

| Componente | Real (no se toca) | Pruebas |
|---|---|---|
| PostgreSQL | `classkids_db`, puerto 5432, base `classkids` | `classkids_test_db`, puerto 5433, base `classkids_test` |
| Backend | `http://127.0.0.1:8000` | `http://127.0.0.1:8001` |
| Frontend | `http://localhost:8080` | `http://localhost:8081` |

## Salvaguardas

1. `backend/tests/conftest.py` detiene pytest si `DATABASE_URL` no apunta a `classkids_test` en el puerto 5433, y vuelve a comprobar el nombre de la base al conectarse.
2. Cada prueba de pytest corre dentro de una transacción que se deshace al final: la base de pruebas tampoco queda modificada.
3. `e2e/tests/fixtures.ts` hace fallar cualquier prueba de interfaz en la que el navegador envíe una petición al backend real (puerto 8000).
4. `docker-compose.test.yml` usa un proyecto Docker propio (`classkids-test`): `down -v` solo borra el volumen de pruebas.

## Levantar el entorno

```bash
# 1. Base de pruebas (desde backend/)
docker compose -f docker-compose.test.yml up -d

# 2. Backend de pruebas (desde backend/)
DATABASE_URL="postgresql+psycopg://postgres:postgrespassword@127.0.0.1:5433/classkids_test" \
JWT_SECRET="clave-solo-para-pruebas-classkids" \
CORS_ORIGINS="http://localhost:8081,http://127.0.0.1:8081" \
venv/Scripts/python.exe -m uvicorn main:app --port 8001
# Sin --reload: en Windows se observó una recarga automática que nunca terminó y el
# backend siguió con el código anterior. Reinícielo a mano tras cada cambio en main.py.

# 3. Frontend de pruebas (desde frontend/, en otra terminal)
VITE_API_URL="http://127.0.0.1:8001" npx vite --port 8081 --strictPort
```

## Ejecutar las pruebas

```bash
# Pruebas de la API (desde backend/)
venv/Scripts/python.exe -m pytest tests -q

# Pruebas de interfaz (desde la raíz). La contraseña demo está en backend/CREDENCIALES_LOCALES.md
CK_DOCENTE_PASS=... node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts
```

## Restablecer la base de pruebas

Las pruebas de interfaz sí guardan datos en `classkids_test` (por ejemplo, calificaciones). Para volver al estado inicial:

```bash
cd backend
docker compose -f docker-compose.test.yml down -v
docker compose -f docker-compose.test.yml up -d
```
