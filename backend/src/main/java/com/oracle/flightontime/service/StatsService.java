package com.oracle.flightontime.service;

import com.oracle.flightontime.config.AirlineConfig;
import com.oracle.flightontime.repository.PredictionHistoryRepository;
import com.oracle.flightontime.util.GeoUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * ============================================================================
 * SERVICIO DE ESTADÍSTICAS
 * ============================================================================
 * Proporciona métodos para calcular estadísticas agregadas de las predicciones.
 * ============================================================================
 */
@Service
public class StatsService {

    private static final Logger logger = LoggerFactory.getLogger(StatsService.class);
    private final PredictionHistoryRepository predictionHistoryRepository;

    public StatsService(PredictionHistoryRepository predictionHistoryRepository) {
        this.predictionHistoryRepository = predictionHistoryRepository;
    }

    /**
     * Obtiene estadísticas agregadas del día actual
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatsToday() {
        LocalDate hoy = LocalDate.now();
        logger.info("📊 Calculando estadísticas para el día: {}", hoy);

        // Contar total de predicciones del día
        Long totalPredicciones = predictionHistoryRepository.countByFechaPrediccion(hoy);
        
        // Contar predicciones de vuelos retrasados del día
        Long totalRetrasados = predictionHistoryRepository.countRetrasadosByFechaPrediccion(hoy);
        
        // Calcular porcentaje de retrasados
        // Si no hay predicciones, no tiene sentido calcular porcentajes
        Double porcentajeRetrasados = null;
        Double porcentajePuntuales = null;
        if (totalPredicciones > 0) {
            porcentajeRetrasados = (totalRetrasados.doubleValue() / totalPredicciones.doubleValue()) * 100.0;
            porcentajeRetrasados = Math.round(porcentajeRetrasados * 100.0) / 100.0;
            porcentajePuntuales = 100.0 - porcentajeRetrasados;
            porcentajePuntuales = Math.round(porcentajePuntuales * 100.0) / 100.0;
        }

        // Obtener estadísticas por aerolínea
        List<Object[]> statsPorAerolinea = predictionHistoryRepository.getStatsByAerolinea(hoy);
        List<Map<String, Object>> aerolineas = new ArrayList<>();
        for (Object[] stat : statsPorAerolinea) {
            String codigoAerolinea = (String) stat[0];
            Map<String, Object> aerolineaStat = new HashMap<>();
            aerolineaStat.put("aerolinea", codigoAerolinea);
            // Agregar nombre completo de la aerolínea
            aerolineaStat.put("aerolinea_nombre", AirlineConfig.getNombreAerolinea(codigoAerolinea));
            aerolineaStat.put("total", ((Number) stat[1]).longValue());
            aerolineaStat.put("retrasados", ((Number) stat[2]).longValue());
            double probPromedio = ((Number) stat[3]).doubleValue();
            aerolineaStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            
            long totalAerolinea = ((Number) stat[1]).longValue();
            long retrasadosAerolinea = ((Number) stat[2]).longValue();
            double porcentajeAerolinea = totalAerolinea > 0 
                ? (retrasadosAerolinea * 100.0 / totalAerolinea) 
                : 0.0;
            aerolineaStat.put("porcentaje_retrasados", Math.round(porcentajeAerolinea * 100.0) / 100.0);
            
            aerolineas.add(aerolineaStat);
        }

        // Obtener estadísticas por aeropuerto de origen
        List<Object[]> statsPorOrigen = predictionHistoryRepository.getStatsByOrigen(hoy);
        List<Map<String, Object>> origenes = new ArrayList<>();
        for (Object[] stat : statsPorOrigen) {
            String codigoAeropuerto = (String) stat[0];
            Map<String, Object> origenStat = new HashMap<>();
            origenStat.put("aeropuerto", codigoAeropuerto);
            // Agregar información completa del aeropuerto
            String nombreAeropuerto = GeoUtils.getAirportName(codigoAeropuerto);
            String ciudadAeropuerto = GeoUtils.getAirportCity(codigoAeropuerto);
            origenStat.put("aeropuerto_nombre", nombreAeropuerto != null ? nombreAeropuerto : codigoAeropuerto);
            origenStat.put("aeropuerto_ciudad", ciudadAeropuerto != null ? ciudadAeropuerto : "");
            origenStat.put("total", ((Number) stat[1]).longValue());
            origenStat.put("retrasados", ((Number) stat[2]).longValue());
            double probPromedio = ((Number) stat[3]).doubleValue();
            origenStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            
            long totalOrigen = ((Number) stat[1]).longValue();
            long retrasadosOrigen = ((Number) stat[2]).longValue();
            double porcentajeOrigen = totalOrigen > 0 
                ? (retrasadosOrigen * 100.0 / totalOrigen) 
                : 0.0;
            origenStat.put("porcentaje_retrasados", Math.round(porcentajeOrigen * 100.0) / 100.0);
            
            origenes.add(origenStat);
        }

        // Construir respuesta
        Map<String, Object> stats = new HashMap<>();
        stats.put("fecha", hoy.toString());
        stats.put("total_predicciones", totalPredicciones);
        stats.put("total_retrasados", totalRetrasados);
        stats.put("total_puntuales", totalPredicciones - totalRetrasados);
        // Solo incluir porcentajes si hay predicciones
        if (porcentajeRetrasados != null) {
            stats.put("porcentaje_retrasados", porcentajeRetrasados);
            stats.put("porcentaje_puntuales", porcentajePuntuales);
        } else {
            stats.put("porcentaje_retrasados", null);
            stats.put("porcentaje_puntuales", null);
        }
        stats.put("estadisticas_por_aerolinea", aerolineas);
        stats.put("estadisticas_por_aeropuerto_origen", origenes);
        stats.put("timestamp", LocalDateTime.now().toString());

        logger.info("✅ Estadísticas calculadas: {} predicciones, {}% retrasados", 
                   totalPredicciones, porcentajeRetrasados);

        return stats;
    }

    /**
     * Obtiene estadísticas para un rango de fechas (similar a getStatsToday pero para un rango)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatsByDateRange(LocalDate inicio, LocalDate fin) {
        LocalDateTime inicioDateTime = inicio.atStartOfDay();
        LocalDateTime finDateTime = fin.atTime(LocalTime.MAX);
        
        logger.info("📊 Calculando estadísticas para el rango: {} a {}", inicio, fin);
        
        // Contar total de predicciones del rango
        Long totalPredicciones = predictionHistoryRepository.countByFechaPrediccionBetween(inicioDateTime, finDateTime);
        
        // Contar predicciones de vuelos retrasados del rango
        Long totalRetrasados = predictionHistoryRepository.countRetrasadosByFechaPrediccionBetween(inicioDateTime, finDateTime);
        
        // Calcular porcentaje de retrasados
        Double porcentajeRetrasados = null;
        Double porcentajePuntuales = null;
        if (totalPredicciones > 0) {
            porcentajeRetrasados = (totalRetrasados.doubleValue() / totalPredicciones.doubleValue()) * 100.0;
            porcentajeRetrasados = Math.round(porcentajeRetrasados * 100.0) / 100.0;
            porcentajePuntuales = 100.0 - porcentajeRetrasados;
            porcentajePuntuales = Math.round(porcentajePuntuales * 100.0) / 100.0;
        }
        
        // Obtener estadísticas por aerolínea para el rango
        List<Object[]> statsPorAerolinea = predictionHistoryRepository.getStatsByAerolineaBetween(inicioDateTime, finDateTime);
        List<Map<String, Object>> aerolineas = new ArrayList<>();
        for (Object[] stat : statsPorAerolinea) {
            String codigoAerolinea = (String) stat[0];
            Map<String, Object> aerolineaStat = new HashMap<>();
            aerolineaStat.put("aerolinea", codigoAerolinea);
            aerolineaStat.put("aerolinea_nombre", AirlineConfig.getNombreAerolinea(codigoAerolinea));
            aerolineaStat.put("total", ((Number) stat[1]).longValue());
            aerolineaStat.put("retrasados", ((Number) stat[2]).longValue());
            double probPromedio = ((Number) stat[3]).doubleValue();
            aerolineaStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            
            long totalAerolinea = ((Number) stat[1]).longValue();
            long retrasadosAerolinea = ((Number) stat[2]).longValue();
            double porcentajeAerolinea = totalAerolinea > 0 
                ? (retrasadosAerolinea * 100.0 / totalAerolinea) 
                : 0.0;
            aerolineaStat.put("porcentaje_retrasados", Math.round(porcentajeAerolinea * 100.0) / 100.0);
            
            aerolineas.add(aerolineaStat);
        }
        
        // Obtener estadísticas por aeropuerto de origen para el rango
        List<Object[]> statsPorOrigen = predictionHistoryRepository.getStatsByOrigenBetween(inicioDateTime, finDateTime);
        List<Map<String, Object>> origenes = new ArrayList<>();
        for (Object[] stat : statsPorOrigen) {
            String codigoAeropuerto = (String) stat[0];
            Map<String, Object> origenStat = new HashMap<>();
            origenStat.put("aeropuerto", codigoAeropuerto);
            String nombreAeropuerto = GeoUtils.getAirportName(codigoAeropuerto);
            String ciudadAeropuerto = GeoUtils.getAirportCity(codigoAeropuerto);
            origenStat.put("aeropuerto_nombre", nombreAeropuerto != null ? nombreAeropuerto : codigoAeropuerto);
            origenStat.put("aeropuerto_ciudad", ciudadAeropuerto != null ? ciudadAeropuerto : "");
            origenStat.put("total", ((Number) stat[1]).longValue());
            origenStat.put("retrasados", ((Number) stat[2]).longValue());
            double probPromedio = ((Number) stat[3]).doubleValue();
            origenStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            
            long totalOrigen = ((Number) stat[1]).longValue();
            long retrasadosOrigen = ((Number) stat[2]).longValue();
            double porcentajeOrigen = totalOrigen > 0 
                ? (retrasadosOrigen * 100.0 / totalOrigen) 
                : 0.0;
            origenStat.put("porcentaje_retrasados", Math.round(porcentajeOrigen * 100.0) / 100.0);
            
            origenes.add(origenStat);
        }
        
        // Construir respuesta
        Map<String, Object> stats = new HashMap<>();
        stats.put("fecha_inicio", inicio.toString());
        stats.put("fecha_fin", fin.toString());
        stats.put("total_predicciones", totalPredicciones);
        stats.put("total_retrasados", totalRetrasados);
        stats.put("total_puntuales", totalPredicciones - totalRetrasados);
        if (porcentajeRetrasados != null) {
            stats.put("porcentaje_retrasados", porcentajeRetrasados);
            stats.put("porcentaje_puntuales", porcentajePuntuales);
        } else {
            stats.put("porcentaje_retrasados", null);
            stats.put("porcentaje_puntuales", null);
        }
        stats.put("estadisticas_por_aerolinea", aerolineas);
        stats.put("estadisticas_por_aeropuerto_origen", origenes);
        stats.put("timestamp", LocalDateTime.now().toString());
        
        logger.info("✅ Estadísticas calculadas para rango: {} predicciones, {}% retrasados", 
                   totalPredicciones, porcentajeRetrasados);
        
        return stats;
    }

    /**
     * Obtiene estadísticas filtradas por batchId
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatsByBatchId(String batchId) {
        logger.info("📊 Calculando estadísticas para batchId: {}", batchId);

        // Obtener todas las predicciones del batch
        List<com.oracle.flightontime.entity.PredictionHistory> predictions = 
            predictionHistoryRepository.findByBatchId(batchId);

        if (predictions.isEmpty()) {
            logger.warn("⚠️ No se encontraron predicciones para batchId: {}", batchId);
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("batch_id", batchId);
            emptyStats.put("total_predicciones", 0L);
            emptyStats.put("total_retrasados", 0L);
            emptyStats.put("total_puntuales", 0L);
            emptyStats.put("porcentaje_retrasados", null);
            emptyStats.put("porcentaje_puntuales", null);
            emptyStats.put("estadisticas_por_aerolinea", new ArrayList<>());
            emptyStats.put("estadisticas_por_aeropuerto_origen", new ArrayList<>());
            emptyStats.put("timestamp", LocalDateTime.now().toString());
            return emptyStats;
        }

        // Calcular estadísticas básicas
        long totalPredicciones = predictions.size();
        long totalRetrasados = predictions.stream()
            .mapToLong(p -> p.getPrediccion() == 1 ? 1 : 0)
            .sum();
        long totalPuntuales = totalPredicciones - totalRetrasados;

        double porcentajeRetrasados = totalPredicciones > 0 
            ? Math.round((totalRetrasados * 100.0 / totalPredicciones) * 100.0) / 100.0
            : 0.0;
        double porcentajePuntuales = 100.0 - porcentajeRetrasados;

        // Estadísticas por aerolínea
        Map<String, Long> totalPorAerolinea = new HashMap<>();
        Map<String, Long> retrasadosPorAerolinea = new HashMap<>();
        Map<String, Double> probabilidadSumPorAerolinea = new HashMap<>();

        for (com.oracle.flightontime.entity.PredictionHistory p : predictions) {
            String aerolinea = p.getAerolinea();
            totalPorAerolinea.merge(aerolinea, 1L, Long::sum);
            if (p.getPrediccion() == 1) {
                retrasadosPorAerolinea.merge(aerolinea, 1L, Long::sum);
            }
            probabilidadSumPorAerolinea.merge(aerolinea, 
                (p.getProbabilidad() != null ? p.getProbabilidad() : 0.0), Double::sum);
        }

        List<Map<String, Object>> aerolineas = new ArrayList<>();
        for (String aerolinea : totalPorAerolinea.keySet()) {
            Map<String, Object> aerolineaStat = new HashMap<>();
            aerolineaStat.put("aerolinea", aerolinea);
            aerolineaStat.put("aerolinea_nombre", AirlineConfig.getNombreAerolinea(aerolinea));
            long total = totalPorAerolinea.get(aerolinea);
            long retrasados = retrasadosPorAerolinea.getOrDefault(aerolinea, 0L);
            double probPromedio = probabilidadSumPorAerolinea.get(aerolinea) / total;
            aerolineaStat.put("total", total);
            aerolineaStat.put("retrasados", retrasados);
            aerolineaStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            double porcentaje = total > 0 ? (retrasados * 100.0 / total) : 0.0;
            aerolineaStat.put("porcentaje_retrasados", Math.round(porcentaje * 100.0) / 100.0);
            aerolineas.add(aerolineaStat);
        }

        // Estadísticas por aeropuerto de origen
        Map<String, Long> totalPorOrigen = new HashMap<>();
        Map<String, Long> retrasadosPorOrigen = new HashMap<>();
        Map<String, Double> probabilidadSumPorOrigen = new HashMap<>();

        for (com.oracle.flightontime.entity.PredictionHistory p : predictions) {
            String origen = p.getOrigen();
            totalPorOrigen.merge(origen, 1L, Long::sum);
            if (p.getPrediccion() == 1) {
                retrasadosPorOrigen.merge(origen, 1L, Long::sum);
            }
            probabilidadSumPorOrigen.merge(origen, 
                (p.getProbabilidad() != null ? p.getProbabilidad() : 0.0), Double::sum);
        }

        List<Map<String, Object>> origenes = new ArrayList<>();
        for (String origen : totalPorOrigen.keySet()) {
            Map<String, Object> origenStat = new HashMap<>();
            origenStat.put("aeropuerto", origen);
            String nombreAeropuerto = GeoUtils.getAirportName(origen);
            String ciudadAeropuerto = GeoUtils.getAirportCity(origen);
            origenStat.put("aeropuerto_nombre", nombreAeropuerto != null ? nombreAeropuerto : origen);
            origenStat.put("aeropuerto_ciudad", ciudadAeropuerto != null ? ciudadAeropuerto : "");
            long total = totalPorOrigen.get(origen);
            long retrasados = retrasadosPorOrigen.getOrDefault(origen, 0L);
            double probPromedio = probabilidadSumPorOrigen.get(origen) / total;
            origenStat.put("total", total);
            origenStat.put("retrasados", retrasados);
            origenStat.put("probabilidad_promedio", Math.round(probPromedio * 10000.0) / 10000.0);
            double porcentaje = total > 0 ? (retrasados * 100.0 / total) : 0.0;
            origenStat.put("porcentaje_retrasados", Math.round(porcentaje * 100.0) / 100.0);
            origenes.add(origenStat);
        }

        // Construir respuesta
        Map<String, Object> stats = new HashMap<>();
        stats.put("batch_id", batchId);
        stats.put("total_predicciones", totalPredicciones);
        stats.put("total_retrasados", totalRetrasados);
        stats.put("total_puntuales", totalPuntuales);
        stats.put("porcentaje_retrasados", porcentajeRetrasados);
        stats.put("porcentaje_puntuales", porcentajePuntuales);
        stats.put("estadisticas_por_aerolinea", aerolineas);
        stats.put("estadisticas_por_aeropuerto_origen", origenes);
        stats.put("timestamp", LocalDateTime.now().toString());

        logger.info("✅ Estadísticas calculadas para batchId {}: {} predicciones, {}% retrasados", 
                   batchId, totalPredicciones, porcentajeRetrasados);

        return stats;
    }
}

