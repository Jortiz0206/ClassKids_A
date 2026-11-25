# Reflexión comparativa de los cuatro backends del programa (criterio 14)

**Estado al 20/11/2026: pendiente de información del equipo.** Ningún documento del proyecto dice cuáles fueron los cuatro backends estudiados en las formaciones: ni este repositorio, ni el documento versión 1.0, ni la presentación `ClassKids_presentacion.pdf`. Por eso no se dan por hechos.

## 1. Evidencia encontrada (sin confirmar que sean «los cuatro»)

| # | Candidato | Evidencia verificable | ¿Confirmado como backend del programa? |
|---|---|---|---|
| 1 | **API de ClassKids** (Python + FastAPI + PostgreSQL) | Este repositorio (`backend/main.py`, 49 operaciones) | Probablemente el «cuarto backend» de la rúbrica (criterio 11), **pendiente de confirmar** |
| 2 | CRUD con Node.js + Express 5 + Mongoose 9 (MongoDB) | Carpeta del equipo `OneDrive/Desktop/Crud-MongoDB/BackEnd` (`package.json` con `express`, `mongoose`, `cors`, `dotenv`; modelos `Client`, `Producto`, `Compra`). La misma estructura aparece en un zip de `Downloads` | **Sin confirmar** |
| 3 | PENDIENTE | — | — |
| 4 | PENDIENTE | — | — |

La carpeta `AstroVet` del mismo equipo es otro proyecto: su carpeta `backend/` está vacía y su README dice que el backend será FastAPI en el futuro. No se cuenta como backend estudiado.

**Acción del equipo:** confirmar los cuatro backends (nombre de la formación, tecnología y repositorio o carpeta) y completar la tabla siguiente. Para los candidatos 3 y 4, no se deben suponer tecnologías.

## 2. Comparativa

Las celdas de ClassKids se basan en el código revisado. Las del candidato Express se limitan a lo que muestra su `package.json` y su estructura de carpetas; lo marcado «PENDIENTE» lo completa el equipo con su experiencia en cada formación.

| Criterio | Backend 1: ClassKids (FastAPI) | Backend 2: Express + MongoDB (candidato) | Backend 3 | Backend 4 |
|---|---|---|---|---|
| Lenguaje y framework | Python, FastAPI, Pydantic v2 | JavaScript, Express 5 | PENDIENTE | PENDIENTE |
| Persistencia | PostgreSQL 15 (relacional) con SQL parametrizado (SQLAlchemy Core `text()`) | MongoDB (documental) con Mongoose | PENDIENTE | PENDIENTE |
| Arquitectura | API REST monolítica en un módulo; middleware de autenticación | Rutas (`routes/`) y modelos (`models/`) separados | PENDIENTE | PENDIENTE |
| Validación | Esquemas Pydantic con rangos y longitudes; errores de integridad con 409/422 (H-05 corregido) | PENDIENTE (Mongoose permite esquemas) | PENDIENTE | PENDIENTE |
| Seguridad | JWT HS256 de 8 h, PBKDF2, CORS configurable; permisos por rol y por asignación docente–materia–grupo (H-08 corregido el 24/11/2026) | PENDIENTE | PENDIENTE | PENDIENTE |
| Pruebas | pytest: 156 en la suite principal (integración, permisos, escala, hallazgos y generador de la demostración), con 18 ejecuciones unitarias | PENDIENTE | PENDIENTE | PENDIENTE |
| Documentación de la API | OpenAPI automática (`/docs`) y `api-endpoints.md` | PENDIENTE | PENDIENTE | PENDIENTE |
| Ventajas | Tipado y documentación automática; SQL explícito y auditable | PENDIENTE | PENDIENTE | PENDIENTE |
| Desventajas | Un solo módulo grande; sin ORM ni migraciones automáticas | PENDIENTE | PENDIENTE | PENDIENTE |
| Casos de uso adecuados | Datos académicos relacionales con integridad referencial | PENDIENTE | PENDIENTE | PENDIENTE |
| Curva de aprendizaje | PENDIENTE (experiencia del equipo) | PENDIENTE | PENDIENTE | PENDIENTE |
| Mantenimiento | Requiere separar en módulos (ver deuda técnica) | PENDIENTE | PENDIENTE | PENDIENTE |
| Relación con ClassKids | Es el backend del proyecto | PENDIENTE | PENDIENTE | PENDIENTE |

## 3. Reflexión del equipo

> PENDIENTE: escrita por el equipo. Preguntas guía:
> 1. ¿Por qué se eligió FastAPI y PostgreSQL para ClassKids y no las otras tecnologías estudiadas?
> 2. ¿Qué conocimiento de cada formación se reutilizó (rutas, modelos, autenticación, validación, pruebas)?
> 3. ¿Qué harían distinto si empezaran hoy?

## 4. Deuda técnica

Ver [`deuda-tecnica.md`](deuda-tecnica.md).
