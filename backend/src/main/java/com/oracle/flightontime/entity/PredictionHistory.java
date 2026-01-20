package com.oracle.flightontime.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * ENTIDAD JPA - HISTORIAL DE PREDICCIONES
 * ============================================================================
 * Representa una predicción almacenada en la base de datos PostgreSQL.
 * Almacena tanto los datos de entrada como los resultados de la predicción.
 * ============================================================================
 */
@Entity
@Table(name = "prediction_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionHistory {

    /**
     * ID único autoincremental
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Código de aerolínea
     */
    @Column(name = "aerolinea", nullable = false, length = 50)
    private String aerolinea;

    /**
     * Código IATA del aeropuerto de origen
     */
    @Column(name = "origen", nullable = false, length = 3)
    private String origen;

    /**
     * Código IATA del aeropuerto de destino
     */
    @Column(name = "destino", nullable = false, length = 3)
    private String destino;

    /**
     * Fecha y hora de partida del vuelo
     */
    @Column(name = "fecha_partida")
    private String fechaPartida;

    /**
     * Distancia del vuelo en kilómetros
     */
    @Column(name = "distancia_km")
    private Double distanciaKm;

    /**
     * Predicción: 0 = Puntual, 1 = Retrasado
     */
    @Column(name = "prediccion", nullable = false)
    private Integer prediccion;

    /**
     * Texto descriptivo de la predicción
     */
    @Column(name = "prevision", length = 50)
    private String prevision;

    /**
     * Probabilidad de retraso (0.0 a 1.0)
     */
    @Column(name = "probabilidad", nullable = false)
    private Double probabilidad;

    /**
     * Nivel de confianza de la predicción (0.0 a 1.0)
     */
    @Column(name = "confianza")
    private Double confianza;

    /**
     * Timestamp automático de cuando se realizó la predicción
     */
    @Column(name = "fecha_prediccion", nullable = false, updatable = false)
    private LocalDateTime fechaPrediccion;

    /**
     * ID único del lote (batch) para agrupar predicciones procesadas juntas
     */
    @Column(name = "batch_id", length = 100)
    private String batchId;

    /**
     * Pre-persist: Establecer fecha de predicción automáticamente
     */
    @PrePersist
    protected void onCreate() {
        if (fechaPrediccion == null) {
            fechaPrediccion = LocalDateTime.now();
        }
        // Establecer texto de previsión basado en predicción numérica
        if (prevision == null && prediccion != null) {
            prevision = prediccion == 1 ? "Retrasado" : "Puntual";
        }
    }
}

