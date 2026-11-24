#!/usr/bin/env bash
# Verificaciones de la API de ClassKids ejecutadas el 20/11/2026 (Docs/pruebas.md).
# Solo lectura: las peticiones que intentan crear datos inválidos son rechazadas por
# la base de datos y no guardan nada; DELETE se hace sobre un id inexistente.
# Uso: CK_DOCENTE_PASS=... bash verificacion-api.sh
B=${API:-http://127.0.0.1:8000}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
echo "P-SEG-01 sin token GET /estudiantes -> $(code $B/estudiantes)   (esperado 401)"
echo "P-SEG-02 token falso -> $(code -H 'Authorization: Bearer abc' $B/estudiantes)   (esperado 401)"
echo "P-AUT-02 contraseña incorrecta -> $(code -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"docente@classkids.local","password":"incorrecta"}')   (esperado 401)"
echo "P-AUT-03 correo inexistente -> $(code -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"noexiste@x.com","password":"x"}')   (esperado 401)"
T=$(curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"docente@classkids.local\",\"password\":\"$CK_DOCENTE_PASS\"}" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
H="Authorization: Bearer $T"
echo "P-AUT-01 login docente -> $([ -n "$T" ] && echo token recibido || echo FALLO)"
echo "P-SEG-03 docente GET /usuarios -> $(code -H "$H" $B/usuarios)   (esperado 403)"
echo "P-SEG-04 docente GET /grupos -> $(curl -s -H "$H" $B/grupos | grep -o '"id"' | wc -l) grupos visibles"
echo "P-SEG-05 docente GET /asignaciones -> $(code -H "$H" $B/asignaciones)"
echo "P-VAL-01 nota 7 -> $(code -X POST $B/calificaciones -H "$H" -H 'Content-Type: application/json' -d '{"estudiante_id":1,"materia_id":1,"nota":7}')   (esperado 422)"
echo "P-VAL-02 estudiante inexistente -> $(code -X POST $B/calificaciones -H "$H" -H 'Content-Type: application/json' -d '{"estudiante_id":999999,"materia_id":1,"nota":4}')   (esperado 404/422)"
echo "P-VAL-03 documento duplicado -> $(code -X POST $B/estudiantes -H "$H" -H 'Content-Type: application/json' -d '{"documento":"100101","nombre":"X","apellido":"Y","grupo_id":1}')   (esperado 409)"
echo "P-VAL-04 estado de alerta inválido -> $(code -X PUT $B/alertas/999999/estado -H "$H" -H 'Content-Type: application/json' -d '{"estado":"xyz"}')   (esperado 422)"
echo "P-VAL-05 DELETE estudiante inexistente -> $(code -X DELETE $B/estudiantes/999999 -H "$H")   (esperado 404)"
echo "P-SEG-06 /docs público -> $(code $B/docs)"
