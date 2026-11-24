-- Huella de la base de datos para la migración 001 (SOLO LECTURA).
-- Ejecutar ANTES y DESPUÉS de la migración y comparar los resultados:
--   las filas de datos deben ser idénticas; solo cambian `columnas_public` (69 → 70)
--   y la fila `columna_entregado`.
-- Uso (Git Bash, desde la raíz del repositorio):
--   docker exec -i -e PGOPTIONS=-cdefault_transaction_read_only=on classkids_db \
--     psql -U postgres -d classkids -t -A < Docs/evidencias/scripts/huella-migracion-001.sql

SELECT 'calificaciones' AS tabla, COUNT(*) AS filas,
       md5(string_agg(id||'|'||estudiante_id||'|'||materia_id||'|'||coalesce(actividad_id::text,'∅')||'|'||nota||'|'||periodo||'|'||coalesce(observacion,'∅')||'|'||fecha_registro, ',' ORDER BY id)) AS huella
FROM calificaciones
UNION ALL SELECT 'estudiantes', COUNT(*), md5(string_agg(id||'|'||documento||'|'||nombre||'|'||apellido||'|'||coalesce(grupo_id::text,'∅')||'|'||activo, ',' ORDER BY id)) FROM estudiantes
UNION ALL SELECT 'grupos', COUNT(*), md5(string_agg(id||'|'||nombre||'|'||coalesce(grado,'∅')||'|'||coalesce(turno,'∅')||'|'||coalesce(ano_lectivo::text,'∅'), ',' ORDER BY id)) FROM grupos
UNION ALL SELECT 'alertas', COUNT(*), md5(string_agg(id||'|'||estudiante_id||'|'||tipo||'|'||mensaje||'|'||estado||'|'||fecha_creacion, ',' ORDER BY id)) FROM alertas
UNION ALL SELECT 'actividades', COUNT(*), md5(string_agg(id||'|'||materia_id||'|'||grupo_id||'|'||titulo||'|'||tipo||'|'||coalesce(fecha_entrega::text,'∅'), ',' ORDER BY id)) FROM actividades
UNION ALL SELECT 'observaciones', COUNT(*), md5(string_agg(id||'|'||estudiante_id||'|'||coalesce(tipo,'∅')||'|'||descripcion||'|'||fecha, ',' ORDER BY id)) FROM observaciones
UNION ALL SELECT 'columnas_public', COUNT(*), md5(string_agg(table_name||'.'||column_name||':'||data_type, ',' ORDER BY table_name, ordinal_position)) FROM information_schema.columns WHERE table_schema = 'public'
UNION ALL SELECT 'columna_entregado', COUNT(*), coalesce(string_agg(data_type||'|'||is_nullable||'|'||coalesce(column_default,'∅'), ','), 'no existe') FROM information_schema.columns WHERE table_name = 'calificaciones' AND column_name = 'entregado';
