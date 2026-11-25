"""Generador de la demostración: plan reproducible, datos coherentes y protecciones de destino.

No escriben en ninguna base: el plan es puro y las protecciones se prueban con URLs y con la
conexión de classkids_test, que el generador debe rechazar.
"""
import os
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import date

import pytest

from demo import catalogo as cat
from demo.generar_demo import DestinoNoPermitido, validar_servidor, validar_url
from demo.plan import construir_plan, redondear_nota

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFERENCIA = date(2026, 11, 24)


@pytest.fixture(scope="module")
def plan():
    return construir_plan(2026, REFERENCIA)


# ============================================================ reproducibilidad

def test_misma_semilla_y_fecha_producen_el_mismo_plan(plan):
    otro = construir_plan(2026, REFERENCIA)
    assert otro.estudiantes == plan.estudiantes
    assert otro.actividades == plan.actividades
    assert otro.calificaciones == plan.calificaciones
    assert otro.observaciones == plan.observaciones


def test_otra_semilla_produce_otros_datos(plan):
    assert construir_plan(7, REFERENCIA).calificaciones != plan.calificaciones


# ============================================================ volumen y relaciones

def test_volumen_de_la_demostracion(plan):
    assert len(cat.DOCENTES) == 5 and len(cat.GRUPOS) == 10 and len(cat.MATERIAS) == 6
    assert len(plan.estudiantes) == 200
    assert Counter(e.grupo for e in plan.estudiantes) == {g["clave"]: 20 for g in cat.GRUPOS}
    assert len(plan.actividades) == 5 * len(cat.ASIGNACIONES)
    assert len(plan.calificaciones) > 3000


def test_un_docente_por_materia_y_grupo_y_asignaciones_distintas():
    pares = [(m, g) for _, m, g in cat.ASIGNACIONES]
    assert len(pares) == len(set(pares))
    grupos = defaultdict(set)
    for d, _, g in cat.ASIGNACIONES:
        grupos[d].add(g)
    assert len({frozenset(v) for v in grupos.values()}) >= 3
    assert not grupos["D1"] & grupos["D2"], "D1 y D2 no comparten grupos (demostración de permisos)"


def test_sin_duplicados_en_documentos_nombres_ni_calificaciones(plan):
    assert len({e.documento for e in plan.estudiantes}) == 200
    assert len({(e.nombre, e.apellido) for e in plan.estudiantes}) == 200
    claves = [(c.documento, c.actividad) for c in plan.calificaciones]
    assert len(claves) == len(set(claves))
    correos = [cat.ADMINISTRADOR["email"]] + [d["email"] for d in cat.DOCENTES]
    assert len(correos) == len(set(correos))


def test_cada_calificacion_es_de_un_estudiante_del_grupo_de_la_actividad(plan):
    grupo = {e.documento: e.grupo for e in plan.estudiantes}
    actividades = {a.clave: a for a in plan.actividades}
    for c in plan.calificaciones:
        a = actividades[c.actividad]
        assert grupo[c.documento] == a.grupo
        assert not a.pendiente
        assert c.periodo == a.periodo


# ============================================================ datos ficticios

def test_datos_completamente_ficticios(plan):
    assert all(e.documento.startswith("DEMO-") for e in plan.estudiantes)
    assert all(u["email"].endswith("@demo.classkids.local") for u in [cat.ADMINISTRADOR, *cat.DOCENTES])
    apellidos = {p for e in plan.estudiantes for p in e.apellido.split()} | {d["apellido"] for d in cat.DOCENTES}
    assert not apellidos & cat.APELLIDOS_EXCLUIDOS
    nombres = {e.nombre for e in plan.estudiantes} | {d["nombre"] for d in cat.DOCENTES}
    assert not nombres & {"Johanna", "Faloon", "Jan", "Alejandra"}


# ============================================================ escala 0.0 – 5.0

@pytest.mark.parametrize("valor,esperado", [(-0.4, 0.0), (0.0, 0.0), (0.05, 0.1), (0.1, 0.1), (2.95, 3.0), (4.9, 4.9), (4.96, 5.0), (5.0, 5.0), (6.3, 5.0)])
def test_redondear_nota_queda_en_la_escala_con_un_decimal(valor, esperado):
    assert redondear_nota(valor) == esperado


def test_todas_las_notas_del_plan_estan_en_la_escala(plan):
    for c in plan.calificaciones:
        assert 0 <= c.nota <= 5
        assert round(c.nota * 10) == pytest.approx(c.nota * 10)


# ============================================================ escenarios

def _promedio(notas):
    return sum(notas) / len(notas)


def test_escenarios_de_rendimiento(plan):
    perfil = {e.documento: e for e in plan.estudiantes}
    por_perfil = defaultdict(list)
    por_perfil_y_periodo = defaultdict(list)
    for c in plan.calificaciones:
        p = perfil[c.documento].perfil
        por_perfil[p].append(c.nota)
        por_perfil_y_periodo[(p, c.periodo)].append(c.nota)
    assert _promedio(por_perfil["excelente"]) >= 4.4
    assert 3.6 <= _promedio(por_perfil["aprobado"]) <= 4.2
    assert 2.9 <= _promedio(por_perfil["umbral"]) <= 3.5
    assert _promedio(por_perfil["bajo"]) < 3.0
    mejora = [_promedio(por_perfil_y_periodo[("mejora", p)]) for p in (1, 2, 3, 4)]
    disminucion = [_promedio(por_perfil_y_periodo[("disminucion", p)]) for p in (1, 2, 3, 4)]
    assert mejora == sorted(mejora) and mejora[3] - mejora[0] > 1.2
    assert disminucion == sorted(disminucion, reverse=True) and disminucion[0] - disminucion[3] > 1.2


def test_diferencias_entre_materias(plan):
    actividades = {a.clave: a for a in plan.actividades}
    for e in [e for e in plan.estudiantes if e.perfil == "diferencias"]:
        notas = defaultdict(list)
        for c in plan.calificaciones:
            if c.documento == e.documento:
                notas[actividades[c.actividad].materia].append(c.nota)
        assert _promedio(notas[e.materia_fuerte]) - _promedio(notas[e.materia_debil]) > 1.5


def test_sin_notas_pendientes_y_observaciones(plan):
    con_notas = {c.documento for c in plan.calificaciones}
    sin_notas = [e for e in plan.estudiantes if e.perfil == "sin_notas"]
    assert sin_notas and not {e.documento for e in sin_notas} & con_notas
    pendientes = [a for a in plan.actividades if a.pendiente]
    assert len(pendientes) == len(cat.ASIGNACIONES)
    assert all(a.fecha_entrega > REFERENCIA for a in pendientes)
    assert all(c.fecha_registro.date() < REFERENCIA for c in plan.calificaciones)
    varias = [d for d, n in Counter(o.documento for o in plan.observaciones).items() if n >= 3]
    assert len(varias) >= 10
    assert {o.tipo for o in plan.observaciones} == {"Académica", "Convivencial", "Reconocimiento"}


def test_las_notas_se_registran_en_orden_cronologico(plan):
    fechas = [c.fecha_registro for c in plan.calificaciones]
    assert fechas == sorted(fechas)


# ============================================================ protecciones de destino

@pytest.mark.parametrize("url", [
    "postgresql+psycopg://postgres:x@localhost:5432/classkids",
    "postgresql+psycopg://postgres:x@127.0.0.1:5433/classkids_test",
    "postgresql+psycopg://postgres:x@127.0.0.1:5432/classkids_demo",  # nombre correcto, puerto de la base real
    "postgresql+psycopg://postgres:x@127.0.0.1:5434/otra_base",
])
def test_el_generador_rechaza_cualquier_base_que_no_sea_la_de_demostracion(url):
    with pytest.raises(DestinoNoPermitido):
        validar_url(url)


def test_el_generador_acepta_la_base_de_demostracion():
    validar_url("postgresql+psycopg://postgres:x@127.0.0.1:5434/classkids_demo")


def test_el_generador_rechaza_el_servidor_de_pruebas(db):
    with pytest.raises(DestinoNoPermitido):
        validar_servidor(db.connection())


def test_el_backend_no_arranca_si_el_entorno_no_coincide_con_la_base(tmp_path):
    env = {**os.environ, "CLASSKIDS_ENTORNO": "demo", "DATABASE_URL": "postgresql+psycopg://postgres:x@127.0.0.1:5432/classkids",
           "CLASSKIDS_ENV_FILE": str(tmp_path / "no-existe.env")}
    r = subprocess.run([sys.executable, "-c", "import database"], cwd=BACKEND, env=env, capture_output=True, text=True)
    assert r.returncode != 0
    assert "exige la base 'classkids_demo'" in r.stderr
