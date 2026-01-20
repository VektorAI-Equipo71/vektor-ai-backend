# ============================================================================
# SCRIPT DE SETUP COMPLETO
# ============================================================================
# Configura todo desde cero paso a paso
# ============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETO - FLIGHTONTIME" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASO 1: CONFIGURAR API KEY
# ============================================================================
Write-Host "PASO 1: Configurar API Key de OpenWeatherMap" -ForegroundColor Yellow
Write-Host ""

$apiKey = $env:OPENWEATHER_API_KEY
if (-not $apiKey -or $apiKey -eq "") {
    Write-Host "No se encontró OPENWEATHER_API_KEY configurada." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "1. Ingresar API Key ahora (temporal para esta sesión)" -ForegroundColor White
    Write-Host "2. Usar valor por defecto (solo para desarrollo)" -ForegroundColor White
    Write-Host "3. Configurar permanentemente (requiere reiniciar PowerShell)" -ForegroundColor White
    Write-Host ""
    $opcion = Read-Host "Selecciona opción (1/2/3)"
    
    switch ($opcion) {
        "1" {
            $apiKey = Read-Host "Ingresa tu API Key de OpenWeatherMap"
            $env:OPENWEATHER_API_KEY = $apiKey
            Write-Host "✅ API Key configurada para esta sesión" -ForegroundColor Green
        }
        "2" {
            Write-Host "⚠️  Usando valor por defecto (solo para desarrollo)" -ForegroundColor Yellow
            $env:OPENWEATHER_API_KEY = "d4ce4d4589c7a7ac4343085c00c39f9b"
        }
        "3" {
            $apiKey = Read-Host "Ingresa tu API Key de OpenWeatherMap"
            [System.Environment]::SetEnvironmentVariable("OPENWEATHER_API_KEY", $apiKey, "User")
            Write-Host "✅ API Key configurada permanentemente" -ForegroundColor Green
            Write-Host "   Cierra y reabre PowerShell para que tome efecto" -ForegroundColor Yellow
            $env:OPENWEATHER_API_KEY = $apiKey
        }
        default {
            Write-Host "⚠️  Usando valor por defecto" -ForegroundColor Yellow
            $env:OPENWEATHER_API_KEY = "d4ce4d4589c7a7ac4343085c00c39f9b"
        }
    }
} else {
    Write-Host "✅ API Key ya configurada" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 2: CONFIGURAR AMBIENTE
# ============================================================================
Write-Host "PASO 2: Configurar Ambiente" -ForegroundColor Yellow
Write-Host ""

$profile = $env:SPRING_PROFILES_ACTIVE
if (-not $profile) {
    Write-Host "Selecciona el ambiente:" -ForegroundColor Cyan
    Write-Host "1. Desarrollo (dev) - Logging detallado" -ForegroundColor White
    Write-Host "2. Producción (prod) - Logging mínimo" -ForegroundColor White
    Write-Host ""
    $opcion = Read-Host "Selecciona opción (1/2)"
    
    if ($opcion -eq "1") {
        $env:SPRING_PROFILES_ACTIVE = "dev"
        Write-Host "✅ Ambiente configurado: DESARROLLO" -ForegroundColor Green
    } else {
        $env:SPRING_PROFILES_ACTIVE = "prod"
        Write-Host "✅ Ambiente configurado: PRODUCCIÓN" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Ambiente ya configurado: $profile" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PASO 3: VERIFICAR DOCKER
# ============================================================================
Write-Host "PASO 3: Verificar Docker" -ForegroundColor Yellow
Write-Host ""

try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker instalado: $dockerVersion" -ForegroundColor Green
    
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose instalado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado o no está en PATH" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ============================================================================
# PASO 4: LEVANTAR SERVICIOS
# ============================================================================
Write-Host "PASO 4: Levantar Servicios" -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Deseas levantar los servicios ahora? (S/N)" -ForegroundColor Cyan
$levantar = Read-Host

if ($levantar -eq "S" -or $levantar -eq "s" -or $levantar -eq "Y" -or $levantar -eq "y") {
    Write-Host ""
    Write-Host "Construyendo y levantando servicios..." -ForegroundColor Yellow
    Write-Host "Esto puede tardar varios minutos la primera vez..." -ForegroundColor Gray
    Write-Host ""
    
    docker-compose up --build -d
    
    Write-Host ""
    Write-Host "✅ Servicios iniciados en background" -ForegroundColor Green
    Write-Host ""
    Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
    
    # Esperar a que los servicios estén saludables
    $maxWait = 120  # 2 minutos máximo
    $waited = 0
    $mlReady = $false
    $backendReady = $false
    
    while ($waited -lt $maxWait -and (-not $mlReady -or -not $backendReady)) {
        Start-Sleep -Seconds 5
        $waited += 5
        
        # Verificar ML Service
        if (-not $mlReady) {
            try {
                $health = Invoke-RestMethod -Uri http://localhost:8001/health -ErrorAction Stop -TimeoutSec 2
                if ($health.modelo -eq "cargado") {
                    $mlReady = $true
                    Write-Host "   ✅ ML Service listo (modelo cargado)" -ForegroundColor Green
                }
            } catch {
                # Aún no está listo
            }
        }
        
        # Verificar Backend
        if (-not $backendReady) {
            try {
                $health = Invoke-RestMethod -Uri http://localhost:8080/api/health -ErrorAction Stop -TimeoutSec 2
                if ($health.status -eq "UP") {
                    $backendReady = $true
                    Write-Host "   ✅ Backend listo" -ForegroundColor Green
                }
            } catch {
                # Aún no está listo
            }
        }
        
        if ($waited % 10 -eq 0) {
            Write-Host "   Esperando... ($waited segundos)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    if ($mlReady -and $backendReady) {
        Write-Host "✅ Todos los servicios están listos" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunos servicios pueden no estar completamente listos" -ForegroundColor Yellow
        Write-Host "   Verifica manualmente con: docker-compose ps" -ForegroundColor Gray
    }
}

# ============================================================================
# PASO 5: VERIFICACIÓN FINAL
# ============================================================================
Write-Host ""
Write-Host "PASO 5: Verificación Final" -ForegroundColor Yellow
Write-Host ""

Write-Host "¿Deseas ejecutar verificación automática? (S/N)" -ForegroundColor Cyan
$verificar = Read-Host

if ($verificar -eq "S" -or $verificar -eq "s" -or $verificar -eq "Y" -or $verificar -eq "y") {
    Write-Host ""
    & "$PSScriptRoot\verificar-correcciones.ps1"
}

# ============================================================================
# RESUMEN
# ============================================================================
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETADO" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuración aplicada:" -ForegroundColor Yellow
Write-Host "  - API Key: $(if ($env:OPENWEATHER_API_KEY) { 'Configurada' } else { 'No configurada' })" -ForegroundColor White
Write-Host "  - Ambiente: $($env:SPRING_PROFILES_ACTIVE)" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verificar servicios: docker-compose ps" -ForegroundColor White
Write-Host "  2. Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  3. Probar predicción: Ver GUIA_USO_CORRECCIONES.md" -ForegroundColor White
Write-Host ""
Write-Host "Documentación:" -ForegroundColor Yellow
Write-Host "  - GUIA_USO_CORRECCIONES.md - Guía detallada paso a paso" -ForegroundColor White
Write-Host "  - RESUMEN_CORRECCIONES.md - Resumen de correcciones" -ForegroundColor White
Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
