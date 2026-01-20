# ============================================================================
# SCRIPT DE VERIFICACIÓN DE CORRECCIONES
# ============================================================================
# Script PowerShell para verificar que todas las correcciones funcionan
# ============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE CORRECCIONES APLICADAS - FLIGHTONTIME" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$errores = 0
$advertencias = 0

# ============================================================================
# 1. VERIFICAR API KEY
# ============================================================================
Write-Host "1. Verificando API Key de OpenWeatherMap..." -ForegroundColor Yellow
$apiKey = $env:OPENWEATHER_API_KEY
if ($apiKey -and $apiKey -ne "") {
    Write-Host "   ✅ API Key configurada: $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor Green
} else {
    Write-Host "   ⚠️  API Key no configurada (usando valor por defecto)" -ForegroundColor Yellow
    Write-Host "      Para configurar: `$env:OPENWEATHER_API_KEY = 'tu_api_key'" -ForegroundColor Gray
    $advertencias++
}

# ============================================================================
# 2. VERIFICAR SERVICIOS DOCKER
# ============================================================================
Write-Host "`n2. Verificando servicios Docker..." -ForegroundColor Yellow
try {
    $services = docker-compose ps --format json | ConvertFrom-Json
    $mlService = $services | Where-Object { $_.Service -eq "ml-service" }
    $backend = $services | Where-Object { $_.Service -eq "backend" }
    
    if ($mlService -and $mlService.State -eq "running") {
        Write-Host "   ✅ ML Service está corriendo" -ForegroundColor Green
    } else {
        Write-Host "   ❌ ML Service no está corriendo" -ForegroundColor Red
        $errores++
    }
    
    if ($backend -and $backend.State -eq "running") {
        Write-Host "   ✅ Backend está corriendo" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend no está corriendo" -ForegroundColor Red
        $errores++
    }
} catch {
    Write-Host "   ⚠️  No se pudieron verificar servicios Docker" -ForegroundColor Yellow
    Write-Host "      Asegúrate de que docker-compose esté ejecutándose" -ForegroundColor Gray
    $advertencias++
}

# ============================================================================
# 3. VERIFICAR HEALTHCHECK ML SERVICE
# ============================================================================
Write-Host "`n3. Verificando Healthcheck del ML Service..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:8001/health -ErrorAction Stop
    if ($health.modelo -eq "cargado") {
        Write-Host "   ✅ Modelo ML cargado correctamente" -ForegroundColor Green
        Write-Host "      Status: $($health.status)" -ForegroundColor Gray
    } elseif ($health.status -eq "healthy") {
        Write-Host "   ✅ ML Service saludable" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ML Service responde pero modelo puede no estar cargado" -ForegroundColor Yellow
        $advertencias++
    }
} catch {
    Write-Host "   ❌ ML Service no responde o modelo no está cargado" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
    $errores++
}

# ============================================================================
# 4. VERIFICAR HEALTHCHECK BACKEND
# ============================================================================
Write-Host "`n4. Verificando Healthcheck del Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:8080/api/health -ErrorAction Stop
    if ($health.status -eq "UP") {
        Write-Host "   ✅ Backend saludable" -ForegroundColor Green
        Write-Host "      Versión: $($health.version)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Backend responde pero status: $($health.status)" -ForegroundColor Yellow
        $advertencias++
    }
} catch {
    Write-Host "   ❌ Backend no responde" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
    $errores++
}

# ============================================================================
# 5. PROBAR PREDICCIÓN
# ============================================================================
Write-Host "`n5. Probando predicción..." -ForegroundColor Yellow
try {
    $body = @{
        aerolinea = "DL"
        origen = "ATL"
        destino = "JFK"
        fecha_partida = "2026-01-15T14:30:00"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri http://localhost:8080/api/predict `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "   ✅ Predicción exitosa" -ForegroundColor Green
    Write-Host "      Predicción: $($response.prediccion) (0=Puntual, 1=Retrasado)" -ForegroundColor Gray
    Write-Host "      Probabilidad retraso: $([math]::Round($response.probabilidad_retraso * 100, 2))%" -ForegroundColor Gray
    Write-Host "      Confianza: $([math]::Round($response.confianza * 100, 2))%" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error en predicción" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "      Detalle: $responseBody" -ForegroundColor Gray
    }
    $errores++
}

# ============================================================================
# 6. VERIFICAR LOGS DE CORRECCIONES
# ============================================================================
Write-Host "`n6. Verificando logs de correcciones aplicadas..." -ForegroundColor Yellow

# Verificar logs del ML Service
Write-Host "   Revisando logs del ML Service..." -ForegroundColor Gray
try {
    $mlLogs = docker-compose logs ml-service --tail 20 2>&1
    if ($mlLogs -match "Modelo cargado") {
        Write-Host "   ✅ Modelo cargado correctamente (visto en logs)" -ForegroundColor Green
    }
    if ($mlLogs -match "OPENWEATHER_API_KEY") {
        Write-Host "   ✅ API Key configurada (visto en logs)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  No se pudieron leer logs del ML Service" -ForegroundColor Yellow
    $advertencias++
}

# Verificar logs del Backend
Write-Host "   Revisando logs del Backend..." -ForegroundColor Gray
try {
    $backendLogs = docker-compose logs backend --tail 20 2>&1
    if ($backendLogs -match "Resilience4j\|CircuitBreaker") {
        Write-Host "   ✅ Resilience4j configurado (visto en logs)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No se encontraron referencias a Resilience4j en logs" -ForegroundColor Yellow
        Write-Host "      (Puede ser normal si no ha habido fallos)" -ForegroundColor Gray
        $advertencias++
    }
} catch {
    Write-Host "   ⚠️  No se pudieron leer logs del Backend" -ForegroundColor Yellow
    $advertencias++
}

# ============================================================================
# RESUMEN
# ============================================================================
Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

if ($errores -eq 0 -and $advertencias -eq 0) {
    Write-Host "✅ TODAS LAS VERIFICACIONES PASARON" -ForegroundColor Green
    Write-Host "   Todas las correcciones están funcionando correctamente." -ForegroundColor Gray
} elseif ($errores -eq 0) {
    Write-Host "⚠️  VERIFICACIONES PASARON CON ADVERTENCIAS" -ForegroundColor Yellow
    Write-Host "   Hay $advertencias advertencia(s) pero no hay errores críticos." -ForegroundColor Gray
} else {
    Write-Host "❌ SE ENCONTRARON ERRORES" -ForegroundColor Red
    Write-Host "   Hay $errores error(es) que deben resolverse." -ForegroundColor Gray
    Write-Host "   Revisa los mensajes arriba para más detalles." -ForegroundColor Gray
}

Write-Host "`nPara más información, consulta: GUIA_USO_CORRECCIONES.md" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
