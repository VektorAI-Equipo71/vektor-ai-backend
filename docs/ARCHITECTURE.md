# Arquitectura del Sistema - FlightOnTime

## 📋 Visión General

FlightOnTime es un sistema de predicción de puntualidad de vuelos construido con una arquitectura de **microservicios**. El sistema consta de cuatro componentes principales que se comunican entre sí mediante HTTP/REST.

---

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUARIOS                                        │
│                                 │                                            │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         FRONTEND                                      │    │
│  │                    (Nginx - Puerto 8081)                              │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │    │
│  │  │ index.html│  │ batch.html│  │history.html│ │ stats.html│         │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘          │    │
│  │                    HTML5 + CSS3 + JavaScript                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                 │                                            │
│                                 │ HTTP/REST                                  │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         BACKEND                                       │    │
│  │                (Spring Boot - Puerto 8080)                            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐      │    │
│  │  │                     REST Controllers                         │      │    │
│  │  │  /api/predict │ /api/batch-predict │ /api/predictions │ ... │      │    │
│  │  └─────────────────────────────────────────────────────────────┘      │    │
│  │                              │                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐      │    │
│  │  │                     Services Layer                           │      │    │
│  │  │ PredictionService │ BatchService │ StatsService │ HistoryService│   │    │
│  │  └─────────────────────────────────────────────────────────────┘      │    │
│  │                              │                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────┐      │    │
│  │  │                   Resilience Layer                           │      │    │
│  │  │            Circuit Breaker │ Retry │ Timeout                 │      │    │
│  │  └─────────────────────────────────────────────────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                       │                           │                          │
│              HTTP/REST│                           │ JDBC                     │
│                       ▼                           ▼                          │
│  ┌────────────────────────────────┐  ┌─────────────────────────────────┐    │
│  │         ML SERVICE             │  │         POSTGRESQL              │    │
│  │    (FastAPI - Puerto 8001)     │  │        (Puerto 5432)            │    │
│  │  ┌──────────────────────────┐  │  │  ┌───────────────────────────┐  │    │
│  │  │   Random Forest Model    │  │  │  │   prediction_history      │  │    │
│  │  │  (scikit-learn/joblib)   │  │  │  │   (Historial + Stats)     │  │    │
│  │  └──────────────────────────┘  │  │  └───────────────────────────┘  │    │
│  │  ┌──────────────────────────┐  │  │                                  │    │
│  │  │   OpenWeatherMap API     │◄─┼──┼─ API Externa                    │    │
│  │  │     (Clima en tiempo     │  │  │                                  │    │
│  │  │          real)           │  │  │                                  │    │
│  │  └──────────────────────────┘  │  │                                  │    │
│  └────────────────────────────────┘  └─────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    DOCKER NETWORK                                     │   │
│  │                   (flightontime-network)                              │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes del Sistema

### 1. Frontend (Nginx)

**Tecnologías:**
- HTML5, CSS3, JavaScript ES6+
- Nginx como servidor web
- Chart.js para gráficas
- SheetJS para exportación Excel

**Responsabilidades:**
- Interfaz de usuario para predicciones
- Visualización de resultados
- Dashboard de estadísticas
- Procesamiento de archivos CSV
- Internacionalización (ES/EN)

**Páginas:**
| Archivo | Descripción |
|---------|-------------|
| `index.html` | Dashboard principal de predicción |
| `batch.html` | Predicción por lotes (CSV) |
| `history.html` | Historial de predicciones |
| `stats.html` | Estadísticas y gráficas |
| `about.html` | Información del sistema |

---

### 2. Backend (Spring Boot)

**Tecnologías:**
- Java 17
- Spring Boot 3.2.1
- Spring Data JPA
- Spring WebFlux (WebClient)
- Resilience4j (Circuit Breaker)
- Micrometer/Prometheus (Métricas)
- Lombok

**Responsabilidades:**
- API REST para clientes
- Orquestación de servicios
- Validación de datos
- Persistencia en PostgreSQL
- Resiliencia ante fallos
- Métricas y monitoreo

**Estructura de paquetes:**

```
com.oracle.flightontime/
├── FlightOnTimeApplication.java    # Entry point
├── controller/
│   └── PredictionController.java   # REST endpoints
├── service/
│   ├── PredictionService.java      # Lógica de predicción
│   ├── BatchPredictionService.java # Procesamiento por lotes
│   ├── PredictionHistoryService.java # Historial
│   └── StatsService.java           # Estadísticas
├── entity/
│   └── PredictionHistory.java      # Entidad JPA
├── repository/
│   └── PredictionHistoryRepository.java # Repository
├── dto/
│   ├── PredictionRequestDTO.java   # Request
│   ├── PredictionResponseDTO.java  # Response
│   └── WeatherDataDTO.java         # Datos de clima
├── config/
│   ├── AirlineConfig.java          # Config de aerolíneas
│   └── WebClientConfig.java        # Config HTTP
└── util/
    └── GeoUtils.java               # Cálculo de distancias
```

---

### 3. ML Service (FastAPI)

**Tecnologías:**
- Python 3.11
- FastAPI 0.109
- scikit-learn 1.6.1
- pandas / numpy
- joblib (serialización)
- requests (HTTP client)

**Responsabilidades:**
- Carga del modelo ML entrenado
- Predicción de puntualidad
- Integración con OpenWeatherMap API
- Cálculo de distancia (Haversine)
- Catálogo de aeropuertos

**Modelo ML:**
- Algoritmo: Random Forest Classifier
- Features: 14 características
- Archivo: `random_forest_clima_v1.joblib`

---

### 4. PostgreSQL

**Versión:** 15-alpine

**Responsabilidades:**
- Persistencia de predicciones
- Historial para consultas
- Datos para estadísticas

**Schema:**

```sql
TABLE prediction_history (
    id              BIGSERIAL PRIMARY KEY,
    aerolinea       VARCHAR(50) NOT NULL,
    origen          VARCHAR(3) NOT NULL,
    destino         VARCHAR(3) NOT NULL,
    fecha_partida   VARCHAR(50),
    distancia_km    DOUBLE PRECISION,
    prediccion      INTEGER NOT NULL,    -- 0=Puntual, 1=Retrasado
    prevision       VARCHAR(50),
    probabilidad    DOUBLE PRECISION NOT NULL,
    confianza       DOUBLE PRECISION,
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch_id        VARCHAR(100)
);
```

---

## 🔄 Flujo de Datos

### Predicción Individual

```
1. Usuario llena formulario en Frontend
   │
2. Frontend envía POST a /api/predict
   │
3. Backend valida request (PredictionRequestDTO)
   │
4. Backend llama a ML Service (/predict_internal)
   │  └─ Circuit Breaker protege la llamada
   │
5. ML Service:
   │  a. Calcula distancia (Haversine)
   │  b. Obtiene clima (OpenWeatherMap)
   │  c. Prepara features
   │  d. Ejecuta predicción con modelo
   │
6. ML Service retorna PredictionResponse
   │
7. Backend guarda en PostgreSQL
   │
8. Backend retorna respuesta a Frontend
   │
9. Frontend muestra resultados con animaciones
```

### Predicción por Lotes

```
1. Usuario carga archivo CSV en Frontend
   │
2. Frontend envía POST multipart a /api/batch-predict
   │
3. Backend parsea CSV
   │
4. Backend procesa cada fila:
   │  └─ Llama a ML Service por cada vuelo
   │
5. Backend guarda todas las predicciones con batch_id
   │
6. Backend retorna resumen de lote
   │
7. Frontend permite descargar resultados (Excel)
```

---

## 🛡️ Patrones de Resiliencia

### Circuit Breaker (Resilience4j)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  CLOSED ──────────── failure threshold ──────────────► OPEN    │
│    │                      (50%)                           │      │
│    │                                                      │      │
│    │◄─────────────────── success ───────────────────────┘      │
│    │                                                      │      │
│    │                  wait duration                       │      │
│    │                     (10s)                            ▼      │
│    │                                                             │
│    └─────────────────► HALF_OPEN ◄────────────────────────┘    │
│                           │                                      │
│                     test requests                                │
│                        (3 calls)                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Configuración:**
- Failure rate threshold: 50%
- Wait duration in open state: 10 segundos
- Sliding window size: 10 llamadas
- Minimum calls: 5

### Retry Policy

- Max attempts: 3
- Wait duration: 1 segundo
- Exponential backoff: x2
- Retry on: TimeoutException, ResponseStatusException

---

## 📊 Métricas y Monitoreo

### Endpoints de Actuator

| Endpoint | Descripción |
|----------|-------------|
| `/actuator/health` | Estado de salud del servicio |
| `/actuator/metrics` | Lista de métricas disponibles |
| `/actuator/prometheus` | Métricas en formato Prometheus |

### Métricas Personalizadas

```
flightontime.predictions.total        # Total de predicciones
flightontime.predictions.puntual      # Predicciones puntuales
flightontime.predictions.retrasado    # Predicciones retrasadas
flightontime.predictions.errors       # Errores
flightontime.predictions.duration     # Latencia de predicciones
flightontime.predictions.by_airline   # Por aerolínea
flightontime.predictions.by_route     # Por ruta
```

---

## 🐳 Configuración Docker

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    healthcheck: pg_isready
    
  ml-service:
    build: ./ml-service
    ports: ["8001:8001"]
    depends_on: []
    environment:
      - OPENWEATHER_API_KEY
    
  backend:
    build: ./backend
    ports: ["8080:8080"]
    depends_on:
      - postgres (healthy)
      - ml-service (healthy)
    
  frontend:
    build: ./frontend
    ports: ["8081:80"]
    depends_on:
      - backend (healthy)
```

### Red Docker

Todos los servicios están conectados a `flightontime-network` (bridge).

---

## 🔐 Seguridad (Roadmap)

### Implementado (v1.0.0)

- ✅ Validación de entrada (Bean Validation)
- ✅ API Key externalizada (variable de entorno)
- ✅ CORS configurado

### Pendiente (Roadmap)

- ⏳ Autenticación JWT
- ⏳ HTTPS/TLS
- ⏳ Rate Limiting
- ⏳ API Gateway

---

## 📦 Dependencias Principales

### Backend (Java)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| spring-boot-starter-web | 3.2.1 | REST API |
| spring-boot-starter-data-jpa | 3.2.1 | Persistencia |
| spring-boot-starter-validation | 3.2.1 | Validación |
| spring-boot-starter-webflux | 3.2.1 | WebClient |
| spring-boot-starter-actuator | 3.2.1 | Health/Metrics |
| resilience4j-spring-boot3 | 2.1.0 | Circuit Breaker |
| micrometer-registry-prometheus | - | Métricas |
| postgresql | - | Driver BD |
| lombok | - | Boilerplate |

### ML Service (Python)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| fastapi | 0.109.0 | Framework web |
| uvicorn | 0.27.0 | ASGI server |
| scikit-learn | 1.6.1 | Machine Learning |
| pandas | 2.1.4 | Datos |
| numpy | 1.26.3 | Cálculos |
| requests | 2.31.0 | HTTP client |
| joblib | 1.2.0 | Serialización |

---

## 🔄 Comunicación entre Servicios

### Protocolo

- HTTP/1.1 sobre TCP
- JSON como formato de datos
- UTF-8 como codificación

### Timeouts

| Conexión | Valor |
|----------|-------|
| Backend → ML Service | 10 segundos |
| Backend → PostgreSQL | 20 segundos |
| Frontend → Backend | 30 segundos |

### Health Checks

| Servicio | Endpoint | Intervalo |
|----------|----------|-----------|
| PostgreSQL | pg_isready | 10s |
| ML Service | /health | 30s |
| Backend | /api/health | 30s |
| Frontend | / | 30s |

---

## 📈 Escalabilidad

### Horizontal

- Backend: Stateless, escalable con load balancer
- ML Service: Stateless (modelo en memoria)
- PostgreSQL: Réplicas de lectura

### Vertical

- ML Service: Más RAM para modelo grande
- PostgreSQL: Más conexiones

### Consideraciones

- El modelo ML se carga en memoria (~500MB)
- Cada réplica de ML Service necesita cargar el modelo
- Considerar Redis para caché de predicciones frecuentes

---

## 🗂️ Estructura de Archivos Completa

```
vektor-ai-backend/
│
├── backend/
│   ├── src/main/java/com/oracle/flightontime/
│   │   ├── FlightOnTimeApplication.java
│   │   ├── controller/
│   │   │   └── PredictionController.java
│   │   ├── service/
│   │   │   ├── PredictionService.java
│   │   │   ├── BatchPredictionService.java
│   │   │   ├── PredictionHistoryService.java
│   │   │   └── StatsService.java
│   │   ├── entity/
│   │   │   └── PredictionHistory.java
│   │   ├── repository/
│   │   │   └── PredictionHistoryRepository.java
│   │   ├── dto/
│   │   │   ├── PredictionRequestDTO.java
│   │   │   ├── PredictionResponseDTO.java
│   │   │   └── WeatherDataDTO.java
│   │   ├── config/
│   │   │   ├── AirlineConfig.java
│   │   │   └── WebClientConfig.java
│   │   └── util/
│   │       └── GeoUtils.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-dev.properties
│   │   ├── application-prod.properties
│   │   └── schema.sql
│   ├── src/test/java/
│   │   └── (tests)
│   ├── pom.xml
│   └── Dockerfile
│
├── ml-service/
│   ├── main.py
│   ├── airport_coords.py
│   ├── random_forest_clima_v1.joblib
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── index.html
│   ├── batch.html
│   ├── history.html
│   ├── stats.html
│   ├── about.html
│   ├── styles.css
│   ├── app.js
│   ├── i18n.js
│   ├── airline_data.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRATO_INTEGRACION.md
│   └── testing/
│       ├── GUIA_PRUEBAS.md
│       ├── CASOS_PRUEBA_BATCH.md
│       └── CASOS_PRUEBA_INSTRUCCIONES.md
│
├── postman/
│   ├── FlightOnTime_Postman_Collection.json
│   ├── FlightOnTime_Environment.json
│   └── README_Postman.md
│
├── docker-compose.yml
└── README.md
```

---

## 📝 Decisiones de Diseño

### ¿Por qué microservicios?

1. **Separación de responsabilidades**: ML en Python, API en Java
2. **Escalabilidad independiente**: Escalar ML sin afectar API
3. **Tecnología óptima**: Cada servicio usa la tecnología más adecuada
4. **Despliegue independiente**: Actualizar un servicio sin afectar otros

### ¿Por qué PostgreSQL?

1. **Robustez**: ACID compliance
2. **Rendimiento**: Bien optimizado para consultas analíticas
3. **Ecosistema**: Amplio soporte y herramientas
4. **Costo**: Open source

### ¿Por qué Random Forest?

1. **Interpretabilidad**: Fácil de explicar decisiones
2. **Robustez**: Maneja bien features numéricas y categóricas
3. **No overfitting**: Ensemble reduce sobreajuste
4. **Rendimiento**: Predicción rápida una vez entrenado

---

**Última actualización**: Enero 2026  
**Versión del documento**: 1.0.0
