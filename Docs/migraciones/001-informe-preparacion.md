# Migración 001 — Informe de preparación

**Estado: NO EJECUTADA en la base real `classkids`.** Este informe documenta la preparación y un ensayo completo realizado en una copia aislada el 20/11/2026. La ejecución en la base real requiere autorización expresa.

## 1. Objetivo

Agregar la columna `calificaciones.entregado` para guardar el estado «Entregado» de cada calificación por separado de la observación (hallazgo H-31, decisión D1, opción B).

## 2. SQL completo de la migración

Archivo: [`backend/migrations/001_calificaciones_entregado.sql`](../../backend/migrations/001_calificaciones_entregado.sql)

```sql
ALTER TABLE calificaciones
    ADD COLUMN IF NOT EXISTS entregado BOOLEAN NOT NULL DEFAULT TRUE;
```

- Es **aditiva**: no modifica ni elimina datos ni columnas existentes.
- `IF NOT EXISTS` permite ejecutarla más de una vez sin error.
- Ya está aplicada en la base de pruebas `classkids_test` desde su creación.

## 3. Respaldo previo (ya generado, solo lectura)

| Dato | Valor |
|---|---|
| Archivo | `backend/backups/classkids_pre_001_20261120.dump` |
| Formato | Personalizado de `pg_dump` (`--format=custom`), restaurable con `pg_restore` |
| Tamaño | 43 200 bytes (base de datos: 8 471 kB en disco) |
| SHA-256 | `182ff7ffbca33f78dd1ca8b16c20ff62997f493828f0a91f8015493cc4d9a058` |
| Creado | 20/11/2026 21:32:38 UTC desde PostgreSQL 15.19 |
| Contenido | Esquema y datos de las 12 tablas (`pg_restore --list`: 12 entradas TABLE DATA) |
| Control de versiones | Excluido de Git (`.gitignore`: `backend/backups/`) |

Comando exacto con que se generó (desde `backend/`, en Git Bash):

```bash
export MSYS_NO_PATHCONV=1   # evita que Git Bash convierta la ruta /tmp del contenedor
F=classkids_pre_001_20261120.dump
docker exec classkids_db pg_dump -U postgres -d classkids --format=custom --no-owner --file=/tmp/$F
docker cp classkids_db:/tmp/$F backups/$F
docker exec classkids_db rm /tmp/$F
sha256sum backups/$F
```

Antes de ejecutar la migración se generará un respaldo nuevo con el mismo comando y la fecha del día, para incluir cualquier dato registrado después de este informe.

## 4. Verificación de integridad y restauración en una base aislada (ya ejecutada)

1. Se creó un contenedor temporal independiente (`classkids_restore_db`, puerto 5434, sin volumen persistente).
2. Se restauró el respaldo: `pg_restore -U postgres -d classkids_restore --no-owner --exit-on-error /tmp/r.dump` → **sin errores**.
3. Se comparó la huella (conteo y MD5 de todas las columnas) de la copia con la de la base real:

| Tabla | Filas | Huella real | Huella de la copia restaurada |
|---|---|---|---|
| calificaciones | 215 | d55c2686f1482d8f451412239cb1e224 | idéntica |
| alertas | 32 | 19e3e8357d2c7cd7a77e81d5ca9786f8 | idéntica |
| estudiantes | 200 | e64c7cf23a1e9328ba599a21059a3e91 | idéntica |
| usuarios | 8 | f6231b6e13f249b44d6a9ac7dfed204b | idéntica |
| observaciones | 10 | 62954b46abfb51c414dc78ef24cc0c55 | idéntica |
| Estructura (columnas del esquema `public`) | 69 | 9905b0f647588340a3bcc2e992a78495 | idéntica |

4. El contenedor temporal se eliminó al terminar.

Procedimiento de restauración en una base aislada (para repetirlo):

```bash
export MSYS_NO_PATHCONV=1
docker run -d --name classkids_restore_db -e POSTGRES_PASSWORD=restorepassword \
  -p 127.0.0.1:5434:5432 --tmpfs /var/lib/postgresql/data postgres:15-alpine
docker exec classkids_restore_db createdb -U postgres classkids_restore
docker cp backups/classkids_pre_001_20261120.dump classkids_restore_db:/tmp/r.dump
docker exec classkids_restore_db pg_restore -U postgres -d classkids_restore --no-owner --exit-on-error /tmp/r.dump
# ... comparar huellas ...
docker rm -f classkids_restore_db
```

## 5. Efecto exacto sobre las 215 calificaciones (medido en la copia)

Se aplicó la migración en la copia restaurada:

| Medición | Resultado |
|---|---|
| Duración | 10 ms |
| Filas reescritas (`pg_stat_user_tables.n_tup_upd`) | **0**: PostgreSQL 11+ agrega una columna con valor por defecto constante sin reescribir la tabla |
| Calificaciones después | 215 (ninguna agregada ni eliminada) |
| `entregado = true` | 215 |
| `entregado = false` | 0 |
| `entregado` nulo | 0 |
| Datos originales (id, estudiante, materia, actividad, nota, periodo, observación, fecha) | Huella idéntica a la de la base real |
| Estructura | Pasa de 69 a 70 columnas; las demás columnas no cambian |
| Bloqueo | Bloqueo exclusivo de la tabla `calificaciones` durante la operación (milisegundos) |

En la interfaz, las 215 notas existentes se siguen mostrando como entregadas, igual que antes de la migración.

## 6. Consultas SELECT para verificar la conservación de los datos

Ejecutar **antes** y **después** de la migración y comparar los resultados (también se pueden correr en DBeaver):

```sql
-- a) Huella de las tablas (debe ser idéntica antes y después en las 5 tablas)
SELECT 'calificaciones', COUNT(*), md5(string_agg(id||'|'||estudiante_id||'|'||materia_id||'|'||coalesce(actividad_id::text,'∅')||'|'||nota||'|'||periodo||'|'||coalesce(observacion,'∅')||'|'||fecha_registro, ',' ORDER BY id)) FROM calificaciones
UNION ALL SELECT 'alertas', COUNT(*), md5(string_agg(id||'|'||estudiante_id||'|'||tipo||'|'||mensaje||'|'||estado||'|'||fecha_creacion, ',' ORDER BY id)) FROM alertas
UNION ALL SELECT 'estudiantes', COUNT(*), md5(string_agg(id||'|'||documento||'|'||nombre||'|'||apellido||'|'||coalesce(grupo_id::text,'∅')||'|'||activo, ',' ORDER BY id)) FROM estudiantes
UNION ALL SELECT 'usuarios', COUNT(*), md5(string_agg(id||'|'||email||'|'||password_hash||'|'||activo||'|'||coalesce(last_sign_in_at::text,'∅'), ',' ORDER BY id)) FROM usuarios
UNION ALL SELECT 'observaciones', COUNT(*), md5(string_agg(id||'|'||estudiante_id||'|'||descripcion, ',' ORDER BY id)) FROM observaciones;

-- b) La columna nueva (después): boolean, NOT NULL, por defecto true
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns WHERE table_name = 'calificaciones' AND column_name = 'entregado';

-- c) Valores de la columna nueva (después): 215 / 215 / 0 / 0
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE entregado) AS entregado_true,
       COUNT(*) FILTER (WHERE NOT entregado) AS entregado_false,
       COUNT(*) FILTER (WHERE entregado IS NULL) AS entregado_null
FROM calificaciones;

-- d) Ninguna fila reescrita (después): n_tup_upd sin incremento por la migración
SELECT relname, n_tup_upd FROM pg_stat_user_tables WHERE relname = 'calificaciones';
```

## 7. Procedimiento propuesto de ejecución (pendiente de autorización)

1. Confirmar que nadie está usando la aplicación.
2. Generar un respaldo nuevo (sección 3) y verificarlo restaurándolo en una base aislada (sección 4).
3. Ejecutar las consultas de la sección 6 y guardar sus resultados.
4. Aplicar la migración: `docker exec -i classkids_db psql -U postgres -d classkids -v ON_ERROR_STOP=1 < backend/migrations/001_calificaciones_entregado.sql`
5. Ejecutar de nuevo las consultas de la sección 6 y compararlas.
6. **Reiniciar el backend real.** El backend detecta la columna una sola vez por proceso; mientras no se reinicie, sigue funcionando como si la columna no existiera (sin errores, pero sin guardar «Entregado»).
7. Actualizar la documentación: estructura con 70 columnas (consultas V-03 y V-05 de `verificacion-bd.sql`) y diccionario de datos.

## 8. Reversión y sus limitaciones

**Opción A — eliminar la columna** (probada en la copia aislada: la huella volvió a ser idéntica a la de la base real, incluida la estructura):

```sql
ALTER TABLE calificaciones DROP COLUMN IF EXISTS entregado;
```

Limitaciones:

- Se pierden los valores `entregado = false` registrados después de la migración (todas las demás columnas se conservan).
- **Después de revertir hay que reiniciar el backend.** Si el backend detectó la columna antes de la reversión, intentará escribir en ella y las operaciones de calificaciones fallarán hasta reiniciarlo.
- La eliminación de una columna en PostgreSQL es inmediata pero no libera espacio en disco hasta un `VACUUM FULL` (irrelevante con este volumen de datos).

**Opción B — restaurar el respaldo completo** (solo ante un daño mayor):

- Devuelve la base exactamente al momento del respaldo.
- **Se pierden todos los cambios hechos después del respaldo** en cualquier tabla (calificaciones, alertas, usuarios, inicios de sesión, etc.).
- Requiere detener la aplicación, recrear la base y ejecutar `pg_restore`; se recomienda ensayarlo primero en una base aislada (sección 4).

## 9. Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Pérdida de datos por la migración | Muy baja: es aditiva y se verificó con huellas | Respaldo verificado y consultas de comparación |
| Bloqueo de la tabla | Muy baja: 10 ms medidos | Ejecutar sin usuarios conectados |
| Backend sin reiniciar tras migrar | Media | Paso 6 del procedimiento; sin reinicio no hay errores, solo no se guarda «Entregado» |
| Backend sin reiniciar tras revertir | Media | Reiniciar siempre después de una reversión |
| Diferencias entre documentación y DBeaver | Media | Actualizar V-03 y V-05 y el diccionario tras migrar |

## Actualización del 23/11/2026

La base real ya no coincide con el respaldo `classkids_pre_001_20261120.dump`: el 20/11/2026 por la noche se crearon registros desde la aplicación real (1 grupo, 1 estudiante, 1 calificación, 1 usuario y 1 invitación; ver `Docs/pruebas/reporte-ejecucion-2026-11-20.md`). **Antes de migrar se debe tomar un respaldo nuevo** y repetir la verificación de huella. La migración sigue sin ejecutarse.
