"""H-31, H-33 y H-02: conservación de observaciones y periodos, y estado «Entregado»."""
from sqlalchemy import text

import main


def _fila(db, cal_id):
    return db.execute(text("SELECT * FROM calificaciones WHERE id = :id"), {"id": cal_id}).mappings().first()


def _payload_sin_periodo_ni_observacion(fila, nota):
    # Lo que envía la pantalla Calificaciones cuando el docente solo cambia la nota.
    return {"estudiante_id": fila["estudiante_id"], "materia_id": fila["materia_id"],
            "actividad_id": fila["actividad_id"], "nota": nota}


def test_h33_put_sin_periodo_conserva_el_periodo(client, docente_headers, db):
    original = _fila(db, 30)  # estudiante 1, actividad 1, periodo 2 en los datos demo
    assert original["periodo"] == 2
    r = client.put("/calificaciones/30", json=_payload_sin_periodo_ni_observacion(original, 4.7), headers=docente_headers)
    assert r.status_code == 200
    despues = _fila(db, 30)
    assert float(despues["nota"]) == 4.7
    assert despues["periodo"] == 2, "El periodo no debe volver a 1"


def test_h31_put_sin_observacion_conserva_la_observacion(client, docente_headers, db):
    original = _fila(db, 30)
    assert original["observacion"] == "Mantiene el alto nivel en el 2° periodo"
    client.put("/calificaciones/30", json=_payload_sin_periodo_ni_observacion(original, 4.6), headers=docente_headers)
    assert _fila(db, 30)["observacion"] == "Mantiene el alto nivel en el 2° periodo"


def test_h31_put_solo_cambia_los_campos_enviados(client, docente_headers, db):
    original = _fila(db, 31)
    client.put("/calificaciones/31", json=_payload_sin_periodo_ni_observacion(original, 3.9), headers=docente_headers)
    despues = _fila(db, 31)
    for campo in ("estudiante_id", "materia_id", "actividad_id", "periodo", "observacion", "fecha_registro"):
        assert despues[campo] == original[campo], campo


def test_h31_entregado_se_guarda_y_se_lee(client, docente_headers, db):
    original = _fila(db, 30)
    assert original["entregado"] is True  # la migración deja TRUE en las notas existentes
    payload = {**_payload_sin_periodo_ni_observacion(original, float(original["nota"])), "entregado": False}
    assert client.put("/calificaciones/30", json=payload, headers=docente_headers).status_code == 200
    listado = client.get("/calificaciones?actividad_id=1", headers=docente_headers).json()
    assert next(c for c in listado if c["id"] == 30)["entregado"] is False
    assert _fila(db, 30)["observacion"] == original["observacion"]


def test_h31_post_guarda_entregado_y_respeta_el_periodo_por_defecto(client, docente_headers, db):
    r = client.post("/calificaciones", json={"estudiante_id": 3, "materia_id": 1, "actividad_id": 1, "nota": 4.2, "entregado": False},
                    headers=docente_headers)
    assert r.status_code == 201
    nueva = r.json()
    assert nueva["entregado"] is False
    assert nueva["periodo"] == 1  # RN-08 sin cambios
    assert nueva["observacion"] is None


def test_put_explicito_de_periodo_y_observacion_sigue_funcionando(client, docente_headers, db):
    original = _fila(db, 31)
    payload = {**_payload_sin_periodo_ni_observacion(original, 3.5), "periodo": 3, "observacion": "Comentario nuevo"}
    client.put("/calificaciones/31", json=payload, headers=docente_headers)
    despues = _fila(db, 31)
    assert despues["periodo"] == 3 and despues["observacion"] == "Comentario nuevo"


def test_compatibilidad_base_sin_migracion(client, docente_headers, db, monkeypatch):
    """Simula la base real (sin la columna `entregado`): el backend debe ignorar el campo."""
    monkeypatch.setitem(main._COLUMNAS_OPCIONALES, ("calificaciones", "entregado"), False)
    original = _fila(db, 30)
    payload = {**_payload_sin_periodo_ni_observacion(original, 4.5), "entregado": False}
    assert client.put("/calificaciones/30", json=payload, headers=docente_headers).status_code == 200
    assert _fila(db, 30)["entregado"] is True  # no se tocó la columna
    r = client.post("/calificaciones", json={"estudiante_id": 3, "materia_id": 1, "actividad_id": 1, "nota": 4.0, "entregado": False},
                    headers=docente_headers)
    assert r.status_code == 201


def test_put_de_calificacion_inexistente_responde_404(client, docente_headers):
    r = client.put("/calificaciones/999999", json={"estudiante_id": 1, "materia_id": 1, "nota": 4.0}, headers=docente_headers)
    assert r.status_code == 404
