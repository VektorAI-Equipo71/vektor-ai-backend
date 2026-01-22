# Ejemplos de Casos de Prueba - Postman

## 📋 Descripción

Este documento contiene **3 casos de prueba reales** para el endpoint `/api/predict` de FlightOnTime API, documentados para uso en Postman.

---

## ✅ Caso 1: Vuelo Puntual (Predicción Exitosa)

### 📝 Descripción
Predicción de un vuelo que se espera sea **puntual** (predicción = 0). Este caso representa un vuelo con condiciones favorables: horario temprano, ruta corta, y condiciones climáticas normales.

### 🔧 Configuración en Postman

**Método:** `POST`  
**URL:** `{{base_url}}/api/predict`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "aerolinea": "DL",
  "origen": "ATL",
  "destino": "CLT",
  "fecha_partida": "2026-01-20T04:30:00"
}
```

### 📊 Respuesta Esperada (200 OK)

```json
{
  "prediccion": 0,
  "probabilidad_retraso": 0.15,
  "confianza": 0.85,
  "distancia_km": 362.5,
  "clima_origen": {
    "temperatura": 8.5,
    "humedad": 72,
    "presion": 1015,
    "visibilidad": 10000,
    "viento_velocidad": 3.2,
    "condicion": "Clear",
    "descripcion": "cielo claro"
  },
  "clima_destino": {
    "temperatura": 6.0,
    "humedad": 68,
    "presion": 1018,
    "visibilidad": 10000,
    "viento_velocidad": 4.1,
    "condicion": "Clear",
    "descripcion": "cielo claro"
  },
  "metadata": {
    "aerolinea": "DL",
    "ruta": "ATL → CLT",
    "origen_nombre": "Hartsfield-Jackson Atlanta International Airport",
    "destino_nombre": "Charlotte Douglas International Airport",
    "fecha_partida": "2026-01-20T04:30:00",
    "timestamp_prediccion": "2026-01-20T10:15:23.456Z"
  }
}
```

### ✅ Validaciones

- **Status Code:** `200 OK`
- **prediccion:** `0` (Puntual)
- **probabilidad_retraso:** Entre `0.0` y `1.0`
- **confianza:** Entre `0.0` y `1.0`
- **distancia_km:** Valor positivo (aproximadamente 362 km para ATL → CLT)
- **clima_origen:** Objeto con datos meteorológicos
- **clima_destino:** Objeto con datos meteorológicos
- **metadata:** Objeto con información adicional

### 🎯 Características del Caso

- **Aerolínea:** Delta Air Lines (DL)
- **Ruta:** Atlanta (ATL) → Charlotte (CLT)
- **Distancia:** ~362 km (ruta corta)
- **Horario:** 04:30 AM (muy temprano, menor tráfico)
- **Resultado esperado:** Predicción = 0 (Puntual)

### 📝 Notas

Este caso utiliza un vuelo temprano en una ruta corta, lo que generalmente resulta en una predicción de puntualidad. El modelo ML considera que los vuelos tempranos tienen menor probabilidad de retraso debido al menor tráfico aéreo.

---

## ⏰ Caso 2: Vuelo Retrasado (Predicción Exitosa)

### 📝 Descripción
Predicción de un vuelo que se espera sea **retrasado** (predicción = 1). Este caso representa un vuelo con condiciones menos favorables: horario de mayor tráfico, ruta larga, y posiblemente condiciones climáticas adversas.

### 🔧 Configuración en Postman

**Método:** `POST`  
**URL:** `{{base_url}}/api/predict`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "aerolinea": "DL",
  "origen": "ATL",
  "destino": "LAX",
  "fecha_partida": "2026-01-20T14:30:00"
}
```

### 📊 Respuesta Esperada (200 OK)

```json
{
  "prediccion": 1,
  "probabilidad_retraso": 0.92,
  "confianza": 0.88,
  "distancia_km": 3125.8,
  "clima_origen": {
    "temperatura": 18.5,
    "humedad": 65,
    "presion": 1012,
    "visibilidad": 8000,
    "viento_velocidad": 12.3,
    "condicion": "Clouds",
    "descripcion": "nubes dispersas"
  },
  "clima_destino": {
    "temperatura": 22.0,
    "humedad": 58,
    "presion": 1010,
    "visibilidad": 10000,
    "viento_velocidad": 8.5,
    "condicion": "Clear",
    "descripcion": "cielo claro"
  },
  "metadata": {
    "aerolinea": "DL",
    "ruta": "ATL → LAX",
    "origen_nombre": "Hartsfield-Jackson Atlanta International Airport",
    "destino_nombre": "Los Angeles International Airport",
    "fecha_partida": "2026-01-20T14:30:00",
    "timestamp_prediccion": "2026-01-20T10:20:15.789Z"
  }
}
```

### ✅ Validaciones

- **Status Code:** `200 OK`
- **prediccion:** `1` (Retrasado)
- **probabilidad_retraso:** Entre `0.7` y `1.0` (alta probabilidad de retraso)
- **confianza:** Entre `0.0` y `1.0`
- **distancia_km:** Valor positivo (aproximadamente 3125 km para ATL → LAX)
- **clima_origen:** Objeto con datos meteorológicos
- **clima_destino:** Objeto con datos meteorológicos
- **metadata:** Objeto con información adicional

### 🎯 Características del Caso

- **Aerolínea:** Delta Air Lines (DL)
- **Ruta:** Atlanta (ATL) → Los Angeles (LAX)
- **Distancia:** ~3125 km (ruta larga, transcontinental)
- **Horario:** 14:30 PM (horario de mayor tráfico)
- **Resultado esperado:** Predicción = 1 (Retrasado)

### 📝 Notas

Este caso utiliza un vuelo en horario de mayor tráfico (tarde) en una ruta larga transcontinental. El modelo ML considera que estos vuelos tienen mayor probabilidad de retraso debido a:
- Mayor congestión aérea en horarios pico
- Mayor distancia (más tiempo de vuelo = más oportunidades de retraso)
- Posibles condiciones climáticas adversas
- Mayor probabilidad de retrasos en cascada

---

## ❌ Caso 3: Error de Validación (Request Inválido)

### 📝 Descripción
Este caso demuestra el manejo de errores cuando se envía un request con datos inválidos. En este ejemplo, el aeropuerto de origen y destino son el mismo, lo cual no es válido.

### 🔧 Configuración en Postman

**Método:** `POST`  
**URL:** `{{base_url}}/api/predict`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "aerolinea": "DL",
  "origen": "ATL",
  "destino": "ATL",
  "fecha_partida": "2026-01-20T14:30:00"
}
```

### 📊 Respuesta Esperada (400 Bad Request)

```json
{
  "timestamp": "2026-01-20T10:25:42.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "El origen y destino no pueden ser iguales",
  "path": "/api/predict"
}
```

**O alternativamente:**

```json
{
  "error": "Validación fallida",
  "campos": {
    "destino": "El destino debe ser diferente del origen"
  }
}
```

### ✅ Validaciones

- **Status Code:** `400 Bad Request`
- **error:** Campo presente con mensaje descriptivo
- **message o campos:** Información sobre qué campo está inválido

### 🎯 Características del Caso

- **Aerolínea:** Delta Air Lines (DL)
- **Origen:** Atlanta (ATL)
- **Destino:** Atlanta (ATL) ⚠️ **INVÁLIDO** (igual al origen)
- **Resultado esperado:** Error 400 - Bad Request

### 📝 Notas

Este caso valida que el sistema rechaza correctamente requests inválidos. El backend debe validar que:
- Origen y destino sean diferentes
- Los códigos IATA sean válidos (3 letras mayúsculas)
- Los aeropuertos existan en el catálogo
- La aerolínea sea válida

### 🔄 Variantes de Error

Puedes probar otros casos de error:

#### Variante A: Aeropuerto Inexistente
```json
{
  "aerolinea": "DL",
  "origen": "XXX",
  "destino": "YYY",
  "fecha_partida": "2026-01-20T14:30:00"
}
```
**Respuesta esperada:** `400 Bad Request` - "El aeropuerto de origen 'XXX' no fue encontrado"

#### Variante B: Parámetros Faltantes
```json
{
  "aerolinea": "DL"
}
```
**Respuesta esperada:** `400 Bad Request` - Campos requeridos faltantes (origen, destino)

#### Variante C: Formato de Fecha Inválido
```json
{
  "aerolinea": "DL",
  "origen": "ATL",
  "destino": "JFK",
  "fecha_partida": "2026-01-20"
}
```
**Respuesta esperada:** `400 Bad Request` - Formato de fecha inválido

---

## 🧪 Scripts de Prueba para Postman

### Tests para Caso 1 (Puntual)

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Predicción es 0 (Puntual)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.prediccion).to.eql(0);
});

pm.test("Probabilidad de retraso es baja (< 0.5)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.probabilidad_retraso).to.be.below(0.5);
});

pm.test("Confianza es razonable (> 0.7)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.confianza).to.be.above(0.7);
});

pm.test("Distancia calculada correctamente", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.distancia_km).to.be.above(0);
    pm.expect(jsonData.distancia_km).to.be.below(500); // Ruta corta
});
```

### Tests para Caso 2 (Retrasado)

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Predicción es 1 (Retrasado)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.prediccion).to.eql(1);
});

pm.test("Probabilidad de retraso es alta (> 0.7)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.probabilidad_retraso).to.be.above(0.7);
});

pm.test("Distancia es larga (> 2000 km)", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.distancia_km).to.be.above(2000);
});
```

### Tests para Caso 3 (Error)

```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Response contains error message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('error').or.have.property('message');
});

pm.test("Error message mentions validation issue", function () {
    var responseText = pm.response.text().toLowerCase();
    pm.expect(responseText).to.include('origen').or.include('destino').or.include('igual');
});
```

---

## 📚 Referencias

- **Colección Postman:** `FlightOnTime_Postman_Collection.json`
- **Environment:** `FlightOnTime_Environment.json`
- **Documentación API:** `docs/CONTRATO_INTEGRACION.md`
- **Base URL:** `http://localhost:8080` (desarrollo)

---

## 🔍 Cómo Usar Estos Casos

1. **Importar la colección Postman** si aún no lo has hecho
2. **Crear nuevos requests** o modificar los existentes con estos ejemplos
3. **Copiar el body JSON** correspondiente a cada caso
4. **Ejecutar el request** y verificar la respuesta
5. **Agregar los tests** en la pestaña "Tests" de Postman para validación automática

---

**Última actualización:** Enero 2026  
**Versión:** 1.0.0
