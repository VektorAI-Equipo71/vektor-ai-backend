# Instrucciones para Casos de Prueba CSV

## 📋 Archivos de Prueba Disponibles

### 1. `casos_prueba_balanceados.csv`
Archivo CSV con 50 casos variados que incluyen:
- ✅ Horarios desde muy temprano (04:30) hasta tarde (18:00)
- ✅ Rutas de diferentes distancias (cortas, medianas, largas)
- ✅ Ambas aerolíneas (1 = Delta, 2 = Southwest)
- ✅ Diferentes días de la semana
- ✅ Diferentes aeropuertos y rutas

## 🎯 Uso del Archivo

### Importar el CSV para Pruebas Batch

El archivo CSV tiene el siguiente formato:

```csv
aerolinea,origen,destino,fecha_partida
1,ATL,LAX,2026-01-20T06:00:00
2,DFW,ORD,2026-01-20T06:30:00
```

### Columnas Requeridas:
- `aerolinea`: Código de aerolínea (1 = Delta, 2 = Southwest)
- `origen`: Código IATA del aeropuerto de origen (ej: ATL, LAX, JFK)
- `destino`: Código IATA del aeropuerto de destino

### Columnas Opcionales:
- `fecha_partida`: Fecha y hora de partida en formato ISO-8601 (ej: 2026-01-20T14:30:00)

## 📊 Resultados Esperados

**Nota importante**: El modelo `random_forest_intento4_version2.joblib` ha sido entrenado con datos históricos que muestran una tendencia hacia predecir retrasos (predicción = 1) en la mayoría de los casos.

### Comportamiento del Modelo:

#### **Casos con Mayor Probabilidad de Retraso (Predicción = 1)**:
- Horarios de mayor tráfico (14:00 - 18:00)
- Vuelos de larga distancia
- Rutas entre hubs principales (ATL↔LAX, JFK↔LAX, etc.)
- Días de semana laborables (lunes a viernes)

**Probabilidades típicas**: 0.90 - 0.99 (90% - 99%)

#### **Casos con Menor Probabilidad de Retraso (Probable Predicción = 1, pero con menor confianza)**:
- Horarios muy tempranos (04:30 - 06:00)
- Rutas cortas entre ciudades cercanas
- Vuelos regionales

**Probabilidades típicas**: 0.70 - 0.90 (70% - 90%)

### ⚠️ Observación Importante

**El modelo actual tiende a predecir "Retrasado" (1) para la mayoría de los casos**, incluso en horarios tempranos o rutas cortas. Esto puede deberse a:

1. **Sesgo en los datos de entrenamiento**: Los datos históricos pueden mostrar más retrasos que puntualidad
2. **Características del modelo**: Las features más importantes (DEP_TIME, CRS_DEP_TIME) pueden estar correlacionadas con retrasos
3. **Umbral del modelo**: El modelo puede tener un umbral que favorece la predicción de retrasos

### 🔍 Para Obtener Ambos Tipos de Predicciones (0 y 1):

Si necesitas casos que definitivamente resulten en predicción **0 (Puntual)**, podrías necesitar:

1. **Ajustar el umbral del modelo** (si es configurable)
2. **Entrenar con datos más balanceados** que incluyan más ejemplos de vuelos puntuales
3. **Usar casos específicos** que históricamente muestran alta puntualidad (estos requerirían análisis específico del dataset de entrenamiento)

### 📈 Ejemplo de Prueba Manual

Para probar un caso específico:

```bash
curl -X POST http://localhost:8080/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "aerolinea": "1",
    "origen": "ATL",
    "destino": "LAX",
    "fecha_partida": "2026-01-20T06:00:00"
  }'
```

Respuesta esperada:
```json
{
  "prediccion": 1,
  "probabilidad_retraso": 0.9763,
  "confianza": 0.9763,
  "distancia_km": 3125.8,
  "clima_origen": {...},
  "clima_destino": {...},
  "metadata": {...}
}
```

## 📝 Notas para Desarrollo

Si necesitas casos que generen predicción **0 (Puntual)**, considera:

1. Revisar el dataset de entrenamiento para identificar patrones de puntualidad
2. Ajustar los hiperparámetros del modelo
3. Balancear el dataset de entrenamiento
4. Usar técnicas de ajuste de umbral en el modelo

## ✅ Casos de Prueba Incluidos

El archivo `casos_prueba_balanceados.csv` incluye:
- 50 casos variados
- Horarios desde 04:30 hasta 18:00
- Ambas aerolíneas (Delta y Southwest)
- Múltiples rutas y aeropuertos
- Diferentes días de la semana

**Estos casos son útiles para:**
- ✅ Probar el servicio de predicción batch
- ✅ Verificar el funcionamiento del modelo
- ✅ Analizar probabilidades de retraso
- ✅ Probar diferentes escenarios y horarios
