package com.oracle.flightontime.repository;

import com.oracle.flightontime.entity.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ============================================================================
 * REPOSITORIO SPRING DATA JPA - HISTORIAL DE PREDICCIONES
 * ============================================================================
 * Proporciona métodos para consultar y gestionar el historial de predicciones.
 * ============================================================================
 */
@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long>, JpaSpecificationExecutor<PredictionHistory> {

    /**
     * Cuenta el total de predicciones realizadas en el día actual
     */
    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE DATE(p.fechaPrediccion) = :fecha")
    Long countByFechaPrediccion(@Param("fecha") LocalDate fecha);

    /**
     * Cuenta las predicciones de vuelos retrasados en el día actual
     */
    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE DATE(p.fechaPrediccion) = :fecha AND p.prediccion = 1")
    Long countRetrasadosByFechaPrediccion(@Param("fecha") LocalDate fecha);
    
    /**
     * Cuenta el total de predicciones realizadas en un rango de fechas
     */
    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.fechaPrediccion BETWEEN :inicio AND :fin")
    Long countByFechaPrediccionBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
    
    /**
     * Cuenta las predicciones de vuelos retrasados en un rango de fechas
     */
    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.fechaPrediccion BETWEEN :inicio AND :fin AND p.prediccion = 1")
    Long countRetrasadosByFechaPrediccionBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    /**
     * Obtiene todas las predicciones realizadas en el día actual
     */
    @Query("SELECT p FROM PredictionHistory p WHERE DATE(p.fechaPrediccion) = :fecha ORDER BY p.fechaPrediccion DESC")
    List<PredictionHistory> findByFechaPrediccion(@Param("fecha") LocalDate fecha);

    /**
     * Obtiene predicciones filtradas por aerolínea
     */
    List<PredictionHistory> findByAerolinea(String aerolinea);

    /**
     * Obtiene predicciones filtradas por aeropuerto de origen
     */
    List<PredictionHistory> findByOrigen(String origen);

    /**
     * Obtiene predicciones filtradas por aeropuerto de destino
     */
    List<PredictionHistory> findByDestino(String destino);

    /**
     * Obtiene predicciones filtradas por batchId
     */
    List<PredictionHistory> findByBatchId(String batchId);

    /**
     * Obtiene predicciones filtradas por rango de fechas
     */
    @Query("SELECT p FROM PredictionHistory p WHERE p.fechaPrediccion BETWEEN :inicio AND :fin ORDER BY p.fechaPrediccion DESC")
    List<PredictionHistory> findByFechaPrediccionBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    /**
     * Estadísticas agregadas por aerolínea
     */
    @Query("SELECT p.aerolinea, COUNT(p) as total, " +
           "SUM(CASE WHEN p.prediccion = 1 THEN 1 ELSE 0 END) as retrasados, " +
           "AVG(p.probabilidad) as probabilidadPromedio " +
           "FROM PredictionHistory p " +
           "WHERE DATE(p.fechaPrediccion) = :fecha " +
           "GROUP BY p.aerolinea")
    List<Object[]> getStatsByAerolinea(@Param("fecha") LocalDate fecha);

    /**
     * Estadísticas agregadas por aeropuerto de origen
     */
    @Query("SELECT p.origen, COUNT(p) as total, " +
           "SUM(CASE WHEN p.prediccion = 1 THEN 1 ELSE 0 END) as retrasados, " +
           "AVG(p.probabilidad) as probabilidadPromedio " +
           "FROM PredictionHistory p " +
           "WHERE DATE(p.fechaPrediccion) = :fecha " +
           "GROUP BY p.origen")
    List<Object[]> getStatsByOrigen(@Param("fecha") LocalDate fecha);
    
    /**
     * Estadísticas agregadas por aerolínea para un rango de fechas
     */
    @Query("SELECT p.aerolinea, COUNT(p) as total, " +
           "SUM(CASE WHEN p.prediccion = 1 THEN 1 ELSE 0 END) as retrasados, " +
           "AVG(p.probabilidad) as probabilidadPromedio " +
           "FROM PredictionHistory p " +
           "WHERE p.fechaPrediccion BETWEEN :inicio AND :fin " +
           "GROUP BY p.aerolinea")
    List<Object[]> getStatsByAerolineaBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
    
    /**
     * Estadísticas agregadas por aeropuerto de origen para un rango de fechas
     */
    @Query("SELECT p.origen, COUNT(p) as total, " +
           "SUM(CASE WHEN p.prediccion = 1 THEN 1 ELSE 0 END) as retrasados, " +
           "AVG(p.probabilidad) as probabilidadPromedio " +
           "FROM PredictionHistory p " +
           "WHERE p.fechaPrediccion BETWEEN :inicio AND :fin " +
           "GROUP BY p.origen")
    List<Object[]> getStatsByOrigenBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}

