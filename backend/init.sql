-- ========================================================
-- DATOS DE PRUEBA MASIVOS Y REALISTAS
-- ========================================================

CREATE TABLE IF NOT EXISTS user_roles (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL UNIQUE,
	descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL UNIQUE,
	nombre VARCHAR(120) NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	rol_id INTEGER REFERENCES user_roles(id),
	activo BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	last_sign_in_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invitaciones (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	rol_id INTEGER NOT NULL REFERENCES user_roles(id),
	token VARCHAR(120) NOT NULL UNIQUE,
	expires_at TIMESTAMP NOT NULL,
	accepted_at TIMESTAMP,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
	id SERIAL PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	token VARCHAR(120) NOT NULL UNIQUE,
	expires_at TIMESTAMP NOT NULL,
	used_at TIMESTAMP,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupos (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(120) NOT NULL,
	grado VARCHAR(30),
	turno VARCHAR(30),
	ano_lectivo INTEGER DEFAULT 2026
);

CREATE TABLE IF NOT EXISTS estudiantes (
	id SERIAL PRIMARY KEY,
	documento VARCHAR(50) NOT NULL UNIQUE,
	nombre VARCHAR(120) NOT NULL,
	apellido VARCHAR(120) NOT NULL,
	grupo_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL,
	activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS materias (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(120) NOT NULL,
	codigo VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS actividades (
	id SERIAL PRIMARY KEY,
	materia_id INTEGER NOT NULL REFERENCES materias(id),
	grupo_id INTEGER NOT NULL REFERENCES grupos(id),
	titulo VARCHAR(200) NOT NULL,
	tipo VARCHAR(30) NOT NULL DEFAULT 'tarea',
	descripcion TEXT,
	fecha_entrega DATE
);

CREATE TABLE IF NOT EXISTS calificaciones (
	id SERIAL PRIMARY KEY,
	estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
	materia_id INTEGER NOT NULL REFERENCES materias(id),
	actividad_id INTEGER REFERENCES actividades(id) ON DELETE SET NULL,
	nota NUMERIC(3, 1) NOT NULL CHECK (nota >= 0 AND nota <= 5),
	periodo INTEGER NOT NULL DEFAULT 1,
	observacion TEXT,
	fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE actividades ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'tarea';

ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS actividad_id INTEGER REFERENCES actividades(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS observaciones (
	id SERIAL PRIMARY KEY,
	estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
	tipo VARCHAR(50) DEFAULT 'Convivencial',
	descripcion TEXT NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alertas (
	id SERIAL PRIMARY KEY,
	estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
	tipo VARCHAR(80) NOT NULL,
	mensaje TEXT NOT NULL,
	estado VARCHAR(30) NOT NULL DEFAULT 'active',
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asignaciones (
	id SERIAL PRIMARY KEY,
	docente_id INTEGER NOT NULL REFERENCES usuarios(id),
	materia_id INTEGER NOT NULL REFERENCES materias(id),
	grupo_id INTEGER NOT NULL REFERENCES grupos(id),
	UNIQUE (docente_id, materia_id, grupo_id)
);

-- 1. Roles
INSERT INTO user_roles (nombre, descripcion) VALUES
('Administrador', 'Control total del sistema'),
('Docente', 'Registro de notas y asistencia'),
('Acudiente', 'Consulta de reportes')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (email, nombre, password_hash, rol_id) VALUES
('admin@classkids.local', 'Administrador ClassKids', '$pbkdf2-sha256$29000$pRTCWIuxthbinFPqnXPOeQ$TwhKc2OrJ25QxCU9TLSlHTTOOrLqZBBtd0r5fa.ucoE', (SELECT id FROM user_roles WHERE nombre = 'Administrador')),
('docente@classkids.local', 'Docente ClassKids', '$pbkdf2-sha256$29000$WkuplTJmLOU8Z6x1rvXeOw$LhP6bY4JkOvbs8Mr2KqxvB2rv.bYZKMVo9U2ieNVors', (SELECT id FROM user_roles WHERE nombre = 'Docente'))
ON CONFLICT (email) DO NOTHING;

-- Migración para instalaciones creadas con el esquema anterior.
ALTER TABLE asignaciones DROP CONSTRAINT IF EXISTS asignaciones_docente_id_fkey;
UPDATE asignaciones a
SET docente_id = u.id
FROM usuarios u
JOIN user_roles r ON r.id = u.rol_id
WHERE lower(r.nombre) = 'docente' AND a.docente_id = r.id;
ALTER TABLE asignaciones ADD CONSTRAINT asignaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES usuarios(id);
CREATE UNIQUE INDEX IF NOT EXISTS asignaciones_docente_materia_grupo_uidx
ON asignaciones (docente_id, materia_id, grupo_id);
CREATE UNIQUE INDEX IF NOT EXISTS asignaciones_materia_grupo_uidx
ON asignaciones (materia_id, grupo_id);

-- 2. Grupos
INSERT INTO grupos (nombre, grado, turno) VALUES
('Grado 1A', '1°', 'Matutino'),
('Grado 2A', '2°', 'Matutino'),
('Grado 3A', '3°', 'Vespertino');

-- 3. Materias
INSERT INTO materias (nombre, codigo) VALUES
('Matemáticas', 'MAT-01'),
('Español y Literatura', 'ESP-01'),
('Ciencias Naturales', 'CNT-01'),
('Sociales', 'SOC-01'),
('Inglés', 'ING-01');

-- 4. 20 Estudiantes
INSERT INTO estudiantes (documento, nombre, apellido, grupo_id) VALUES
('100101', 'Sofía', 'Gómez', 1), ('100102', 'Mateo', 'Rodríguez', 1),
('100103', 'Valentina', 'Martínez', 1), ('100104', 'Lucas', 'Hernández', 1),
('100105', 'Isabella', 'Díaz', 1), ('100106', 'Santiago', 'Pérez', 1),
('100107', 'Camila', 'Torres', 1), ('100108', 'Alejandro', 'Ramírez', 2),
('100109', 'Mariana', 'Flores', 2), ('100110', 'Diego', 'Acosta', 2),
('100111', 'Gabriela', 'Castro', 2), ('100112', 'Nicolas', 'Vargas', 2),
('100113', 'Daniela', 'Ríos', 2), ('100114', 'Samuel', 'Suárez', 2),
('100115', 'Lucía', 'Mendoza', 3), ('100116', 'Joaquín', 'Silva', 3),
('100117', 'Victoria', 'Rojas', 3), ('100118', 'Martín', 'Navarro', 3),
('100119', 'Elena', 'Morales', 3), ('100120', 'Tomás', 'Gutiérrez', 3);

-- 5. Actividades Académicas (15 registros)
INSERT INTO actividades (materia_id, grupo_id, titulo, descripcion, fecha_entrega) VALUES
(1, 1, 'Taller de Sumas y Restas', 'Resolver la guía interactiva del capítulo 2', '2026-09-05'),
(1, 1, 'Evaluación de Geometría', 'Prueba sobre figuras planas y perímetros', '2026-09-12'),
(2, 1, 'Lectura Comprensiva', 'Resumen sobre el cuento El Principito', '2026-09-08'),
(2, 1, 'Dictado y Ortografía', 'Uso correcto de la B y la V', '2026-09-15'),
(3, 1, 'Experimento de Germinación', 'Registro en diario del crecimiento de la semilla', '2026-09-20'),
(1, 2, 'Tablas de Multiplicar', 'Taller práctico de multiplicación por 2, 3 y 4', '2026-09-06'),
(3, 2, 'El Ciclo del Agua', 'Elaboración de maqueta explicativa', '2026-09-14'),
(4, 2, 'Mapa de la Región', 'Ubicación de departamentos en el croquis', '2026-09-18'),
(5, 2, 'Vocabulario: La Familia', 'Presentación oral corta en inglés', '2026-09-22'),
(1, 3, 'Fraccionarios Básicos', 'Representación gráfica de fracciones', '2026-09-10'),
(2, 3, 'Estructura del Párrafo', 'Redacción de texto expositivo corto', '2026-09-13'),
(4, 3, 'Democracia Escolar', 'Análisis sobre las funciones del personero', '2026-09-17'),
(5, 3, 'Verbo To Be', 'Taller escrito de gramática', '2026-09-21'),
(3, 3, 'Sistemas del Cuerpo Humano', 'Quiz sobre el sistema digestivo', '2026-09-25'),
(2, 2, 'Mesa Redonda: Comprensión', 'Debate en clase sobre la fábula asignada', '2026-09-28');

UPDATE actividades SET tipo = CASE
	WHEN lower(titulo) LIKE '%evaluación%' OR lower(titulo) LIKE '%quiz%' THEN 'examen'
	WHEN lower(titulo) LIKE '%maqueta%' OR lower(titulo) LIKE '%experimento%' THEN 'proyecto'
	WHEN lower(titulo) LIKE '%mesa redonda%' OR lower(titulo) LIKE '%presentación%' THEN 'participación'
	ELSE 'tarea'
END;

-- 6. Calificaciones (35 registros variados para gráficos)
INSERT INTO calificaciones (estudiante_id, materia_id, nota, periodo, observacion) VALUES
(1, 1, 4.8, 1, 'Excelente manejo conceptual'),
(1, 2, 4.5, 1, 'Muy buena redacción'),
(1, 3, 5.0, 1, 'Desempeño sobresaliente'),
(2, 1, 2.8, 1, 'Requiere apoyo en operaciones de resta'),
(2, 2, 3.5, 1, 'Cumple con el nivel básico'),
(2, 3, 2.5, 1, 'No presentó la guía de trabajo'),
(3, 1, 4.0, 1, 'Buen trabajo'),
(3, 2, 4.2, 1, 'Participación activa'),
(4, 1, 3.0, 1, 'Aprobado justo'),
(4, 4, 2.2, 1, 'Bajo rendimiento en evaluaciones escritas'),
(5, 5, 4.9, 1, 'Pronunciación destacada'),
(5, 1, 4.3, 1, 'Buen desempeño'),
(6, 2, 3.8, 1, 'Constante en sus entregas'),
(7, 3, 4.6, 1, 'Gran interés por la ciencia'),
(8, 1, 2.0, 1, 'Presenta serias dificultades en multiplicación'),
(8, 2, 3.0, 1, 'Nivel aceptable'),
(9, 3, 4.5, 1, 'Trabajo en equipo destacado'),
(10, 4, 3.2, 1, 'Debe mejorar la atención en clase'),
(11, 5, 4.7, 1, 'Excelente nivel de conversación'),
(12, 1, 2.9, 1, 'Cerca de alcanzar el nivel básico'),
(13, 2, 4.0, 1, 'Ortografía impecable'),
(14, 3, 3.5, 1, 'Desempeño regular'),
(15, 1, 4.8, 1, 'Dominio completo de fraccionarios'),
(15, 2, 4.4, 1, 'Buena argumentación'),
(16, 4, 2.4, 1, 'Incompletos los trabajos del periodo'),
(17, 5, 4.1, 1, 'Buenas habilidades auditivas'),
(18, 3, 3.9, 1, 'Compromiso académico adecuado'),
(19, 1, 4.5, 1, 'Solución rápida de ejercicios'),
(20, 2, 2.7, 1, 'Necesita reforzar la comprensión de lectura'),
(1, 1, 4.9, 2, 'Mantiene el alto nivel en el 2° periodo'),
(2, 1, 3.5, 2, 'Demuestra importante mejoría respecto al periodo 1'),
(4, 4, 3.6, 2, 'Superó las fallas del periodo anterior'),
(8, 1, 3.2, 2, 'Logró aprobar tras las tutorías'),
(16, 4, 3.0, 2, 'Nivel básico alcanzado'),
(20, 2, 3.8, 2, 'Gran avance en el plan de mejoramiento');

-- 7. Observaciones (10 registros para ObservacionesEstudiante.tsx)
INSERT INTO observaciones (estudiante_id, tipo, descripcion) VALUES
(2, 'Académica', 'Se envió nota al acudiente solicitando refuerzo en tablas de multiplicar.'),
(2, 'Convivencial', 'Falta de atención constante durante la segunda hora de clase.'),
(1, 'Reconocimiento', 'Elegida como representante del grupo por su liderazgo y compañerismo.'),
(4, 'Académica', 'Se cita a reunión para fijar compromiso académico en Sociales.'),
(8, 'Convivencial', 'Interrumpe frecuentemente las explicaciones del docente.'),
(15, 'Reconocimiento', 'Felicitación por obtener la puntuación más alta en el concurso de matemáticas.'),
(16, 'Académica', 'Falta de entrega de 3 talleres consecutivos en la asignatura de Sociales.'),
(20, 'Académica', 'Se le asigna cartilla de lectura para reforzar durante el fin de semana.'),
(5, 'Convivencial', 'Muestra excelente empatía y apoyo a sus compañeros de grupo.'),
(12, 'Convivencial', 'Llegó tarde al inicio de la jornada en tres ocasiones esta semana.');

-- 8. Alertas (8 registros para AlertsPanel.tsx)
INSERT INTO alertas (estudiante_id, tipo, mensaje, estado) VALUES
(2, 'Bajo Rendimiento', 'Promedio acumulado inferior a 3.0 en Matemáticas (Periodo 1)', 'active'),
(2, 'Seguimiento', 'Requiere seguimiento en plan de refuerzo académico', 'active'),
(4, 'Bajo Rendimiento', 'Nota defensiva de 2.2 en Sociales', 'active'),
(8, 'Bajo Rendimiento', 'Nota reprobatoria (2.0) en Matemáticas', 'active'),
(8, 'Inasistencia', 'Registro de 3 faltas sin justificar en el mes', 'active'),
(16, 'Bajo Rendimiento', 'Incumplimiento de tareas asignadas en Sociales', 'active'),
(20, 'Bajo Rendimiento', 'Dificultades en comprensión lectora (Nota: 2.7)', 'active'),
(12, 'Inasistencia', 'Alertas por impuntualidad reiterada al inicio de la jornada', 'active');

-- 9. Asignaciones académicas del colegio demo
INSERT INTO asignaciones (docente_id, materia_id, grupo_id)
SELECT u.id, m.id, g.id
FROM usuarios u
JOIN user_roles r ON r.id = u.rol_id AND lower(r.nombre) = 'docente'
JOIN materias m ON m.id IN (1, 2, 3, 4, 5)
JOIN grupos g ON g.id IN (1, 2, 3)
WHERE u.email = 'docente@classkids.local'
ON CONFLICT (materia_id, grupo_id) DO NOTHING;

-- Relacionar las calificaciones demo con la primera actividad de cada materia y grupo.
UPDATE calificaciones c
SET actividad_id = source.actividad_id
FROM (
	SELECT c2.id, (
		SELECT a.id FROM actividades a
		JOIN estudiantes e2 ON e2.id = c2.estudiante_id
		WHERE a.materia_id = c2.materia_id AND a.grupo_id = e2.grupo_id
		ORDER BY a.id ASC LIMIT 1
	) AS actividad_id
	FROM calificaciones c2
) source
WHERE c.id = source.id AND source.actividad_id IS NOT NULL;