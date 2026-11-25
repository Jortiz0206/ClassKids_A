# Verificación de la escala de calificaciones 0.0 – 5.0

Verificación del 24/11/2026, hecha en el entorno de pruebas aislado (`classkids_test`, puerto 5433). La base real `classkids` solo se consultó en modo lectura.

**Regla aprobada (sin cambios):** la escala oficial es de 0.0 a 5.0 con un decimal. La alerta se crea cuando el promedio acumulado es menor que 3.0. No se cambiaron fórmulas ni umbrales.

## 1. Dónde se valida la escala

| Capa | Ubicación | Qué garantiza |
|---|---|---|
| PostgreSQL | `backend/init.sql:84`: `nota NUMERIC(3, 1) NOT NULL CHECK (nota >= 0 AND nota <= 5)` | Rechaza cualquier valor fuera de 0–5, aunque se escriba sin pasar por la API. `NUMERIC(3,1)` guarda un decimal; 100 no cabe (máximo 99.9). |
| API: tipo y rango | `backend/main.py:108`: `nota: float = Field(ge=0, le=5, strict=True)` en `CalificacionSchema` | 422 si la nota es menor que 0, mayor que 5, texto o booleano. |
| API: un decimal | `backend/main.py:117`: `nota_con_un_decimal` | 422 si la nota tiene más de un decimal. Sin este control, PostgreSQL redondearía en silencio (2.96 → 3.0) y cambiaría el promedio de la alerta. |
| API: registrar | `backend/main.py:891`: `registrar_calificacion` (`POST /calificaciones`) | Usa `CalificacionSchema`: la validación ocurre antes de los permisos y de la base. |
| API: editar | `backend/main.py:928`: `actualizar_calificacion` (`PUT /calificaciones/{id}`) | Usa el mismo esquema y las mismas validaciones. |
| Alerta | `backend/main.py:905-910`: `evaluar_alerta_bajo_rendimiento`, `AVG(nota)` y `< 3` | El promedio se calcula en la escala 0–5, sin redondear. |
| Interfaz: entrada | `frontend/src/lib/notas.ts` (`interpretarNota`) y `Calificaciones.tsx` (`updateCalificacion`) | Desde la etapa de demostración, el docente escribe la nota en 0.0–5.0; un valor fuera de rango o con más de un decimal se marca y no se puede guardar. |
| Interfaz: guardado | `Calificaciones.tsx` (`handleSave`) | Envía la nota escrita, sin conversión. `aEscala5` (`round(porcentaje ÷ 2) ÷ 10`) solo se usa para mostrar en 0.0–5.0 los promedios calculados en porcentaje. |
| Interfaz: lectura | `frontend/src/lib/notas.ts:65` (`aPorcentaje`) y `:28` (`promedioExacto`); pantallas Estudiantes, Grupos, Actividades, Análisis y Dashboard | Muestran nota × 20. Las clasificaciones usan el promedio exacto (H-01). |

**Otros elementos revisados:**
- **Modelos SQLAlchemy:** el proyecto no tiene modelos ORM; usa SQL parametrizado con `text()`. Por eso la validación está en el esquema Pydantic y en la base.
- **Migración 001:** solo agrega `entregado` y no toca `nota`.
- **Scripts de evidencias:** `verificacion-bd.sql` (V-05 y V-09) solo consulta la escala.

## 2. Estado de las bases de datos (consulta de solo lectura)

| Base | Columna | Restricción | Notas | Mínimo / máximo | Con más de un decimal |
|---|---|---|---|---|---|
| `classkids` (real) | `numeric(3,1)` | `CHECK (((nota >= (0)::numeric) AND (nota <= (5)::numeric)))` | 216 | 0.3 / 5.0 | 0 |
| `classkids_test` | `numeric(3,1)` | La misma | 215 | 1.8 / 5.0 | 0 |

No hay triggers que modifiquen la nota.

## 3. Conversiones

| Escala oficial | Sobre 100 (× 20) | Sobre 20 (× 4) |
|---|---|---|
| 0.0 | 0 | 0 |
| 2.5 | 50 | 10 |
| 3.0 | 60 | 12 |
| 4.0 | 80 | 16 |
| 5.0 | 100 | 20 |

- La interfaz solo usa la escala sobre 100.
- La escala sobre 20 no aparece en ninguna pantalla ni en la API; se comprueba como equivalencia en Vitest.

## 4. Inconsistencias encontradas y corregidas (H-44)

| Problema | Antes | Después |
|---|---|---|
| La API aceptaba notas con más de un decimal | `2.96` se guardaba como `3.0` (redondeo silencioso de `NUMERIC(3,1)`) | 422 «La nota usa la escala 0.0 a 5.0 con un solo decimal» |
| La API aceptaba texto y booleanos | `"4.0"` → 4.0; `true` → 1.0 | 422 |
| La interfaz redondeaba de forma desigual | Con `toFixed(1)`, que redondea sobre el valor binario: 85 % → 4.3, 87 % → 4.3, 91 % → 4.5 | Mitad hacia arriba, como PostgreSQL: 85 % → 4.3, 87 % → 4.4, 91 % → 4.6 |

No se encontró ningún punto que permitiera guardar 80 o 100 como nota oficial. Antes de esta verificación, la API ya rechazaba esos valores (422 por `le=5`) y la base también (CHECK).

## 5. Pruebas

| Suite | Archivo | Casos de escala |
|---|---|---|
| pytest | `backend/tests/test_escala_notas.py` | 56 |
| Vitest | `frontend/src/test/notas.test.ts` | 4 |
| Playwright | `e2e/tests/calificaciones.spec.ts` | 1 |

**pytest:**
- `POST` y `PUT` aceptan 0.0, 0.1, 2.5, 3.0, 4.0, 4.9 y 5.0, y la base guarda el mismo valor.
- `POST` y `PUT` rechazan sin guardar -0.1, 5.1, 7, 12, 20, 80, 100, 2.96, 4.95, 0.05, 3.25, `"4.0"`, `"80"`, `true` y `null`.
- El docente también recibe 422 con 80.
- PostgreSQL rechaza -0.1, 5.1, 80 y 100 escritos directamente, y acepta 0.0, 0.1, 4.9 y 5.0.
- La columna y el CHECK tienen la definición esperada, y ninguna nota guardada está fuera de la escala.
- Con un promedio de 3.0 no hay alerta; con 2.9 sí.

**Vitest:**
- Equivalencias × 20 y × 4.
- Límites: 0, 2, 98 y 100 % se convierten en 0.0, 0.1, 4.9 y 5.0.
- Desde la etapa de demostración, la nota se escribe en 0.0–5.0: `interpretarNota` acepta 0, 0.1, 4.9 y 5.0 (con punto o coma) y rechaza -0.1, 5.1, 80, 100 y los valores con más de un decimal.
- El redondeo es uniforme.

**Playwright:**
- Se digita 150, el campo muestra 100 y se guarda 5.0.
- Se digita 87, se muestra «4.4» y se guarda 4.4.
- La API responde 422 a 80, 100, 5.1, -0.1 y 2.96, y la nota guardada no cambia.

**Contra el backend anterior:** 12 de las 56 pruebas de pytest fallan (más de un decimal, `"4.0"` y `true`).

**Resultado de la suite completa:** pytest 128 de 128, Vitest 59 de 59 y Playwright 44 de 44.
