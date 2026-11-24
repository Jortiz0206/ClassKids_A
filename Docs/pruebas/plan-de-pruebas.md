# Plan de pruebas de ClassKids

Versión 1.0 · 20/11/2026 · Aplica al código del repositorio en la rama `stg` (cambios locales sin commit al momento de esta versión).

## 1. Objetivo

Comprobar que ClassKids cumple sus reglas académicas y funcionales, y que las correcciones y la renovación visual no rompen lo que ya funcionaba. Todo se ejecuta en un ambiente **separado del real**, sin tocar la base `classkids`.

## 2. Alcance

**Dentro del alcance**
- Reglas de presentación de notas: escala 0–100 ↔ 0.0–5.0, umbrales 90 / 70 / 3.5 / 3.0 y estados.
- Calificaciones: guardado solo de filas modificadas (D2), conservación de periodo y observación (H-31, H-33), estado «Entregado» con y sin la columna `entregado`.
- Alertas: deduplicación `low_grade` / «Bajo Rendimiento» (D3), conteo de activas (H-25), consulta de resueltas sin eliminarlas.
- Grupos: año lectivo (H-27). Estudiantes: filtros, edición, paginación.
- Actividades: fechas sin desfase (H-30a), entregas (H-30c), RN-16.
- Navegación por rol (escritorio y celular), autenticación JWT y hash de contraseñas.
- Interfaz: errores legibles (H-24), estados vacíos y de carga, responsive y contraste WCAG.

**Fuera del alcance (pendiente)**
- Correcciones no autorizadas: H-01, H-04, H-05, H-19 y otras (ver [`registro-defectos.md`](registro-defectos.md)). H-08 y H-18 se corrigieron y se prueban desde el 24/11/2026.
- Pruebas de carga y de seguridad automatizadas (OWASP); envío real de correos SMTP.
- Base real `classkids` y migración 001: no se prueban ni se ejecutan sin autorización.
- IoT: no existe un prototipo (ver [`../iot/propuesta-iot.md`](../iot/propuesta-iot.md)).

## 3. Niveles y tipos de prueba

| Nivel | Herramienta | Qué comprueba | Ubicación | Casos |
|---|---|---|---|---:|
| Unitarias (frontend) | Vitest | Funciones puras sin red: notas, fechas, conteos, navegación por rol, tema, formato de errores | `frontend/src/test/` | 59 |
| Unitarias (backend) | pytest | Funciones y esquemas puros sin base de datos: estados de alerta, hash PBKDF2, JWT, esquemas Pydantic, caché de columnas | `backend/tests/test_unitarias.py` | 11 funciones (18 ejecuciones con parámetros) |
| Integración (API + PostgreSQL) | pytest + TestClient | Endpoints contra `classkids_test` dentro de una transacción que se deshace | `backend/tests/test_alertas.py`, `test_calificaciones.py`, `test_grupos.py`, `test_entorno.py` | 24 |
| Seguridad de la API (permisos) | pytest + TestClient | H-18 y H-08 con casos permitidos y denegados, llamando a la API directamente con tres sesiones | `backend/tests/test_permisos.py` | 19 |
| Hallazgos del cierre | pytest + TestClient | H-05 (validación y errores), H-09 (cuenta revalidada), H-17 (`.env`) y CORS en 401/403 | `backend/tests/test_hallazgos_cierre.py` | 11 |
| Escala de calificaciones | pytest + TestClient + SQL | Límites válidos (0.0, 0.1, 2.5, 3.0, 4.0, 4.9, 5.0) e inválidos (-0.1, 5.1, 80, 100, más de un decimal, texto, booleano) en POST y PUT; CHECK y `NUMERIC(3,1)` en PostgreSQL; alerta con 2.9 sí y con 3.0 no | `backend/tests/test_escala_notas.py` | 56 |
| Interfaz de extremo a extremo | Playwright (Chromium) | Flujos completos en el navegador: frontend 8081 → API 8001 → `classkids_test` (incluye modo claro y oscuro, landing, confirmaciones, celular y permisos por rol) | `e2e/tests/` | 44 |
| Estáticas | TypeScript (`tsc`), ESLint, `vite build` | Tipos, estilo y compilación de producción | `frontend/` | — |
| Accesibilidad | Script de contraste WCAG | 32 pares de color por tema (claro y oscuro) de `index.css` | `Docs/evidencias/scripts/contraste-wcag.py` | 64 |
| Visuales | Script de capturas | Todas las vistas de la plataforma por módulo, en claro y oscuro, de escritorio y celular, con verificación del tema y del desborde | `Docs/evidencias/scripts/capturas-plataforma.cjs` | 142 |

### Organización de las suites (24/11/2026)

| Archivo | Responsabilidad | Escribe en la base | Cómo se protege |
|---|---|---|---|
| `backend/tests/test_unitarias.py` | Unitarias del backend | No | Sin base de datos |
| `backend/tests/test_entorno.py` | Salvaguarda del entorno | Sí, dentro de una transacción | `conftest.py` exige `classkids_test` en el puerto 5433 y deshace cada prueba |
| `backend/tests/test_alertas.py`, `test_calificaciones.py`, `test_grupos.py` | Integración de la API | Sí, dentro de una transacción | Igual que la fila anterior |
| `backend/tests/test_permisos.py` | Seguridad: H-18 y H-08 | Sí, dentro de una transacción | Igual que la fila anterior |
| `frontend/src/test/*.test.ts` | Unitarias del frontend | No | Sin red |
| `e2e/tests/entorno.spec.ts`, `landing.spec.ts`, `renovacion.spec.ts`, `permisos.spec.ts` | Interfaz, solo lectura | No | `guardedPage` detiene la prueba si hay peticiones a `:8000` |
| `e2e/tests/calificaciones.spec.ts`, `estudiantes.spec.ts`, `integracion.spec.ts`, `materias.spec.ts`, `sesion.spec.ts` | Interfaz con escritura | Sí, en `classkids_test` | Cada prueba restaura lo que cambia; antes de la ejecución se respalda la base de pruebas y después se compara tabla por tabla |

Las pruebas que dependían del alcance anterior del docente (por ejemplo, ver los 200 estudiantes o borrar materias) se ajustaron el 24/11/2026: las reglas globales se prueban con el administrador y las del docente con su alcance real (H-08).

## 4. Ambientes

| | Desarrollo / real | Pruebas (aislado) |
|---|---|---|
| Base de datos | `classkids_db`, puerto 5432, base `classkids` | `classkids_test_db`, puerto 5433, base `classkids_test` (`backend/docker-compose.test.yml`, proyecto Docker `classkids-test`) |
| Backend | `uvicorn` en 8000 | `uvicorn` en 8001, `JWT_SECRET` de pruebas, sin `--reload` |
| Frontend | Vite en 8080 | Vite en 8081 con `VITE_API_URL=http://127.0.0.1:8001` |

**Salvaguardas.**
1. `backend/tests/conftest.py` detiene pytest si la URL no apunta a `classkids_test:5433`.
2. Cada prueba de pytest corre en una transacción con *rollback*.
3. `e2e/tests/fixtures.ts` falla si el navegador llama al puerto 8000.
4. Las pruebas E2E comprueban que el backend de pruebas ejecuta el código actual (`openapi.json`).
5. Si la base de pruebas no responde, `conftest.py` detiene pytest antes de ejecutar cualquier prueba, con un mensaje que indica cómo levantarla (H-41). El contenedor de pruebas se reinicia con Docker (`restart: unless-stopped`).
5. Los scripts de capturas abortan si detectan una llamada al backend real.

## 5. Datos de prueba

- La base de pruebas se crea con `backend/init.sql` (datos demo) más `backend/migrations/001_calificaciones_entregado.sql`.
- Volumen: 10 grupos, 200 estudiantes, 5 materias, 52 actividades, 215 calificaciones y 32 alertas activas.
- Las pruebas que escriben (por ejemplo, guardar una calificación) restauran el valor original en un bloque `finally`.
- Para volver al estado inicial: `docker compose -f docker-compose.test.yml down -v && ... up -d`.
- Las contraseñas demo se leen de `backend/CREDENCIALES_LOCALES.md`, que no está en Git, y se pasan como variables `CK_DOCENTE_PASS` y `CK_ADMIN_PASS`.

## 6. Casos de prueba representativos

| ID | Caso | Nivel | Resultado esperado |
|---|---|---|---|
| CP-01 | Nota 86 % se guarda como 4.3 y se muestra «86 / 100 = 4.3» | Unitaria + E2E | Conversión ÷ 20 con un decimal; sin cambio de escala |
| CP-02 | Límites de estado 90 / 89 / 70 / 69 | Unitaria | Excelente / Aprobado / Aprobado / Reprobado |
| CP-03 | Guardar sin cambios | E2E | Botón deshabilitado; no se envía nada |
| CP-04 | Cambiar una nota | E2E | Solo esa fila se guarda; periodo y observación se conservan |
| CP-05 | Marcar «Entregado» | Integración + E2E | Se guarda y se lee de vuelta; sin la columna, el backend no falla |
| CP-06 | Alerta duplicada de bajo rendimiento | Integración | No se crea si existe una activa o en revisión |
| CP-07 | Resolver una alerta | E2E | Sale del panel del Dashboard y se consulta en Alertas › Resueltas; no se elimina |
| CP-08 | Docente abre «Más» en el celular | E2E + unitaria | Ve Grupos, Actividades, Análisis y Materias; no ve Usuarios |
| CP-09 | Administrador abre «Más» | E2E | Ve además Usuarios y Panel de administración |
| CP-10 | Redimensionar con notas sin guardar | E2E | Los valores digitados se conservan |
| CP-11 | Fecha de entrega 2026-09-05 | Unitaria + E2E | Se muestra «5 sep», no «4 sep» |
| CP-12 | Fecha de alerta con desfase de zona horaria | Unitaria + E2E | «Hoy», nunca «Hace -1 días» |
| CP-13 | Token firmado con otra clave | Unitaria | Rechazado |
| CP-14 | Contraste de los 32 pares de color | Script | Todos ≥ 4.5:1 (texto) o ≥ 3:1 (gráficos y bordes) |

La lista completa de casos está en los propios archivos de prueba; cada nombre de prueba describe el comportamiento esperado.

## 7. Criterios de entrada y de salida

**Entrada.**
- Entorno de pruebas levantado: `docker ps` muestra `classkids_test_db`.
- Backend 8001 y frontend 8081 responden.
- `openapi.json` del backend de pruebas contiene `entregado`.

**Salida (aceptación).**
1. El 100 % de las pruebas automatizadas aprobadas.
2. `tsc` sin errores y `vite build` exitoso.
3. 0 px de desbordamiento horizontal en las capturas.
4. Contraste: 64 de 64 pares cumplen (32 por tema).
5. La base real no se modifica (se verifica con `Docs/evidencias/scripts/verificacion-bd.sql`, solo lectura).

## 8. Comandos

```bash
# Unitarias + integración (backend/)
DATABASE_URL="postgresql+psycopg://postgres:postgrespassword@127.0.0.1:5433/classkids_test" \
JWT_SECRET="clave-solo-para-pruebas-classkids" venv/Scripts/python.exe -m pytest tests -q

# Unitarias del frontend (frontend/)
npx vitest run

# Extremo a extremo (raíz)
CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts

# Contraste y capturas (raíz)
python Docs/evidencias/scripts/contraste-wcag.py > Docs/evidencias/contraste-wcag.md
CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node Docs/evidencias/scripts/capturas-plataforma.cjs
python Docs/evidencias/scripts/rotular-capturas.py
```

## 9. Roles

| Rol | Responsable |
|---|---|
| Diseño y ejecución automatizada de esta versión | **Pendiente de asignar por el equipo** |
| Revisión y aprobación del plan | **Pendiente de asignar por el equipo** (Faloon Johanna Ortiz, María Alejandra Guio, Jan Llanos) |

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| Ejecutar pruebas contra la base real | Salvaguardas de conftest, fixtures y scripts |
| El backend de pruebas sigue con código antiguo (`--reload` en Windows) | Sin `--reload` y verificación con `openapi.json` |
| Las pruebas E2E dejan datos modificados | Restauración en `finally` y restablecimiento con `down -v` |
| La base real no tiene la columna `entregado` | Prueba de compatibilidad sin la columna; migración 001 pendiente de autorización |
