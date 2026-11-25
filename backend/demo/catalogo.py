"""Catálogo de datos SINTÉTICOS para la demostración de ClassKids.

Todos los nombres se combinan al azar a partir de listas genéricas: no corresponden a
estudiantes, docentes ni usuarios reales. Los documentos usan el prefijo «DEMO-» y los
correos el dominio reservado «demo.classkids.local», que no existe.
"""

# Apellidos que NO se usan para evitar coincidencias con el equipo del proyecto o con
# personas mencionadas en la documentación. Las pruebas comprueban que no aparezcan.
APELLIDOS_EXCLUIDOS = {"Ortiz", "Llanos", "Guio", "Gutiérrez", "Quiroga"}

NOMBRES = [
    "Sofía", "Valentina", "Isabella", "Mariana", "Gabriela", "Salomé", "Luciana", "Antonella",
    "Emilia", "Sara", "Juliana", "Manuela", "Victoria", "Daniela", "Martina", "Allison",
    "Camila", "Paula", "Laura", "Renata", "Abril", "Violeta", "Amelia", "Celeste",
    "Santiago", "Sebastián", "Matías", "Nicolás", "Samuel", "Alejandro", "Emiliano", "Tomás",
    "Mateo", "Jerónimo", "Martín", "Lucas", "Benjamín", "Joaquín", "Simón", "Felipe",
    "Gabriel", "Daniel", "Thiago", "Emmanuel", "Maximiliano", "Julián", "Agustín", "Pablo",
]

APELLIDOS = [
    "Acosta", "Aguilar", "Arango", "Ávila", "Barrera", "Benítez", "Bermúdez", "Botero",
    "Cabrera", "Calderón", "Cardona", "Carvajal", "Castillo", "Cifuentes", "Contreras", "Correa",
    "Delgado", "Duarte", "Escobar", "Espinosa", "Figueroa", "Franco", "Galeano", "Gallego",
    "Giraldo", "Guzmán", "Henao", "Hoyos", "Jaramillo", "Lozano", "Marín", "Medina",
    "Mejía", "Molina", "Montoya", "Mora", "Murillo", "Navarro", "Orozco", "Osorio",
    "Pardo", "Patiño", "Pineda", "Quintero", "Ramírez", "Rincón", "Rojas", "Salcedo",
    "Sandoval", "Serna", "Suárez", "Tamayo", "Toro", "Trujillo", "Uribe", "Valencia",
    "Vargas", "Vélez", "Zapata", "Zuluaga",
]

ADMINISTRADOR = {"nombre": "Marta", "apellido": "Rivas", "email": "admin@demo.classkids.local"}

# Docentes ficticios. «clave» es solo interna del generador.
DOCENTES = [
    {"clave": "D1", "nombre": "Lucía", "apellido": "Méndez", "email": "lucia.mendez@demo.classkids.local"},
    {"clave": "D2", "nombre": "Hernán", "apellido": "Villamizar", "email": "hernan.villamizar@demo.classkids.local"},
    {"clave": "D3", "nombre": "Carolina", "apellido": "Restrepo", "email": "carolina.restrepo@demo.classkids.local"},
    {"clave": "D4", "nombre": "Mauricio", "apellido": "Peña", "email": "mauricio.pena@demo.classkids.local"},
    {"clave": "D5", "nombre": "Diana", "apellido": "Castaño", "email": "diana.castano@demo.classkids.local"},
]

MATERIAS = [
    {"clave": "MAT", "nombre": "Matemáticas", "codigo": "MAT-DEMO"},
    {"clave": "LEN", "nombre": "Lenguaje", "codigo": "LEN-DEMO"},
    {"clave": "CN", "nombre": "Ciencias Naturales", "codigo": "CN-DEMO"},
    {"clave": "CS", "nombre": "Ciencias Sociales", "codigo": "CS-DEMO"},
    {"clave": "ING", "nombre": "Inglés", "codigo": "ING-DEMO"},
    {"clave": "ART", "nombre": "Educación Artística", "codigo": "ART-DEMO"},
]

# Diez grupos de primaria: dos por grado, jornada matutina (A) y vespertina (B), los mismos valores que usa la interfaz.
GRUPOS = [
    {"clave": f"{grado}{letra}", "nombre": f"Grado {grado}{letra}", "grado": f"{grado}°",
     "turno": "Matutino" if letra == "A" else "Vespertino"}
    for grado in range(1, 6) for letra in ("A", "B")
]
ESTUDIANTES_POR_GRUPO = 20

_GRUPOS_1_A_3 = [g["clave"] for g in GRUPOS if g["clave"][0] in "123"]
_GRUPOS_4_Y_5 = [g["clave"] for g in GRUPOS if g["clave"][0] in "45"]
_TODOS = [g["clave"] for g in GRUPOS]
_GRUPOS_1_Y_2 = [g["clave"] for g in GRUPOS if g["clave"][0] in "12"]

# Un docente por materia en cada grupo (restricción del sistema). Cada docente tiene un
# conjunto distinto: D1 y D2 no comparten grupos, lo que permite demostrar los permisos.
ASIGNACIONES = (
    [("D1", "MAT", g) for g in _GRUPOS_1_A_3] + [("D1", "CN", g) for g in _GRUPOS_1_A_3]
    + [("D2", "MAT", g) for g in _GRUPOS_4_Y_5] + [("D2", "CN", g) for g in _GRUPOS_4_Y_5]
    + [("D3", "LEN", g) for g in _TODOS]
    + [("D4", "CS", g) for g in _TODOS]
    + [("D5", "ING", g) for g in _TODOS] + [("D5", "ART", g) for g in _GRUPOS_1_Y_2]
)

# Actividades por materia: una calificada en cada periodo (1 a 4) y una pendiente.
ACTIVIDADES = {
    "MAT": [("Taller de sumas y restas", "tarea"), ("Evaluación de multiplicación", "examen"),
            ("Fracciones con material concreto", "tarea"), ("Proyecto: la tienda escolar", "proyecto"),
            ("Repaso de geometría", "tarea")],
    "LEN": [("Lectura en voz alta", "participación"), ("Comprensión lectora: fábulas", "examen"),
            ("Escritura de un cuento", "proyecto"), ("Dictado y ortografía", "tarea"),
            ("Exposición de un libro", "participación")],
    "CN": [("Las partes de la planta", "tarea"), ("Evaluación: los seres vivos", "examen"),
           ("Experimento: estados del agua", "proyecto"), ("El cuerpo humano", "tarea"),
           ("Huerta escolar: registro", "proyecto")],
    "CS": [("Mi barrio y mi comunidad", "tarea"), ("Mapa de Colombia", "proyecto"),
           ("Evaluación: regiones naturales", "examen"), ("Símbolos patrios", "participación"),
           ("Línea del tiempo familiar", "tarea")],
    "ING": [("Colors and numbers", "tarea"), ("Vocabulary quiz: animals", "examen"),
            ("My family poster", "proyecto"), ("Speaking: daily routine", "participación"),
            ("Song and rhymes", "participación")],
    "ART": [("Collage con materiales reciclados", "proyecto"), ("Dibujo de paisajes", "tarea"),
            ("Muestra de títeres", "participación"), ("Mándalas y color", "tarea"),
            ("Exposición de fin de año", "proyecto")],
}

# Perfiles académicos (escenarios de la demostración) y cuántos estudiantes tiene cada uno.
PERFILES = {
    "excelente": 30,      # promedio cercano a 4.6
    "aprobado": 66,       # promedio cercano a 3.9
    "umbral": 36,         # promedio cercano a 3.2: algunos activan la alerta y otros no
    "bajo": 20,           # promedio cercano a 2.4: activan la alerta
    "mejora": 14,         # empiezan bajo y mejoran periodo a periodo
    "disminucion": 14,    # empiezan bien y bajan periodo a periodo
    "diferencias": 12,    # muy bien en una materia y mal en otra
    "sin_notas": 6,       # matriculados recientemente: sin calificaciones
    "retirado": 2,        # estudiantes inactivos con notas del primer semestre
}

# Nota base por periodo (1 a 4) de cada perfil.
NOTA_BASE = {
    "excelente": (4.6, 4.6, 4.6, 4.6),
    "aprobado": (3.9, 3.9, 3.9, 3.9),
    "umbral": (3.25, 3.2, 3.2, 3.25),
    "bajo": (2.5, 2.4, 2.4, 2.3),
    "mejora": (2.3, 2.9, 3.5, 4.1),
    "disminucion": (4.3, 3.7, 3.0, 2.5),
    "diferencias": (3.8, 3.8, 3.8, 3.8),
    "retirado": (3.0, 2.8, None, None),
}
DISPERSION = {"excelente": 0.25, "aprobado": 0.35, "umbral": 0.3, "bajo": 0.4, "mejora": 0.3,
              "disminucion": 0.3, "diferencias": 0.3, "retirado": 0.35}
# Probabilidad de que el estudiante no entregue una actividad (no se registra nota).
NO_ENTREGA = {"excelente": 0.02, "aprobado": 0.05, "umbral": 0.08, "bajo": 0.18, "mejora": 0.08,
              "disminucion": 0.1, "diferencias": 0.05, "retirado": 0.1}

OBSERVACIONES = {
    "Reconocimiento": [
        "Participa activamente y ayuda a sus compañeros durante las actividades.",
        "Entregó un trabajo sobresaliente, ordenado y creativo.",
        "Muestra un avance notable respecto al periodo anterior.",
        "Lidera con respeto el trabajo en equipo.",
    ],
    "Académica": [
        "Presenta dificultades para terminar las actividades en clase; se acuerda refuerzo.",
        "No entregó dos actividades del periodo; se informa al acudiente.",
        "Necesita apoyo en comprensión lectora; se recomiendan lecturas cortas en casa.",
        "Su rendimiento bajó en las últimas semanas; se programa seguimiento.",
        "Requiere refuerzo en operaciones básicas.",
    ],
    "Convivencial": [
        "Se distrae con frecuencia y conversa durante las explicaciones.",
        "Tuvo un desacuerdo con un compañero; se resolvió con diálogo.",
        "Llega tarde de forma reiterada; se cita al acudiente.",
        "Mejoró su comportamiento después del acuerdo de convivencia.",
    ],
}
