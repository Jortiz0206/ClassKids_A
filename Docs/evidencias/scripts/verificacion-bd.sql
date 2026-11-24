-- =====================================================================
-- ClassKids - Verificación de la base de datos (solo lectura)
-- Ejecutar en DBeaver sobre la conexión  localhost:5432 / classkids
-- (usuario postgres). Ninguna consulta modifica datos.
-- Los resultados esperados están en Docs/referencia-tecnica/database-schema.md,
-- sección «Verificación en DBeaver». Los conteos corresponden al 20/11/2026:
-- si el sistema se usa después de esa fecha, los conteos pueden cambiar.
-- =====================================================================

-- V-01. Servidor: debe ser el contenedor Docker classkids_db (PostgreSQL 15)
SELECT current_database() AS base, split_part(version(), ' ', 2) AS version_postgresql;

-- V-02. Tablas y número de registros
SELECT 'user_roles' AS tabla, COUNT(*) AS registros FROM user_roles
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'invitaciones', COUNT(*) FROM invitaciones
UNION ALL SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens
UNION ALL SELECT 'grupos', COUNT(*) FROM grupos
UNION ALL SELECT 'estudiantes', COUNT(*) FROM estudiantes
UNION ALL SELECT 'materias', COUNT(*) FROM materias
UNION ALL SELECT 'asignaciones', COUNT(*) FROM asignaciones
UNION ALL SELECT 'actividades', COUNT(*) FROM actividades
UNION ALL SELECT 'calificaciones', COUNT(*) FROM calificaciones
UNION ALL SELECT 'observaciones', COUNT(*) FROM observaciones
UNION ALL SELECT 'alertas', COUNT(*) FROM alertas;

-- V-03. Estructura: número de tablas, columnas y restricciones del esquema public
SELECT
  (SELECT COUNT(*) FROM information_schema.tables  WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tablas,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') AS columnas,
  (SELECT COUNT(*) FROM pg_constraint WHERE connamespace = 'public'::regnamespace) AS restricciones;

-- V-04. Restricciones por tipo (p = PK, f = FK, u = UNIQUE, c = CHECK)
SELECT contype AS tipo, COUNT(*) AS cantidad
FROM pg_constraint WHERE connamespace = 'public'::regnamespace
GROUP BY contype ORDER BY contype;

-- V-05. Columna de la nota: escala oficial 0.0–5.0 con un decimal
SELECT column_name, data_type, numeric_precision, numeric_scale,
       (SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'calificaciones_nota_check') AS restriccion
FROM information_schema.columns
WHERE table_name = 'calificaciones' AND column_name = 'nota';

-- V-06. Usuarios activos por rol
SELECT r.nombre AS rol, u.activo, COUNT(*) AS usuarios
FROM usuarios u LEFT JOIN user_roles r ON r.id = u.rol_id
GROUP BY r.nombre, u.activo ORDER BY r.nombre;

-- V-07. Estudiantes por grupo
SELECT g.nombre AS grupo, g.grado, g.turno, COUNT(e.id) AS estudiantes
FROM grupos g LEFT JOIN estudiantes e ON e.grupo_id = g.id
GROUP BY g.id, g.nombre, g.grado, g.turno ORDER BY g.id;

-- V-08. Asignaciones: una materia por grupo con un solo docente
SELECT COUNT(*) AS asignaciones,
       COUNT(DISTINCT (materia_id, grupo_id)) AS pares_materia_grupo,
       COUNT(DISTINCT docente_id) AS docentes_asignados
FROM asignaciones;

-- V-09. Rango y promedio de las notas (escala 0.0–5.0)
SELECT MIN(nota) AS nota_minima, MAX(nota) AS nota_maxima, ROUND(AVG(nota), 2) AS promedio_general,
       COUNT(*) FILTER (WHERE nota < 3.0) AS notas_menores_a_3
FROM calificaciones;

-- V-10. Calificaciones sin actividad asociada (hallazgo H-06)
SELECT COUNT(*) AS calificaciones_sin_actividad FROM calificaciones WHERE actividad_id IS NULL;

-- V-11. Calificaciones repetidas para el mismo estudiante y la misma actividad (hallazgo H-06)
SELECT actividad_id, estudiante_id, COUNT(*) AS veces
FROM calificaciones WHERE actividad_id IS NOT NULL
GROUP BY actividad_id, estudiante_id HAVING COUNT(*) > 1
ORDER BY actividad_id, estudiante_id;

-- V-12. Alertas por tipo y estado
SELECT tipo, estado, COUNT(*) AS alertas FROM alertas GROUP BY tipo, estado ORDER BY COUNT(*) DESC;

-- V-13. Estudiantes con promedio acumulado menor a 3.0 (criterio de la alerta automática)
SELECT COUNT(*) AS estudiantes_promedio_menor_3
FROM (SELECT estudiante_id FROM calificaciones GROUP BY estudiante_id HAVING AVG(nota) < 3.0) x;

-- V-14. Estudiantes con promedio menor a 3.5 (criterio «En riesgo» de la interfaz, hallazgo H-01)
SELECT COUNT(*) AS estudiantes_promedio_menor_3_5
FROM (SELECT estudiante_id FROM calificaciones GROUP BY estudiante_id HAVING AVG(nota) < 3.5) x;

-- V-15. Integridad entre capas (todas deben dar 0)
SELECT
  (SELECT COUNT(*) FROM calificaciones c JOIN actividades a ON a.id = c.actividad_id WHERE a.materia_id <> c.materia_id) AS nota_con_materia_distinta_a_su_actividad,
  (SELECT COUNT(*) FROM calificaciones c JOIN actividades a ON a.id = c.actividad_id JOIN estudiantes e ON e.id = c.estudiante_id WHERE e.grupo_id <> a.grupo_id) AS nota_de_estudiante_fuera_del_grupo,
  (SELECT COUNT(*) FROM asignaciones s JOIN usuarios u ON u.id = s.docente_id JOIN user_roles r ON r.id = u.rol_id WHERE NOT u.activo OR r.nombre <> 'Docente') AS asignacion_con_docente_invalido,
  (SELECT COUNT(*) FROM estudiantes WHERE grupo_id IS NULL) AS estudiantes_sin_grupo;

-- V-16. Columnas que la interfaz espera y no existen (hallazgo H-26): debe dar 0 filas
SELECT column_name FROM information_schema.columns
WHERE table_name = 'grupos' AND column_name = 'created_at';
