# Contrato de Integración - FlightOnTime API

## 📋 Información General

| Atributo | Valor |
|----------|-------|
| **Nombre del Servicio** | FlightOnTime API |
| **Versión** | 1.0.0 |
| **Base URL (Local)** | `http://localhost:8080/api` |
| **Base URL (Producción)** | `http://159.54.159.244/api` |
| **Frontend (Producción)** | `http://159.54.159.244/index.html` |
| **Formato de Datos** | JSON |
| **Codificación** | UTF-8 |
| **Autenticación** | No requerida (v1.0.0) |

## 🌐 Entornos Disponibles

### Entorno de Producción
- **URL Base**: `http://159.54.159.244`
- **Frontend**: `http://159.54.159.244/index.html`
- **Backend API**: `http://159.54.159.244/api`
- **Estado**: ✅ Activo y funcionando

### Entorno Local (Docker)
- **URL Base**: `http://localhost:8080`
- **Frontend**: `http://localhost:8081`
- **Backend API**: `http://localhost:8080/api`
- **ML Service**: `http://localhost:8001`
- **PostgreSQL**: `localhost:5432`


---

## 🔌 Endpoints

### 1. Predicción Individual

**Descripción**: Realiza una predicción de puntualidad para un vuelo específico.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/predict` |
| **Método** | `POST` |
| **Content-Type** | `application/json` |

#### Request Body

```json
{
  "aerolinea": "string",
  "origen": "string",
  "destino": "string",
  "fecha_partida": "string"
}
```

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| `aerolinea` | string | ✅ Sí | Código de aerolínea IATA | Not blank |
| `origen` | string | ✅ Sí | Código IATA aeropuerto origen | 3 letras mayúsculas |
| `destino` | string | ✅ Sí | Código IATA aeropuerto destino | 3 letras mayúsculas |
| `fecha_partida` | string | ❌ No | Fecha/hora de partida | ISO-8601 |

**Ejemplo Request:**

```json
{
  "aerolinea": "DL",
  "origen": "ATL",
  "destino": "JFK",
  "fecha_partida": "2026-01-15T14:30:00"
}
```

#### Response Body (Éxito - 200)

```json
{
  "prediccion": 0,
  "probabilidad_retraso": 0.15,
  "confianza": 0.85,
  "distancia_km": 1208.45,
  "clima_origen": {
    "temperatura": 22.5,
    "humedad": 65,
    "presion": 1013,
    "visibilidad": 10000,
    "viento_velocidad": 5.2,
    "condicion": "Clear",
    "descripcion": "cielo claro"
  },
  "clima_destino": {
    "temperatura": 18.0,
    "humedad": 72,
    "presion": 1015,
    "visibilidad": 8000,
    "viento_velocidad": 8.1,
    "condicion": "Clouds",
    "descripcion": "nubes dispersas"
  },
  "metadata": {
    "aerolinea": "DL",
    "ruta": "ATL → JFK",
    "origen_nombre": "Hartsfield-Jackson Atlanta International Airport",
    "destino_nombre": "John F. Kennedy International Airport",
    "fecha_partida": "2026-01-15T14:30:00",
    "timestamp_prediccion": "2026-01-20T15:34:37.123Z"
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `prediccion` | integer | 0 = Puntual, 1 = Retrasado |
| `probabilidad_retraso` | float | Probabilidad de retraso (0.0 - 1.0) |
| `confianza` | float | Nivel de confianza del modelo (0.0 - 1.0) |
| `distancia_km` | float | Distancia calculada en kilómetros |
| `clima_origen` | object | Datos meteorológicos del origen |
| `clima_destino` | object | Datos meteorológicos del destino |
| `metadata` | object | Información adicional de la predicción |

#### WeatherDataDTO (clima_origen / clima_destino)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `temperatura` | float | Temperatura en °C |
| `humedad` | integer | Humedad relativa (%) |
| `presion` | integer | Presión atmosférica (hPa) |
| `visibilidad` | integer | Visibilidad en metros |
| `viento_velocidad` | float | Velocidad del viento (m/s) |
| `condicion` | string | Condición climática principal |
| `descripcion` | string | Descripción detallada del clima |

---

### 2. Predicción por Lotes

**Descripción**: Procesa múltiples vuelos desde un archivo CSV.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/batch-predict` |
| **Método** | `POST` |
| **Content-Type** | `multipart/form-data` |

#### Request Parameters

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | file | ✅ Sí | Archivo CSV con vuelos |
| `batch_id` | string | ❌ No | ID único para agrupar el lote |

#### Formato CSV

```csv
aerolinea,origen,destino,fecha_partida
DL,ATL,JFK,2026-01-15T14:30:00
WN,LAX,ORD,2026-01-16T10:00:00
UA,SFO,DEN,2026-01-17T08:15:00
```

#### Response Body (Éxito - 200)

```json
{
  "batch_id": "BATCH-20260120-153437",
  "total_procesados": 3,
  "exitosos": 3,
  "fallidos": 0,
  "resultados": [
    {
      "prediccion": 0,
      "probabilidad_retraso": 0.15,
      "confianza": 0.85,
      ...
    }
  ]
}
```

---

### 3. Consultar Predicciones (Historial)

**Descripción**: Consulta predicciones almacenadas con paginación y filtros.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/predictions` |
| **Método** | `GET` |

#### Query Parameters

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | integer | ❌ | 0 | Número de página |
| `size` | integer | ❌ | 20 | Tamaño de página |
| `sortBy` | string | ❌ | fechaPrediccion | Campo para ordenar |
| `sortDir` | string | ❌ | desc | Dirección (asc/desc) |
| `fechaInicio` | date | ❌ | - | Fecha inicio (yyyy-MM-dd) |
| `fechaFin` | date | ❌ | - | Fecha fin (yyyy-MM-dd) |
| `aerolinea` | string | ❌ | - | Filtrar por aerolínea |
| `origen` | string | ❌ | - | Filtrar por origen |
| `destino` | string | ❌ | - | Filtrar por destino |
| `prediccion` | integer | ❌ | - | 0=Puntual, 1=Retrasado |
| `batchId` | string | ❌ | - | Filtrar por ID de lote |

**Ejemplo Request:**
```
GET /api/predictions?page=0&size=20&aerolinea=DL&prediccion=1
```

#### Response Body (Éxito - 200)

```json
{
  "content": [
    {
      "id": 1,
      "aerolinea": "DL",
      "origen": "ATL",
      "destino": "JFK",
      "fechaPartida": "2026-01-15T14:30:00",
      "distanciaKm": 1208.45,
      "prediccion": 0,
      "prevision": "Puntual",
      "probabilidad": 0.15,
      "confianza": 0.85,
      "fechaPrediccion": "2026-01-20T15:34:37",
      "batchId": null
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 150,
  "totalPages": 8
}
```

---

### 4. Estadísticas

**Descripción**: Obtiene estadísticas agregadas de predicciones.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/stats` |
| **Método** | `GET` |

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `inicio` | date | ❌ | Fecha inicio (yyyy-MM-dd) |
| `fin` | date | ❌ | Fecha fin (yyyy-MM-dd) |
| `batchId` | string | ❌ | Filtrar por ID de lote |

#### Response Body (Éxito - 200)

```json
{
  "total_predicciones": 1500,
  "puntuales": 1200,
  "retrasados": 300,
  "porcentaje_puntualidad": 80.0,
  "por_aerolinea": {
    "DL": { "total": 200, "puntuales": 180, "retrasados": 20 },
    "AA": { "total": 150, "puntuales": 120, "retrasados": 30 }
  },
  "por_origen": {
    "ATL": { "total": 100, "puntuales": 85, "retrasados": 15 }
  },
  "por_destino": {
    "JFK": { "total": 80, "puntuales": 70, "retrasados": 10 }
  }
}
```

---

### 5. Health Check

**Descripción**: Verifica el estado del servicio.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/health` |
| **Método** | `GET` |

#### Response Body (Éxito - 200)

```json
{
  "status": "UP",
  "service": "flightontime-backend",
  "version": "1.0.0",
  "timestamp": "2026-01-20T15:34:37.123Z"
}
```

---

### 6. Documentación de Endpoints

**Descripción**: Retorna información sobre los endpoints disponibles.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/docs` |
| **Método** | `GET` |

---

### 7. Opciones de Filtros

**Descripción**: Retorna listas de valores únicos para filtros.

| Atributo | Valor |
|----------|-------|
| **URL** | `/api/predictions/filters` |
| **Método** | `GET` |

#### Response Body (Éxito - 200)

```json
{
  "aerolineas": ["DL", "AA", "UA", "WN"],
  "origenes": ["ATL", "LAX", "JFK", "ORD"],
  "destinos": ["JFK", "MIA", "SFO", "SEA"]
}
```

---

## 🔴 ML Service API (Interno)

El ML Service es utilizado internamente por el Backend. Estos endpoints no deben ser consumidos directamente por clientes externos.

### Predicción Interna

| Atributo | Valor |
|----------|-------|
| **URL** | `http://localhost:8001/predict_internal` |
| **Método** | `POST` |



### Health Check ML

| Atributo | Valor |
|----------|-------|
| **URL** | `http://localhost:8001/health` |
| **Método** | `GET` |

---

## 🔴 Códigos de Error

### Códigos HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 400 | Bad Request | Parámetros inválidos o faltantes |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error interno del servidor |
| 503 | Service Unavailable | Servicio ML no disponible |

### Formato de Error

```json
{
  "timestamp": "2026-01-20T15:34:37.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El aeropuerto de origen 'XXX' no fue encontrado",
  "path": "/api/predict"
}
```

---

## ✅ Validaciones

### Aeropuertos

- Código IATA: 3 letras mayúsculas (A-Z)
- Debe existir en el catálogo de aeropuertos
- Origen y destino deben ser diferentes

### Aerolíneas

- Código IATA válido (2 letras o alfanumérico)
- Debe estar en la lista de aerolíneas soportadas

### Fecha de Partida

- Formato: ISO-8601 (`YYYY-MM-DDTHH:mm:ss`)
- Campo opcional (usa fecha actual si no se proporciona)

---

## 📊 Aerolíneas Soportadas

| Código | Nombre Completo |
|--------|-----------------|
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

---

## 🌐 Headers Requeridos

| Header | Valor | Requerido |
|--------|-------|-----------|
| Content-Type | application/json | ✅ Para POST con JSON |
| Accept | application/json | ❌ Opcional |

---

## 📝 Ejemplos de Uso

### cURL - Predicción Individual (Local)

```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "aerolinea": "DL",
    "origen": "ATL",
    "destino": "JFK",
    "fecha_partida": "2026-01-15T14:30:00"
  }'
```

### cURL - Predicción Individual (Producción)

```bash
curl -X POST http://159.54.159.244/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "aerolinea": "DL",
    "origen": "ATL",
    "destino": "JFK",
    "fecha_partida": "2026-01-15T14:30:00"
  }'
```

### cURL - Consultar Estadísticas (Local)

```bash
curl http://localhost:8080/api/stats
```

### cURL - Consultar Estadísticas (Producción)

```bash
curl http://159.54.159.244/api/stats
```

### cURL - Consultar Historial con Filtros (Local)

```bash
curl "http://localhost:8080/api/predictions?page=0&size=20&aerolinea=DL"
```

### cURL - Consultar Historial con Filtros (Producción)

```bash
curl "http://159.54.159.244/api/predictions?page=0&size=20&aerolinea=DL"
```

### cURL - Health Check (Local)

```bash
curl http://localhost:8080/api/health
```

### cURL - Health Check (Producción)

```bash
curl http://159.54.159.244/api/health
```


---

## 🔒 Consideraciones de Seguridad

1. **API Key**: No exponer la API Key de OpenWeatherMap en el frontend
2. **CORS**: Configurado para permitir todos los orígenes en desarrollo
3. **Rate Limiting**: No implementado en v1.0.0
4. **Autenticación**: No requerida en v1.0.0 (roadmap para v2.0)

---

## 📈 Límites y Cuotas

| Parámetro | Valor |
|-----------|-------|
| Tamaño máximo de request | 10 MB |
| Timeout de request | 30 segundos |
| Máximo de registros por página | 100 |
| Máximo de vuelos por lote CSV | 1000 |

---

## 🔄 Versionado

La API sigue versionado semántico (SemVer):

- **v1.0.0**: Versión inicial
- Path de versión: No incluido en URL (futuras versiones: `/api/v2/...`)

---

## 📞 Soporte

Para soporte técnico o consultas sobre la integración:

- **Repositorio del Equipo**: [https://github.com/VektorAI-Equipo71](https://github.com/VektorAI-Equipo71)
- **Documentación técnica**: Este documento
- **Colección Postman**: `postman/FlightOnTime_Postman_Collection.json`
- **Logs del sistema**: `docker compose logs -f`

---

**Última actualización**: Enero 2026  
**Versión del documento**: 1.0.2
