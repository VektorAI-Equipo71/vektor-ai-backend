package com.oracle.flightontime.service;

import com.oracle.flightontime.config.AirlineConfig;
import com.oracle.flightontime.dto.PredictionRequestDTO;
import com.oracle.flightontime.dto.PredictionResponseDTO;
import com.oracle.flightontime.entity.PredictionHistory;
import com.oracle.flightontime.repository.PredictionHistoryRepository;
import com.oracle.flightontime.util.GeoUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import io.github.resilience4j.reactor.retry.RetryOperator;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

import java.time.Duration;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * ============================================================================
 * SERVICIO DE PREDICCIÓN - ORQUESTADOR EMPRESARIAL
 * ============================================================================
 * Este servicio actúa como orquestador entre el frontend y el servicio ML.
 * Realiza predicciones usando el modelo ML real.
 * ============================================================================
 */
@Service
public class PredictionService {

    private static final Logger logger = LoggerFactory.getLogger(PredictionService.class);

    private final WebClient webClient;
    private final PredictionHistoryRepository predictionHistoryRepository;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final RetryRegistry retryRegistry;
    private final MeterRegistry meterRegistry;

    // AL-003: Métricas personalizadas
    private final Counter predictionsTotal;
    private final Counter predictionsPuntual;
    private final Counter predictionsRetrasado;
    private final Counter predictionsErrors;
    private final Timer predictionDuration;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @Value("${ml.service.timeout:10}")
    private int mlServiceTimeout;

    public PredictionService(WebClient.Builder webClientBuilder, 
                             PredictionHistoryRepository predictionHistoryRepository,
                             CircuitBreakerRegistry circuitBreakerRegistry,
                             RetryRegistry retryRegistry,
                             MeterRegistry meterRegistry) {
        this.webClient = webClientBuilder.build();
        this.predictionHistoryRepository = predictionHistoryRepository;
        this.circuitBreakerRegistry = circuitBreakerRegistry;
        this.retryRegistry = retryRegistry;
        this.meterRegistry = meterRegistry;

        // AL-003: Inicializar métricas personalizadas
        this.predictionsTotal = Counter.builder("flightontime.predictions.total")
                .description("Total de predicciones realizadas")
                .register(meterRegistry);
        
        this.predictionsPuntual = Counter.builder("flightontime.predictions.puntual")
                .description("Predicciones de vuelos puntuales")
                .tag("prediccion", "puntual")
                .register(meterRegistry);
        
        this.predictionsRetrasado = Counter.builder("flightontime.predictions.retrasado")
                .description("Predicciones de vuelos retrasados")
                .tag("prediccion", "retrasado")
                .register(meterRegistry);
        
        this.predictionsErrors = Counter.builder("flightontime.predictions.errors")
                .description("Errores en predicciones")
                .register(meterRegistry);
        
        this.predictionDuration = Timer.builder("flightontime.predictions.duration")
                .description("Duración de las predicciones en segundos")
                .register(meterRegistry);
    }

    /**
     * ========================================================================
     * VALIDACIÓN DE DATOS DE ENTRADA
     * ========================================================================
     * Valida que la aerolínea, origen y destino existan en la base de datos.
     * Lanza excepción con mensaje específico si algún dato no es válido.
     * ========================================================================
     */
    private void validarDatosEntrada(PredictionRequestDTO request) {
        String aerolinea = request.getAerolinea().toUpperCase(); // Normalizar a mayúsculas
        String origen = request.getOrigen();
        String destino = request.getDestino();

        // Validar que origen y destino no sean iguales
        if (origen != null && origen.equals(destino)) {
            logger.warn("⚠️ Origen y destino son iguales: {}", origen);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El aeropuerto de origen y destino no pueden ser el mismo.");
        }

        // Validar que la aerolínea exista
        // Convertir a mayúsculas para normalizar
        aerolinea = aerolinea.toUpperCase();
        
        if (!AirlineConfig.esAerolineaValida(aerolinea)) {
            logger.warn("⚠️ Aerolínea no válida: {}", aerolinea);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aerolínea no válida. Códigos válidos: 9E, AA, AS, B6, DL, F9, G4, HA, MQ, NK, OH, OO, UA, WN, YX");
        }

        // Validar aeropuerto de origen
        if (!AirlineConfig.esAeropuertoValido(aerolinea, origen)) {
            logger.warn("⚠️ Aeropuerto de origen {} no disponible para aerolínea {}", 
                       origen, AirlineConfig.getNombreAerolinea(aerolinea));
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("El aeropuerto de origen %s no está disponible para %s",
                                origen, AirlineConfig.getNombreAerolinea(aerolinea)));
        }

        // Validar aeropuerto de destino
        if (!AirlineConfig.esAeropuertoValido(aerolinea, destino)) {
            logger.warn("⚠️ Aeropuerto de destino {} no disponible para aerolínea {}", 
                       destino, AirlineConfig.getNombreAerolinea(aerolinea));
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("El aeropuerto de destino %s no está disponible para %s",
                                destino, AirlineConfig.getNombreAerolinea(aerolinea)));
        }

        logger.info("✅ Validación exitosa: {} {} → {}",
                AirlineConfig.getNombreAerolinea(aerolinea), origen, destino);
    }


    /**
     * ========================================================================
     * PREDICCIÓN CON MODELO ML
     * ========================================================================
     * Realiza una llamada HTTP al servicio ML Python para obtener la predicción
     * basada en el modelo entrenado y datos meteorológicos actuales.
     * ========================================================================
     */
    private PredictionResponseDTO predictReal(PredictionRequestDTO request) {
        logger.info("🚀 Ejecutando predicción con modelo ML");
        logger.info("📋 Request: {} {} → {}", request.getAerolinea(), request.getOrigen(), request.getDestino());

        // Validar datos de entrada
        validarDatosEntrada(request);

        long startTime = System.currentTimeMillis();

        // Construir URL del endpoint ML
        String mlEndpoint = mlServiceUrl + "/predict_internal";
        logger.info("🔗 Llamando a ML Service: {}", mlEndpoint);

        try {
            // AL-001: Circuit Breaker y Retry con Resilience4j
            var circuitBreaker = circuitBreakerRegistry.circuitBreaker("mlService");
            var retry = retryRegistry.retry("mlService");
            
            // Realizar llamada HTTP POST al servicio ML con Circuit Breaker y Retry
            Mono<PredictionResponseDTO> responseMono = webClient.post()
                    .uri(mlEndpoint)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), 
                            clientResponse -> {
                                logger.error("❌ Error HTTP {} del servicio ML: {}", 
                                        clientResponse.statusCode(), clientResponse.statusCode());
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(body -> {
                                            logger.error("❌ Respuesta del servicio ML: {}", body);
                                            return Mono.error(new ResponseStatusException(
                                                    HttpStatus.BAD_GATEWAY,
                                                    "Error del servicio ML: " + body));
                                        });
                            })
                    .bodyToMono(PredictionResponseDTO.class)
                    .timeout(Duration.ofSeconds(mlServiceTimeout))
                    .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
                    .transformDeferred(RetryOperator.of(retry))
                    .doOnError(error -> {
                        if (error instanceof java.util.concurrent.TimeoutException) {
                            logger.error("❌ Timeout al llamar al servicio ML después de {} segundos", mlServiceTimeout);
                        } else {
                            logger.error("❌ Error al llamar al servicio ML: {}", error.getMessage());
                        }
                    });
            
            PredictionResponseDTO response = responseMono.block();

            long duration = System.currentTimeMillis() - startTime;

            if (response == null) {
                logger.error("❌ El servicio ML devolvió una respuesta nula");
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "El servicio ML no devolvió una respuesta válida");
            }

            // Agregar tiempo de respuesta y enriquecer metadata con información completa
            if (response.getMetadata() == null) {
                response.setMetadata(new HashMap<>());
            }
            response.getMetadata().put("tiempo_respuesta_ms", duration);
            
            // Agregar nombre completo de la aerolínea
            String nombreAerolinea = AirlineConfig.getNombreAerolinea(request.getAerolinea());
            response.getMetadata().put("aerolinea_nombre", nombreAerolinea);
            
            // Agregar información completa de aeropuertos (nombre y ciudad)
            String origenNombre = GeoUtils.getAirportName(request.getOrigen());
            String origenCiudad = GeoUtils.getAirportCity(request.getOrigen());
            if (origenNombre != null) {
                response.getMetadata().put("origen_nombre", origenNombre);
            }
            if (origenCiudad != null) {
                response.getMetadata().put("origen_ciudad", origenCiudad);
            }
            
            String destinoNombre = GeoUtils.getAirportName(request.getDestino());
            String destinoCiudad = GeoUtils.getAirportCity(request.getDestino());
            if (destinoNombre != null) {
                response.getMetadata().put("destino_nombre", destinoNombre);
            }
            if (destinoCiudad != null) {
                response.getMetadata().put("destino_ciudad", destinoCiudad);
            }

            logger.info("✅ Predicción ML: {} (Probabilidad retraso: {}%) - Tiempo: {}ms",
                    response.getPrediccion(),
                    response.getProbabilidadRetraso() * 100,
                    duration);

            return response;

        } catch (ResponseStatusException e) {
            // Re-lanzar excepciones de estado HTTP
            throw e;
        } catch (org.springframework.web.reactive.function.client.WebClientException e) {
            logger.error("❌ Error de conexión con el servicio ML: {}", e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo conectar con el servicio ML. Verifique que el servicio esté disponible.");
        } catch (Exception e) {
            logger.error("❌ Error inesperado al llamar al servicio ML: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error interno al procesar la predicción: " + e.getMessage());
        }
    }

    /**
     * ========================================================================
     * PREDICCIÓN PRINCIPAL
     * ========================================================================
     * Realiza la predicción usando el modelo ML real y guarda el resultado
     * en la base de datos para mantener un historial.
     * ========================================================================
     */
    @Transactional
    public PredictionResponseDTO predict(PredictionRequestDTO request) {
        return predict(request, null);
    }

    /**
     * ========================================================================
     * PREDICCIÓN PRINCIPAL CON BATCH ID
     * ========================================================================
     * Realiza la predicción usando el modelo ML real y guarda el resultado
     * en la base de datos con un batch_id opcional para agrupar predicciones.
     * 
     * Usa REQUIRES_NEW para crear una transacción independiente cuando se llama
     * desde procesamiento por lotes, evitando que errores en una predicción
     * afecten a las demás.
     * ========================================================================
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PredictionResponseDTO predict(PredictionRequestDTO request, String batchId) {
        // AL-003: Medir duración de la predicción
        try {
            return predictionDuration.recordCallable(() -> {
                try {
                    // Incrementar contador total de predicciones
                    predictionsTotal.increment();
                    
                    // Ejecutar predicción con el modelo ML real
                    PredictionResponseDTO response = predictReal(request);
                    
                    // AL-003: Registrar métricas según el resultado
                    if (response.getPrediccion() != null) {
                        if (response.getPrediccion() == 0) {
                            predictionsPuntual.increment();
                        } else if (response.getPrediccion() == 1) {
                            predictionsRetrasado.increment();
                        }
                    }
                    
                    // Registrar métricas adicionales con tags
                    meterRegistry.counter("flightontime.predictions.by_airline",
                            "airline", request.getAerolinea().toUpperCase()).increment();
                    meterRegistry.counter("flightontime.predictions.by_route",
                            "origin", request.getOrigen(),
                            "destination", request.getDestino()).increment();
                    
                    // Guardar predicción en la base de datos
                    savePredictionToDatabase(request, response, batchId);
                    
                    return response;
                } catch (ResponseStatusException e) {
                    // AL-003: Registrar error en métricas
                    predictionsErrors.increment();
                    meterRegistry.counter("flightontime.predictions.errors.by_type",
                            "error_type", e.getClass().getSimpleName()).increment();
                    throw e;
                } catch (Exception e) {
                    // AL-003: Registrar error en métricas
                    predictionsErrors.increment();
                    meterRegistry.counter("flightontime.predictions.errors.by_type",
                            "error_type", e.getClass().getSimpleName()).increment();
                    throw new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Error al procesar la predicción: " + e.getMessage());
                }
            });
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("❌ Error inesperado en predict: {}", e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error interno al procesar la predicción: " + e.getMessage());
        }
    }

    /**
     * ========================================================================
     * GUARDAR PREDICCIÓN EN BASE DE DATOS
     * ========================================================================
     * Persiste la predicción en PostgreSQL para mantener un historial.
     * El parámetro batchId es opcional y puede ser null para predicciones individuales.
     * ========================================================================
     */
    private void savePredictionToDatabase(PredictionRequestDTO request, PredictionResponseDTO response, String batchId) {
        try {
            // Calcular distancia si no está presente
            Double distanciaKm = response.getDistanciaKm();
            if (distanciaKm == null) {
                distanciaKm = GeoUtils.calcularDistancia(request.getOrigen(), request.getDestino());
                if (distanciaKm == null) {
                    distanciaKm = 0.0;
                }
            }

            // Crear entidad de historial
            PredictionHistory history = PredictionHistory.builder()
                    .aerolinea(request.getAerolinea())
                    .origen(request.getOrigen())
                    .destino(request.getDestino())
                    .fechaPartida(request.getFechaPartida())
                    .distanciaKm(distanciaKm)
                    .prediccion(response.getPrediccion())
                    .probabilidad(response.getProbabilidadRetraso())
                    .confianza(response.getConfianza())
                    .batchId(batchId)
                    .build();

            // Guardar en base de datos
            predictionHistoryRepository.save(history);
            logger.info("💾 Predicción guardada en BD con ID: {} (batch_id: {})", history.getId(), batchId);

        } catch (Exception e) {
            // No fallar la predicción si hay error al guardar en BD
            logger.error("❌ Error al guardar predicción en BD: {}", e.getMessage(), e);
        }
    }
}
