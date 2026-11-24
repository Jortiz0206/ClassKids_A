-- Verificación del modelo relacional de ClassKids. SOLO LECTURA.
-- Ejecutar con la transacción en modo de solo lectura, por ejemplo:
--   docker exec -i -e PGOPTIONS=-cdefault_transaction_read_only=on classkids_db \
--     psql -U postgres -d classkids < Docs/evidencias/scripts/verificacion-mr.sql
-- En DBeaver: abrir este archivo sobre la conexión «classkids» y ejecutarlo como script.

\echo '== 1. Columnas: tipo, nulos y valor por defecto'
SELECT c.table_name AS tabla, c.ordinal_position AS n, c.column_name AS columna,
       CASE WHEN c.data_type = 'character varying' THEN 'varchar(' || COALESCE(c.character_maximum_length::text, '') || ')'
            WHEN c.data_type = 'numeric' THEN 'numeric(' || c.numeric_precision || ',' || c.numeric_scale || ')'
            ELSE c.data_type END AS tipo,
       c.is_nullable AS admite_nulo, COALESCE(c.column_default, '') AS por_defecto
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

\echo '== 2. Restricciones PK, UNIQUE y CHECK'
SELECT conrelid::regclass AS tabla, conname AS restriccion,
       CASE contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' END AS tipo,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace AND contype IN ('p', 'u', 'c')
ORDER BY 1, 3, 2;

\echo '== 3. Llaves foráneas con acciones ON DELETE / ON UPDATE'
SELECT conrelid::regclass AS tabla, conname AS restriccion, pg_get_constraintdef(oid) AS definicion,
       CASE confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END AS on_delete,
       CASE confupdtype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END AS on_update
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace AND contype = 'f'
ORDER BY 1, 2;

\echo '== 4. Índices'
SELECT tablename AS tabla, indexname AS indice, indexdef AS definicion
FROM pg_indexes WHERE schemaname = 'public' ORDER BY 1, 2;

\echo '== 5. Puntos revisados'
SELECT 'calificaciones.actividad_id admite nulos' AS punto, is_nullable AS valor
FROM information_schema.columns WHERE table_name = 'calificaciones' AND column_name = 'actividad_id'
UNION ALL
SELECT 'password_reset_tokens tiene FK hacia usuarios', CASE WHEN EXISTS (
  SELECT 1 FROM pg_constraint WHERE conrelid = 'password_reset_tokens'::regclass AND contype = 'f') THEN 'sí' ELSE 'no' END
UNION ALL
SELECT 'calificaciones.entregado existe', CASE WHEN EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name = 'calificaciones' AND column_name = 'entregado') THEN 'sí' ELSE 'no' END
UNION ALL
SELECT 'tablas en public', count(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
