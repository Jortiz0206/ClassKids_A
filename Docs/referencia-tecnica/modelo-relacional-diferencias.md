# Informe de diferencias del modelo relacional

**Fecha de verificación:** 23/11/2026.

**Método:** consultas de solo lectura con [`verificacion-mr.sql`](../evidencias/scripts/verificacion-mr.sql).
- Base real `classkids` (puerto 5432): salida en [`verificacion-mr-real.txt`](../evidencias/verificacion-mr-real.txt).
- Base de pruebas `classkids_test` (puerto 5433): la misma consulta.

Modelo verificado: [`modelo-relacional.md`](modelo-relacional.md).

No se modificó ninguna base de datos.

## 1. Base real frente a base de pruebas

| Aspecto | Real (`classkids`) | Pruebas (`classkids_test`) |
|---|---|---|
| Tablas | 12 | 12 |
| Columnas | 69 | 70 |
| `calificaciones.entregado` | **No existe** | `boolean NOT NULL DEFAULT true` (migración 001 aplicada solo en pruebas) |
| Restricciones, FK, acciones ON DELETE e índices | Iguales | Iguales |

La migración 001 sigue **pendiente de autorización**. El backend funciona con y sin la columna (`columna_existe`).

## 2. Base real frente a la documentación anterior

| Documento | Diferencia encontrada | Corrección |
|---|---|---|
| `Docs/diagramas/uml-y-modelo-relacional.md` (MR del 20/11) | Se generó desde la base de pruebas y mostraba `entregado`, aunque con la nota «solo en pruebas» | El MR ahora proviene de la base real y no muestra `entregado`; el documento remite al modelo verificado |
| `Docs/referencia-tecnica/database-schema.md` | Tablas, tipos, FK, `ON DELETE`, CHECK de la nota y los índices únicos de `asignaciones` **coinciden** con la base. El conteo de registros (V-02, del 20/11) ya no es el actual: grupos 10 → 11, estudiantes 200 → 201, calificaciones 215 → 216, usuarios 8 → 9, invitaciones 1 → 2 | Se conserva como registro del 20/11. Los registros nuevos se crearon desde la aplicación real el 20/11 por la noche (ver el reporte de ejecución) |
| Diagrama de DBeaver aportado por el equipo | Coincide: 12 tablas, `password_reset_tokens` sin relación, `calificaciones` sin `entregado`, `invitaciones` y `usuarios` relacionadas con `user_roles` | — |

## 3. Puntos revisados en detalle

| Punto | Resultado verificado | Implicación |
|---|---|---|
| `password_reset_tokens.email` y `usuarios` | **No hay llave foránea.** La relación es lógica (mismo correo, comparado en el backend con `lower(email)`) | Puede haber tokens de correos inexistentes; el backend solo los crea si el usuario existe y está activo |
| `calificaciones.actividad_id` | **Admite nulos**; `ON DELETE SET NULL` | Puede haber calificaciones sin actividad (hallazgo H-06); borrar una actividad conserva sus notas, sin actividad |
| `calificaciones.estudiante_id`, `observaciones.estudiante_id`, `alertas.estudiante_id` | `ON DELETE CASCADE` | Borrar un estudiante borra su historial académico (hallazgo H-11) |
| `estudiantes.grupo_id` | Admite nulos; `ON DELETE SET NULL` | Borrar un grupo deja a sus estudiantes sin grupo |
| `actividades`, `asignaciones`, `calificaciones.materia_id`, `usuarios.rol_id`, `invitaciones.rol_id` | `NO ACTION` | No se puede borrar el registro referenciado mientras existan dependientes (la API responde 409 en grupos y materias) |
| `calificaciones.nota` | `numeric(3,1)` con `CHECK (nota >= 0 AND nota <= 5)` | La escala oficial 0.0–5.0 está garantizada por la base |
| `asignaciones` | Única `(docente_id, materia_id, grupo_id)` como restricción, más los índices únicos `asignaciones_docente_materia_grupo_uidx` (duplica la restricción) y `asignaciones_materia_grupo_uidx` `(materia_id, grupo_id)` | Un solo docente por materia en cada grupo. El índice duplicado es redundante (deuda técnica) |
| Índices de llaves foráneas | No hay índices sobre las columnas FK | Sin impacto con los datos actuales; con más volumen convendría indexar `calificaciones(estudiante_id)`, `calificaciones(actividad_id)` y `alertas(estudiante_id)` (deuda técnica) |
| Valores por defecto | `actividades.tipo = 'tarea'`, `alertas.estado = 'active'`, `calificaciones.periodo = 1`, `grupos.ano_lectivo = 2026`, `observaciones.tipo = 'Convivencial'`, `activo = true`, fechas con `CURRENT_TIMESTAMP` | Coinciden con los valores por defecto de los esquemas del backend |

## 4. Cómo repetir la verificación

```bash
docker exec -i -e PGOPTIONS=-cdefault_transaction_read_only=on classkids_db \
  psql -U postgres -d classkids -P pager=off < Docs/evidencias/scripts/verificacion-mr.sql > Docs/evidencias/verificacion-mr-real.txt
python Docs/evidencias/scripts/generar-modelo-relacional.py Docs/evidencias/verificacion-mr-real.txt AAAA-MM-DD
node Docs/diagramas/renderizar_mermaid.cjs     # PNG y PDF
```

En DBeaver: abrir `verificacion-mr.sql` sobre la conexión `classkids` y ejecutarlo como script. Las consultas solo leen el catálogo de PostgreSQL.
