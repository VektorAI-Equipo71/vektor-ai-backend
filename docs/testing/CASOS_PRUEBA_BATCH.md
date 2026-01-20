# Casos de Prueba para Predicción Batch

## Archivos Generados

### 1. `casos_prueba_batch.csv` (Principal)
- **25 casos de prueba** listos para usar
- Cubre diferentes escenarios: rutas cortas, medias y largas
- Incluye ambas aerolíneas (Delta y Southwest)
- Fechas variadas en enero 2026

### 2. `casos_prueba_batch_extendido.csv` (Adicional)
- **25 casos adicionales** para pruebas más exhaustivas
- Rutas diferentes a las del archivo principal
- Fechas en febrero 2026

## Formato del CSV

El archivo CSV debe contener las siguientes columnas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| `aerolinea` | String | ✅ Obligatorio | Código de aerolínea: "1" (Delta) o "2" (Southwest) | `1` |
| `origen` | String | ✅ Obligatorio | Código IATA del aeropuerto de origen (3 letras) | `ATL` |
| `destino` | String | ✅ Obligatorio | Código IATA del aeropuerto de destino (3 letras) | `LAX` |
| `fecha_partida` | String | ⚪ Opcional | Fecha y hora en formato ISO-8601 | `2026-01-15T06:00:00` |

### Notas sobre el formato:
- **Separador**: Coma (`,`)
- **Encabezados**: Primera línea debe contener los nombres de las columnas
- **Fechas**: Formato ISO-8601 (`YYYY-MM-DDTHH:mm:ss`)
- **Aeropuertos**: Códigos IATA en mayúsculas (se convertirán automáticamente)

## Distribución de Casos en `casos_prueba_batch.csv`

### Por Aerolínea:
- **Delta Air Lines (1)**: 13 casos
- **Southwest Airlines (2)**: 12 casos

### Por Tipo de Ruta:
- **Rutas Cortas** (< 1000 km): 
  - ATL-MIA, SFO-LAX, CVG-ATL, TPA-ATL, BWI-ATL, etc.
  
- **Rutas Medianas** (1000-2000 km):
  - ATL-LAX, DAL-LAX, ORD-DEN, PHX-SEA, etc.
  
- **Rutas Largas** (> 2000 km):
  - JFK-SFO, SEA-JFK, EWR-LAX, etc.

### Por Horarios:
- **Mañana temprano** (06:00-08:00): 8 casos
- **Mañana** (09:00-12:00): 9 casos
- **Tarde** (13:00-16:00): 8 casos

### Aeropuertos Incluidos:

**Delta (1):**
- ATL, LAX, JFK, SFO, MIA, DTW, MSP, CLT, DFW, BOS, EWR, CVG, PDX, IAD, MCO, SEA

**Southwest (2):**
- DAL, LAX, ORD, DEN, PHX, SEA, BWI, ATL, SAN, MDW, HOU, SLC, TPA, SMF, STL

## Casos de Prueba Incluidos

1. ATL → LAX (Delta) - Ruta larga, mañana temprano
2. DAL → LAX (Southwest) - Ruta media, mañana
3. JFK → SFO (Delta) - Ruta muy larga (transcontinental)
4. ORD → DEN (Southwest) - Ruta media, mañana
5. MIA → ATL (Delta) - Ruta corta, mañana
6. PHX → SEA (Southwest) - Ruta media, mediodía
7. DTW → MSP (Delta) - Ruta corta, tarde
8. BWI → ATL (Southwest) - Ruta corta, tarde
9. SFO → LAX (Delta) - Ruta muy corta (hub to hub)
10. DEN → PHX (Southwest) - Ruta corta, tarde
11. CLT → DFW (Delta) - Ruta media, mañana temprano
12. SEA → SAN (Southwest) - Ruta media, mañana
13. BOS → MIA (Delta) - Ruta larga, mañana
14. MDW → LAX (Southwest) - Ruta larga, mañana
15. EWR → LAX (Delta) - Ruta muy larga, mañana
16. HOU → ORD (Southwest) - Ruta media, mediodía
17. CVG → ATL (Delta) - Ruta corta, mañana temprano
18. SLC → DEN (Southwest) - Ruta corta, mañana
19. PDX → LAX (Delta) - Ruta corta, mañana
20. TPA → ATL (Southwest) - Ruta corta, mañana
21. IAD → LAX (Delta) - Ruta larga, mañana
22. SMF → LAX (Southwest) - Ruta corta, mediodía
23. MCO → ATL (Delta) - Ruta corta, mañana
24. STL → DEN (Southwest) - Ruta media, mañana
25. SEA → JFK (Delta) - Ruta muy larga (transcontinental)

## Cómo Usar los Archivos

### 1. Subir el archivo CSV
- Accede a la página de **Predicción Batch** (`batch.html`)
- Haz clic en "Seleccionar archivo" o arrastra el archivo `casos_prueba_batch.csv`
- Haz clic en "Procesar Predicciones"

### 2. Ver los Resultados
El sistema procesará cada línea y mostrará:
- ✅ **Predicción**: Puntual (0) o Retrasado (1)
- 📊 **Probabilidad de Retraso**: Porcentaje (0-100%)
- 🎯 **Confianza del Modelo**: Porcentaje (0-100%)
- 📏 **Distancia**: Calculada automáticamente en km
- ⏱️ **Tiempo de Procesamiento**: Para cada predicción

### 3. Exportar Resultados
- Los resultados se pueden descargar como CSV
- Incluye todas las métricas de predicción para análisis posterior

## Validaciones Aplicadas

La aplicación validará:
1. ✅ Formato correcto del CSV (encabezados requeridos)
2. ✅ Código de aerolínea válido ("1" o "2")
3. ✅ Aeropuertos válidos según la aerolínea seleccionada
4. ✅ Formato de fecha válido (si se proporciona)
5. ⚠️ Si un aeropuerto no existe para la aerolínea, se reportará como error

## Notas Importantes

- La **distancia** se calcula automáticamente usando la fórmula de Haversine, por lo que no es necesario incluirla en el CSV
- Si no se proporciona `fecha_partida`, se usará la fecha y hora actual
- Todos los aeropuertos incluidos están validados según `AirlineConfig.java`
- Las rutas seleccionadas son realistas y basadas en operaciones reales de las aerolíneas

## Resultados Esperados

Cada predicción incluirá:
- **Predicción binaria**: 0 = Puntual, 1 = Retrasado
- **Probabilidad de retraso**: Valor entre 0.0 y 1.0
- **Confianza**: Nivel de certeza del modelo (siempre será el máximo entre las probabilidades)
- **Distancia calculada**: En kilómetros
- **Datos meteorológicos**: Del aeropuerto de origen y destino (si están disponibles)

## Solución de Problemas

Si encuentras errores:
1. Verifica que el formato del CSV sea correcto (sin espacios extra, comas correctas)
2. Confirma que los códigos de aeropuerto sean válidos para la aerolínea seleccionada
3. Revisa el formato de la fecha (debe ser ISO-8601: `YYYY-MM-DDTHH:mm:ss`)
4. Verifica que el servicio ML esté funcionando correctamente
