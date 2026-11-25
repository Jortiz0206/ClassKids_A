# ClassKids — Seguimiento académico con alertas tempranas

ClassKids es una plataforma web que apoya a los docentes de un colegio en el seguimiento académico de sus estudiantes. Centraliza grupos, estudiantes, materias, actividades, calificaciones y observaciones, calcula indicadores de rendimiento y genera alertas cuando un estudiante tiene bajo desempeño.

Proyecto formativo del programa **Análisis y Desarrollo de Software (ADSO)** del **SENA**.

**Objetivo:** que cada docente identifique a tiempo a los estudiantes que necesitan acompañamiento, con la información académica en un solo lugar y alertas automáticas cuando el promedio baja de 3.0.

> **Documentación completa:** [`Docs/README.md`](Docs/README.md) · **Evaluación (14 criterios):** [`ENTREGA_FINAL_CLASSKIDS/`](ENTREGA_FINAL_CLASSKIDS/00_INDICE_Y_ESTADO/README.md) · **Documento académico (Word, versión 3.0):** [`Docs/entregable/ClassKids_Documento_Proyecto_v3.docx`](Docs/entregable/ClassKids_Documento_Proyecto_v3.docx)

## Funcionalidades

| Módulo | Qué permite | Estado |
|---|---|---|
| Seguridad y acceso | Inicio y cierre de sesión (JWT, 8 h), recuperación de contraseña, activación de cuenta por invitación. | Implementado |
| Administración | Invitar usuarios, cambiar rol, desactivar cuentas, métricas y datos globales. | Implementado (sin edición de datos del usuario) |
| Grupos | Crear y consultar grupos con indicadores. | Parcial: editar y eliminar solo por API |
| Estudiantes | Registrar, editar, buscar, filtrar (por grupo y estado) y consultar el detalle. | Parcial: eliminar solo por API |
| Materias y asignaciones | Catálogo de materias y un docente por materia en cada grupo. | Parcial: editar materias solo por API |
| Actividades | Crear y consultar tareas, exámenes, proyectos y participaciones. | Parcial: editar y eliminar solo por API |
| Calificaciones | Registrar las notas de un grupo por actividad; solo se guardan las filas modificadas y se conservan observaciones y periodos. Escala oficial 0.0–5.0: la nota se escribe y se muestra en esa escala, con el porcentaje y la equivalencia sobre 20 como datos secundarios. | Implementado con observaciones (migración 001 pendiente en la base real) |
| Observaciones | Registrar observaciones académicas, convivenciales y de reconocimiento. | Implementado |
| Análisis | Dashboard del docente y tablero con cuatro gráficas y estudiantes en riesgo. | Implementado con observaciones |
| Alertas | Alerta automática cuando el promedio es menor a 3.0, sin duplicados; seguimiento por estados e historial de resueltas. | Parcial: sin creación manual en la interfaz |

Los errores y pendientes conocidos están documentados en [`Docs/hallazgos.md`](Docs/hallazgos.md).

## Roles

- **Administrador:** gestiona usuarios y consulta las métricas globales. Puede usar todas las funciones del docente.
- **Docente:** gestiona la información académica, consulta el tablero y atiende las alertas.
- Los **estudiantes** son registros del sistema; no ingresan a la plataforma. El rol *Acudiente* existe en la base de datos, pero no tiene funcionalidad.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Recharts |
| Backend | Python, FastAPI, Uvicorn, Pydantic, SQLAlchemy Core, python-jose (JWT), passlib (PBKDF2) |
| Base de datos | PostgreSQL 15 en Docker |
| Pruebas | pytest + httpx (API), Vitest (unitarias del frontend), Playwright (interfaz de extremo a extremo) |
| Herramientas | pnpm, ESLint, Docker Compose, Git |

## Interfaz

La interfaz se renovó el 20/11/2026 en el entorno de pruebas. Detalles en [`Docs/frontend/renovacion-visual.md`](Docs/frontend/renovacion-visual.md), organización del código en [`Docs/frontend/organizacion-codigo.md`](Docs/frontend/organizacion-codigo.md) y evidencias vigentes (94 capturas, claro y oscuro, escritorio y celular) en [`Docs/evidencias/capturas-v3/`](Docs/evidencias/capturas-v3/README.md).

- **Identidad:** paleta fresca (menta, cielo, lavanda y blanco nube, con acentos durazno, mantequilla y frambuesa); verde ClassKids para las acciones y azul tinta para el texto.
- **Tipografía:** Bricolage Grotesque en los títulos y DM Sans en el texto.
- **Mascota:** la plantita de ClassKids, en bienvenidas y estados vacíos.
- **Navegación:** menú lateral claro en escritorio y barra inferior en el celular (Inicio, Estudiantes, Calificaciones, Alertas y «Más»), respetando los roles.
- **Calificaciones:** se escriben de 0.0 a 5.0 con un decimal, y se muestran sus equivalencias, por ejemplo `4.3 → 86 % · 17.2 / 20`. Un valor fuera de la escala no se puede guardar.
- **Modo claro y oscuro:** selector en toda la plataforma; la preferencia se conserva al navegar y al recargar.
- **Accesibilidad:** contraste WCAG AA verificado en 64 de 64 pares de color, 32 por tema ([reporte](Docs/evidencias/contraste-wcag.md)), y texto mínimo de 12 px.

## Arquitectura

Cliente-servidor en tres capas:

1. React (navegador).
2. API REST FastAPI, que se comunica por HTTP + JSON con un JWT en cada petición.
3. PostgreSQL, al que la API accede con SQL parametrizado.

Diagramas en [`Docs/diagramas/`](Docs/diagramas/): MER, clases UML, casos de uso, componentes y despliegue. El modelo relacional verificado contra la base real (con PNG, PDF y diccionario de datos) está en [`Docs/referencia-tecnica/modelo-relacional.md`](Docs/referencia-tecnica/modelo-relacional.md).

## Estructura

```text
ClassKids_A/
├── backend/                  API FastAPI (main.py), conexión (database.py), init.sql, migrations/, tests/ (pytest),
│                             docker-compose.yml (real), docker-compose.test.yml (pruebas) y docker-compose.demo.yml (demostración)
├── frontend/                 React: src/pages, src/components (common, layout, dashboard, ui), src/lib, src/test (Vitest)
├── e2e/                      Pruebas de interfaz con Playwright y guía del entorno de pruebas
├── backend/demo/             Generador de la base de demostración (classkids_demo); tests_demo/ la verifica
├── Docs/                     Documentación oficial, diagramas, evidencias, pruebas, Scrum, equipo y Word
└── ENTREGA_FINAL_CLASSKIDS/  Índice para el instructor: los 14 criterios con enlaces a sus evidencias;
                              06_IOT_BONIFICACION/ contiene el prototipo IoT independiente (Wokwi + receptor en Python)
```

## Instalación rápida

Requisitos: Git, Docker, Python 3.10 o superior, Node.js 18 o superior y pnpm.

```bash
# 1. Base de datos
cd backend
docker compose up -d

# 2. Backend (en backend/)
python -m venv venv
venv\Scripts\activate            # Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload        # http://127.0.0.1:8000  (docs en /docs)

# 3. Frontend (en otra terminal)
cd frontend
pnpm install
pnpm run dev                                # http://localhost:8080
```

### Variables de entorno

| Variable | Dónde | Uso |
|---|---|---|
| `DATABASE_URL` | Backend | Conexión a PostgreSQL (por defecto, la base local `classkids` en 5432). Se lee de `backend/.env` o del sistema; `CLASSKIDS_ENV_FILE` indica otro archivo, por ejemplo `.env.demo` |
| `CLASSKIDS_ENTORNO` | Backend | `real`, `test` o `demo`. Si se define, el backend solo arranca cuando `DATABASE_URL` apunta a la base de ese entorno |
| `JWT_SECRET` | Backend | Firma de las sesiones. Obligatoria con `ENVIRONMENT=production`; en desarrollo, si falta, las sesiones se pierden al reiniciar |
| `ENVIRONMENT` | Backend | `development` (por defecto) o `production` |
| `CORS_ORIGINS`, `FRONTEND_URL` | Backend | Orígenes permitidos y URL usada en los enlaces de correo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Backend | Envío de invitaciones y recuperación de contraseña (opcional) |
| `VITE_API_URL` | Frontend | URL de la API (por defecto `http://127.0.0.1:8000`) |

La plantilla está en `backend/.env.example` y la explicación completa en el [manual técnico](Docs/manual-tecnico.md). El estado del despliegue está en [`Docs/despliegue.md`](Docs/despliegue.md): por ahora solo hay ejecución local, y la base de datos es el único servicio en Docker.

## API

La API expone **49 operaciones** REST, verificadas contra el `openapi.json` del backend.
- **Referencia completa** (método, ruta, acceso, códigos de error y uso desde la interfaz): [`Docs/referencia-tecnica/api-endpoints.md`](Docs/referencia-tecnica/api-endpoints.md).
- **Documentación interactiva:** `http://127.0.0.1:8000/docs`, con el backend en ejecución.
- **Recursos:** `/auth/*`, `/usuarios`, `/invitaciones`, `/grupos`, `/estudiantes`, `/materias`, `/asignaciones`, `/actividades`, `/calificaciones`, `/observaciones` y `/alertas`.

## Demostración con datos persistentes

ClassKids incluye una **base de demostración** propia (`classkids_demo`, puerto 5434) que se reconstruye en cualquier computador con un generador versionado:

```powershell
cd backend
docker compose -f docker-compose.demo.yml up -d
python demo/generar_demo.py preparar        # backend/.env.demo con claves aleatorias (no se publica)
python demo/generar_demo.py generar         # unos 6 minutos
$env:CLASSKIDS_ENV_FILE = ".env.demo"; python -m uvicorn main:app --port 8002
# en otra terminal:  cd frontend; npm run demo   → http://localhost:8082
```

**Qué genera:**
- 1 administradora y 5 docentes con asignaciones distintas;
- 10 grupos, 6 materias, 200 estudiantes y 270 actividades;
- 3.861 calificaciones de 0.0 a 5.0, 96 observaciones y 51 alertas.

**Cómo lo genera:**
- Todo pasa por la API real: las alertas las crea la regla del backend y las contraseñas usan el mismo hash PBKDF2.
- Los datos son ficticios y reproducibles: la semilla es fija.
- El generador nunca escribe en `classkids` ni en `classkids_test`.

Las credenciales quedan en `backend/CREDENCIALES_DEMO.md` (local). La guía completa, con los escenarios y el recorrido por rol, está en [`Docs/demo/guia-demostracion.md`](Docs/demo/guia-demostracion.md).

La base real (`classkids`) se crea con `backend/init.sql`. Contiene 10 grupos, 200 estudiantes, 5 materias, 52 actividades, 215 calificaciones, 10 observaciones y 32 alertas. Las contraseñas de sus cuentas están en `backend/CREDENCIALES_LOCALES.md`, que no se publica.

## Pruebas

El proyecto tiene **264 pruebas automatizadas** en el entorno aislado, **17** sobre la base de demostración y **48** del prototipo IoT:

| Suite | Pruebas |
|---|---:|
| pytest: integración de la API con PostgreSQL | 24 |
| pytest: seguridad de la API (permisos H-08 y H-18) | 19 |
| pytest: hallazgos del cierre (H-05, H-09, H-17, CORS) | 11 |
| pytest: escala de calificaciones 0.0–5.0 (H-44) | 56 |
| pytest: generador de la demostración (plan y protecciones) | 28 |
| pytest: unitarias del backend, sin base de datos | 18 (11 funciones) |
| Vitest: unitarias del frontend | 64 |
| Playwright: interfaz de extremo a extremo | 44 |
| Demostración: pytest sobre `classkids_demo` | 11 |
| Demostración: recorrido en el navegador (Playwright) | 6 |
| IoT: receptor, circuito y registros de la simulación (pytest) | 48 |

Última ejecución completa (24/11/2026, auditoría integral):
- **264 de 264** en el entorno aislado.
- **14 de 14** sobre la demostración: las 11 de pytest y las 3 de solo lectura del recorrido. Las otras 3 del recorrido crean y borran registros; no se ejecutaron para no modificar la base persistente.
- **48 de 48** del prototipo IoT, que además se simuló en Wokwi (grabación en `ENTREGA_FINAL_CLASSKIDS/06_IOT_BONIFICACION/`).

Se ejecutan en un **entorno aislado** con su propia base de datos (`classkids_test`, puerto 5433), backend en 8001 y frontend en 8081, sin tocar la base real.
- Plan de pruebas: [`Docs/pruebas/plan-de-pruebas.md`](Docs/pruebas/plan-de-pruebas.md).
- Último reporte: [`Docs/pruebas/reporte-ejecucion-2026-11-24.md`](Docs/pruebas/reporte-ejecucion-2026-11-24.md) (anterior: [`reporte-ejecucion-2026-11-20.md`](Docs/pruebas/reporte-ejecucion-2026-11-20.md)).
- Defectos: [`Docs/pruebas/registro-defectos.md`](Docs/pruebas/registro-defectos.md).
- Instrucciones del entorno: [`e2e/README.md`](e2e/README.md).

```bash
cd frontend && npx vitest run                              # Vitest
cd backend && venv/Scripts/python.exe -m pytest tests -q   # pytest (requiere la base de pruebas)
CK_DOCENTE_PASS=... CK_ADMIN_PASS=... node node_modules/@playwright/test/cli.js test -c e2e/playwright.config.ts   # desde la raíz
```

## Documentación

| Documento | Contenido |
|---|---|
| [Descripción general](Docs/conceptos/descripcion-general.md) | Idea, objetivos, alcance, actores y módulos |
| [Casos de uso](Docs/conceptos/casos-de-uso.md) | CU-01 a CU-16 con su estado |
| [Requisitos funcionales](Docs/conceptos/RFs.md) y [no funcionales](Docs/conceptos/NFs.md) | RF-01 a RF-26 y RNF-01 a RNF-18 |
| [Reglas de negocio](Docs/conceptos/reglas-de-negocio.md) | Escala, umbrales, alertas y permisos |
| [Arquitectura](Docs/referencia-tecnica/architecture.md) y [modelo de datos](Docs/referencia-tecnica/database-schema.md) | Diagramas y diccionario de datos |
| [Manual de usuario](Docs/manual-usuario.md) y [manual técnico](Docs/manual-tecnico.md) | Uso, instalación y mantenimiento |
| [Hallazgos](Docs/hallazgos.md) y [registro de defectos](Docs/pruebas/registro-defectos.md) | Errores, severidad, estado y seguimiento |
| [Renovación visual](Docs/frontend/renovacion-visual.md) | Pantallas, rutas, navegación, componentes, colores y accesibilidad |
| [Deuda técnica](Docs/deuda-tecnica.md) y [comparativa de backends](Docs/backends-comparativa.md) | Prioridades técnicas y reflexión del criterio 14 |
| [Scrum](Docs/scrum/README.md) y [equipo](Docs/equipo/README.md) | Backlog, sprints, retrospectivas y trabajo en equipo (con pendientes del equipo) |

## Equipo

Integrantes actuales:
- María Alejandra Guio
- Faloon Johanna Ortiz
- Jan Llanos

Los roles y la distribución del trabajo están en [`Docs/equipo/README.md`](Docs/equipo/README.md), pendientes de que el equipo los complete.


Programa Análisis y Desarrollo de Software (ADSO) — Servicio Nacional de Aprendizaje (SENA). Proyecto desarrollado con fines académicos.
