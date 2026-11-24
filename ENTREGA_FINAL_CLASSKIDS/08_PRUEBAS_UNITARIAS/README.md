# Criterio 8. Pruebas unitarias automatizadas

**Estado:** Cumplido y verificado

**Qué solicita el instructor:** Mínimo 20 pruebas unitarias reales y distintas.

Explicación en palabras sencillas y cómo demostrarlo: [`../00_INDICE_Y_ESTADO/guia-sustentacion.md`](../00_INDICE_Y_ESTADO/guia-sustentacion.md)

## Archivos oficiales (en el repositorio)

| Evidencia | Ubicación |
|---|---|
| Vitest: 44 pruebas unitarias del frontend | [`frontend/src/test/`](../../frontend/src/test/) |
| Listas y mapas compartidos (4) | [`frontend/src/test/listas.test.ts`](../../frontend/src/test/listas.test.ts) |
| Reglas de notas (14) | [`frontend/src/test/notas.test.ts`](../../frontend/src/test/notas.test.ts) |
| Navegación por rol (5) | [`frontend/src/test/navegacion.test.ts`](../../frontend/src/test/navegacion.test.ts) |
| Tema claro y oscuro (3) | [`frontend/src/test/tema.test.ts`](../../frontend/src/test/tema.test.ts) |
| Unitarias del backend sin base de datos (11 funciones, 18 ejecuciones) | [`backend/tests/test_unitarias.py`](../../backend/tests/test_unitarias.py) |
| Reporte de ejecución | [`Docs/pruebas/reporte-ejecucion-2026-11-20.md`](../../Docs/pruebas/reporte-ejecucion-2026-11-20.md) |

## Pendientes y observaciones

- Total: 55 casos unitarios reales. Las 24 de integración y las 28 de interfaz no se cuentan como unitarias.
- Se retiró la prueba de ejemplo `expect(true)`, que no verificaba nada.

Matriz completa: [`../00_INDICE_Y_ESTADO/matriz-cumplimiento.md`](../00_INDICE_Y_ESTADO/matriz-cumplimiento.md)
