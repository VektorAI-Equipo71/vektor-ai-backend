-- ============================================================================
-- SCHEMA SQL - HISTORIAL DE PREDICCIONES
-- ============================================================================
-- Script para crear la tabla de historial de predicciones en PostgreSQL
-- ============================================================================

-- Crear tabla de historial de predicciones
CREATE TABLE IF NOT EXISTS prediction_history (
    id BIGSERIAL PRIMARY KEY,
    aerolinea VARCHAR(50) NOT NULL,
    origen VARCHAR(3) NOT NULL,
    destino VARCHAR(3) NOT NULL,
    fecha_partida VARCHAR(50),
    distancia_km DOUBLE PRECISION,
    prediccion INTEGER NOT NULL,
    prevision VARCHAR(50),
    probabilidad DOUBLE PRECISION NOT NULL,
    confianza DOUBLE PRECISION,
    fecha_prediccion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_id VARCHAR(100)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_prediction_history_fecha_prediccion 
    ON prediction_history(fecha_prediccion);

CREATE INDEX IF NOT EXISTS idx_prediction_history_aerolinea 
    ON prediction_history(aerolinea);

CREATE INDEX IF NOT EXISTS idx_prediction_history_origen 
    ON prediction_history(origen);

CREATE INDEX IF NOT EXISTS idx_prediction_history_destino 
    ON prediction_history(destino);

CREATE INDEX IF NOT EXISTS idx_prediction_history_prediccion 
    ON prediction_history(prediccion);

CREATE INDEX IF NOT EXISTS idx_prediction_history_batch_id 
    ON prediction_history(batch_id);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE prediction_history IS 'Historial de todas las predicciones realizadas por el sistema';
COMMENT ON COLUMN prediction_history.id IS 'ID único autoincremental';
COMMENT ON COLUMN prediction_history.aerolinea IS 'Código de aerolínea';
COMMENT ON COLUMN prediction_history.origen IS 'Código IATA del aeropuerto de origen';
COMMENT ON COLUMN prediction_history.destino IS 'Código IATA del aeropuerto de destino';
COMMENT ON COLUMN prediction_history.fecha_partida IS 'Fecha y hora de partida del vuelo';
COMMENT ON COLUMN prediction_history.distancia_km IS 'Distancia del vuelo en kilómetros';
COMMENT ON COLUMN prediction_history.prediccion IS 'Predicción: 0 = Puntual, 1 = Retrasado';
COMMENT ON COLUMN prediction_history.prevision IS 'Texto descriptivo de la predicción';
COMMENT ON COLUMN prediction_history.probabilidad IS 'Probabilidad de retraso (0.0 a 1.0)';
COMMENT ON COLUMN prediction_history.confianza IS 'Nivel de confianza de la predicción (0.0 a 1.0)';
COMMENT ON COLUMN prediction_history.fecha_prediccion IS 'Timestamp de cuando se realizó la predicción';
COMMENT ON COLUMN prediction_history.batch_id IS 'ID único del lote (batch) para agrupar predicciones procesadas juntas';

