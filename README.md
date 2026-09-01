# ClassKids - Sistema de Seguimiento Académico y Control Escolar

## Descripción del proyecto

ClassKids es una plataforma web para la gestión académica de un colegio pequeño. Permite administrar grupos, estudiantes, materias, actividades, calificaciones, observaciones y alertas de seguimiento.

El sistema centraliza la información escolar y apoya la toma de decisiones mediante métricas, análisis de rendimiento y alertas. Las alertas pueden registrarse manualmente y también se genera una alerta automática cuando el promedio acumulado de un estudiante baja de 3.0.

Este proyecto fue desarrollado como parte del proceso formativo del programa Análisis y Desarrollo de Software (ADSO) del Servicio Nacional de Aprendizaje (SENA).

---

## Marco metodológico

Para el desarrollo de ClassKids se aplicaron metodologías ágiles y prácticas modernas de gestión de proyectos:

- Marco de trabajo: Scrum para la organización del proyecto en sprints y entregas incrementales.
- Gestión de requisitos: uso de historias de usuario para definir funcionalidades desde la perspectiva de los usuarios.
- Priorización: aplicación de la metodología MoSCoW para identificar y desarrollar las funcionalidades esenciales del producto mínimo viable (MVP).

---

## Roles

- **Administrador:** gestiona usuarios, métricas globales, datos generales y asignaciones docente-materia-grupo.
- **Docente:** consulta sus grupos y registra estudiantes, actividades, calificaciones, observaciones y seguimiento de alertas.
- **Acudiente:** existe en el catálogo de base de datos, pero todavía no tiene portal implementado.

## Tecnologías utilizadas

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- FastAPI, Pydantic y Uvicorn
- SQLAlchemy Core con SQL parametrizado
- JWT para sesiones y passlib PBKDF2 para contraseñas

### Base de datos y Contenedores
- PostgreSQL
- Docker / Docker Compose

---

## Estructura del proyecto

```text
ClassKids_A/
├── backend/
│   ├── __pycache__/
│   ├── database.py
│   ├── docker-compose.yml
│   ├── init.sql
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── node_modules/
│   ├── Public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── test/
│   │   ├── types/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── ...
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Requisitos previos

Asegúrate de tener instalado:

Node.js y pnpm

Python 3.10 o superior

Docker y Docker Compose (para la base de datos)

Git

## Instalación y ejecución local
1. Base de datos (Docker)
Inicia el contenedor de PostgreSQL usando Docker Compose desde la carpeta del backend:

Bash


cd backend
docker compose up -d
2. Backend
Accede a la carpeta del backend, crea tu entorno virtual e instala las dependencias:

Bash


cd backend
python -m venv venv
venv\Scripts\activate  # En Windows (o source venv/bin/activate en Mac/Linux)
pip install -r requirements.txt
Inicia el servidor de FastAPI:

Bash


python -m uvicorn main:app --reload
La documentación interactiva estará disponible en: http://127.0.0.1:8000/docs

3. Frontend
Abre otra terminal, accede a la carpeta del frontend e instala las dependencias con pnpm:

Bash


cd frontend
pnpm install
Inicia el entorno de desarrollo:

Bash


pnpm run dev
La aplicación estará disponible en: http://localhost:8080 (puerto fijado en `frontend/vite.config.ts`)

Funcionalidades principales
Gestión de estudiantes.

Gestión de grupos.

Gestión de materias.

Registro de calificaciones.

Registro manual y seguimiento de alertas.

Observaciones académicas.

CRUD integrado con PostgreSQL y FastAPI, con autenticación JWT y roles de administrador/docente.

## Datos de demostración

El `init.sql` prepara un escenario reproducible con 2 usuarios, 3 grupos, 20 estudiantes, 5 materias, 15 actividades, 35 calificaciones, 10 observaciones, 8 alertas y 15 asignaciones.

Los dos usuarios demo (uno administrador, uno docente) quedan creados en la base de
datos local con su hash de contraseña (`backend/init.sql`); ese archivo no expone
la contraseña en texto plano. Las credenciales para probarlos localmente no se
publican en este README — pídelas a quien administre el proyecto, o genera tus
propios usuarios de prueba con tu propia contraseña reemplazando el hash en
`init.sql` antes de levantar el contenedor (`docker compose up -d`), o mediante el
flujo de invitación (`POST /usuarios/invitar`) una vez tengas una cuenta admin activa.

## Pruebas

```powershell
cd frontend
pnpm test
pnpm run build
```

> **Nota:** actualmente el repositorio no contiene archivos de pruebas de Playwright
> (`*.spec.ts`) ni configuración (`playwright.config.*`), ni una suite de `pytest`
> para el backend, aunque `@playwright/test` está declarado como dependencia en la
> raíz. El script `pnpm test` de la raíz es un placeholder. Ver `Docs/backlog.md`.

## Variables de entorno

Ninguna es obligatoria para desarrollo local (el backend usa valores por defecto si
no están definidas). Copia `backend/.env.example` a `backend/.env` para personalizar:

| Variable | Uso | Default en desarrollo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg://postgres:postgrespassword@localhost:5432/classkids` |
| `CORS_ORIGINS` | Orígenes permitidos por CORS | `http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173` |
| `JWT_SECRET` | Firma de los JWT de sesión | Aleatorio por proceso (las sesiones se invalidan al reiniciar el backend); **obligatorio si `ENVIRONMENT=production`** |
| `ENVIRONMENT` | `development` o `production` | `development` |
| `FRONTEND_URL` | Base para enlaces de invitación/reseteo | `http://127.0.0.1:8080` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío real de correos | Sin definir: no se envía ningún correo (afecta el flujo de "olvidé mi contraseña") |

## Documentación

La documentación técnica y de requisitos está en [`Docs/README.md`](Docs/README.md).

- [`Docs/backlog.md`](Docs/backlog.md): funcionalidades terminadas y trabajo pendiente.
- [`Docs/pruebas.md`](Docs/pruebas.md): pruebas ejecutadas, resultados y observaciones.

## Equipo de desarrollo
Proyecto desarrollado por:

Faloon Johanna Ortiz

Alejandra Guio

Yan (Jan) Llanos

Programa: Análisis y Desarrollo de Software (ADSO)

Institución: Servicio Nacional de Aprendizaje (SENA)

Licencia
Este proyecto fue desarrollado con fines académicos como parte del proceso de formación ADSO del SENA.