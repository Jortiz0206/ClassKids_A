# Guía para sustentar los 14 criterios

Escrita para el equipo (Faloon Johanna Ortiz, María Alejandra Guio y Jan Llanos), en palabras sencillas, para explicar y defender cada criterio ante el instructor. Estado verificado el 23/11/2026.

Para cada criterio:
- **Qué pide:** lo que solicita la rúbrica.
- **En sencillo:** qué significa.
- **En ClassKids:** cómo se aplica al proyecto.
- **Tenemos:** lo que ya existe.
- **Falta:** lo que todavía no está.
- **Se hizo:** lo que se corrigió o creó.
- **Dónde:** los archivos.
- **Cómo demostrarlo:** qué mostrar en la sustentación.

**Antes de presentar, levanten el entorno de pruebas:** base 5433, backend 8001 y frontend 8081. Los pasos están en `e2e/README.md`.

---

## 1. Documentación

- **Qué pide:** requisitos, diagramas, MER, MR, UML, casos de uso y diagramas de clases que coincidan con el código.
- **En sencillo:** demostrar que sabemos *qué* hace el sistema (requisitos y casos de uso) y *cómo* está construido (modelos y clases), y que el papel coincide con lo programado.
- **En ClassKids:** 25 RF, 17 RNF, 16 casos de uso, 20 historias, MER, modelo relacional de 12 tablas y clases del backend y del frontend.
- **Tenemos:** todo lo anterior.
  - El modelo relacional se verificó el 23/11 contra la base **real** con consultas de solo lectura: columnas, tipos, nulos, valores por defecto, PK, FK, índices y `ON DELETE`.
  - Está en versión editable, PNG y PDF.
  - Hay un informe de diferencias.
- **Falta:** que el equipo revise el Word 3.0.
- **Se hizo:**
  - Modelo relacional generado desde la base real, sin la columna `entregado`, que aún no existe porque la migración 001 está pendiente.
  - Diccionario de datos e informe de diferencias.
  - Clases UML, componentes y despliegue.
  - Word 3.0.
- **Dónde:** `Docs/conceptos/`, `Docs/referencia-tecnica/modelo-relacional.md`, `Docs/diagramas/` y `Docs/entregable/ClassKids_Documento_Proyecto_v3.docx`.
- **Cómo demostrarlo:**
  1. Abra el PNG del MR junto a DBeaver y muestre que las 12 tablas coinciden.
  2. Explique un `ON DELETE`: «si se borra un estudiante, se borran sus calificaciones, observaciones y alertas (CASCADE)».
  3. Explique la relación débil: «`password_reset_tokens` no tiene llave foránea; se relaciona por el correo».

## 2. Scrum

- **Qué pide:** backlog, historias puntuadas, sprints, tareas con responsable y retrospectivas.
- **En sencillo:** demostrar que el trabajo se organizó en ciclos cortos, con tareas repartidas y revisión de lo aprendido.
- **En ClassKids:** el proyecto se trabajó por fases, no con sprints formales registrados. Se reconstruyó el proceso en **6 etapas** (análisis, diseño, backend y base de datos, frontend e integración, pruebas y defectos, renovación y documentación), cada una con la evidencia que la respalda.
- **Tenemos:**
  - Las etapas, en `etapas-retrospectivas.md`.
  - El backlog de 20 historias con criterios de aceptación y un **esfuerzo estimado de forma retrospectiva** (75 en total). Está marcado como estimación posterior, no como puntos históricos.
  - Una retrospectiva de cierre con aprendizajes que se pueden comprobar.
  - Plantillas.
- **Falta (lo completan ustedes):** sus propios puntos, los responsables, el sprint de cierre y su reflexión personal. No se inventaron fechas, reuniones ni asignaciones.
- **Dónde:** `Docs/scrum/`.
- **Cómo demostrarlo:** muestren una etapa con su evidencia (por ejemplo, la de pruebas y defectos) y una historia con sus criterios. Expliquen con honestidad que las etapas son una reconstrucción.

## 3. Backend

- **Qué pide:** que FastAPI inicie sin errores, con rutas, validaciones, manejo de errores, códigos HTTP, estados y variables de entorno.
- **En sencillo:** que el servidor arranque bien, responda con el código correcto (200, 401, 404…) y no tenga claves escritas en el código.
- **En ClassKids:**
  - 49 rutas.
  - JWT de 8 horas y contraseñas PBKDF2.
  - Códigos 400, 401, 403, 404, 409, 422 y 500.
  - Variables en `.env.example`.
- **Tenemos:** arranque limpio verificado, 72 pruebas de backend (19 de permisos y 11 de los hallazgos del cierre), la auditoría completa y los permisos por rol y por asignación (H-08) y la autoprotección del administrador (H-18) corregidos el 24/11/2026.
- **Falta (requiere autorización):**
  - H-04: decidir si la alerta se evalúa al editar y por materia (contradice RN-09 y RN-10).
- **Dónde:** `backend/main.py`, `Docs/backend/auditoria-backend.md`.
- **Cómo demostrarlo:**
  1. Abra `http://127.0.0.1:8001/docs`.
  2. Llame a una ruta sin token: responde 401.
  3. Ejecute `pytest`: 42 aprobadas.

## 4. Despliegue

- **Qué pide:** instalación, dependencias, variables, Docker y la diferencia entre ejecución local y publicación.
- **En sencillo:** explicar cómo cualquiera instala y ejecuta el sistema, y qué haría falta para publicarlo.
- **En ClassKids:** PostgreSQL en Docker (real y pruebas), backend con `uvicorn` y frontend con Vite. `vite build` compila para producción.
- **Falta (requiere autorización):** Dockerfiles del backend y del frontend, un compose completo y la plataforma de publicación. No se publicó nada ni se generaron costos.
- **Dónde:** `Docs/despliegue.md`, `README.md`, `Docs/manual-tecnico.md`.
- **Cómo demostrarlo:** muestren los dos compose, el `.env.example` y la lista de verificación del día del despliegue.

## 5. Arquitectura

- **Qué pide:** el diagrama de cómo se comunican React, la API, la lógica de negocio y PostgreSQL.
- **En sencillo:** el «mapa» del sistema y el recorrido de un dato.
- **En ClassKids:** cliente-servidor en tres capas.
- **Recorrido real de «guardar una calificación»:**
  1. El docente escribe 86 y pulsa «Guardar cambios».
  2. React convierte 86 a 4.3 (÷ 20).
  3. `client.ts` envía un POST o PUT con el token.
  4. El middleware de FastAPI valida el token.
  5. Pydantic valida el JSON.
  6. El endpoint guarda la nota en PostgreSQL. Si el promedio queda por debajo de 3.0, crea la alerta.
  7. La pantalla muestra «Calificaciones guardadas correctamente».
- **Falta:** relacionarla con las formaciones previas (información del equipo).
- **Dónde:** `Docs/referencia-tecnica/architecture.md`, `Docs/diagramas/componentes.png` y `despliegue.png`.
- **Cómo demostrarlo:** con el diagrama de componentes en pantalla, cuenten ese recorrido mientras guardan una nota en el entorno de pruebas.

## 6. IoT (bonificación)

- **Qué pide:** un prototipo, la recepción de datos y el protocolo explicado.
- **En sencillo:** un dispositivo que mide algo y le envía los datos a un programa.
- **En ClassKids:** **no implementado.** La aplicación no tiene ninguna integración IoT, y no se presenta como si la tuviera.
- **Tenemos:** la búsqueda documentada (no se encontraron actividades de Arduino en el repositorio ni en este equipo), una plantilla y una **propuesta** de prototipo independiente (Arduino + sensor → JSON por serial → Python). No hay capturas, datos ni pruebas de IoT.
- **Falta:** si la actividad de Arduino de la formación existe (sensor → serial → JSON → Python), aporten el código y la evidencia.
- **Dónde:** `Docs/iot/propuesta-iot.md`.
- **Cómo explicarlo:** «el Arduino envía `{"temperatura": 24}` por el puerto serial; Python lo lee con `pyserial` y lo convierte con `json.loads`».

## 7. Plan de pruebas

- **Qué pide:** alcance, ambientes, tipos de prueba, casos y resultados.
- **En sencillo:** qué se prueba, dónde, cómo y qué se esperaba frente a lo que salió.
- **En ClassKids:** un ambiente de pruebas **separado** del real: otra base (5433), otro backend (8001) y otro frontend (8081), con salvaguardas que impiden tocar la base real.
- **Tipos de prueba:**
  - **Unitarias:** una función sola, sin base de datos ni navegador.
  - **Integración:** la API con la base de pruebas.
  - **Interfaz:** un navegador automático usa la app como lo haría una persona.
- **Dónde:** `Docs/pruebas/plan-de-pruebas.md` y `reporte-ejecucion-2026-11-20.md`.
- **Cómo demostrarlo:** muestren la tabla de niveles y expliquen la salvaguarda: «pytest se detiene si la base no es `classkids_test`».

## 8. Pruebas unitarias

- **Qué pide:** al menos 20 pruebas unitarias reales y distintas.
- **En sencillo:** pruebas pequeñas que verifican una regla concreta.
- **En ClassKids:** **55 casos unitarios reales**:
  - 44 de Vitest: notas, umbrales, conversión ÷ 20, fechas, navegación por rol, tema, errores y normalización de listas.
  - 11 funciones de pytest sin base de datos: JWT, PBKDF2, estados de alerta y esquemas.
  - Las pruebas de integración y de interfaz no se cuentan como unitarias. Se retiró una prueba de ejemplo que no probaba nada.
- **Dónde:** `frontend/src/test/` y `backend/tests/test_unitarias.py`.
- **Cómo demostrarlo:** ejecuten `npx vitest run` (44 aprobadas) y muestren `notas.test.ts`: «70 % equivale exactamente a 3.5».

## 9. Defectos

- **Qué pide:** defectos con su información completa y seguimiento.
- **En sencillo:** una lista de errores reales, qué tan graves son y en qué quedaron.
- **En ClassKids:** 40 defectos (H-01 a H-40) con módulo, severidad, prioridad, estado y evidencia. Los corregidos tienen la prueba que lo demuestra.
- **Dónde:** `Docs/pruebas/registro-defectos.md`.
- **Cómo demostrarlo:** muestren H-34: «al girar una tableta se perdían las notas sin guardar; se corrigió y una prueba E2E lo comprueba».

## 10. Frontend

- **Qué pide:** pantallas, rutas, navegación, colores y experiencia de usuario.
- **En sencillo:** que la aplicación se vea bien, sea fácil de usar y funcione en el computador y en el celular.
- **En ClassKids:**
  - Rediseño completo con las paletas Recreo y Cuaderno vivo, la mascota, Bricolage Grotesque y DM Sans.
  - Menú lateral claro y barra inferior en el celular, con «Más».
  - Notas con su equivalencia («86 / 100 = 4.3»).
  - **Modo claro y oscuro** en toda la plataforma, con la preferencia guardada.
  - Contraste AA en ambos temas (64 de 64).
  - Confirmación antes de borrar o desactivar, y la lista de usuarios adaptada al celular.
  - Código ordenado sin cambiar el comportamiento: utilidades compartidas y el panel de inicio con 6 peticiones en lugar de 13.
- **Dónde:** `frontend/src/`, `Docs/frontend/renovacion-visual.md`, `Docs/frontend/organizacion-codigo.md` y el índice de **94 capturas V3** en `Docs/evidencias/capturas-v3/README.md`. Las capturas V2 son históricas; no las usen en la presentación.
- **Cómo demostrarlo:** en vivo, cambien el tema, recarguen (se mantiene), abran Calificaciones en el celular y el menú «Más».

## 11. README y API

- **Qué pide:** un README completo y los endpoints documentados, que existan de verdad.
- **En ClassKids:** el README tiene instalación, variables, ejecución, pruebas, arquitectura, API y equipo. Las 49 rutas documentadas se compararon el 23/11 con el backend en ejecución: coinciden las 49.
- **Falta:** confirmar que el «cuarto backend» de la rúbrica es ClassKids.
- **Dónde:** `README.md`, `Docs/referencia-tecnica/api-endpoints.md`.
- **Cómo demostrarlo:** abran `/docs` y busquen la misma ruta en la tabla de la referencia.

## 12. Git

- **Qué pide:** manejo apropiado de ramas y commits.
- **En ClassKids:** ramas `master`, `develop`, `stg` y `show-cocurrent`, con 6 commits. El trabajo reciente está sin commit, a la espera de autorización.
- **Dónde:** `Docs/repositorio-git.md`, que incluye una propuesta de commits por grupo y el flujo `stg` → `develop` → `master`.
- **Cómo demostrarlo:** muestren `git log --oneline --all` y expliquen el flujo propuesto.

## 13. Trabajo en equipo

- **Qué pide:** integrantes, división del trabajo, participación y retroalimentación.
- **En ClassKids:** los integrantes actuales son Johanna, Alejandra y Jan. Andrés Gutiérrez aparece solo como autor histórico de la versión 1.0.
- **Falta (lo escriben ustedes):** roles, quién hizo qué, con evidencia, y la retroalimentación de cada uno.
- **Dónde:** `Docs/equipo/`.

## 14. Backends y deuda técnica

- **Qué pide:** comparar los cuatro backends estudiados y documentar la deuda técnica.
- **En ClassKids:** la deuda técnica está priorizada (18 ítems, por impacto y riesgo). Los cuatro backends **no aparecen en ningún documento**; hay un candidato (CRUD Express + MongoDB) en este equipo, sin confirmar.
- **Falta:** que confirmen los cuatro backends y escriban la reflexión.
- **Dónde:** `Docs/backends-comparativa.md`, `Docs/deuda-tecnica.md`.
- **Cómo explicarlo:** «la deuda P1 era que la API no limitaba qué datos veía cada docente (H-08); se corrigió el 24/11/2026 con permisos por asignación y 19 pruebas. Queda guardar la materia en las alertas, que requiere una migración».
