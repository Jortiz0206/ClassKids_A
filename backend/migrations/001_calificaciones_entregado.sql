-- Migración 001 — Estado «Entregado» de cada calificación (hallazgo H-31, decisión D1).
--
-- Hasta ahora la interfaz guardaba la entrega escribiendo «Actividad entregada» en
-- calificaciones.observacion (lo que borraba la observación pedagógica) y, al recargar,
-- la deducía de que existiera la nota. Esta columna separa los dos datos.
--
-- Es una migración ADITIVA: no modifica ni borra datos. Las calificaciones existentes
-- quedan con entregado = TRUE, que es exactamente lo que la interfaz mostraba para ellas
-- (toda nota registrada se mostraba como entregada).
--
-- ESTADO: aplicada solo en la base de pruebas classkids_test (docker-compose.test.yml).
-- NO se ha aplicado a la base real classkids: requiere autorización expresa.
-- El backend funciona con y sin esta columna (la detecta al iniciar).

ALTER TABLE calificaciones
    ADD COLUMN IF NOT EXISTS entregado BOOLEAN NOT NULL DEFAULT TRUE;
