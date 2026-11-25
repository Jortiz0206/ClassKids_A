# Arquitectura del sistema

## Visión general

ClassKids sigue una arquitectura **cliente-servidor desacoplada en tres capas**:

1. **Capa de presentación:** aplicación de una sola página (SPA) en React que se ejecuta en el navegador.
2. **Capa de lógica:** API REST en FastAPI (Python) que valida la sesión, aplica las reglas de negocio y accede a los datos.
3. **Capa de datos:** base de datos PostgreSQL 15 que se ejecuta en un contenedor Docker.

Las capas se comunican por HTTP con mensajes JSON. Cada petición a una ruta privada incluye el encabezado `Authorization: Bearer <token>`.

![Arquitectura de ClassKids](../diagramas/arquitectura.png)

## Tecnologías

| Capa | Tecnología | Uso en el proyecto |
|---|---|---|
| Presentación | React 18 + TypeScript | Construcción de la interfaz por componentes. |
| Presentación | Vite 5 | Servidor de desarrollo (puerto 8080) y empaquetado. |
| Presentación | Tailwind CSS 3 + shadcn/ui (Radix UI) | Estilos y componentes accesibles (diálogos, selectores, tablas, pestañas). |
| Presentación | React Router 6 | Rutas públicas, protegidas y de administración. |
| Presentación | Recharts 2 | Gráficas del Dashboard y de Análisis. |
| Presentación | Sonner | Mensajes de éxito y error. |
| Lógica | Python + FastAPI + Uvicorn | API REST (puerto 8000) con documentación automática en `/docs`. |
| Lógica | Pydantic 2 | Esquemas de los datos de entrada. |
| Lógica | python-jose | Emisión y validación de tokens JWT (HS256). |
| Lógica | passlib (PBKDF2-SHA256) | Hash de contraseñas. |
| Lógica | SQLAlchemy 2 (Core) + psycopg 3 | Conexión a PostgreSQL y consultas SQL parametrizadas con `text()`; no se usan modelos ORM. |
| Datos | PostgreSQL 15 (imagen `postgres:15-alpine`) | Persistencia. |
| Infraestructura | Docker Compose | Ejecución de la base de datos con volumen persistente. |
| Pruebas | pytest + httpx (TestClient) | 24 pruebas de la API contra la base de pruebas. |
| Pruebas | Vitest + Testing Library | 15 pruebas de lógica del frontend. |
| Pruebas | Playwright | 15 pruebas de interfaz contra el entorno de pruebas. |
| Herramientas | pnpm, ESLint, Git | Gestión de paquetes, análisis estático y control de versiones. |

## Estructura del repositorio

Actualizada el 23/11/2026 con el código entregado.

```text
ClassKids_A/
├── backend/
│   ├── main.py                  API completa: esquemas Pydantic, middleware JWT y 49 operaciones
│   ├── database.py              Conexión a PostgreSQL (engine y sesión)
│   ├── init.sql                 Esquema de la base de datos y datos de demostración
│   ├── migrations/              001_calificaciones_entregado.sql (aplicada solo en pruebas)
│   ├── tests/                   pytest: conftest (salvaguardas), integración y unitarias
│   ├── docker-compose.yml       PostgreSQL real (5432)
│   ├── docker-compose.test.yml  PostgreSQL de pruebas (5433)
│   ├── requirements.txt         Dependencias (y requirements-dev.txt para pruebas)
│   └── .env.example             Variables de entorno de referencia
├── frontend/
│   ├── src/
│   │   ├── api/client.ts                Cliente HTTP con el token de sesión y errores legibles
│   │   ├── contexts/                    AuthContext (sesión) y SidebarContext
│   │   ├── hooks/                       useUserRole, use-mobile, useRecurso (listas compartidas), useAlertasActivas
│   │   ├── lib/                         notas (escala y umbrales), fechas, conteos, listas, tema, utils
│   │   ├── pages/                       Una página por módulo, admin/* y legal/*
│   │   ├── components/common/           Mascota, EstadoBadge, estados (vacío, carga, error), ThemeToggle
│   │   ├── components/layout/           Menú lateral, barra inferior móvil, layouts, navegación (navegacion.ts)
│   │   ├── components/dashboard/        Indicadores, gráfica por materia, alertas, seguimiento
│   │   ├── components/students/         Observaciones del estudiante
│   │   ├── components/ui/               Componentes base de shadcn/ui en uso (19)
│   │   ├── test/                        Pruebas unitarias (Vitest)
│   │   ├── types/                       Tipos TypeScript de las entidades
│   │   ├── index.css                    Tokens de diseño: temas claro y oscuro
│   │   └── App.tsx                      Rutas, protección por rol y proveedor de tema
│   ├── vite.config.ts                   Puerto 8080 y alias @
│   └── package.json
├── e2e/                         Pruebas de interfaz (Playwright) y guía del entorno de pruebas
├── Docs/                        Documentación, diagramas, evidencias, pruebas, Scrum y Word
├── ENTREGA_FINAL_CLASSKIDS/     Índice de evaluación de los 14 criterios
└── README.md
```

## Capa de presentación

### Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Landing (página de inicio del producto) | Público |
| `/auth` | Inicio de sesión y solicitud de recuperación | Público (redirige a `/app` si ya hay sesión) |
| `/reset-password` | Nueva contraseña | Público (con token) |
| `/invitacion` | Activación de cuenta | Público (con token) |
| `/legal/terminos`, `/legal/privacidad`, `/legal/cookies`, `/legal/proteccion-datos` | Políticas legales | Público |
| `/app` | Dashboard del docente | Sesión iniciada |
| `/app/grupos`, `/app/estudiantes`, `/app/materias`, `/app/actividades`, `/app/calificaciones`, `/app/analisis`, `/app/alertas` | Módulos académicos | Sesión iniciada |
| `/admin`, `/admin/usuarios`, `/admin/datos` | Panel de administración | Rol Administrador |

La protección se implementa con tres componentes en `App.tsx`: `ProtectedRoute` (exige sesión), `AdminRoute` (exige rol administrador) y `AuthRoute` (evita volver al login con sesión activa).

### Manejo de la sesión

1. Al iniciar sesión, `AuthContext` guarda el token y los datos del usuario (incluido el rol) en `localStorage`.
2. `api/client.ts` lee el token y lo agrega a cada petición. Si la API responde con error, convierte el campo `detail` en un mensaje legible, tanto si es texto (401, 403, 404, 409) como si es la lista de errores de validación de Pydantic (422).
3. `useUserRole` deriva el rol del usuario guardado para mostrar u ocultar «Panel Admin» y proteger `/admin`.
4. Al cerrar sesión se borran el token y el usuario del navegador.

### Procesamiento en el cliente

El backend entrega listas completas (grupos, estudiantes, calificaciones, alertas) y cada pantalla calcula sus indicadores en el navegador: promedios, porcentajes, clasificación de rendimiento, estado del estudiante y tendencia. Las reglas de ese cálculo están en el capítulo de reglas de negocio.

## Capa de lógica (API)

- **Archivo único:** toda la API está en `backend/main.py`, organizada por secciones (autenticación, usuarios, grupos, estudiantes, materias, actividades, calificaciones, observaciones, alertas, roles y asignaciones).
- **Middleware de autenticación:** `require_authentication` intercepta cada petición. Si la ruta empieza por uno de los prefijos privados (`/usuarios`, `/catalogo`, `/grupos`, `/estudiantes`, `/materias`, `/actividades`, `/calificaciones`, `/observaciones`, `/alertas`, `/roles`, `/asignaciones`, `/docentes`, `/admins`), exige un token válido. Si además empieza por `/usuarios`, `/docentes` o `/admins`, exige rol administrador.
- **Rutas públicas:** `/`, `/auth/*`, `/invitaciones/*` y la documentación `/docs`.
- **Cuenta revalidada en cada petición (H-09, 24/11/2026):** además de la firma y el vencimiento del token, el middleware consulta en PostgreSQL que la cuenta siga activa y con el mismo rol (`_estado_cuenta`). Si se desactivó o cambió de rol, responde 401 y el frontend cierra la sesión y muestra el motivo en el inicio de sesión. Cerrar sesión no revoca el token en el servidor (requeriría guardar tokens o versiones de sesión).
- **Orden de los middlewares:** CORS se registra después del middleware de autenticación para ser el más externo; así las respuestas 401 y 403 llevan las cabeceras CORS (H-43).
- **Validación y errores (H-05):** los esquemas Pydantic limitan rangos y longitudes según las columnas. Los manejadores globales convierten los errores de integridad de PostgreSQL en 409 (duplicado) o 422 (relación inexistente, valor fuera de rango) y cualquier otro error en un 500 genérico sin detalles internos.
- **Configuración (H-17):** `database.py` carga `backend/.env` antes de leer `DATABASE_URL`; las variables del entorno tienen prioridad.
- **Identidad y permisos (24/11/2026):** el middleware guarda en `request.state.usuario` el id (`sub`) y el rol (`role`) del token. Cada endpoint de datos recibe esa identidad con `Depends(sesion_actual)` y aplica dos niveles:
  - **Rol:** `solo_admin()` reserva al administrador la creación, edición y eliminación de grupos, materias y asignaciones, y la eliminación de estudiantes; `/catalogo` se suma a los prefijos de administración. El administrador no puede cambiarse el rol ni desactivarse (H-18, 403).
  - **Asignación:** para el docente, las consultas se filtran con la tabla `asignaciones` (docente + materia + grupo): grupos y estudiantes de los grupos donde tiene alguna asignación, sus materias, y actividades y calificaciones solo de la materia que dicta en ese grupo. Las alertas se filtran por los estudiantes de sus grupos y, si el mensaje nombra una materia, por esa materia (RN-37). Las escrituras validan el registro destino con `tiene_asignacion`, `exigir_calificar`, `exigir_estudiante`, `_exigir_actividad`, `_exigir_calificacion` y `_exigir_alerta`; fuera de ámbito responden 403 sin modificar datos.
  - Los fragmentos SQL de los filtros son fijos y el id del docente siempre viaja como parámetro (`:uid`); nunca se usa un id de docente enviado por el cliente.
- **Indicadores por materia:** como la API ya entrega al docente solo sus datos, los indicadores del navegador quedan acotados. El Dashboard del docente muestra «Mis asignaciones» (promedio de cada materia en cada grupo) y Análisis permite filtrar por materia; las fórmulas no cambian.
- **Acceso a datos:** cada endpoint ejecuta SQL parametrizado con `text()` y parámetros con nombre, lo que evita la inyección SQL.
- **Correo:** si `SMTP_HOST` está definido, se envían los correos de invitación y de recuperación de contraseña.

El detalle de cada endpoint está en el anexo de referencia de la API.

## Capa de datos

PostgreSQL 15 en el contenedor `classkids_db`, con la base `classkids` y el volumen persistente `postgres_data`. El script `init.sql` se ejecuta la primera vez que se crea el contenedor: crea las 12 tablas y carga los datos de demostración. El modelo completo está en el capítulo de modelo de datos.

## Ejemplo de flujo: registrar una calificación

1. El docente pulsa «Guardar cambios» en la pantalla Calificaciones.
2. `Calificaciones.tsx` valida la nota escrita en la escala oficial 0.0–5.0 (`interpretarNota`) y llama a `api.post('/calificaciones', …)` o a `api.put(…)` con ese mismo valor.
3. `client.ts` envía la petición con el token.
4. El middleware valida el token y guarda la identidad; FastAPI valida el JSON con `CalificacionSchema` y el endpoint comprueba que el docente tenga asignada esa materia en el grupo del estudiante (si no, 403).
5. El endpoint inserta la calificación, calcula el promedio del estudiante y, si es menor a 3.0, crea la alerta.
6. PostgreSQL confirma la transacción y la API devuelve la calificación creada.
7. La pantalla muestra el mensaje de éxito y recarga los datos.

## Configuración del entorno

| Variable | Uso | Valor por defecto en desarrollo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg://postgres:postgrespassword@localhost:5432/classkids` |
| `CORS_ORIGINS` | Orígenes permitidos | Puertos 8080 y 5173 de `localhost` y `127.0.0.1` |
| `JWT_SECRET` | Firma de los tokens | Aleatorio en cada arranque (las sesiones se pierden al reiniciar). Obligatorio si `ENVIRONMENT=production`. |
| `ENVIRONMENT` | `development` o `production` | `development` |
| `FRONTEND_URL` | Base de los enlaces enviados por correo | `http://127.0.0.1:8080` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío de correos | Sin definir: no se envían correos |
| `VITE_API_URL` (frontend) | URL de la API | `http://127.0.0.1:8000` |

> Nota: `database.py` lee `DATABASE_URL` antes de que `main.py` cargue el archivo `.env`, por lo que hoy esa variable solo surte efecto si se define en el sistema operativo (hallazgo H-17).

## Entorno de pruebas aislado

| Componente | Real | Pruebas |
|---|---|---|
| PostgreSQL | `classkids_db`, puerto 5432, base `classkids` | `classkids_test_db`, puerto 5433, base `classkids_test` (`backend/docker-compose.test.yml`) |
| Backend | puerto 8000 | puerto 8001, con `DATABASE_URL` apuntando a `classkids_test` |
| Frontend | puerto 8080 | puerto 8081, con `VITE_API_URL=http://127.0.0.1:8001` |

Las pruebas de pytest se detienen si la conexión no apunta a `classkids_test`, y las de Playwright fallan si el navegador llama al backend real. Detalle en [`../../e2e/README.md`](../../e2e/README.md).

## Migraciones

El esquema inicial se crea con `init.sql`. Los cambios posteriores se guardan como scripts numerados en `backend/migrations/`. La migración 001 (columna `calificaciones.entregado`) está aplicada en la base de pruebas y pendiente de autorización en la real. El backend consulta una vez por proceso si las columnas opcionales existen (`columna_existe`) y funciona con ambos esquemas.

## Patrones aplicados

| Patrón | Aplicación |
|---|---|
| Cliente-servidor desacoplado | Frontend y backend independientes, comunicados por una API REST. |
| Arquitectura en capas | Presentación, lógica y datos. Dentro del backend no hay capas separadas de servicios y repositorios: cada endpoint contiene su lógica y su SQL. |
| DTO / esquema | Modelos Pydantic para los datos de entrada. |
| Guardia de rutas | `ProtectedRoute` y `AdminRoute` en el frontend; middleware de autenticación en el backend. |
| Fachada de acceso a la API | `api/client.ts` centraliza las peticiones HTTP. |
| Contexto global | `AuthContext` y `SidebarContext` (Context API de React). |
| Sistema de diseño por componentes | shadcn/ui + Radix + Tailwind. |

Ver también [`../conceptos/patrones-arquitectonicos.md`](../conceptos/patrones-arquitectonicos.md).
