package com.oracle.flightontime.service;

import com.oracle.flightontime.dto.PredictionRequestDTO;
import com.oracle.flightontime.dto.PredictionResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * ============================================================================
 * SERVICIO DE PREDICCIÓN POR LOTE (BATCH)
 * ============================================================================
 * Procesa archivos CSV con múltiples vuelos y genera predicciones para cada uno.
 * ============================================================================
 */
@Service
public class BatchPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(BatchPredictionService.class);
    private final PredictionService predictionService;

    public BatchPredictionService(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * Procesa un archivo CSV y genera predicciones para cada vuelo usando el modelo ML real
     * NOTA: No usa @Transactional a nivel de método para evitar conflictos de transacciones.
     * Cada predicción individual maneja su propia transacción.
     */
    public List<Map<String, Object>> processBatchPrediction(MultipartFile file) {
        return processBatchPrediction(file, null);
    }

    /**
     * Procesa un archivo CSV y genera predicciones para cada vuelo usando el modelo ML real
     * @param file Archivo CSV a procesar
     * @param batchId ID único del lote para agrupar todas las predicciones
     * NOTA: No usa @Transactional a nivel de método para evitar conflictos de transacciones.
     * Cada predicción individual maneja su propia transacción.
     */
    public List<Map<String, Object>> processBatchPrediction(MultipartFile file, String batchId) {
        logger.info("📦 Procesando archivo CSV: {} (tamaño: {} bytes)", 
                   file.getOriginalFilename(), file.getSize());

        List<Map<String, Object>> resultados = new ArrayList<>();
        List<String> errores = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // Leer encabezados
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("El archivo CSV está vacío");
            }

            // Validar encabezados esperados
            String[] headers = parseCSVLine(headerLine);
            Map<String, Integer> headerMap = new HashMap<>();
            logger.debug("📋 Headers parseados: {}", Arrays.toString(headers));
            for (int i = 0; i < headers.length; i++) {
                String headerName = headers[i].trim().toLowerCase();
                // Eliminar comillas dobles si están presentes
                if (headerName.startsWith("\"") && headerName.endsWith("\"")) {
                    headerName = headerName.substring(1, headerName.length() - 1);
                }
                // Eliminar BOM (Byte Order Mark) y otros caracteres invisibles
                headerName = headerName.replaceAll("^\\uFEFF", ""); // UTF-8 BOM
                headerName = headerName.replaceAll("^[\\u200B-\\u200D\\uFEFF]", ""); // Varios tipos de caracteres invisibles
                headerName = headerName.trim(); // Trim adicional después de eliminar BOM
                logger.debug("📋 Header[{}] = '{}' (normalizado: '{}')", i, headers[i], headerName);
                headerMap.put(headerName, i);
            }
            logger.debug("📋 HeaderMap: {}", headerMap.keySet());

            // Validar que existan las columnas requeridas
            if (!headerMap.containsKey("aerolinea") || 
                !headerMap.containsKey("origen") || 
                !headerMap.containsKey("destino")) {
                logger.error("❌ Columnas requeridas no encontradas. Headers disponibles: {}", headerMap.keySet());
                throw new IllegalArgumentException(
                    "El CSV debe contener las columnas: aerolinea, origen, destino. " +
                    "Opcionalmente: fecha_partida, distancia_km. Headers encontrados: " + headerMap.keySet());
            }

            // Procesar cada línea
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] values = parseCSVLine(line);
                    
                    // Crear DTO de solicitud
                    PredictionRequestDTO request = new PredictionRequestDTO();
                    String aerolineaValue = getValue(values, headerMap, "aerolinea", lineNumber);
                    // Normalizar a mayúsculas y validar
                    if (aerolineaValue != null) {
                        aerolineaValue = aerolineaValue.toUpperCase().trim();
                    }
                    request.setAerolinea(aerolineaValue);
                    request.setOrigen(getValue(values, headerMap, "origen", lineNumber).toUpperCase());
                    request.setDestino(getValue(values, headerMap, "destino", lineNumber).toUpperCase());
                    
                    // Campos opcionales
                    String fechaPartida = getValueOptional(values, headerMap, "fecha_partida");
                    if (fechaPartida != null && !fechaPartida.isEmpty()) {
                        request.setFechaPartida(fechaPartida);
                    }

                    // Generar predicción usando el modelo ML real con batch_id
                    PredictionResponseDTO response = predictionService.predict(request, batchId);

                    // Construir resultado
                    Map<String, Object> resultado = new HashMap<>();
                    resultado.put("linea", lineNumber);
                    resultado.put("aerolinea", request.getAerolinea());
                    resultado.put("origen", request.getOrigen());
                    resultado.put("destino", request.getDestino());
                    resultado.put("fecha_partida", request.getFechaPartida());
                    resultado.put("distancia_km", response.getDistanciaKm());
                    resultado.put("prediccion", response.getPrediccion());
                    resultado.put("prevision", response.getPrediccion() == 1 ? "Retrasado" : "Puntual");
                    resultado.put("probabilidad_retraso", response.getProbabilidadRetraso());
                    resultado.put("confianza", response.getConfianza());
                    resultado.put("fecha_prediccion", LocalDateTime.now().toString());
                    resultado.put("batch_id", batchId);

                    resultados.add(resultado);

                } catch (Exception e) {
                    logger.warn("⚠️ Error procesando línea {}: {}", lineNumber, e.getMessage());
                    Map<String, Object> error = new HashMap<>();
                    error.put("linea", lineNumber);
                    error.put("error", e.getMessage());
                    error.put("datos", line);
                    errores.add("Línea " + lineNumber + ": " + e.getMessage());
                }
            }

            logger.info("✅ Procesadas {} líneas, {} exitosas, {} errores", 
                       lineNumber - 1, resultados.size(), errores.size());

        } catch (Exception e) {
            logger.error("❌ Error al procesar archivo CSV: {}", e.getMessage(), e);
            throw new RuntimeException("Error al procesar archivo CSV: " + e.getMessage(), e);
        }

        // Agregar resumen al resultado
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("total_procesadas", resultados.size());
        resumen.put("total_errores", errores.size());
        resumen.put("errores", errores);

        // El primer elemento será el resumen si hay errores
        if (!errores.isEmpty()) {
            Map<String, Object> resultadoConErrores = new HashMap<>();
            resultadoConErrores.put("resumen", resumen);
            resultadoConErrores.put("resultados", resultados);
            return Arrays.asList(resultadoConErrores);
        }

        return resultados;
    }

    /**
     * Parsea una línea CSV, manejando valores entre comillas
     */
    private String[] parseCSVLine(String line) {
        List<String> values = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder currentValue = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                values.add(currentValue.toString().trim());
                currentValue = new StringBuilder();
            } else {
                currentValue.append(c);
            }
        }
        values.add(currentValue.toString().trim());

        return values.toArray(new String[0]);
    }

    /**
     * Obtiene un valor requerido del CSV
     */
    private String getValue(String[] values, Map<String, Integer> headerMap, 
                           String columnName, int lineNumber) {
        Integer index = headerMap.get(columnName.toLowerCase());
        if (index == null || index >= values.length) {
            throw new IllegalArgumentException(
                String.format("Columna '%s' no encontrada o sin valor en línea %d", 
                            columnName, lineNumber));
        }
        String value = values[index].trim();
        if (value.isEmpty()) {
            throw new IllegalArgumentException(
                String.format("Columna '%s' está vacía en línea %d", columnName, lineNumber));
        }
        return value;
    }

    /**
     * Obtiene un valor opcional del CSV
     */
    private String getValueOptional(String[] values, Map<String, Integer> headerMap, 
                                   String columnName) {
        Integer index = headerMap.get(columnName.toLowerCase());
        if (index == null || index >= values.length) {
            return null;
        }
        String value = values[index].trim();
        return value.isEmpty() ? null : value;
    }
}

