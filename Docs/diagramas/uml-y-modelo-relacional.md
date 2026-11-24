# Diagramas UML, modelo relacional y arquitectura de componentes

Diagramas elaborados el 20/11/2026 a partir del **código entregado** (`backend/main.py`, `frontend/src`) y del **esquema leído en PostgreSQL** (`information_schema` de `classkids_test`, solo lectura). Están en Mermaid, por lo que GitHub los muestra directamente y se pueden editar como texto.

> **Esquema real y esquema de pruebas.** La única diferencia es la columna `calificaciones.entregado`: existe en `classkids_test` (migración 001 aplicada en pruebas) y **no existe todavía** en la base real `classkids`. El backend detecta la columna en tiempo de ejecución (`columna_existe`).

Complementan los diagramas existentes: [MER](mer-classkids.png), [casos de uso](casos-de-uso.png), [arquitectura](arquitectura.png), [flujo del proceso](flujo-proceso.png) y [registro de calificación con alerta](flujo-calificacion-alerta.png).

## 1. Modelo relacional (MR)

El modelo relacional **verificado contra la base real** (columnas, tipos, nulos, valores por defecto, PK, FK, restricciones, índices y acciones `ON DELETE`) está en [`../referencia-tecnica/modelo-relacional.md`](../referencia-tecnica/modelo-relacional.md), con su versión editable en Mermaid, [PNG](modelo-relacional.png) y [PDF](modelo-relacional.pdf).

![Modelo relacional de la base real](modelo-relacional.png)

La columna `calificaciones.entregado` **no existe en la base real**: solo está en `classkids_test`, porque la migración 001 sigue pendiente de autorización.

## 2. Diagrama de clases UML: backend (FastAPI)

El backend no usa ORM: los endpoints son funciones con SQL parametrizado (`sqlalchemy.text`). Las clases reales son los **esquemas Pydantic** que validan las peticiones, y el módulo `main` actúa como controlador. Se muestran los atributos tal como están declarados.

```mermaid
classDiagram
  direction LR
  class BaseModel {
    <<pydantic>>
  }
  class GrupoSchema {
    +str nombre
    +str grado = "1°"
    +str turno = "Matutino"
    +int ano_lectivo = 2026
  }
  class EstudianteSchema {
    +str documento
    +str nombre
    +str apellido
    +int grupo_id
    +bool activo = True
  }
  class MateriaSchema {
    +str nombre
    +str codigo
  }
  class ActividadSchema {
    +int materia_id
    +int grupo_id
    +str titulo
    +str tipo = "tarea"
    +str descripcion
    +str fecha_entrega
  }
  class CalificacionSchema {
    +int estudiante_id
    +int materia_id
    +int actividad_id
    +float nota
    +int periodo = 1
    +str observacion
    +bool entregado = None
  }
  class ObservacionSchema {
    +int estudiante_id
    +str tipo = "Convivencial"
    +str descripcion
  }
  class AlertaSchema {
    +int estudiante_id
    +str tipo
    +str mensaje
    +str estado = "active"
  }
  class LoginSchema {
    +str email
    +str password
  }
  class AsignacionSchema
  class InvitationSchema
  class AcceptInvitationSchema
  class RoleUpdateSchema
  class AlertStatusSchema
  class ForgotPasswordSchema
  class ResetPasswordSchema

  BaseModel <|-- GrupoSchema
  BaseModel <|-- EstudianteSchema
  BaseModel <|-- MateriaSchema
  BaseModel <|-- ActividadSchema
  BaseModel <|-- CalificacionSchema
  BaseModel <|-- ObservacionSchema
  BaseModel <|-- AlertaSchema
  BaseModel <|-- LoginSchema
  BaseModel <|-- AsignacionSchema
  BaseModel <|-- InvitationSchema
  BaseModel <|-- AcceptInvitationSchema
  BaseModel <|-- RoleUpdateSchema
  BaseModel <|-- AlertStatusSchema
  BaseModel <|-- ForgotPasswordSchema
  BaseModel <|-- ResetPasswordSchema

  class main {
    <<módulo FastAPI>>
    +app: FastAPI
    +pwd_context: CryptContext (PBKDF2)
    +create_access_token(user_id, role) str
    +require_authentication(request, call_next)
    +normalize_alert_status(value) str
    +columna_existe(db, tabla, columna) bool
    +49 operaciones REST
  }
  class database {
    <<módulo>>
    +engine
    +SessionLocal
    +get_db() Session
  }
  main ..> database : usa get_db()
  main ..> CalificacionSchema : valida
  main ..> AlertaSchema : valida
  main ..> GrupoSchema : valida
```

![Diagrama de clases del backend](clases-backend.png)

*Imagen generada desde el bloque anterior con `renderizar_mermaid.cjs` (para el documento Word).*

## 3. Diagrama de clases UML: frontend (React + TypeScript)

Componentes y módulos principales de la interfaz renovada. Las flechas indican dependencia (uso).

```mermaid
classDiagram
  direction TB
  class App { rutas: BrowserRouter
    ProtectedRoute
    AdminRoute }
  class AuthContext { user
    token
    login()
    signOut() }
  class apiClient { <<api/client.ts>>
    get() post() put() delete()
    formatApiErrorDetail() }
  class AppLayout { menú lateral o barra inferior }
  class AdminLayout
  class AppSidebar
  class MobileNav { 4 accesos + «Más» }
  class navegacion { <<config>>
    modulosApp
    accesosMovil
    menuMas
    itemsVisibles(items, esAdmin)
    esRutaActiva(actual, path) }
  class notas { <<lib/notas.ts>>
    estadoNota(p)
    aEscala5(p)
    formatoEscala5(p)
    nivelPromedio(p)
    filaModificada(fila)
    promedioActividad(filas) }
  class fechas { <<lib/fechas.ts>>
    fechaLocal()
    tiempoRelativo()
    fechaCorta() }
  class conteos { <<lib/conteos.ts>>
    contarAlertasActivas()
    contarEstudiantesActivos() }
  class EstadoBadge
  class Estados { EstadoVacio
    EstadoCargando
    EstadoError }
  class Mascota
  class Calificaciones { <<página>> }
  class Dashboard { <<página>> }
  class Alertas { <<página>> }

  App --> AuthContext
  App --> AppLayout
  App --> AdminLayout
  AppLayout --> AppSidebar
  AppLayout --> MobileNav
  AdminLayout --> MobileNav
  AppSidebar --> navegacion
  MobileNav --> navegacion
  Calificaciones --> notas
  Calificaciones --> apiClient
  Calificaciones --> EstadoBadge
  Dashboard --> conteos
  Dashboard --> apiClient
  Alertas --> fechas
  Alertas --> EstadoBadge
  Calificaciones --> Estados
  Estados --> Mascota
```

![Diagrama de clases del frontend](clases-frontend.png)

*Imagen generada desde el bloque anterior con `renderizar_mermaid.cjs` (para el documento Word).*

## 4. Arquitectura de componentes y comunicación entre capas

```mermaid
flowchart LR
  subgraph Navegador["Navegador (docente o administrador)"]
    UI["React 18 + TypeScript<br/>Vite · Tailwind · shadcn/ui · Recharts"]
    LS[("localStorage<br/>token JWT + usuario")]
    UI <--> LS
  end
  subgraph API["Backend FastAPI (Python)"]
    MW["Middleware require_authentication<br/>JWT HS256 · rol admin"]
    EP["49 operaciones REST<br/>validación Pydantic"]
    R["Reglas de negocio<br/>alerta si promedio < 3.0 · RN-16 · D2"]
    MW --> EP --> R
  end
  DB[("PostgreSQL 15<br/>12 tablas · Docker")]
  SMTP["Servidor SMTP<br/>(opcional)"]
  UI -- "HTTP + JSON<br/>Authorization: Bearer" --> MW
  R -- "SQL parametrizado<br/>SQLAlchemy text()" --> DB
  EP -. "invitaciones y recuperación" .-> SMTP
```

![Arquitectura de componentes](componentes.png)

*Imagen generada desde el bloque anterior con `renderizar_mermaid.cjs` (para el documento Word).*

## 5. Despliegue actual: entorno real y entorno de pruebas aislado

```mermaid
flowchart TB
  subgraph Real["Entorno REAL (no se modifica en esta etapa)"]
    FR["Frontend Vite :8080"] --> BR["Backend uvicorn :8000"] --> DR[("classkids_db :5432<br/>base classkids")]
  end
  subgraph Pruebas["Entorno de PRUEBAS (renovación y validación)"]
    FP["Frontend Vite :8081<br/>VITE_API_URL=:8001"] --> BP["Backend uvicorn :8001<br/>JWT_SECRET de pruebas"] --> DP[("classkids_test_db :5433<br/>base classkids_test<br/>docker-compose.test.yml")]
    T["pytest · Vitest · Playwright<br/>salvaguardas: conftest + fixtures"] -.-> BP
    T -.-> FP
  end
```

![Despliegue actual](despliegue.png)

*Imagen generada desde el bloque anterior con `renderizar_mermaid.cjs` (para el documento Word).*

No hay despliegue en servidor público; ver [`despliegue.md`](../despliegue.md).
