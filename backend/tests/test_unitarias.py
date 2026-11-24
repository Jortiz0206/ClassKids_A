"""Pruebas unitarias del backend: funciones y esquemas puros, SIN base de datos.

No usan las fixtures `client` ni `db`, no abren conexiones y no envían peticiones HTTP.
Importar `main` solo crea el motor de SQLAlchemy (no se conecta hasta la primera consulta);
aun así, conftest.py exige que la URL apunte a classkids_test.
"""
from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

import main


class _ConsultaFalsa:
    """Doble de prueba de una sesión de SQLAlchemy: cuenta las consultas y responde un valor fijo."""

    def __init__(self, existe: bool):
        self.existe = existe
        self.consultas = 0

    def execute(self, *_args, **_kwargs):
        self.consultas += 1
        return self

    def scalar(self):
        return self.existe


@pytest.mark.parametrize("entrada,esperado", [
    ("Pendiente", "active"), ("Activa", "active"), ("active", "active"),
    ("En revisión", "reviewed"), ("Revisada", "reviewed"), ("reviewed", "reviewed"),
    ("Resuelta", "resolved"), ("resolved", "resolved"),
])
def test_normalize_alert_status_acepta_estados_en_espanol_e_ingles(entrada, esperado):
    assert main.normalize_alert_status(entrada) == esperado


def test_normalize_alert_status_rechaza_un_estado_desconocido_con_422():
    with pytest.raises(HTTPException) as error:
        main.normalize_alert_status("Archivada")
    assert error.value.status_code == 422


def test_hash_de_contrasena_es_pbkdf2_y_no_guarda_el_texto_plano():
    hash_ = main.pwd_context.hash("clave-segura-123")
    assert hash_.startswith("$pbkdf2-sha256$")
    assert "clave-segura-123" not in hash_
    assert main.pwd_context.verify("clave-segura-123", hash_)
    assert not main.pwd_context.verify("otra-clave", hash_)


def test_token_jwt_lleva_usuario_rol_y_vence_en_8_horas():
    token = main.create_access_token(7, "docente")
    datos = jwt.decode(token, main.JWT_SECRET, algorithms=[main.JWT_ALGORITHM])
    assert datos["sub"] == "7"
    assert datos["role"] == "docente"
    restante = datos["exp"] - datetime.now(timezone.utc).timestamp()
    assert 7.9 * 3600 < restante <= 8 * 3600 + 5


def test_token_firmado_con_otra_clave_es_rechazado():
    token = main.create_access_token(1, "admin")
    with pytest.raises(Exception):
        jwt.decode(token, "clave-equivocada", algorithms=[main.JWT_ALGORITHM])


def test_grupo_acepta_ano_lectivo_con_y_sin_enie_y_por_defecto_2026():
    assert main.GrupoSchema(nombre="Grado 1A", ano_lectivo=2027).ano_lectivo == 2027
    assert main.GrupoSchema(nombre="Grado 1A", **{"año_lectivo": 2028}).ano_lectivo == 2028
    assert main.GrupoSchema(nombre="Grado 1A").ano_lectivo == 2026


def test_calificacion_registra_solo_los_campos_enviados_para_actualizacion_parcial():
    c = main.CalificacionSchema(estudiante_id=1, materia_id=1, nota=4.3, entregado=False)
    assert {"estudiante_id", "materia_id", "nota", "entregado"} <= c.model_fields_set
    assert "periodo" not in c.model_fields_set
    assert "observacion" not in c.model_fields_set
    assert c.periodo == 1  # RN-08: periodo 1 por defecto al crear


def test_calificacion_entregado_es_opcional_para_compatibilidad_con_la_base_real():
    c = main.CalificacionSchema(estudiante_id=1, materia_id=1, nota=3.5)
    assert c.entregado is None


def test_columnas_editables_de_calificacion_son_una_lista_cerrada():
    assert set(main._COLUMNAS_EDITABLES_CALIFICACION) == {
        "estudiante_id", "materia_id", "actividad_id", "nota", "periodo", "observacion", "entregado",
    }


def test_columna_existe_consulta_una_sola_vez_y_guarda_el_resultado():
    main._COLUMNAS_OPCIONALES.pop(("tabla_prueba_unitaria", "col"), None)
    sesion = _ConsultaFalsa(existe=True)
    try:
        assert main.columna_existe(sesion, "tabla_prueba_unitaria", "col") is True
        assert main.columna_existe(sesion, "tabla_prueba_unitaria", "col") is True
        assert sesion.consultas == 1
    finally:
        main._COLUMNAS_OPCIONALES.pop(("tabla_prueba_unitaria", "col"), None)


def test_rutas_privadas_y_de_administracion_estan_declaradas():
    assert "/calificaciones" in main.PRIVATE_PREFIXES
    assert "/alertas" in main.PRIVATE_PREFIXES
    assert set(main.ADMIN_PREFIXES) <= set(main.PRIVATE_PREFIXES)
    assert "/usuarios" in main.ADMIN_PREFIXES
