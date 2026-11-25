"""Plan determinista de la demostración: qué registros crear, sin tocar ninguna base de datos.

`construir_plan(semilla, referencia)` devuelve siempre el mismo plan para la misma semilla y
la misma fecha de referencia. El generador (generar_demo.py) lo ejecuta mediante la API real.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta

from demo import catalogo as cat

SEMILLA = 2026

# Días antes de la fecha de referencia en que vence la actividad calificada de cada periodo.
_DIAS_ANTES_POR_PERIODO = {1: 250, 2: 170, 3: 95, 4: 25}


@dataclass(frozen=True)
class Estudiante:
    documento: str
    nombre: str
    apellido: str
    grupo: str
    perfil: str
    materia_fuerte: str | None = None
    materia_debil: str | None = None


@dataclass(frozen=True)
class Actividad:
    clave: str
    materia: str
    grupo: str
    titulo: str
    tipo: str
    descripcion: str
    fecha_entrega: date
    periodo: int
    pendiente: bool


@dataclass(frozen=True)
class Calificacion:
    documento: str
    actividad: str
    nota: float
    periodo: int
    fecha_registro: datetime


@dataclass(frozen=True)
class Observacion:
    documento: str
    tipo: str
    descripcion: str
    fecha: datetime


@dataclass
class Plan:
    semilla: int
    referencia: date
    estudiantes: list[Estudiante] = field(default_factory=list)
    actividades: list[Actividad] = field(default_factory=list)
    calificaciones: list[Calificacion] = field(default_factory=list)
    observaciones: list[Observacion] = field(default_factory=list)

    @property
    def ano_lectivo(self) -> int:
        return self.referencia.year

    def docente_de(self, materia: str, grupo: str) -> str:
        for docente, m, g in cat.ASIGNACIONES:
            if m == materia and g == grupo:
                return docente
        raise KeyError((materia, grupo))

    def materias_del_grupo(self, grupo: str) -> list[str]:
        return [m for _, m, g in cat.ASIGNACIONES if g == grupo]


def redondear_nota(valor: float) -> float:
    """Escala oficial 0.0 – 5.0 con un decimal, redondeando la mitad hacia arriba."""
    valor = min(5.0, max(0.0, valor))
    return int(valor * 10 + 0.5 + 1e-9) / 10


def _estudiantes(rng: random.Random) -> list[Estudiante]:
    perfiles = [p for p, n in cat.PERFILES.items() for _ in range(n)]
    total = len(cat.GRUPOS) * cat.ESTUDIANTES_POR_GRUPO
    assert len(perfiles) == total, (len(perfiles), total)
    rng.shuffle(perfiles)

    usados: set[tuple[str, str]] = set()
    estudiantes = []
    for i, perfil in enumerate(perfiles):
        grupo = cat.GRUPOS[i // cat.ESTUDIANTES_POR_GRUPO]["clave"]
        while True:
            nombre = rng.choice(cat.NOMBRES)
            apellido = f"{rng.choice(cat.APELLIDOS)} {rng.choice(cat.APELLIDOS)}"
            if (nombre, apellido) not in usados and apellido.split()[0] != apellido.split()[1]:
                usados.add((nombre, apellido))
                break
        fuerte = debil = None
        if perfil == "diferencias":
            materias = [m for _, m, g in cat.ASIGNACIONES if g == grupo]
            fuerte, debil = rng.sample(materias, 2)
        estudiantes.append(Estudiante(f"DEMO-{i + 1:04d}", nombre, apellido, grupo, perfil, fuerte, debil))
    return estudiantes


def _actividades(rng: random.Random, referencia: date) -> list[Actividad]:
    actividades = []
    desfase_materia = {m["clave"]: i * 2 for i, m in enumerate(cat.MATERIAS)}
    for _, materia, grupo in cat.ASIGNACIONES:
        desfase = desfase_materia[materia] + int(grupo[0])
        for indice, (titulo, tipo) in enumerate(cat.ACTIVIDADES[materia]):
            pendiente = indice == 4
            if pendiente:
                periodo = 4
                fecha = referencia + timedelta(days=3 + desfase % 12)
                descripcion = "Actividad pendiente: aún no tiene calificaciones."
            else:
                periodo = indice + 1
                fecha = referencia - timedelta(days=_DIAS_ANTES_POR_PERIODO[periodo] - desfase)
                descripcion = f"Actividad del periodo {periodo}."
            actividades.append(Actividad(f"{materia}-{grupo}-{indice + 1}", materia, grupo, titulo, tipo,
                                         descripcion, fecha, periodo, pendiente))
    return actividades


def _nota(rng: random.Random, est: Estudiante, materia: str, periodo: int, sesgo: dict) -> float | None:
    base = cat.NOTA_BASE[est.perfil][periodo - 1]
    if base is None:
        return None
    if materia == est.materia_fuerte:
        base += 0.9
    elif materia == est.materia_debil:
        base -= 1.6
    return redondear_nota(base + sesgo[(est.documento, materia)] + rng.gauss(0, cat.DISPERSION[est.perfil]))


def construir_plan(semilla: int = SEMILLA, referencia: date | None = None) -> Plan:
    referencia = referencia or date.today()
    rng = random.Random(semilla)
    plan = Plan(semilla, referencia)
    plan.estudiantes = _estudiantes(rng)
    plan.actividades = _actividades(rng, referencia)

    # Cada estudiante tiene un pequeño sesgo estable por materia (unas le cuestan más que otras).
    sesgo = {(e.documento, m): rng.gauss(0, 0.2) for e in plan.estudiantes for m in plan.materias_del_grupo(e.grupo)}
    por_grupo: dict[str, list[Estudiante]] = {}
    for e in plan.estudiantes:
        por_grupo.setdefault(e.grupo, []).append(e)

    calificaciones = []
    for act in plan.actividades:
        if act.pendiente:
            continue
        for est in por_grupo[act.grupo]:
            if est.perfil == "sin_notas" or rng.random() < cat.NO_ENTREGA[est.perfil]:
                continue
            nota = _nota(rng, est, act.materia, act.periodo, sesgo)
            if nota is None:
                continue
            dias = rng.randint(1, 6)
            registro = datetime.combine(act.fecha_entrega + timedelta(days=dias), time(7 + rng.randint(0, 9), rng.randint(0, 59)))
            limite = datetime.combine(referencia - timedelta(days=1), time(18, 0))
            calificaciones.append(Calificacion(est.documento, act.clave, nota, act.periodo, min(registro, limite)))
    # Se registran en orden cronológico, como ocurriría durante el año lectivo: así la regla
    # de alerta del backend evalúa el promedio acumulado en el momento de cada nota.
    plan.calificaciones = sorted(calificaciones, key=lambda c: (c.fecha_registro, c.documento, c.actividad))

    observaciones = []
    con_varias = {e.documento for e in rng.sample(
        [e for e in plan.estudiantes if e.perfil in ("bajo", "mejora", "disminucion", "umbral")], 10)}
    for est in plan.estudiantes:
        if est.perfil == "sin_notas":
            continue
        cantidad = rng.randint(3, 5) if est.documento in con_varias else (1 if rng.random() < 0.3 else 0)
        for _ in range(cantidad):
            if est.perfil in ("excelente", "mejora") and rng.random() < 0.7:
                tipo = "Reconocimiento"
            elif est.perfil in ("bajo", "disminucion", "umbral", "diferencias") and rng.random() < 0.7:
                tipo = "Académica"
            else:
                tipo = rng.choice(["Convivencial", "Académica", "Reconocimiento"])
            fecha = datetime.combine(referencia - timedelta(days=rng.randint(2, 260)), time(8 + rng.randint(0, 8), rng.randint(0, 59)))
            observaciones.append(Observacion(est.documento, tipo, rng.choice(cat.OBSERVACIONES[tipo]), fecha))
    plan.observaciones = sorted(observaciones, key=lambda o: (o.fecha, o.documento))
    return plan
