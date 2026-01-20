# ============================================================================
# Script de Prueba de Predicción - FlightOnTime
# ============================================================================
# Este script prueba el endpoint de predicción del ML Service
# ============================================================================

param(
    [string]$Aerolinea = "DL",
    [string]$Origen = "ATL",
    [string]$Destino = "LAX",
    [string]$FechaPartida = "2026-01-15T14:30:00"
)

Write-Host "`n=== PRUEBA DE PREDICCIÓN - FlightOnTime ===" -ForegroundColor Cyan
Write-Host "`nParámetros:" -ForegroundColor Yellow
Write-Host "  Aerolínea: $Aerolinea"
Write-Host "  Origen: $Origen"
Write-Host "  Destino: $Destino"
Write-Host "  Fecha Partida: $FechaPartida"

# Preparar el cuerpo de la solicitud
$body = @{
    aerolinea = $Aerolinea
    origen = $Origen
    destino = $Destino
    fecha_partida = $FechaPartida
} | ConvertTo-Json

Write-Host "`nEnviando solicitud a http://localhost:8001/predict_internal..." -ForegroundColor Yellow

try {
    # Realizar la solicitud
    $response = Invoke-WebRequest -Uri "http://localhost:8001/predict_internal" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    # Parsear la respuesta JSON
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✅ PREDICCIÓN EXITOSA" -ForegroundColor Green
    Write-Host "`nResultados:" -ForegroundColor Cyan
    Write-Host "  Predicción: $($result.prediccion) ($(if ($result.prediccion -eq 0) { 'Puntual' } else { 'Retrasado' }))"
    Write-Host "  Probabilidad de Retraso: $([math]::Round($result.probabilidad_retraso * 100, 2))%"
    Write-Host "  Confianza: $([math]::Round($result.confianza * 100, 2))%"
    Write-Host "  Distancia: $([math]::Round($result.distancia_km, 2)) km"
    
    Write-Host "`nClima Origen:" -ForegroundColor Cyan
    Write-Host "  Temperatura: $($result.clima_origen.temperatura)°C"
    Write-Host "  Humedad: $($result.clima_origen.humedad)%"
    Write-Host "  Viento: $($result.clima_origen.viento_velocidad) m/s"
    Write-Host "  Condición: $($result.clima_origen.condicion)"
    
    if ($result.clima_destino) {
        Write-Host "`nClima Destino:" -ForegroundColor Cyan
        Write-Host "  Temperatura: $($result.clima_destino.temperatura)°C"
        Write-Host "  Humedad: $($result.clima_destino.humedad)%"
        Write-Host "  Viento: $($result.clima_destino.viento_velocidad) m/s"
        Write-Host "  Condición: $($result.clima_destino.condicion)"
    }
    
    Write-Host "`nRespuesta completa (JSON):" -ForegroundColor Cyan
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    
} catch {
    Write-Host "`n❌ ERROR EN LA PREDICCIÓN" -ForegroundColor Red
    Write-Host "Código de Estado: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor:" -ForegroundColor Red
        Write-Host $responseBody
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== FIN DE LA PRUEBA ===" -ForegroundColor Cyan