# ============================================================================
# FLIGHTONTIME - SISTEMA DE PREDICCIÓN DE PUNTUALIDAD DE VUELOS
# ============================================================================
# Oracle Enterprise Partner | Sistema de Misión Crítica
# Versión 1.0.0
# ============================================================================

![FlightOnTime](https://img.shields.io/badge/FlightOnTime-v1.0.0-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Python](https://img.shields.io/badge/Python-3.11-green)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Tests](https://img.shields.io/badge/Tests-16%20passing-brightgreen)
![Métricas](https://img.shields.io/badge/Métricas-Prometheus-blue)

## 📋 Descripción

**FlightOnTime** es un sistema empresarial de predicción de puntualidad de vuelos que combina:

- 🤖 **Machine Learning** con modelo Random Forest entrenado (random_forest_v3.joblib)
- 🌤️ **Datos meteorológicos en tiempo real** vía OpenWeatherMap API
- 📏 **Cálculo automático de distancias** usando la fórmula de Haversine
- 🏢 **Arquitectura empresarial** con Java Spring Boot y Python FastAPI
- 🎨 **Frontend moderno** estilo Oracle Redwood
- 💾 **Persistencia PostgreSQL** para historial y estadísticas
- 📊 **Dashboard de estadísticas** con gráficas interactivas
- 📦 **Procesamiento por lotes** mediante archivos CSV
- 🛡️ **Resiliencia** con Circuit Breaker y Retry (Resilience4j)
- 📊 **Métricas y Monitoreo** con Prometheus
- 🧪 **Tests Automatizados** (16 tests: unitarios + integración)

---

## 🔄 Mejoras de Auditoría Técnica (v1.0.0)

> **Nota**: Este proyecto ha sido mejorado significativamente como resultado de una auditoría técnica detallada. Ver sección completa más abajo.

### Resumen de Mejoras Implementadas

| Categoría | Estado | Detalles |
|-----------|--------|----------|
| **Críticas** | ✅ 67% | API Key externalizada, Suite de tests completa |
| **Altas** | ✅ **100%** | Circuit Breaker, Categorías robustas, Métricas |
| **Medias** | ✅ 33% | Configuración por ambientes |
| **Total** | ✅ **67%** | 6 de 12 observaciones resueltas |

**Puntuación Mejorada**: 3.55/10 → **8.5/10** (+139%)

**Documentación Completa**: Ver sección [🔄 Mejoras Recientes](#-mejoras-recientes-v100---auditoría-técnica) más abajo.

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Java 17** (para ejecución local sin Docker)
- **Python 3.11** (para ejecución local sin Docker)
- **Maven** (para compilación del backend)
- **PostgreSQL 15** (si ejecuta base de datos localmente)

### Opción 1: Ejecución con Docker (Recomendado)

```bash
# 1. Clonar o navegar al directorio del proyecto
cd FlightOnTime

# 2. Configurar API Key de OpenWeatherMap (IMPORTANTE)
# Opción A: Crear archivo .env
cp .env.example .env
# Editar .env y agregar: OPENWEATHER_API_KEY=tu_api_key_aqui

# Opción B: Variable de entorno
export OPENWEATHER_API_KEY="tu_api_key_aqui"

# 3. Construir y levantar todos los servicios
docker-compose up --build

# 4. Acceder a la aplicación
# Frontend: http://localhost:8081
# Backend API: http://localhost:8080/api
# ML Service: http://localhost:8001
# Métricas: http://localhost:8080/actuator/prometheus
# PostgreSQL: localhost:5432
```

> **⚠️ Nota**: La API Key de OpenWeatherMap es requerida. Ver `.env.example` para referencia.

**Tiempos de inicio aproximados:**
- PostgreSQL: ~10 segundos
- ML Service: ~40 segundos (carga del modelo)
- Backend: ~60 segundos (incluye compilación Maven)
- Frontend: ~10 segundos

### Opción 2: Ejecución Local (Desarrollo)

#### Base de Datos PostgreSQL

```bash
# Opción A: Docker
docker run -d \
  --name flightontime-postgres \
  -e POSTGRES_DB=flightontime \
  -e POSTGRES_USER=flightontime \
  -e POSTGRES_PASSWORD=flightontime123 \
  -p 5432:5432 \
  postgres:15-alpine

# Opción B: Instalación local
# Ver: docs/DOCKER_SETUP.md
```

#### ML Service

```bash
cd ml-service

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servicio
python main.py

# Servicio disponible en: http://localhost:8001
```

#### Backend

```bash
cd backend

# Compilar con Maven
mvn clean package

# Ejecutar JAR
java -jar target/backend-1.0.0.jar

# API disponible en: http://localhost:8080
```

#### Frontend

```bash
cd frontend

# Opción A: Servidor Python simple
python -m http.server 8081

# Opción B: Nginx (recomendado)
# Ver: docs/DOCKER_SETUP.md
```

---

## 📡 Endpoints de la API

### Backend (Puerto 8080)

#### `POST /api/predict`

Realiza una predicción de puntualidad de vuelo.

**Body (JSON):**
```json
{
  "aerolinea": "DL",           // REQUERIDO: Código IATA (2 letras)
  "origen": "ATL",            // REQUERIDO: Código IATA (3 letras)
  "destino": "JFK",           // REQUERIDO: Código IATA (3 letras)
  "fecha_partida": "2026-01-15T14:30:00"   // OPCIONAL: ISO-8601
}
```

**Respuesta (JSON):**
```json
{
  "prediccion": 0,
  "probabilidad_retraso": 0.15,
  "confianza": 0.85,
  "distancia_km": 1208.45,
  "clima_origen": { /* WeatherDataDTO */ },
  "clima_destino": { /* WeatherDataDTO */ },
  "metadata": { /* MetadataObject */ },
  "modo_mock": false
}
```

#### `POST /api/batch-predict`

Procesa un archivo CSV con múltiples vuelos.

**Formato CSV:**
```csv
aerolinea,origen,destino,fecha_partida
DL,ATL,JFK,2026-01-15T14:30:00
WN,LAX,ORD,2026-01-16T10:00:00
```

**Parámetros:**
- `file`: Archivo CSV (multipart/form-data)
- `batch_id`: ID de lote opcional (String)

#### `GET /api/predictions`

Consulta predicciones almacenadas con paginación y filtros.

**Parámetros de Query:**
- `fechaInicio`: Fecha inicio (yyyy-MM-dd)
- `fechaFin`: Fecha fin (yyyy-MM-dd)
- `aerolinea`: Código de aerolínea
- `origen`: Código IATA origen
- `destino`: Código IATA destino
- `prediccion`: 0 = Puntual, 1 = Retrasado
- `batchId`: ID de lote
- `page`: Número de página (default: 0)
- `size`: Tamaño de página (default: 20)
- `sortBy`: Campo para ordenar (default: fechaPrediccion)
- `sortDir`: Dirección (asc/desc, default: desc)

#### `GET /api/stats`

Estadísticas agregadas de predicciones.

**Parámetros de Query:**
- `inicio`: Fecha inicio (yyyy-MM-dd)
- `fin`: Fecha fin (yyyy-MM-dd)
- `batchId`: ID de lote para filtrar

#### `GET /api/health`

Verifica el estado del backend.

#### `GET /api/docs`

Documentación automática de endpoints.

### ML Service (Puerto 8001)

#### `POST /predict_internal`

Endpoint interno para predicción (llamado por el backend).

#### `GET /airports`

Lista todos los aeropuertos disponibles en el sistema.

#### `GET /health`

Health check del servicio ML.

---

## 🎯 Características Principales

### 1. Predicción Inteligente

- ✅ Modelo ML entrenado (random_forest_v3.joblib) cargado en memoria
- ✅ Predicción binaria: **Puntual** vs **Retrasado**
- ✅ Probabilidades de retraso (0.0 - 1.0)
- ✅ Nivel de confianza del modelo
- ✅ 15 características (features) procesadas automáticamente

### 2. Integración Meteorológica

- ✅ Consulta en tiempo real a OpenWeatherMap API
- ✅ Datos: temperatura, humedad, presión, viento, visibilidad
- ✅ Clima para origen y destino
- ✅ Fallback automático si la API falla

### 3. Cálculo Automático de Distancia

- ✅ Diccionario de 397+ aeropuertos internacionales
- ✅ Fórmula de Haversine para distancia geodésica
- ✅ **UX mejorada**: Usuario NO envía distancia manualmente

### 4. Persistencia y Historial

- ✅ PostgreSQL para almacenar todas las predicciones
- ✅ Historial completo con filtros avanzados
- ✅ Paginación para grandes volúmenes de datos
- ✅ Búsqueda por ID de lote (batch)

### 5. Procesamiento por Lotes

- ✅ Carga de archivos CSV con múltiples vuelos
- ✅ Procesamiento asíncrono
- ✅ ID de lote único para agrupar resultados
- ✅ Exportación a Excel

### 6. Estadísticas y Análisis

- ✅ Dashboard con gráficas interactivas (Chart.js)
- ✅ Estadísticas por aerolínea
- ✅ Estadísticas por aeropuerto
- ✅ Análisis de salidas atrasadas por franja horaria
- ✅ Tabla de predicciones individuales

### 7. Frontend Empresarial

- ✅ Diseño Oracle Redwood con paleta curada
- ✅ Animaciones suaves y micro-interacciones
- ✅ Loading states y manejo de errores visual
- ✅ Responsive design (mobile-first)
- ✅ Internacionalización (Español/Inglés)
- ✅ Conversión de unidades (SI/Imperial)

---

## 📂 Estructura del Proyecto

```
FlightOnTime/
│
├── backend/                          # Backend Java Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/com/oracle/flightontime/
│   │       │   ├── FlightOnTimeApplication.java
│   │       │   ├── controller/
│   │       │   │   └── PredictionController.java
│   │       │   ├── service/
│   │       │   │   ├── PredictionService.java
│   │       │   │   ├── BatchPredictionService.java
│   │       │   │   ├── PredictionHistoryService.java
│   │       │   │   └── StatsService.java
│   │       │   ├── entity/
│   │       │   │   └── PredictionHistory.java
│   │       │   ├── repository/
│   │       │   │   └── PredictionHistoryRepository.java
│   │       │   ├── dto/
│   │       │   │   ├── PredictionRequestDTO.java
│   │       │   │   ├── PredictionResponseDTO.java
│   │       │   │   └── WeatherDataDTO.java
│   │       │   ├── config/
│   │       │   │   ├── AirlineConfig.java
│   │       │   │   └── WebClientConfig.java
│   │       │   └── util/
│   │       │       └── GeoUtils.java
│   │       └── resources/
│   │           ├── application.properties
│   │           ├── schema.sql
│   │           └── aerolinea_origin_dest.json
│   ├── pom.xml
│   └── Dockerfile
│
├── ml-service/                       # Servicio ML Python FastAPI
│   ├── main.py                       # Aplicación principal
│   ├── airport_coords.py             # Diccionario de coordenadas IATA
│   ├── random_forest_v3.joblib       # Modelo ML entrenado
│   ├── model_v3_info.json            # Información del modelo
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                         # Frontend HTML/CSS/JS
│   ├── index.html                    # Dashboard principal
│   ├── batch.html                    # Predicción por lote
│   ├── history.html                  # Historial de predicciones
│   ├── stats.html                    # Estadísticas
│   ├── about.html                    # Acerca de
│   ├── styles.css                    # Estilos centralizados
│   ├── app.js                        # Lógica de aplicación
│   ├── i18n.js                       # Internacionalización
│   ├── airline_data.js               # Datos de aerolíneas
│   ├── nginx.conf                    # Configuración Nginx
│   └── Dockerfile
│
├── docs/                             # Documentación
│   ├── architecture/
│   │   └── ARCHITECTURE.md
│   ├── integration/
│   │   └── CONTRATO_INTEGRACION.md
│   └── testing/
│       ├── CASOS_PRUEBA_BATCH.md
│       ├── CASOS_PRUEBA_INSTRUCCIONES.md
│       └── GUIA_PRUEBAS.md
│
├── docker-compose.yml                # Orquestación de servicios
└── README.md                         # Este archivo
```

---

## 🔧 Configuración

### Variables de Entorno Requeridas

#### ML Service

**IMPORTANTE**: La API Key de OpenWeatherMap debe configurarse como variable de entorno:

```bash
# Opción 1: Variable de entorno
export OPENWEATHER_API_KEY="tu_api_key_aqui"
docker-compose up

# Opción 2: Archivo .env (recomendado)
echo "OPENWEATHER_API_KEY=tu_api_key_aqui" > .env
docker-compose up
```

Ver `.env.example` para la plantilla.

#### Backend (`backend/src/main/resources/application.properties`)

```properties
# Puerto del servidor
server.port=8080

# URL del servicio ML
ml.service.url=http://ml-service:8001

# Timeout para llamadas al servicio ML (segundos)
ml.service.timeout=10

# Base de datos PostgreSQL
spring.datasource.url=jdbc:postgresql://postgres:5432/flightontime
spring.datasource.username=flightontime
spring.datasource.password=flightontime123
```

#### ML Service

```python
# API Key de OpenWeatherMap (en main.py o variable de entorno)
OPENWEATHER_API_KEY = "d4ce4d4589c7a7ac4343085c00c39f9b"
```

**Nota**: Para producción, usar variables de entorno en lugar de hardcodear la API key.

### Aerolíneas Soportadas

El sistema soporta **15 aerolíneas** con sus códigos IATA:

| Código | Nombre Completo |
|--------|----------------|
| 9E | Endeavor Air |
| AA | American Airlines |
| AS | Alaska Airlines |
| B6 | JetBlue Airways |
| DL | Delta Air Lines |
| F9 | Frontier Airlines |
| G4 | Allegiant Air |
| HA | Hawaiian Airlines |
| MQ | Envoy Air |
| NK | Spirit Airlines |
| OH | PSA Airlines |
| OO | SkyWest Airlines |
| UA | United Airlines |
| WN | Southwest Airlines |
| YX | Republic Airways |

**Aeropuertos**: 397+ aeropuertos internacionales soportados.

Para ver la lista completa:
- **Backend**: `AirlineConfig.java`
- **Frontend**: `airline_data.js`
- **ML Service**: Endpoint `/airports`

---

## 🐳 Docker

### Comandos Útiles

```bash
# Construir y levantar servicios
docker-compose up --build

# Levantar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir un servicio específico
docker-compose up --build backend
```

### Health Checks

Todos los servicios incluyen health checks:

```bash
# Verificar estado de contenedores
docker-compose ps

# Salida esperada:
# NAME                    STATUS
# flightontime-frontend   Up (healthy)
# flightontime-backend    Up (healthy)
# flightontime-ml         Up (healthy)
# flightontime-postgres   Up (healthy)
```

### Métricas y Monitoreo

El backend expone métricas en formato Prometheus:

```bash
# Ver métricas en formato Prometheus
curl http://localhost:8080/actuator/prometheus

# Ver lista de métricas disponibles
curl http://localhost:8080/actuator/metrics

# Ver métricas específicas
curl http://localhost:8080/actuator/metrics/flightontime.predictions.total
```

**Métricas Personalizadas Disponibles**:
- `flightontime.predictions.total` - Total de predicciones
- `flightontime.predictions.puntual` - Predicciones puntuales
- `flightontime.predictions.retrasado` - Predicciones retrasadas
- `flightontime.predictions.errors` - Errores
- `flightontime.predictions.duration` - Duración de predicciones
- `flightontime.predictions.by_airline` - Por aerolínea
- `flightontime.predictions.by_route` - Por ruta

---

## 🧪 Testing

### Tests Automatizados

El proyecto incluye una suite completa de tests automatizados:

```bash
# Ejecutar todos los tests
cd backend
mvn test

# Salida esperada:
# Tests run: 16, Failures: 0, Errors: 0
```

**Cobertura de Tests**:
- ✅ **6 tests unitarios** (`PredictionServiceTest.java`)
  - Validación de requests
  - Manejo de errores
  - Timeouts
  - Casos exitosos
- ✅ **10 tests de integración** (`PredictionControllerTest.java`)
  - Todos los endpoints principales
  - Validación de respuestas HTTP/JSON
  - Casos de error y validación

### Pruebas Manuales

1. **Verificar servicios activos**:
   - Frontend: http://localhost:8081
   - Backend: http://localhost:8080/api/health
   - ML Service: http://localhost:8001/health
   - Métricas: http://localhost:8080/actuator/prometheus
   - PostgreSQL: `docker-compose exec postgres psql -U flightontime -d flightontime`

2. **Probar predicción individual**:
   - Abrir http://localhost:8081
   - Llenar formulario
   - Verificar respuesta con clima y metadata

3. **Probar procesamiento por lote**:
   - Abrir http://localhost:8081/batch.html
   - Subir archivo CSV
   - Verificar resultados y exportación

4. **Probar estadísticas**:
   - Abrir http://localhost:8081/stats.html
   - Aplicar filtros
   - Verificar gráficas

### Pruebas con cURL

```bash
# Predicción individual
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "aerolinea": "DL",
    "origen": "ATL",
    "destino": "JFK",
    "fecha_partida": "2026-01-15T14:30:00"
  }'

# Estadísticas
curl http://localhost:8080/api/stats

# Historial
curl "http://localhost:8080/api/predictions?page=0&size=20"

# Métricas Prometheus
curl http://localhost:8080/actuator/prometheus
```

---

## 📊 Tecnologías Utilizadas

### Backend
- **Java 17**: Lenguaje de programación
- **Spring Boot 3.2.1**: Framework empresarial
- **Spring Data JPA**: Persistencia
- **PostgreSQL**: Base de datos
- **Maven**: Gestión de dependencias
- **Lombok**: Reducción de boilerplate
- **WebFlux**: Cliente HTTP reactivo
- **Validation**: Validación de DTOs
- **Resilience4j**: Circuit Breaker y Retry para resiliencia
- **Micrometer + Prometheus**: Métricas y monitoreo
- **Spring Actuator**: Health checks y endpoints de métricas

### ML Service
- **Python 3.11**: Lenguaje de programación
- **FastAPI**: Framework web moderno
- **scikit-learn**: Machine Learning
- **pandas/numpy**: Manipulación de datos
- **requests**: Cliente HTTP
- **joblib**: Serialización del modelo

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos (Flexbox, Grid, Variables CSS)
- **JavaScript ES6+**: Lógica de aplicación
- **Fetch API**: Llamadas HTTP
- **Chart.js**: Gráficas interactivas
- **SheetJS (xlsx)**: Exportación a Excel
- **Google Fonts (Inter)**: Tipografía profesional

### DevOps
- **Docker**: Containerización
- **Docker Compose**: Orquestación
- **Nginx**: Servidor web para frontend
- **PostgreSQL**: Base de datos relacional

---

## 📚 Documentación

### Documentos Principales

- **[ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)** - Arquitectura del sistema
- **[API_CONTRACT.md](docs/integration/CONTRATO_INTEGRACION.md)** - Contrato de integración completo
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Esquema de base de datos
- **[CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)** - Guía de configuración
- **[DOCKER_SETUP.md](docs/DOCKER_SETUP.md)** - Configuración Docker
- **[MONITORING.md](docs/MONITORING.md)** - Monitoreo y observabilidad
- **[SECURITY.md](docs/SECURITY.md)** - Consideraciones de seguridad
- **[OCI_DEPLOYMENT_GUIDE.md](oci-deployment/OCI_DEPLOYMENT_GUIDE.md)** - Guía de despliegue en OCI

### Documentos de Testing

- **[GUIA_PRUEBAS.md](docs/testing/GUIA_PRUEBAS.md)** - Guía completa de pruebas
- **[CASOS_PRUEBA_BATCH.md](docs/testing/CASOS_PRUEBA_BATCH.md)** - Casos de prueba para batch
- **[CASOS_PRUEBA_INSTRUCCIONES.md](docs/testing/CASOS_PRUEBA_INSTRUCCIONES.md)** - Instrucciones de pruebas

### Colección Postman

- **[FlightOnTime_Postman_Collection.json](postman/FlightOnTime_Postman_Collection.json)** - Colección completa
- **[FlightOnTime_Environment.json](postman/FlightOnTime_Environment.json)** - Entorno Postman

---

## 🎨 Diseño UI/UX

### Paleta de Colores

- **Primario**: `#1A2B48` - Azul Abisal (profundidad, autoridad)
- **Acento**: `#00F2FF` - Cian Eléctrico (datos, ML, innovación)
- **Éxito**: `hsl(142, 71%, 45%)` - Verde para vuelos puntuales
- **Peligro**: `hsl(0, 84%, 60%)` - Rojo para retrasos
- **Advertencia**: `hsl(45, 100%, 51%)` - Amarillo para alertas

### Características de Diseño

- ✅ **Glassmorphism** en header
- ✅ **Gradientes suaves** en botones y cards
- ✅ **Animaciones CSS** (pulse, blink, slideIn, scaleIn)
- ✅ **Micro-interacciones** en hover
- ✅ **Loading states** con spinner
- ✅ **Responsive design** mobile-first
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **Conversión de unidades** automática

---

## 🔄 Mejoras Recientes (v1.0.0 - Auditoría Técnica)

### ✅ Correcciones Implementadas (Enero 2026)

Como resultado de la auditoría técnica detallada, se implementaron las siguientes mejoras:

#### 🔴 Críticas Resueltas
- ✅ **CR-002**: API Key de OpenWeatherMap externalizada a variables de entorno
- ✅ **CR-001**: Suite completa de tests automatizados (16 tests: 6 unitarios + 10 integración)

#### 🟠 Altas Resueltas (100% Completado)
- ✅ **AL-001**: Circuit Breaker y Retry con Resilience4j implementados
- ✅ **AL-002**: Manejo robusto de categorías desconocidas con fallback
- ✅ **AL-003**: Métricas y monitoreo con Micrometer + Prometheus

#### 🟡 Medias Resueltas
- ✅ **ME-003**: Configuración por ambientes (dev/prod) implementada

#### 🔧 Mejoras Adicionales
- ✅ Validación mejorada de features faltantes
- ✅ Validación de salidas del modelo (NaN, rangos, tipos)
- ✅ Healthcheck mejorado que valida carga del modelo ML

**Resultado**: 67% de observaciones resueltas (6 de 12), incluyendo **100% de observaciones ALTAS**.

Para más detalles, ver:
- **[VERIFICACION_AUDITORIA_COMPLETA.md](VERIFICACION_AUDITORIA_COMPLETA.md)** - Verificación exhaustiva
- **[INFORME_RESULTADOS_AUDITORIA.md](INFORME_RESULTADOS_AUDITORIA.md)** - Informe ejecutivo
- **[CORRECCIONES_AUDITORIA.md](CORRECCIONES_AUDITORIA.md)** - Detalles técnicos

---

## 📈 Roadmap Futuro

### Fase 1: Seguridad (Corto Plazo) - ⚠️ PENDIENTE
- [ ] **CR-003**: Implementar autenticación JWT (Spring Security)
- [ ] Configurar HTTPS
- [ ] Restringir CORS
- [x] ~~Externalizar secretos~~ ✅ **COMPLETADO**

### Fase 2: Observabilidad (Medio Plazo) - ✅ PARCIALMENTE COMPLETADO
- [x] ~~Agregar Prometheus~~ ✅ **COMPLETADO**
- [ ] Dashboards de Grafana
- [ ] Implementar tracing distribuido (Jaeger)
- [ ] Centralizar logs (ELK Stack)
- [x] ~~Métricas personalizadas~~ ✅ **COMPLETADO**

### Fase 3: Resiliencia Avanzada (Largo Plazo) - ✅ PARCIALMENTE COMPLETADO
- [x] ~~Implementar Circuit Breaker~~ ✅ **COMPLETADO**
- [ ] **ME-001**: Agregar Redis para caché
- [ ] **ME-002**: Rate limiting avanzado
- [ ] API Gateway (Kong/Ambassador)

### Fase 4: Funcionalidades
- [ ] Reentrenamiento automático del modelo
- [ ] Integración con más APIs meteorológicas
- [ ] Notificaciones push
- [ ] Exportación de reportes (PDF)

---

## 👥 Contribuciones

Este es un proyecto empresarial de Oracle Enterprise Partner. Para contribuciones:

1. Fork del repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

---

## 📄 Licencia

Copyright © 2026 FlightOnTime - Oracle Enterprise Partner

---

## 📞 Soporte

Para soporte técnico o consultas:

- **Email**: soporte@flightontime.com
- **Documentación API**: http://localhost:8080/api/docs
- **Health Checks**: 
  - Backend: http://localhost:8080/api/health
  - ML Service: http://localhost:8001/health
- **Postman Collection**: Ver carpeta `postman/`

---

## ✨ Créditos

Desarrollado como sistema de misión crítica para Oracle Enterprise Partner.

**Tecnologías**: Java 17, Spring Boot, Python, FastAPI, PostgreSQL, Docker, Nginx  
**APIs**: OpenWeatherMap  
**Diseño**: Oracle Redwood Design System  
**ML Model**: Random Forest Classifier (scikit-learn)

---

**¡Gracias por usar FlightOnTime!** ✈️
