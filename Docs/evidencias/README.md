# Índice de evidencias

Qué demuestra cada evidencia y a qué criterio de la rúbrica corresponde. Revisado el 24/11/2026.

Las capturas se tomaron en el entorno de pruebas (`classkids_test`) con la versión actual de la interfaz: nota de 0.0 a 5.0 y promedios en esa escala.

| Categoría | Evidencia | Qué demuestra | Criterio |
|---|---|---|---|
| Interfaz | [`capturas-v3/`](capturas-v3/README.md): 142 capturas por módulo, en claro y oscuro, de escritorio y celular | Todas las pantallas vigentes, la navegación móvil y los dos temas | 10 |
| Interfaz | [`contraste-wcag.md`](contraste-wcag.md) | Contraste AA en 64 de 64 pares de color | 10 |
| Funcionalidades | [`capturas-v3/vigente/modulos/`](capturas-v3/README.md) | Cada módulo: grupos, estudiantes, materias, actividades, calificaciones, análisis, alertas y usuarios | 10, 1 |
| Funcionalidades | Guía de la demostración: [`../demo/guia-demostracion.md`](../demo/guia-demostracion.md) | Recorrido por rol con datos persistentes (`classkids_demo`) | 10 |
| Video de recorrido | `frontend/public/video/recorrido-classkids-v3.webm` (140 s) | Uso real de la aplicación por el docente y el administrador, con la nota de 0.0 a 5.0. La escena de calificación escribe 3.8 **sin guardar**: ilustra la entrada y no demuestra persistencia | 10 |
| Pruebas | [`../pruebas/reporte-ejecucion-2026-11-24.md`](../pruebas/reporte-ejecucion-2026-11-24.md) | Resultados de pytest, Vitest y Playwright | 7, 8 |
| Pruebas | [`escala-notas/verificacion-escala.md`](escala-notas/verificacion-escala.md) | La escala 0.0–5.0 en la base, la API, la interfaz y las pruebas | 3, 7 |
| Base de datos | [`verificacion-mr-real.txt`](verificacion-mr-real.txt) y [`scripts/verificacion-mr.sql`](scripts/verificacion-mr.sql) | El modelo relacional coincide con la base real (consulta de solo lectura) | 1 |
| Base de datos | [`scripts/verificacion-bd.sql`](scripts/verificacion-bd.sql) | Verificación de tablas, restricciones y escala para ejecutar en DBeaver | 1 |
| Arquitectura | `../diagramas/` (capas, componentes, despliegue y UML) | Comunicación React → API → PostgreSQL | 5 |
| Seguridad y permisos | [`permisos/verificacion-api-permisos.md`](permisos/verificacion-api-permisos.md) | 18 de 18 peticiones con resultado esperado (H-08, H-18) | 3 |
| Despliegue | `../despliegue.md`, `backend/docker-compose*.yml` | Bases real, de pruebas y de demostración en Docker; instalación local | 4 |
| IoT | [`ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/evidencias/`](../../ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/iot/semaforo-comprension/evidencias/) y [`../iot/propuesta-iot.md`](../iot/propuesta-iot.md) | Grabación de la simulación en Wokwi (106 s), 6 fotogramas, una captura, el registro serial transcrito, el monitor serial copiado de Wokwi (`registro-wokwi.txt`) y los CSV del receptor; 48 pruebas automáticas y 9 de 9 manuales. La grabación respalda el funcionamiento general; el 70 % y la ronda vacía se respaldan con `registro-wokwi.txt` y `resumenes.csv` | 6 |

## Scripts que generan las evidencias

| Script | Genera |
|---|---|
| `scripts/capturas-plataforma.cjs` y `scripts/rotular-capturas.py` | Las capturas vigentes de `capturas-v3/vigente/` |
| `scripts/capturas-producto-landing.cjs` y `scripts/optimizar-producto-landing.py` | Las imágenes de la landing (`frontend/src/assets/producto/`) |
| `scripts/grabar-recorrido.cjs` y `scripts/montar-recorrido.py` | El video de recorrido, con la música original |
| `scripts/indice-capturas.py` | El índice `capturas-v3/README.md` |
| `scripts/contraste-wcag.py` | `contraste-wcag.md` |
| `scripts/verificar-permisos-api.py` | `permisos/verificacion-api-permisos.md` |
| `scripts/generar-modelo-relacional.py` | El modelo relacional en PNG y PDF |

**Scripts obsoletos (eliminación pendiente de autorización):** `scripts/capturas.cjs` y `scripts/capturas-pruebas.cjs`. Generaban carpetas de capturas que ya no existen, y `capturas.cjs` apunta al entorno real (8080/8000).
