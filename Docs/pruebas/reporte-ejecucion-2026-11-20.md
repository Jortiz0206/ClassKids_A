# Reporte de ejecución de pruebas · 20/11/2026

**Ambiente:**
- Pruebas aislado: frontend `:8081`, API `:8001`, base `classkids_test` (puerto 5433).
- Código: rama `stg` con cambios locales sin commit.
- Ejecutado en Windows 11 con Python 3.14 (venv del backend), Node 24 y Chromium (Playwright).

## Antes y después de la renovación visual

| Suite | Antes (línea base, 20/11/2026) | Después (20/11/2026) | Diferencia |
|---|---:|---:|---|
| pytest: integración API + PostgreSQL | 24 / 24 | 24 / 24 | Sin cambios |
| pytest: unitarias del backend (sin BD) | — | 18 / 18 (11 funciones, una parametrizada con 8 casos) | Nuevas |
| Vitest: unitarias del frontend | 15 / 15 | 37 / 37 | +22 (notas 13, navegación 5, tiempo relativo 4) |
| Playwright: interfaz E2E | 15 / 15 | 23 / 23 | +8 (`renovacion.spec.ts`) |
| **Total** | **54 / 54** | **102 / 102** | **+48** |

**Pruebas unitarias reales (criterio 8): 47 casos distintos.** Son 36 de Vitest (sin contar la de ejemplo) y 11 funciones de pytest sin base de datos, que suman 54 ejecuciones. Las 24 de integración y las 23 de interfaz no se cuentan como unitarias.

**Repetición del 23/11/2026** (después de reiniciar el equipo y levantar de nuevo el entorno de pruebas): pytest 42/42, Vitest 37/37, Playwright 23/23 y `tsc` sin errores. Total: **102 / 102**.

**Ejecución de cierre del 23/11/2026** (después del modo claro y oscuro, el rediseño de la landing y la limpieza de código):

| Suite | Resultado |
|---|---:|
| pytest (24 de integración + 18 unitarias) | 42 / 42 |
| Vitest | 39 / 39 (se retiró la prueba de ejemplo sin valor y se agregaron 3 del tema) |
| Playwright | 26 / 26 (+3: modo claro y oscuro, persistencia y enlace «Ver cómo funciona») |
| **Total** | **107 / 107** |

`tsc` sin errores y `vite build` exitoso. **Casos unitarios reales: 50** (39 de Vitest y 11 funciones de pytest sin base de datos).

**Ejecución posterior a la organización del código (23/11/2026, tarde):**

| Suite | Resultado |
|---|---:|
| pytest | 42 / 42 |
| Vitest | 44 / 44 (+5: `listas.test.ts` y `clasePromedio`) |
| Playwright | 28 / 28 (+2: confirmaciones H-39 y Usuarios en celular H-40) |
| **Total** | **114 / 114** |

`tsc` sin errores y `vite build` exitoso. **Casos unitarios reales: 55** (44 de Vitest y 11 funciones de pytest sin base de datos).

## Verificaciones estáticas y de calidad

| Verificación | Resultado |
|---|---|
| `tsc -p tsconfig.app.json --noEmit` | Sin errores |
| `vite build` (salida a carpeta temporal, sin tocar `dist/`) | Compila; aviso de bloque JavaScript > 500 kB (optimización pendiente) |
| ESLint sobre archivos modificados | 28 errores `no-explicit-any` y 2 avisos, en lógica de datos existente que se conservó sin cambios (H-20) |
| Contraste WCAG (32 pares) | 32 / 32 cumplen ([`contraste-wcag.md`](../evidencias/contraste-wcag.md)) |
| Desbordamiento horizontal | 0 px en las 32 capturas (escritorio 1366 px y celular 390 px) |
| Errores de consola del navegador | Ninguno en las pantallas de la app; solo el registro intencional de la página 404 |
| Llamadas al backend real (:8000) | Ninguna (salvaguardas activas) |

## Regresiones encontradas durante la ejecución

| # | Prueba | Causa | Acción |
|---|---|---|---|
| 1 | `entorno.spec.ts` buscaba el texto «Total Grupos» | Cambio de rótulo **autorizado** («Total Grupos» → «Grupos») | Se actualizó el selector de la prueba; el comentario en la prueba documenta el motivo |
| 2 | «Panel de alertas…» falló con `getByText('1 alertas')` en modo estricto | La nueva insignia del menú lateral decía «31 alertas por revisar», que contiene «1 alertas» | Se corrigió el **producto** (texto accesible «por revisar»); la prueba no se modificó |

No se modificó ninguna prueba para ocultar un defecto.

## Defectos encontrados y corregidos en esta etapa

Ver [`registro-defectos.md`](registro-defectos.md), entradas H-13, H-14, H-15 y H-34 a H-37.

## Base real

No se ejecutaron pruebas, migraciones ni escrituras contra `classkids`. La única escritura de esta etapa fuera de las pruebas automatizadas fue la del mensaje de éxito para las capturas: cambió la entrega de un estudiante en `classkids_test` y la restauró, y la restauración se comprobó por la API y por SQL de solo lectura.

**Cambios detectados en la base real (no realizados en esta etapa).** El 23/11/2026, una consulta de solo lectura mostró que la base `classkids` difiere del respaldo del 20/11/2026 (16:32):

| Tabla | Respaldo | 23/11/2026 |
|---|---:|---:|
| grupos | 10 | 11 |
| estudiantes | 200 | 201 |
| calificaciones | 215 | 216 |
| usuarios | 8 | 9 |
| invitaciones | 1 | 2 |

- Los registros nuevos tienen fecha del 20/11/2026 entre las 9:27 y las 9:29 p. m. (hora de Colombia).
- Se hicieron desde la aplicación real (frontend 8080 y backend 8000), que entonces estaba en ejecución. Como Vite recarga el código, esa aplicación ya mostraba la interfaz renovada.
- Los scripts y pruebas de esta etapa apuntaban solo al entorno de pruebas y abortaban ante cualquier llamada al puerto 8000.
- No se identificó a la persona ni se modificaron esos datos.
- **Consecuencia:** el respaldo del 20/11 ya no refleja la base real; antes de la migración 001 se necesita un `pg_dump` nuevo.
