package com.oracle.flightontime.service;

import com.oracle.flightontime.entity.PredictionHistory;
import com.oracle.flightontime.repository.PredictionHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * ============================================================================
 * SERVICIO DE HISTORIAL DE PREDICCIONES
 * ============================================================================
 * Proporciona métodos para consultar el historial de predicciones con
 * paginación y filtros avanzados.
 * ============================================================================
 */
@Service
public class PredictionHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(PredictionHistoryService.class);
    private final PredictionHistoryRepository predictionHistoryRepository;

    public PredictionHistoryService(PredictionHistoryRepository predictionHistoryRepository) {
        this.predictionHistoryRepository = predictionHistoryRepository;
    }

    /**
     * Obtiene predicciones con paginación y filtros
     */
    @Transactional(readOnly = true)
    public Page<PredictionHistory> getPredictions(
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String aerolinea,
            String origen,
            String destino,
            Integer prediccion,
            String batchId,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        logger.info("📋 Consultando predicciones con filtros - página: {}, tamaño: {}", page, size);

        // Construir especificación de filtros
        Specification<PredictionHistory> spec = Specification.where(null);

        // Filtro por batch_id
        if (batchId != null && !batchId.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("batchId"), batchId));
        }

        // Filtro por rango de fechas
        if (fechaInicio != null && fechaFin != null) {
            LocalDateTime inicio = fechaInicio.atStartOfDay();
            LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
            spec = spec.and((root, query, cb) -> 
                cb.between(root.get("fechaPrediccion"), inicio, fin));
        } else if (fechaInicio != null) {
            LocalDateTime inicio = fechaInicio.atStartOfDay();
            spec = spec.and((root, query, cb) -> 
                cb.greaterThanOrEqualTo(root.get("fechaPrediccion"), inicio));
        } else if (fechaFin != null) {
            LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
            spec = spec.and((root, query, cb) -> 
                cb.lessThanOrEqualTo(root.get("fechaPrediccion"), fin));
        }

        // Filtro por aerolínea
        if (aerolinea != null && !aerolinea.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("aerolinea"), aerolinea));
        }

        // Filtro por origen
        if (origen != null && !origen.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("origen"), origen.toUpperCase()));
        }

        // Filtro por destino
        if (destino != null && !destino.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("destino"), destino.toUpperCase()));
        }

        // Filtro por predicción (0 = Puntual, 1 = Retrasado)
        if (prediccion != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("prediccion"), prediccion));
        }

        // Configurar ordenamiento
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, 
                           sortBy != null ? sortBy : "fechaPrediccion");

        // Crear Pageable
        Pageable pageable = PageRequest.of(page, size, sort);

        // Ejecutar consulta
        Page<PredictionHistory> result = predictionHistoryRepository.findAll(spec, pageable);

        logger.info("✅ Encontradas {} predicciones (página {} de {})", 
                   result.getTotalElements(), 
                   result.getNumber() + 1, 
                   result.getTotalPages());

        return result;
    }

    /**
     * Obtiene lista de aerolíneas únicas
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctAirlines() {
        return predictionHistoryRepository.findAll()
                .stream()
                .map(PredictionHistory::getAerolinea)
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Obtiene lista de aeropuertos únicos (origen)
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctOrigins() {
        return predictionHistoryRepository.findAll()
                .stream()
                .map(PredictionHistory::getOrigen)
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Obtiene lista de aeropuertos únicos (destino)
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctDestinations() {
        return predictionHistoryRepository.findAll()
                .stream()
                .map(PredictionHistory::getDestino)
                .distinct()
                .sorted()
                .toList();
    }
}

