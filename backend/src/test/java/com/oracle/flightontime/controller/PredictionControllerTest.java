package com.oracle.flightontime.controller;

import com.oracle.flightontime.dto.PredictionRequestDTO;
import com.oracle.flightontime.dto.PredictionResponseDTO;
import com.oracle.flightontime.service.BatchPredictionService;
import com.oracle.flightontime.service.PredictionHistoryService;
import com.oracle.flightontime.service.PredictionService;
import com.oracle.flightontime.service.StatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================================
 * TESTS DE INTEGRACIÓN - PREDICTION CONTROLLER
 * ============================================================================
 * CR-001: Suite completa de tests de integración para endpoints REST
 * ============================================================================
 */
@WebMvcTest(PredictionController.class)
class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PredictionService predictionService;

    @MockBean
    private StatsService statsService;

    @MockBean
    private BatchPredictionService batchPredictionService;

    @MockBean
    private PredictionHistoryService predictionHistoryService;

    @Test
    void testPredictEndpoint_ValidRequest_ReturnsOk() throws Exception {
        // Arrange
        PredictionResponseDTO mockResponse = PredictionResponseDTO.builder()
                .prediccion(0)
                .probabilidadRetraso(0.15)
                .confianza(0.85)
                .distanciaKm(1208.45)
                .build();

        when(predictionService.predict(any(PredictionRequestDTO.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aerolinea\":\"DL\",\"origen\":\"ATL\",\"destino\":\"JFK\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prediccion").value(0))
                .andExpect(jsonPath("$.probabilidad_retraso").value(0.15))
                .andExpect(jsonPath("$.confianza").value(0.85))
                .andExpect(jsonPath("$.distancia_km").value(1208.45));

        verify(predictionService, times(1)).predict(any(PredictionRequestDTO.class));
    }

    @Test
    void testPredictEndpoint_InvalidRequest_MissingFields_ReturnsBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aerolinea\":\"DL\"}"))  // Faltan origen y destino
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPredictEndpoint_OriginEqualsDestination_ReturnsBadRequest() throws Exception {
        // Arrange
        when(predictionService.predict(any(PredictionRequestDTO.class)))
                .thenThrow(new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "El aeropuerto de origen y destino no pueden ser el mismo."));

        // Act & Assert
        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aerolinea\":\"DL\",\"origen\":\"ATL\",\"destino\":\"ATL\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPredictEndpoint_InvalidJson_ReturnsBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/predict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("invalid json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testHealthEndpoint_ReturnsOk() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("FlightOnTime Backend"))
                .andExpect(jsonPath("$.version").value("1.0.0"));
    }

    @Test
    void testDocsEndpoint_ReturnsOk() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.servicio").value("FlightOnTime API"))
                .andExpect(jsonPath("$.version").value("1.0.0"))
                .andExpect(jsonPath("$.endpoints").exists());
    }

    @Test
    void testStatsEndpoint_ReturnsOk() throws Exception {
        // Arrange
        Map<String, Object> mockStats = new HashMap<>();
        mockStats.put("total_predicciones", 100);
        mockStats.put("puntuales", 75);
        mockStats.put("retrasados", 25);

        when(statsService.getStatsToday()).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total_predicciones").value(100))
                .andExpect(jsonPath("$.puntuales").value(75))
                .andExpect(jsonPath("$.retrasados").value(25));

        verify(statsService, times(1)).getStatsToday();
    }

    @Test
    void testBatchPredictEndpoint_EmptyFile_ReturnsBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(multipart("/api/batch-predict")
                        .file("file", new byte[0]))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetPredictionsEndpoint_ReturnsOk() throws Exception {
        // Arrange
        when(predictionHistoryService.getPredictions(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(org.springframework.data.domain.Page.empty());

        // Act & Assert
        mockMvc.perform(get("/api/predictions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").exists())
                .andExpect(jsonPath("$.totalElements").value(0));

        verify(predictionHistoryService, times(1)).getPredictions(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString());
    }

    @Test
    void testGetFilterOptionsEndpoint_ReturnsOk() throws Exception {
        // Arrange
        when(predictionHistoryService.getDistinctAirlines()).thenReturn(java.util.List.of("DL", "AA"));
        when(predictionHistoryService.getDistinctOrigins()).thenReturn(java.util.List.of("ATL", "JFK"));
        when(predictionHistoryService.getDistinctDestinations()).thenReturn(java.util.List.of("LAX", "ORD"));

        // Act & Assert
        mockMvc.perform(get("/api/predictions/filters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aerolineas").exists())
                .andExpect(jsonPath("$.origenes").exists())
                .andExpect(jsonPath("$.destinos").exists());

        verify(predictionHistoryService, times(1)).getDistinctAirlines();
        verify(predictionHistoryService, times(1)).getDistinctOrigins();
        verify(predictionHistoryService, times(1)).getDistinctDestinations();
    }
}
