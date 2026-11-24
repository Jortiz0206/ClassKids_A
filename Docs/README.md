# Documentación de ClassKids

ClassKids es una plataforma web de seguimiento académico con alertas tempranas para colegios, desarrollada en el programa Análisis y Desarrollo de Software (ADSO) del SENA por María Alejandra Guio, Faloon Johanna Ortiz y Jan Llanos.

## Versión 2.0: la implementación como fuente de verdad

Esta documentación se reescribió el 20/11/2026 a partir del sistema real: el código de `backend/` y `frontend/`, la base de datos PostgreSQL en ejecución y un recorrido por todas las pantallas. Parte del documento original versión 1.0 (noviembre de 2025): conserva lo que sigue vigente, corrige lo desactualizado e incorpora lo construido después.

El **entregable académico principal** es el documento Word [`entregable/ClassKids_Documento_Proyecto_v3.docx`](entregable/ClassKids_Documento_Proyecto_v3.docx) (versión 3.0, 23/11/2026; la versión 2.0 se conserva como histórico en `entregable/ClassKids_Documento_Proyecto_v2.docx`). Ese documento se genera a partir de estos mismos archivos Markdown, de modo que el Word, esta carpeta y el README del repositorio contienen la misma información.

## Índice

| Capítulo del documento | Archivo |
|---|---|
| 1. Descripción general (idea, problema, objetivos, alcance, actores, módulos) | [`conceptos/descripcion-general.md`](conceptos/descripcion-general.md) |
| 2. Casos de uso (CU-01 a CU-16) | [`conceptos/casos-de-uso.md`](conceptos/casos-de-uso.md) |
| 3. Requisitos funcionales (RF-01 a RF-26) | [`conceptos/RFs.md`](conceptos/RFs.md) |
| 4. Requisitos no funcionales (RNF-01 a RNF-18) | [`conceptos/NFs.md`](conceptos/NFs.md) |
| 5. Reglas de negocio | [`conceptos/reglas-de-negocio.md`](conceptos/reglas-de-negocio.md) |
| 6. Arquitectura | [`referencia-tecnica/architecture.md`](referencia-tecnica/architecture.md) |
| 7. Modelo de datos, diccionario y verificación en DBeaver | [`referencia-tecnica/database-schema.md`](referencia-tecnica/database-schema.md) |
| 8. Integración entre capas (frontend, backend y PostgreSQL) | [`referencia-tecnica/integracion.md`](referencia-tecnica/integracion.md) |
| 9. Flujos del sistema | [`referencia-tecnica/flujos.md`](referencia-tecnica/flujos.md) |
| 10. Interfaces | [`referencia-tecnica/interfaces.md`](referencia-tecnica/interfaces.md) |
| 11. Pruebas y evidencias | [`pruebas.md`](pruebas.md) |
| 12. Comparación con la documentación anterior | [`comparativa-documentacion.md`](comparativa-documentacion.md) |
| 13. Hallazgos: errores y funcionalidades incompletas | [`hallazgos.md`](hallazgos.md) |
| 14. Ejecución del proyecto por fases | [`conceptos/plan-ejecucion.md`](conceptos/plan-ejecucion.md) |
| 15. Conclusiones | [`conclusiones.md`](conclusiones.md) |
| Anexo A. Historias de usuario | [`conceptos/HUs.md`](conceptos/HUs.md) |
| Anexo B. Matriz de trazabilidad | [`conceptos/trazabilidad.md`](conceptos/trazabilidad.md) |
| Anexo C. Referencia de la API | [`referencia-tecnica/api-endpoints.md`](referencia-tecnica/api-endpoints.md) |
| Anexo D. Manual de usuario | [`manual-usuario.md`](manual-usuario.md) |
| Anexo E. Manual técnico | [`manual-tecnico.md`](manual-tecnico.md) |

### Documentos de la evaluación (rúbrica de 14 criterios, 20/11/2026)

La carpeta [`../ENTREGA_FINAL_CLASSKIDS/`](../ENTREGA_FINAL_CLASSKIDS/00_INDICE_Y_ESTADO/README.md) organiza los criterios y enlaza a estos archivos oficiales:

| Documento | Archivo |
|---|---|
| Modelo relacional verificado contra la base real (editable, PNG, PDF y diccionario de datos) | [`referencia-tecnica/modelo-relacional.md`](referencia-tecnica/modelo-relacional.md) |
| Informe de diferencias del modelo relacional | [`referencia-tecnica/modelo-relacional-diferencias.md`](referencia-tecnica/modelo-relacional-diferencias.md) |
| Diagramas UML (clases), componentes y despliegue | [`diagramas/uml-y-modelo-relacional.md`](diagramas/uml-y-modelo-relacional.md) |
| Renovación visual del frontend | [`frontend/renovacion-visual.md`](frontend/renovacion-visual.md) |
| Plan de pruebas | [`pruebas/plan-de-pruebas.md`](pruebas/plan-de-pruebas.md) |
| Reporte de ejecución (antes y después) | [`pruebas/reporte-ejecucion-2026-11-20.md`](pruebas/reporte-ejecucion-2026-11-20.md) |
| Registro de defectos | [`pruebas/registro-defectos.md`](pruebas/registro-defectos.md) |
| Auditoría del backend | [`backend/auditoria-backend.md`](backend/auditoria-backend.md) |
| Despliegue | [`despliegue.md`](despliegue.md) |
| Scrum (backlog, sprints, retrospectivas) | [`scrum/README.md`](scrum/README.md), [`scrum/etapas-retrospectivas.md`](scrum/etapas-retrospectivas.md), [`scrum/retrospectiva-cierre.md`](scrum/retrospectiva-cierre.md) |
| Organización del código (diagnóstico y etapas) | [`frontend/organizacion-codigo.md`](frontend/organizacion-codigo.md) |
| Trabajo en equipo y retroalimentación | [`equipo/README.md`](equipo/README.md) |
| Comparativa de backends y deuda técnica | [`backends-comparativa.md`](backends-comparativa.md), [`deuda-tecnica.md`](deuda-tecnica.md) |
| IoT (propuesta) | [`iot/propuesta-iot.md`](iot/propuesta-iot.md) |
| Estado del repositorio Git | [`repositorio-git.md`](repositorio-git.md) |
| Contraste WCAG y capturas vigentes | [`evidencias/contraste-wcag.md`](evidencias/contraste-wcag.md), [`evidencias/capturas-v3/README.md`](evidencias/capturas-v3/README.md) (142 capturas por módulo, claro y oscuro, escritorio y celular) |

### Otros documentos

- [`backlog.md`](backlog.md): trabajo terminado y pendiente, priorizado según los hallazgos.
- [`conceptos/patrones-arquitectonicos.md`](conceptos/patrones-arquitectonicos.md): patrones de diseño aplicados.
- [`conceptos/restricciones.md`](conceptos/restricciones.md): restricciones de alcance, técnicas y de negocio.
- [`diagramas/`](diagramas/): diagramas PNG y sus versiones en Mermaid.
- [`evidencias/`](evidencias/): capturas de pantalla y scripts de verificación.
- [`migraciones/001-informe-preparacion.md`](migraciones/001-informe-preparacion.md): respaldo, ensayo y reversión de la migración 001 (pendiente de autorización).
- [`../e2e/README.md`](../e2e/README.md): entorno de pruebas aislado y ejecución de las pruebas automatizadas.
- [`politicas/`](politicas/): términos y condiciones, privacidad, cookies y protección de datos (también publicadas en `/legal/*`).

## Estado del proyecto en una frase

ClassKids es un MVP funcional de extremo a extremo sobre PostgreSQL, con 16 casos de uso construidos (7 completos y 9 parciales o con observaciones). Se documentaron 33 hallazgos; los de integración aprobados (H-02, H-24 a H-29, H-31, H-33, y en parte H-30 y H-32) ya están corregidos y respaldados por 54 pruebas automatizadas aprobadas. Siguen pendientes, entre otros, la diferencia de umbrales entre la interfaz y la alerta (H-01), la regla de alerta al editar (H-04) y el promedio con estudiantes sin nota (H-19). La migración 001 (columna `entregado`) está preparada y pendiente de autorización en la base real.

## Base de datos

La base de datos documentada es exactamente la que se consulta en DBeaver (`localhost:5432`, base `classkids`): el contenedor Docker `classkids_db`. Para comprobarlo, ejecute en DBeaver [`evidencias/scripts/verificacion-bd.sql`](evidencias/scripts/verificacion-bd.sql) y compare con la sección «Verificación en DBeaver» de [`referencia-tecnica/database-schema.md`](referencia-tecnica/database-schema.md).

## Cómo regenerar el documento Word

El Word se construye con el script [`entregable/build_docx.py`](entregable/build_docx.py), que lee los capítulos Markdown en el orden del índice:

```bash
pip install python-docx pillow
node Docs/diagramas/renderizar_mermaid.cjs   # solo si cambian los diagramas Mermaid (genera los PNG)
python Docs/entregable/build_docx.py          # genera entregable/ClassKids_Documento_Proyecto_v3.docx
```
