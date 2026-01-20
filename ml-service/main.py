# ============================================================================
# SERVICIO ML - FLIGHTONTIME
# Motor de Predicción de Puntualidad de Vuelos con Integración Meteorológica
# ============================================================================
# Este servicio FastAPI carga el modelo ML entrenado (model.pkl) y proporciona
# predicciones enriquecidas con datos meteorológicos en tiempo real.
# ============================================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import joblib
import pandas as pd
import numpy as np
from math import radians, sin, cos, sqrt, atan2
import requests
from datetime import datetime
import logging
import os
import sys

from airport_coords import AIRPORT_COORDINATES

# ============================================================================
# CONFIGURACIÓN DE LOGGING
# ============================================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# INICIALIZACIÓN DE FASTAPI
# ============================================================================
app = FastAPI(
    title="FlightOnTime ML Service",
    description="Servicio de predicción de puntualidad de vuelos con integración meteorológica",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    """
    Endpoint de salud para Docker Healthcheck
    AL-003: Healthcheck que falle si modelo no carga
    """
    if model is None:
        logger.error("❌ Modelo ML no disponible")
        raise HTTPException(
            status_code=503,
            detail="Modelo ML no disponible. El servicio no puede procesar predicciones."
        )
    
    return {
        "status": "healthy",
        "modelo": "cargado" if model is not None else "no disponible",
        "timestamp": datetime.now().isoformat()
    }

# Configuración CORS para permitir llamadas desde el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# CARGA DEL MODELO ML
# ============================================================================
MODEL_PATH = "random_forest_clima_v1.joblib"

# Función stub necesaria para deserializar el modelo (fue entrenado con esta función)
def feature_engineering(*args, **kwargs):
    """Función stub para deserializar el modelo. No se usa realmente."""
    pass

# Asegurar que feature_engineering esté disponible en el módulo __main__
# Esto es necesario cuando el modelo fue entrenado con esta función y se carga con uvicorn
if __name__ != "__main__" or hasattr(sys.modules.get('__main__', None), '__file__'):
    # Si estamos en el contexto de uvicorn, asegurar que la función esté en __main__
    import __main__ as main_module
    if not hasattr(main_module, 'feature_engineering'):
        main_module.feature_engineering = feature_engineering
    # También asegurar en el módulo actual
    setattr(sys.modules[__name__], 'feature_engineering', feature_engineering)
    
# Además, registrar en el módulo __main__ directamente (para joblib)
try:
    __main__ = sys.modules.get('__main__')
    if __main__ is not None:
        __main__.feature_engineering = feature_engineering
except:
    pass

try:
    # El modelo está guardado como un diccionario que contiene:
    # - 'model': El RandomForestClassifier real
    # - 'encoders': Diccionario de encoders
    # - 'feature_engineering': Función de feature engineering
    # - 'features': Lista de nombres de features
    model_data = joblib.load(MODEL_PATH)
    
    # Extraer el modelo real del diccionario
    if isinstance(model_data, dict) and 'model' in model_data:
        model = model_data['model']
        encoders = model_data.get('encoders', {})
        expected_features = model_data.get('features', [])
        logger.info(f"✅ Modelo cargado exitosamente desde {MODEL_PATH}")
        logger.info(f"📋 Modelo: RandomForestClassifier con {model.n_estimators} árboles")
        logger.info(f"📋 Features esperadas: {len(expected_features)} características")
        logger.info(f"📋 Encoders disponibles: {list(encoders.keys()) if encoders else 'Ninguno'}")
    else:
        model = model_data
        encoders = {}
        expected_features = []
        logger.warning(f"⚠️ Modelo no está en formato diccionario esperado, usando directamente")
        logger.info(f"✅ Modelo cargado exitosamente desde {MODEL_PATH}")
except Exception as e:
    logger.error(f"❌ Error al cargar el modelo: {e}")
    import traceback
    logger.error(f"❌ Traceback completo:\n{traceback.format_exc()}")
    model = None
    encoders = {}
    expected_features = []

# ============================================================================
# CONFIGURACIÓN DE API METEOROLÓGICA
# ============================================================================
# CR-002: Externalizar API Key desde variable de entorno
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "d4ce4d4589c7a7ac4343085c00c39f9b")
if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "":
    logger.warning("⚠️ OPENWEATHER_API_KEY no configurada, usando valor por defecto (solo para desarrollo)")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# ============================================================================
# CONFIGURACIÓN DE AEROLÍNEAS
# ============================================================================
# El modelo random_forest_intento4_version2.joblib fue entrenado con:
# - Código "1" = Delta Air Lines (DL)
# - Códigos IATA soportados: 9E, AA, AS, B6, DL, F9, G4, HA, MQ, NK, OH, OO, UA, WN, YX
# 
# Estos códigos se usan directamente en las predicciones.
# NO se requiere mapeo adicional.
# ============================================================================

# ============================================================================
# MODELOS DE DATOS (DTOs)
# ============================================================================

class PredictionRequest(BaseModel):
    """
    Modelo de entrada para solicitud de predicción.
    El usuario NO envía la distancia, se calcula automáticamente.
    """
    aerolinea: str = Field(..., description="Código IATA de aerolínea: 9E, AA, AS, B6, DL, F9, G4, HA, MQ, NK, OH, OO, UA, WN, YX")
    origen: str = Field(..., description="Código IATA del aeropuerto de origen (ej: ATL, LAX, JFK)")
    destino: str = Field(..., description="Código IATA del aeropuerto de destino (ej: ORD, MIA, SEA)")
    fecha_partida: Optional[str] = Field(None, description="Fecha de partida en formato ISO-8601")
    
    class Config:
        json_schema_extra = {
            "example": {
                "aerolinea": "DL",
                "origen": "ATL",
                "destino": "LAX",
                "fecha_partida": "2026-01-15T14:30:00"
            }
        }


class WeatherData(BaseModel):
    """Datos meteorológicos del aeropuerto de origen"""
    temperatura: float
    humedad: int
    presion: int
    visibilidad: int
    viento_velocidad: float
    condicion: str
    descripcion: str


class PredictionResponse(BaseModel):
    """Respuesta completa de la predicción"""
    prediccion: int  # 0 = Puntual, 1 = Retrasado
    probabilidad_retraso: float
    confianza: float
    distancia_km: float
    clima_origen: WeatherData
    clima_destino: Optional[WeatherData] = None
    metadata: Dict[str, Any]

# ... existing code ...

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

def calcular_distancia_haversine(lat1, lon1, lat2, lon2):
    """
    Calcula la distancia en kilómetros entre dos puntos geográficos
    usando la fórmula de Haversine.
    """
    # Radio de la Tierra en km
    R = 6371.0

    # Convertir grados a radianes
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distancia = R * c
    return distancia


def obtener_clima_aeropuerto(iata_code: str) -> Optional[WeatherData]:
    """
    Obtiene el clima actual para un aeropuerto usando OpenWeatherMap.
    Usa las coordenadas del diccionario para la búsqueda.
    """
    try:
        # 1. Obtener coordenadas
        if iata_code not in AIRPORT_COORDINATES:
            logger.warning(f"⚠️ No hay coordenadas para {iata_code}, no se puede obtener clima")
            return None
            
        coords = AIRPORT_COORDINATES[iata_code]
        lat = coords['lat']
        lon = coords['lon']
        
        # 2. Consultar API
        # Documentación: https://openweathermap.org/current
        params = {
            'lat': lat,
            'lon': lon,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric', # Para obtener Celsius y m/s
            'lang': 'es'       # Descripciones en español
        }
        
        logger.debug(f"Petición clima {iata_code}: {lat}, {lon}")
        
        response = requests.get(OPENWEATHER_BASE_URL, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            # Mapear respuesta a nuestro DTO
            weather = WeatherData(
                temperatura=float(data['main']['temp']),
                humedad=int(data['main']['humidity']),
                presion=int(data['main']['pressure']),
                visibilidad=int(data.get('visibility', 10000)),
                viento_velocidad=float(data['wind']['speed']),
                condicion=data['weather'][0]['main'],
                descripcion=data['weather'][0]['description']
            )
            return weather
            
        else:
            logger.error(f"❌ Error API OpenWeatherMap ({response.status_code}): {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Excepción obteniendo clima para {iata_code}: {e}")
        return None


@app.post("/predict_internal", response_model=PredictionResponse)
async def predict_internal(request: PredictionRequest):
    """
    Endpoint principal de predicción con enriquecimiento meteorológico.
    """
    logger.info(f"🔍 Iniciando predicción para: Aerolínea={request.aerolinea}, {request.origen} → {request.destino}")

    
    try:
        # ====================================================================
        # 1. VALIDACIÓN DE AEROPUERTOS
        # ====================================================================
        logger.debug(f"Validando aeropuerto de origen: {request.origen}")
        if request.origen not in AIRPORT_COORDINATES:
            logger.error(f"❌ Aeropuerto de origen '{request.origen}' no encontrado")
            # Optimize: don't list all if too many
            raise HTTPException(
                status_code=400,
                detail=f"Aeropuerto de origen '{request.origen}' no encontrado."
            )
        
        logger.debug(f"Validando aeropuerto de destino: {request.destino}")
        if request.destino not in AIRPORT_COORDINATES:
            logger.error(f" Aeropuerto de destino '{request.destino}' no encontrado")
            raise HTTPException(
                status_code=400,
                detail=f"Aeropuerto de destino '{request.destino}' no encontrado."
            )
        
        logger.info(f" Aeropuertos validados: {request.origen} y {request.destino}")
        
        # ====================================================================
        # 2. CÁLCULO AUTOMÁTICO DE DISTANCIA
        # ====================================================================
        origen_coords = AIRPORT_COORDINATES[request.origen]
        destino_coords = AIRPORT_COORDINATES[request.destino]
        
        logger.debug(f"Calculando distancia entre {origen_coords['name']} y {destino_coords['name']}")
        
        distancia_km = calcular_distancia_haversine(
            origen_coords["lat"], origen_coords["lon"],
            destino_coords["lat"], destino_coords["lon"]
        )
        
        logger.info(f"📏 Distancia calculada: {distancia_km:.2f} km")
        
        # ====================================================================
        # 3. CONSULTA DE CLIMA EN TIEMPO REAL (ORIGEN Y DESTINO)
        # ====================================================================
        # Clima Origen
        logger.debug(f"Consultando clima para {request.origen}")
        clima_origen = obtener_clima_aeropuerto(request.origen)
        
        if clima_origen is None:
            logger.warning(f"⚠️ No se pudo obtener clima real para {request.origen}, usando simulado")
            # ... simulación simplificada ...
            clima_origen = WeatherData(
                temperatura=20.0, humedad=60, presion=1013, visibilidad=10000,
                viento_velocidad=5.0, condicion="Clear", descripcion="cielo claro"
            )

        # Clima Destino (Nuevo Requerimiento)
        logger.debug(f"Consultando clima para {request.destino}")
        clima_destino = obtener_clima_aeropuerto(request.destino)
        
        if clima_destino is None:
             logger.warning(f"⚠️ No se pudo obtener clima real para {request.destino}, usando simulado")
             clima_destino = WeatherData(
                temperatura=20.0, humedad=60, presion=1013, visibilidad=10000,
                viento_velocidad=5.0, condicion="Clear", descripcion="cielo claro"
            )

        # ====================================================================
        # 4. PREPARACIÓN DE FEATURES Y PREDICCIÓN
        # ====================================================================
        if model is None:
            logger.error("❌ Modelo ML no está cargado")
            raise HTTPException(status_code=503, detail="Modelo ML no disponible")
        
        # Preparar features usando los códigos IATA de origen y destino
        # IMPORTANTE: Los datos de OpenWeather NO se usan en el modelo, solo en la respuesta al usuario
        # El modelo usa solo features tradicionales (aerolínea, aeropuertos, fecha, distancia, etc.)
        features_df = preparar_features_modelo(
            aerolinea=request.aerolinea,
            origen_iata=request.origen,
            destino_iata=request.destino,
            distancia_km=distancia_km,
            fecha_partida_str=request.fecha_partida
        )
        
        # Realizar predicción
        try:
            # Usar las features esperadas del modelo (definidas al cargar el modelo)
            # Si no están definidas, usar las del modelo directamente
            if expected_features and len(expected_features) > 0:
                model_expected_features = expected_features
                logger.debug(f"📋 Features esperadas del modelo (desde diccionario): {model_expected_features}")
            elif hasattr(model, 'feature_names_in_') and model.feature_names_in_ is not None:
                model_expected_features = list(model.feature_names_in_)
                logger.debug(f"📋 Features esperadas por el modelo (desde feature_names_in_): {model_expected_features}")
            else:
                # Si no tenemos información, usar las columnas tal como están
                model_expected_features = list(features_df.columns)
                logger.warning(f"⚠️ No se encontraron features esperadas, usando columnas disponibles: {model_expected_features}")
            
            # AL-002: Validación mejorada de features faltantes
            # No rellenar con 0 automáticamente, validar primero
            missing_features = set(model_expected_features) - set(features_df.columns)
            if missing_features:
                logger.debug(f"📋 Features faltantes detectadas: {missing_features} (se usarán valores por defecto razonables)")
                # Solo rellenar con 0 para features numéricas no críticas
                # Para features categóricas, esto causaría errores
                for feature in missing_features:
                    # Verificar si es feature numérica o categórica
                    # Features numéricas tradicionales
                    if feature in ['mes_sin', 'mes_cos', 'dia_semana_sin', 'dia_semana_cos', 
                                   'es_fin_de_semana', 'MONTH', 'QUARTER', 'DAY_OF_MONTH', 
                                   'DAY_OF_WEEK', 'CRS_DEP_TIME', 'CRS_ARR_TIME']:
                        features_df[feature] = 0
                        logger.debug(f"  📋 Feature numérica '{feature}' usando valor por defecto 0")
                    # Features numéricas de clima (sin sufijos)
                    elif feature in ['temperatura', 'humedad', 'presion', 'visibilidad', 'viento_velocidad']:
                        # Valores por defecto razonables para clima
                        if feature == 'temperatura':
                            features_df[feature] = 20.0  # 20°C por defecto
                        elif feature == 'humedad':
                            features_df[feature] = 60  # 60% por defecto
                        elif feature == 'presion':
                            features_df[feature] = 1013  # Presión estándar
                        elif feature == 'visibilidad':
                            features_df[feature] = 10000  # 10km visibilidad
                        elif feature == 'viento_velocidad':
                            features_df[feature] = 5.0  # 5 m/s por defecto
                        logger.debug(f"  📋 Feature de clima '{feature}' usando valor por defecto razonable")
                    # Features categóricas de clima (condición)
                    elif feature == 'condicion':
                        # Usar primer valor del encoder si está disponible, sino 'Clear'
                        condicion_default = 'Clear'
                        if encoders and 'condicion' in encoders:
                            encoder_condicion = encoders['condicion']
                            if hasattr(encoder_condicion, 'classes_') and len(encoder_condicion.classes_) > 0:
                                condicion_default = encoder_condicion.classes_[0]
                                logger.debug(f"  📋 Feature 'condicion' usando valor por defecto del encoder: {condicion_default}")
                            else:
                                logger.debug(f"  📋 Feature 'condicion' usando valor por defecto: {condicion_default}")
                        else:
                            logger.debug(f"  📋 Feature 'condicion' usando valor por defecto: {condicion_default}")
                        features_df[feature] = condicion_default
                    else:
                        # Features categóricas tradicionales deben estar presentes
                        logger.error(f"❌ Feature categórica crítica '{feature}' faltante")
                        raise ValueError(f"Feature categórica requerida '{feature}' no está presente en los datos")
            
            # Verificar que todas las columnas requeridas estén presentes
            extra_features = set(features_df.columns) - set(model_expected_features)
            if extra_features:
                logger.debug(f"📋 Features extras (serán ignoradas): {extra_features}")
            
            # Reordenar según el orden esperado por el modelo
            features_df = features_df[model_expected_features]
            logger.debug(f"✅ DataFrame reordenado según modelo: {list(features_df.columns)}")
            logger.debug(f"✅ Shape del DataFrame: {features_df.shape}")
            
            # Aplicar encoders si están disponibles (para características categóricas)
            # El modelo fue entrenado con valores codificados, por lo que debemos aplicar
            # los mismos encoders antes de hacer la predicción
            if encoders:
                logger.debug(f"📋 Aplicando encoders: {list(encoders.keys())}")
                for encoder_name, encoder in encoders.items():
                    # Mapear nombres de encoders a nombres de features
                    # El encoder puede estar guardado como 'ORIGIN' pero la feature se llama 'ORIGIN_AIRPORT_ID'
                    feature_name = encoder_name
                    if encoder_name == 'ORIGIN' and 'ORIGIN_AIRPORT_ID' in features_df.columns:
                        feature_name = 'ORIGIN_AIRPORT_ID'
                    elif encoder_name == 'DEST' and 'DEST_AIRPORT_ID' in features_df.columns:
                        feature_name = 'DEST_AIRPORT_ID'
                    
                    if feature_name in features_df.columns:
                        try:
                            # Obtener el valor original
                            original_values = features_df[feature_name].values
                            
                            # Aplicar transformación del encoder
                            if hasattr(encoder, 'transform'):
                                # LabelEncoder u otro encoder con método transform
                                try:
                                    # Asegurar que los valores sean del tipo correcto (string para LabelEncoder)
                                    # Convertir a string si es necesario antes de aplicar el encoder
                                    if hasattr(encoder, 'classes_') and len(encoder.classes_) > 0:
                                        # Convertir a string si es necesario
                                        if isinstance(original_values[0], (int, float)):
                                            # Si es numérico, intentar mapear de vuelta al código IATA
                                            logger.warning(f"  ⚠️ Valor numérico recibido para '{feature_name}', pero el encoder espera string")
                                            # Para OP_UNIQUE_CARRIER, necesitamos el código IATA, no el número
                                            if feature_name == 'OP_UNIQUE_CARRIER':
                                                logger.error(f"  ❌ OP_UNIQUE_CARRIER debe ser código IATA (string), no número")
                                                raise ValueError(f"OP_UNIQUE_CARRIER debe ser código IATA, recibido: {original_values[0]}")
                                        
                                        # Asegurar que todos los valores sean strings
                                        original_values = [str(v) for v in original_values]
                                    
                                    encoded_values = encoder.transform(original_values)
                                    features_df[feature_name] = encoded_values
                                    logger.debug(f"  ✅ Encoder aplicado a '{feature_name}': {original_values} -> {encoded_values}")
                                except (ValueError, KeyError) as e:
                                    # Si el valor no está en las clases del encoder, intentar manualmente
                                    logger.debug(f"  ⚠️ Error en transform directo para '{feature_name}': {e}, intentando manualmente")
                                    if hasattr(encoder, 'classes_'):
                                        original_value = original_values[0] if len(original_values) > 0 else original_values
                                        # Convertir a string si es necesario
                                        if not isinstance(original_value, str):
                                            original_value = str(original_value)
                                        
                                        if original_value in encoder.classes_:
                                            encoded_value = list(encoder.classes_).index(original_value)
                                            features_df[feature_name] = [encoded_value]
                                            logger.debug(f"  ✅ Encoder aplicado a '{feature_name}' (manual LabelEncoder): {original_value} -> {encoded_value}")
                                        else:
                                            # Para TAIL_NUM, usar un valor por defecto si no está en las clases
                                            if feature_name == 'TAIL_NUM':
                                                logger.warning(f"  ⚠️ TAIL_NUM '{original_value}' no está en las clases, usando valor por defecto")
                                                # Usar el primer valor de las clases como fallback
                                                default_tail = encoder.classes_[0]
                                                encoded_value = 0  # Índice del primer valor
                                                features_df[feature_name] = [encoded_value]
                                                logger.debug(f"  ✅ Usando TAIL_NUM por defecto: {default_tail} (índice {encoded_value})")
                                            else:
                                                # AL-002: Manejo robusto de categorías desconocidas con fallback
                                                logger.debug(f"  📋 Valor '{original_value}' no está en las clases del encoder para '{feature_name}', usando valor por defecto")
                                                
                                                # Estrategia de fallback: usar la clase más frecuente (índice 0)
                                                default_value = encoder.classes_[0]
                                                encoded_value = 0  # Índice del primer valor (más frecuente)
                                                features_df[feature_name] = [encoded_value]
                                                logger.debug(f"  📋 Usando valor por defecto para '{feature_name}': {default_value} (índice {encoded_value})")
                                    else:
                                        logger.warning(f"  ⚠️ No se pudo aplicar encoder a '{feature_name}'")
                            else:
                                # Si no tiene método transform directo, intentar manualmente con LabelEncoder
                                if hasattr(encoder, 'classes_'):
                                    try:
                                        original_value = original_values[0] if len(original_values) > 0 else original_values
                                        if original_value in encoder.classes_:
                                            encoded_value = list(encoder.classes_).index(original_value)
                                            features_df[feature_name] = [encoded_value]
                                            logger.debug(f"  ✅ Encoder aplicado a '{feature_name}' (manual LabelEncoder): {original_value} -> {encoded_value}")
                                        else:
                                            # Para TAIL_NUM, usar un valor por defecto si no está en las clases
                                            if feature_name == 'TAIL_NUM':
                                                logger.debug(f"  📋 TAIL_NUM '{original_value}' no está en las clases, usando valor por defecto")
                                                # Usar el primer valor de las clases como fallback
                                                default_tail = encoder.classes_[0]
                                                encoded_value = 0  # Índice del primer valor
                                                features_df[feature_name] = [encoded_value]
                                                logger.debug(f"  📋 Usando TAIL_NUM por defecto: {default_tail} (índice {encoded_value})")
                                            else:
                                                # AL-002: Manejo robusto de categorías desconocidas con fallback
                                                logger.debug(f"  📋 Valor '{original_value}' no está en las clases del encoder para '{feature_name}', usando valor por defecto")
                                                
                                                # Estrategia de fallback: usar la clase más frecuente (índice 0)
                                                default_value = encoder.classes_[0]
                                                encoded_value = 0  # Índice del primer valor (más frecuente)
                                                features_df[feature_name] = [encoded_value]
                                                logger.debug(f"  📋 Usando valor por defecto para '{feature_name}': {default_value} (índice {encoded_value})")
                                    except Exception as e:
                                        logger.warning(f"  ⚠️ Error aplicando encoder manual a '{feature_name}': {e}")
                                else:
                                    logger.warning(f"  ⚠️ Encoder para '{feature_name}' no tiene clases definidas ni método transform")
                        except Exception as e:
                            logger.warning(f"  ⚠️ Error aplicando encoder a '{feature_name}': {e}")
                            # Si falla el encoder, intentar usar el valor original
                            pass
            else:
                logger.debug(f"📋 No hay encoders disponibles, usando valores originales")
            
            # Validar tipos antes de enviar al modelo
            # AL-002: Validación de tipos de features
            for col in features_df.columns:
                if features_df[col].dtype == 'object':
                    logger.warning(f"⚠️ Feature '{col}' es de tipo object, convirtiendo a numérico")
                    try:
                        features_df[col] = pd.to_numeric(features_df[col], errors='coerce')
                    except Exception as e:
                        logger.error(f"❌ Error convirtiendo '{col}' a numérico: {e}")
                        raise ValueError(f"No se pudo convertir feature '{col}' a tipo numérico")
            
            # Asegurar que todas las features sean numéricas
            features_df = features_df.astype(float)
            
            # Hacer la predicción
            probabilidades = model.predict_proba(features_df)[0]
            
            # AL-002: Validación de salidas del modelo (NaN, probabilidades inválidas)
            if np.isnan(probabilidades).any():
                logger.error(f"❌ El modelo devolvió NaN en las probabilidades: {probabilidades}")
                raise ValueError("El modelo devolvió probabilidades inválidas (NaN)")
            
            if not (0 <= probabilidades[0] <= 1) or not (0 <= probabilidades[1] <= 1):
                logger.error(f"❌ Probabilidades fuera del rango [0,1]: {probabilidades}")
                raise ValueError(f"Probabilidades inválidas: deben estar en [0,1], recibidas: {probabilidades}")
            
            if abs(sum(probabilidades) - 1.0) > 0.01:  # Tolerancia para errores de punto flotante
                logger.warning(f"⚠️ Suma de probabilidades no es 1.0: {sum(probabilidades)}")
            
            prob_retraso = float(probabilidades[1])
            prediccion_binaria = int(model.predict(features_df)[0])
            confianza = float(max(probabilidades))
            
            # Validar que la predicción sea 0 o 1
            if prediccion_binaria not in [0, 1]:
                logger.error(f"❌ Predicción binaria inválida: {prediccion_binaria}")
                raise ValueError(f"Predicción binaria debe ser 0 o 1, recibida: {prediccion_binaria}")
            
            logger.info(f"✅ Predicción realizada: {prediccion_binaria} (probabilidad retraso: {prob_retraso:.4f}, confianza: {confianza:.4f})")
        except Exception as e:
            logger.error(f"❌ Error en predicción: {e}")
            logger.error(f"❌ Tipo de error: {type(e).__name__}")
            import traceback
            logger.error(f"❌ Traceback completo:\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error en predicción del modelo: {str(e)}")
        
        # ====================================================================
        # 5. CONSTRUCCIÓN DE RESPUESTA
        # ====================================================================
        response = PredictionResponse(
            prediccion=prediccion_binaria,
            probabilidad_retraso=round(prob_retraso, 4),
            confianza=round(confianza, 4),
            distancia_km=distancia_km,
            clima_origen=clima_origen,
            clima_destino=clima_destino,
            metadata={
                "aerolinea": request.aerolinea,
                "ruta": f"{request.origen} → {request.destino}",
                "origen_nombre": origen_coords["name"],
                "destino_nombre": destino_coords["name"],
                "fecha_partida": request.fecha_partida,
                "timestamp_prediccion": datetime.now().isoformat()
            }
        )
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado en predict_internal: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")


def preparar_features_modelo(aerolinea: str, origen_iata: str, destino_iata: str, 
                            distancia_km: float, fecha_partida_str: str = None) -> pd.DataFrame:
    """
    Prepara el DataFrame de features para el modelo Random Forest.
    
    NOTA IMPORTANTE: Los datos de OpenWeatherMap NO se incluyen en esta función.
    Los datos de clima obtenidos de OpenWeatherMap son solo para información referencial
    en la respuesta al usuario, NO se usan como features del modelo.
    
    El modelo usa solo features tradicionales (15 características):
    1. mes_sin - Codificación cíclica seno del mes
    2. mes_cos - Codificación cíclica coseno del mes
    3. dia_semana_sin - Codificación cíclica seno del día de la semana
    4. dia_semana_cos - Codificación cíclica coseno del día de la semana
    5. es_fin_de_semana - Indicador booleano (0 o 1)
    6. MONTH - Mes (1-12)
    7. QUARTER - Trimestre (1-4)
    8. DAY_OF_MONTH - Día del mes (1-31)
    9. DAY_OF_WEEK - Día de la semana (0=Lunes, 6=Domingo)
    10. OP_UNIQUE_CARRIER - Código de aerolínea (codificado con LabelEncoder)
    11. ORIGIN_AIRPORT_ID - Código IATA del aeropuerto de origen (codificado con LabelEncoder)
    12. DEST_AIRPORT_ID - Código IATA del aeropuerto de destino (codificado con LabelEncoder)
    13. CRS_DEP_TIME - Hora programada de salida (formato HHMM)
    14. CRS_ARR_TIME - Hora programada de llegada (formato HHMM)
    15. TAIL_NUM - Número de cola del avión (codificado con LabelEncoder)
    
    Si el modelo requiere features de clima adicionales, estas deben venir del
    entrenamiento del modelo mismo (valores por defecto o códigos METAR), no de OpenWeatherMap.
    """
    import math
    
    # 1. Procesar Fecha/Hora
    if fecha_partida_str:
        try:
            dt = datetime.fromisoformat(fecha_partida_str.replace('Z', '+00:00'))
        except ValueError:
            dt = datetime.now()
    else:
        dt = datetime.now()
    
    # Características de fecha tradicionales
    MONTH = dt.month
    QUARTER = (MONTH - 1) // 3 + 1  # Trimestre 1-4
    DAY_OF_MONTH = dt.day
    DAY_OF_WEEK = dt.weekday()  # 0=Lunes, 6=Domingo
    
    # 2. Codificación cíclica del mes (para capturar periodicidad anual)
    # mes_sin = sin(2 * π * month / 12)
    # mes_cos = cos(2 * π * month / 12)
    mes_sin = math.sin(2 * math.pi * MONTH / 12)
    mes_cos = math.cos(2 * math.pi * MONTH / 12)
    
    # 3. Codificación cíclica del día de la semana (para capturar periodicidad semanal)
    # dia_semana_sin = sin(2 * π * day_of_week / 7)
    # dia_semana_cos = cos(2 * π * day_of_week / 7)
    dia_semana_sin = math.sin(2 * math.pi * DAY_OF_WEEK / 7)
    dia_semana_cos = math.cos(2 * math.pi * DAY_OF_WEEK / 7)
    
    # 4. Indicador de fin de semana (Sábado=5, Domingo=6)
    es_fin_de_semana = 1 if DAY_OF_WEEK >= 5 else 0
    
    # 5. Hora programada de salida (CRS_DEP_TIME) en formato HHMM
    CRS_DEP_TIME = dt.hour * 100 + dt.minute  # Ej: 14:30 -> 1430
    
    # 6. Calcular hora programada de llegada (CRS_ARR_TIME)
    # Estimación: tiempo de vuelo basado en distancia
    # Promedio: ~800 km/h para vuelos comerciales
    tiempo_vuelo_horas = distancia_km / 800.0
    tiempo_vuelo_minutos = int(tiempo_vuelo_horas * 60)
    
    # Calcular hora de llegada sumando tiempo de vuelo
    total_minutos = dt.hour * 60 + dt.minute + tiempo_vuelo_minutos
    arrival_hour = (total_minutos // 60) % 24
    arrival_minute = total_minutos % 60
    CRS_ARR_TIME = arrival_hour * 100 + arrival_minute
    
    # 7. OP_UNIQUE_CARRIER - Código de aerolínea (será codificado con LabelEncoder)
    # El modelo v3 usa LabelEncoder, por lo que necesitamos pasar el código IATA directamente como string
    # El encoder lo convertirá al número correspondiente
    aerolinea_upper = aerolinea.upper()
    # Pasar el código IATA directamente como string (NO convertir a número)
    # El LabelEncoder del modelo espera strings como 'B6', 'DL', etc.
    OP_UNIQUE_CARRIER = aerolinea_upper  # String IATA, será codificado por el LabelEncoder
    
    # 8. ORIGIN_AIRPORT_ID y DEST_AIRPORT_ID - Códigos IATA directamente
    # El modelo espera ORIGIN_AIRPORT_ID y DEST_AIRPORT_ID (no ORIGIN y DEST)
    ORIGIN_AIRPORT_ID = origen_iata.upper()
    DEST_AIRPORT_ID = destino_iata.upper()
    
    # 9. TAIL_NUM - Número de cola del avión
    # Como no tenemos esta información real, necesitamos usar un valor que esté en las clases del encoder
    # El encoder tiene valores como '188NV', '189NV', etc. Usaremos el primer valor como fallback
    # Esto se manejará en el código de aplicación de encoders
    TAIL_NUM_STR = f"{aerolinea_upper}001"  # Formato: AA001, DL001, etc. (será reemplazado si no está en clases)
    
    # Construir DataFrame con las características tradicionales
    # NOTA: El modelo clima_v1 NO incluye DAY_OF_WEEK en las features esperadas
    data = {
        'mes_sin': [mes_sin],
        'mes_cos': [mes_cos],
        'dia_semana_sin': [dia_semana_sin],
        'dia_semana_cos': [dia_semana_cos],
        'es_fin_de_semana': [es_fin_de_semana],
        'MONTH': [MONTH],
        'QUARTER': [QUARTER],
        'DAY_OF_MONTH': [DAY_OF_MONTH],
        'OP_UNIQUE_CARRIER': [OP_UNIQUE_CARRIER],
        'ORIGIN_AIRPORT_ID': [ORIGIN_AIRPORT_ID],  # Cambiado de ORIGIN a ORIGIN_AIRPORT_ID
        'DEST_AIRPORT_ID': [DEST_AIRPORT_ID],      # Cambiado de DEST a DEST_AIRPORT_ID
        'CRS_DEP_TIME': [CRS_DEP_TIME],
        'CRS_ARR_TIME': [CRS_ARR_TIME],
        'TAIL_NUM': [TAIL_NUM_STR]
    }
    
    # NOTA: Los datos de OpenWeatherMap NO se incluyen aquí.
    # Los datos de clima de OpenWeatherMap son solo para información referencial
    # en la respuesta al usuario, NO se usan como features del modelo.
    # Si el modelo requiere features de clima, estas deben venir del entrenamiento
    # (valores por defecto o códigos METAR), no de OpenWeatherMap.
    
    df = pd.DataFrame(data)
    
    logger.debug(f"[DEBUG] Features preparadas:")
    logger.debug(f"  Codificación cíclica: mes_sin={mes_sin:.4f}, mes_cos={mes_cos:.4f}")
    logger.debug(f"  Codificación cíclica: dia_semana_sin={dia_semana_sin:.4f}, dia_semana_cos={dia_semana_cos:.4f}")
    logger.debug(f"  es_fin_de_semana: {es_fin_de_semana}")
    logger.debug(f"  MONTH: {MONTH}, QUARTER: {QUARTER}, DAY_OF_MONTH: {DAY_OF_MONTH}, DAY_OF_WEEK: {DAY_OF_WEEK}")
    logger.debug(f"  OP_UNIQUE_CARRIER: {OP_UNIQUE_CARRIER} (será codificado)")
    logger.debug(f"  ORIGIN_AIRPORT_ID: {ORIGIN_AIRPORT_ID}, DEST_AIRPORT_ID: {DEST_AIRPORT_ID} (serán codificados)")
    logger.debug(f"  CRS_DEP_TIME: {CRS_DEP_TIME}, CRS_ARR_TIME: {CRS_ARR_TIME}")
    logger.debug(f"  TAIL_NUM: {TAIL_NUM_STR} (será codificado)")
    logger.debug(f"  NOTA: Features de clima de OpenWeatherMap NO se incluyen en el modelo (solo referencia en respuesta)")
    logger.debug(f"  Columnas: {list(df.columns)}")
    logger.debug(f"  Shape: {df.shape}")
    
    return df

# ============================================================================
# PUNTO DE ENTRADA
# ============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )

