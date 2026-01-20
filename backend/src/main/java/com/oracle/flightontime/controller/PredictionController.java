package com.oracle.flightontime.controller;

import com.oracle.flightontime.dto.PredictionRequestDTO;
import com.oracle.flightontime.dto.PredictionResponseDTO;
import com.oracle.flightontime.entity.PredictionHistory;
import com.oracle.flightontime.service.BatchPredictionService;
import com.oracle.flightontime.service.PredictionHistoryService;
import com.oracle.flightontime.service.PredictionService;
import com.oracle.flightontime.service.StatsService;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * CONTROLADOR REST - PREDICCIÓN DE VUELOS
 * ============================================================================
 * Expone los endpoints HTTP para el sistema FlightOnTime.
 * Implementa validación de negocio y manejo de errores.
 * ============================================================================
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PredictionController {

    private static final Logger logger = LoggerFactory.getLogger(PredictionController.class);

    private final PredictionService predictionService;
    private final StatsService statsService;
    private final BatchPredictionService batchPredictionService;
    private final PredictionHistoryService predictionHistoryService;

    public PredictionController(PredictionService predictionService, 
                               StatsService statsService,
                               BatchPredictionService batchPredictionService,
                               PredictionHistoryService predictionHistoryService) {
        this.predictionService = predictionService;
        this.statsService = statsService;
        this.batchPredictionService = batchPredictionService;
        this.predictionHistoryService = predictionHistoryService;
    }

    /**
     * ========================================================================
     * ENDPOINT PRINCIPAL DE PREDICCIÓN
     * ========================================================================
     * POST /api/predict
     * 
     * Realiza predicción usando el modelo ML real
     * ========================================================================
     */
    @PostMapping("/predict")
    public ResponseEntity<PredictionResponseDTO> predict(
            @Valid @RequestBody PredictionRequestDTO request) {

        try {
            logger.info(" Recibida solicitud de predicción: {} {} → {}",
                    request.getAerolinea(),
                    request.getOrigen(),
                    request.getDestino());

            // Validación adicional de negocio
            if (request.getOrigen().equals(request.getDestino())) {
                logger.warn("Origen y destino son iguales: {}", request.getOrigen());
                return ResponseEntity.badRequest().build();
            }

            // Ejecutar predicción usando el modelo ML real
            PredictionResponseDTO response = predictionService.predict(request);

            logger.info("📤 Respuesta enviada: {} (confianza: {}%)",
                    response.getPrediccion(),
                    response.getConfianza() * 100);

            return ResponseEntity.ok(response);

        } catch (org.springframework.web.server.ResponseStatusException e) {
            // Error de validación de datos
            logger.warn("⚠️ Error de validación: {}", e.getReason());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getReason());
            errorResponse.put("status", e.getStatusCode().value());

            return ResponseEntity.status(e.getStatusCode()).body(
                    PredictionResponseDTO.builder()
                            .prediccion(-1)  // -1 indica error
                            .probabilidadRetraso(0.0)
                            .confianza(0.0)
                            .distanciaKm(0.0)
                            .metadata(errorResponse)
                            .build());
        } catch (Exception e) {
            logger.error("❌ Error en endpoint /predict: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ========================================================================
     * ENDPOINT DE SALUD
     * ========================================================================
     * GET /api/health
     * Verifica el estado del backend
     * ========================================================================
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "FlightOnTime Backend");
        health.put("version", "1.0.0");
        health.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(health);
    }

    /**
     * ========================================================================
     * ENDPOINT DE PREDICCIÓN POR LOTE (BATCH)
     * ========================================================================
     * POST /api/batch-predict
     * Procesa un archivo CSV con múltiples vuelos y genera predicciones.
     * 
     * Formato CSV esperado:
     *   aerolinea,origen,destino,fecha_partida,distancia_km
     *   1,ATL,JFK,2025-12-25T14:30:00,1200.5
     *   2,LAX,ORD,2025-12-26T10:00:00,1744.2
     * 
     * Columnas requeridas: aerolinea, origen, destino
     * Columnas opcionales: fecha_partida, distancia_km
     * 
     * Parámetros:
     *   - file: archivo CSV (multipart/form-data)
     * ========================================================================
     */
    @PostMapping("/batch-predict")
    public ResponseEntity<?> batchPredict(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "batch_id", required = false) String batchId) {
        
        try {
            // Validar archivo
            if (file.isEmpty()) {
                logger.warn("⚠️ Archivo CSV vacío recibido");
                return ResponseEntity.badRequest().body(
                    Map.of("error", "El archivo CSV está vacío"));
            }

            // Validar tipo de archivo
            String filename = file.getOriginalFilename();
            if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
                logger.warn("⚠️ Archivo no es CSV: {}", filename);
                return ResponseEntity.badRequest().body(
                    Map.of("error", "El archivo debe ser un CSV (.csv)"));
            }

            logger.info("📦 Procesando archivo CSV: {} ({} bytes)", filename, file.getSize());

            // Procesar batch usando el modelo ML real con batch_id
            List<Map<String, Object>> resultados = batchPredictionService.processBatchPrediction(file, batchId);

            logger.info("✅ Batch procesado exitosamente: {} predicciones generadas", resultados.size());

            return ResponseEntity.ok(Map.of(
                "total_predicciones", resultados.size(),
                "resultados", resultados
            ));

        } catch (IllegalArgumentException e) {
            logger.warn("⚠️ Error de validación en batch: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Error de validación",
                "mensaje", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("❌ Error al procesar batch: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Error al procesar archivo CSV",
                "mensaje", e.getMessage()
            ));
        }
    }

    /**
     * ========================================================================
     * ENDPOINT DE CONSULTA DE PREDICCIONES CON PAGINACIÓN
     * ========================================================================
     * GET /api/predictions
     * Retorna predicciones almacenadas con paginación y filtros.
     * 
     * Parámetros:
     *   - fechaInicio: fecha de inicio (formato: yyyy-MM-dd)
     *   - fechaFin: fecha de fin (formato: yyyy-MM-dd)
     *   - aerolinea: código de aerolínea
     *   - origen: código IATA del aeropuerto de origen
     *   - destino: código IATA del aeropuerto de destino
     *   - prediccion: 0 = Puntual, 1 = Retrasado
     *   - page: número de página (default: 0)
     *   - size: tamaño de página (default: 20)
     *   - sortBy: campo para ordenar (default: fechaPrediccion)
     *   - sortDir: dirección de ordenamiento (asc/desc, default: desc)
     * ========================================================================
     */
    @GetMapping("/predictions")
    public ResponseEntity<Map<String, Object>> getPredictions(
            @RequestParam(value = "fechaInicio", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(value = "fechaFin", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(value = "aerolinea", required = false) String aerolinea,
            @RequestParam(value = "origen", required = false) String origen,
            @RequestParam(value = "destino", required = false) String destino,
            @RequestParam(value = "prediccion", required = false) Integer prediccion,
            @RequestParam(value = "batchId", required = false) String batchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sortBy", defaultValue = "fechaPrediccion") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        
        try {
            logger.info("📋 Consultando predicciones - página: {}, tamaño: {}, batchId: {}", page, size, batchId);
            
            Page<PredictionHistory> result = predictionHistoryService.getPredictions(
                fechaInicio, fechaFin, aerolinea, origen, destino, prediccion, batchId,
                page, size, sortBy, sortDir);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", result.getContent());
            response.put("totalElements", result.getTotalElements());
            response.put("totalPages", result.getTotalPages());
            response.put("currentPage", result.getNumber());
            response.put("pageSize", result.getSize());
            response.put("hasNext", result.hasNext());
            response.put("hasPrevious", result.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error al consultar predicciones: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al consultar predicciones");
            error.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * ========================================================================
     * ENDPOINT PARA OBTENER OPCIONES DE FILTROS
     * ========================================================================
     * GET /api/predictions/filters
     * Retorna listas de valores únicos para los filtros
     * ========================================================================
     */
    @GetMapping("/predictions/filters")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        try {
            Map<String, Object> filters = new HashMap<>();
            filters.put("aerolineas", predictionHistoryService.getDistinctAirlines());
            filters.put("origenes", predictionHistoryService.getDistinctOrigins());
            filters.put("destinos", predictionHistoryService.getDistinctDestinations());
            return ResponseEntity.ok(filters);
        } catch (Exception e) {
            logger.error("❌ Error al obtener opciones de filtros: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ========================================================================
     * ENDPOINT DE ESTADÍSTICAS
     * ========================================================================
     * GET /api/stats
     * Retorna estadísticas agregadas de las predicciones almacenadas.
     * Parámetros opcionales:
     *   - inicio: fecha de inicio (formato: yyyy-MM-dd)
     *   - fin: fecha de fin (formato: yyyy-MM-dd)
     * Si no se proporcionan fechas, retorna estadísticas del día actual.
     * ========================================================================
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(value = "inicio", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(value = "fin", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(value = "batchId", required = false) String batchId) {
        
        try {
            logger.info("📊 Solicitud de estadísticas recibida, batchId: {}", batchId);
            
            Map<String, Object> stats;
            if (batchId != null && !batchId.isEmpty()) {
                logger.info("📦 Estadísticas filtradas por batchId: {}", batchId);
                stats = statsService.getStatsByBatchId(batchId);
            } else if (inicio != null && fin != null) {
                logger.info("📅 Rango de fechas: {} a {}", inicio, fin);
                stats = statsService.getStatsByDateRange(inicio, fin);
            } else {
                logger.info("📅 Estadísticas del día actual");
                stats = statsService.getStatsToday();
            }
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("❌ Error al obtener estadísticas: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al calcular estadísticas");
            error.put("mensaje", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * ========================================================================
     * ENDPOINT DE DOCUMENTACIÓN
     * ========================================================================
     * GET /api/docs
     * Retorna información sobre los endpoints disponibles
     * ========================================================================
     */
    @GetMapping("/docs")
    public ResponseEntity<Map<String, Object>> docs() {
        Map<String, Object> docs = new HashMap<>();
        docs.put("servicio", "FlightOnTime API");
        docs.put("version", "1.0.0");

        Map<String, Object> endpoints = new HashMap<>();

        // Documentar endpoint de predicción
        Map<String, Object> predictEndpoint = new HashMap<>();
        predictEndpoint.put("metodo", "POST");
        predictEndpoint.put("url", "/api/predict");
        predictEndpoint.put("descripcion", "Predice si un vuelo será puntual o retrasado usando el modelo ML real");
        predictEndpoint.put("body_ejemplo", Map.of(
                "aerolinea", "DL",
                "origen", "GRU",
                "destino", "JFK",
                "fecha_partida", "2025-12-25T14:30:00"));

        endpoints.put("predict", predictEndpoint);

        // Documentar endpoint de salud
        Map<String, Object> healthEndpoint = new HashMap<>();
        healthEndpoint.put("metodo", "GET");
        healthEndpoint.put("url", "/api/health");
        healthEndpoint.put("descripcion", "Verifica el estado del servicio");

        endpoints.put("health", healthEndpoint);

        docs.put("endpoints", endpoints);

        return ResponseEntity.ok(docs);
    }

    /**
     * ========================================================================
     * MANEJO DE ERRORES DE VALIDACIÓN
     * ========================================================================
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {

        Map<String, Object> errors = new HashMap<>();
        errors.put("error", "Validación fallida");

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

        errors.put("campos", fieldErrors);

        logger.warn("⚠️ Error de validación: {}", fieldErrors);

        return ResponseEntity.badRequest().body(errors);
    }
}
