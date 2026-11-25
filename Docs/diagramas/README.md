# Diagramas

Los diagramas se generaron el 20/11/2026 a partir de la estructura real de la base de datos (catálogo de PostgreSQL) y del código. Las imágenes PNG se incluyen en el documento Word y en los capítulos de `Docs/`. Debajo de la tabla se incluyen versiones en Mermaid, que GitHub muestra directamente y se pueden editar.

| Diagrama | Archivo | Capítulo |
|---|---|---|
| Casos de uso | [`casos-de-uso.png`](casos-de-uso.png) | [Casos de uso](../conceptos/casos-de-uso.md) |
| Modelo entidad-relación | [`mer-classkids.png`](mer-classkids.png) | [Modelo de datos](../referencia-tecnica/database-schema.md) |
| Arquitectura | [`arquitectura.png`](arquitectura.png) | [Arquitectura](../referencia-tecnica/architecture.md) |
| Flujo general del proceso | [`flujo-proceso.png`](flujo-proceso.png) | [Flujos](../referencia-tecnica/flujos.md) |
| Registro de calificaciones y alerta | [`flujo-calificacion-alerta.png`](flujo-calificacion-alerta.png) | [Flujos](../referencia-tecnica/flujos.md) |

## Modelo entidad-relación (Mermaid)

```mermaid
erDiagram
    user_roles ||--o{ usuarios : "rol_id"
    user_roles ||--o{ invitaciones : "rol_id"
    usuarios ||--o{ asignaciones : "docente_id"
    materias ||--o{ asignaciones : "materia_id"
    grupos ||--o{ asignaciones : "grupo_id"
    grupos |o--o{ estudiantes : "grupo_id (SET NULL)"
    grupos ||--o{ actividades : "grupo_id"
    materias ||--o{ actividades : "materia_id"
    estudiantes ||--o{ calificaciones : "CASCADE"
    materias ||--o{ calificaciones : "materia_id"
    actividades |o--o{ calificaciones : "actividad_id (SET NULL)"
    estudiantes ||--o{ observaciones : "CASCADE"
    estudiantes ||--o{ alertas : "CASCADE"

    usuarios {
        int id PK
        string email UK
        string nombre
        string apellido
        string password_hash
        int rol_id FK
        bool activo
        timestamp created_at
        timestamp last_sign_in_at
    }
    grupos {
        int id PK
        string nombre
        string grado
        string turno
        int ano_lectivo
    }
    estudiantes {
        int id PK
        string documento UK
        string nombre
        string apellido
        int grupo_id FK
        bool activo
    }
    materias {
        int id PK
        string nombre
        string codigo
    }
    asignaciones {
        int id PK
        int docente_id FK
        int materia_id FK
        int grupo_id FK
    }
    actividades {
        int id PK
        int materia_id FK
        int grupo_id FK
        string titulo
        string tipo
        string descripcion
        date fecha_entrega
    }
    calificaciones {
        int id PK
        int estudiante_id FK
        int materia_id FK
        int actividad_id FK
        decimal nota
        int periodo
        string observacion
        timestamp fecha_registro
    }
    observaciones {
        int id PK
        int estudiante_id FK
        string tipo
        string descripcion
        timestamp fecha
    }
    alertas {
        int id PK
        int estudiante_id FK
        string tipo
        string mensaje
        string estado
        timestamp fecha_creacion
    }
```

## Registro de calificación y alerta (Mermaid)

```mermaid
flowchart TD
    A[Docente elige grupo y actividad] --> B[Escribe o cambia notas 0.0-5.0 y marca Entregado]
    B --> M[Guardar cambios: solo filas MODIFICADAS]
    M --> C{¿La fila ya tenía calificación?}
    C -- Sí --> D[PUT /calificaciones/id<br/>solo campos enviados: conserva periodo y observación<br/>no evalúa alertas]
    C -- No --> E[POST /calificaciones<br/>periodo 1]
    E --> F[Promedio de todas las notas del estudiante]
    F --> G{¿Promedio < 3.0 y sin alerta de bajo rendimiento<br/>activa o en revisión?}
    G -- Sí --> H[Crea alerta low_grade, estado active]
    G -- No --> I[Solo guarda la nota]
```
