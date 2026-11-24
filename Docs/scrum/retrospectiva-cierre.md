# Retrospectiva de cierre

> Basada en aprendizajes y dificultades **verificables** en el código, los hallazgos, las pruebas y los informes del proyecto. No describe reuniones ni opiniones de los integrantes. La sección final queda para que el equipo agregue su propia reflexión.

Fecha de elaboración: 23/11/2026.

## Lo que funcionó bien

| Aprendizaje | Evidencia |
|---|---|
| Separar un **entorno de pruebas aislado** del real (otra base, otro backend, otro frontend) permitió corregir y rediseñar sin arriesgar los datos reales | `backend/docker-compose.test.yml`, `backend/tests/conftest.py`, `e2e/tests/fixtures.ts`; ninguna prueba tocó la base real |
| Tratar **el código como fuente de verdad** de la documentación evitó documentos que prometían funciones inexistentes | [`../comparativa-documentacion.md`](../comparativa-documentacion.md) |
| Escribir **pruebas antes y después** de cada cambio detectó regresiones a tiempo | En la renovación, dos regresiones se detectaron y corrigieron sin ocultar defectos ([reporte](../pruebas/reporte-ejecucion-2026-11-20.md)) |
| **Centralizar reglas** (escala, umbrales y navegación) en un solo archivo con pruebas redujo inconsistencias entre pantallas | `frontend/src/lib/notas.ts`, `components/layout/navegacion.ts` |
| Registrar las **decisiones con autorización explícita** (D1–D7) dio claridad sobre qué se podía cambiar | [`../conceptos/reglas-de-negocio.md`](../conceptos/reglas-de-negocio.md) |

## Dificultades encontradas

| Dificultad | Evidencia | Qué se hizo |
|---|---|---|
| La escala tenía dos umbrales distintos: 3.5 para aprobar en la interfaz y 3.0 para la alerta en el backend | Hallazgo H-01 | Se documentó la escala oficial 0.0–5.0; la unificación queda como decisión académica pendiente |
| El backend de pruebas con `uvicorn --reload` en Windows siguió ejecutando código viejo | `e2e/README.md` | Se arranca sin `--reload` y una prueba comprueba que el backend ejecuta el código actual |
| Cambiar el ancho de la pantalla volvía a montar las páginas y perdía las notas sin guardar | Hallazgo H-34 | Se corrigió el layout y una prueba E2E lo protege |
| Varias capas usaban nombres o tipos distintos (`año_lectivo` y `ano_lectivo`, ids como texto o número) | H-27, H-18 | H-27 corregido; H-18 pendiente |
| El historial de Git tiene pocos commits y mucho trabajo sin registrar | [`../repositorio-git.md`](../repositorio-git.md) | Se propuso un flujo de ramas y commits por grupo para el cierre |
| Faltan registros de la organización del trabajo (sprints, puntos, retrospectivas) | [`README.md`](README.md) | Reconstrucción honesta por etapas y plantillas para el sprint de cierre |

## Qué mejorar en el siguiente proyecto (propuestas)

1. Registrar desde el inicio el backlog, los sprints y las retrospectivas en un tablero (GitHub Projects).
2. Hacer commits pequeños y frecuentes, con mensajes en un solo idioma.
3. Crear el entorno de pruebas y las primeras pruebas automatizadas desde el primer módulo.
4. Definir las reglas académicas (escala y umbrales) en un solo lugar antes de programar.

## Reflexión del equipo (PENDIENTE: la escriben los integrantes)

| Integrante | ¿Qué aprendí? | ¿Qué haría distinto? |
|---|---|---|
| Faloon Johanna Ortiz | | |
| María Alejandra Guio | | |
| Jan Llanos | | |
