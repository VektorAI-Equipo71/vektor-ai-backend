#!/usr/bin/env python3
"""
Script para analizar el modelo ML random_forest_clima_v1.joblib
y obtener información sobre las características esperadas, incluyendo features de clima.
"""

import joblib
import pandas as pd
import sys
import warnings
import json

# Suprimir advertencias de versión por ahora
warnings.filterwarnings('ignore', category=UserWarning)

def feature_engineering(*args, **kwargs):
    """
    Función stub para poder cargar modelos que fueron entrenados con esta función.
    Esta es una función placeholder que se requiere para deserializar el modelo.
    """
    pass

def analyze_model_clima_v1(model_path='random_forest_clima_v1.joblib'):
    """Analiza el modelo ML con clima y extrae información sobre las características."""
    
    print("=" * 80)
    print("ANÁLISIS DEL MODELO ML: random_forest_clima_v1.joblib")
    print("=" * 80)
    
    try:
        # Cargar el modelo (necesita feature_engineering en el módulo)
        print(f"\n[INFO] Cargando modelo desde: {model_path}")
        loaded_data = joblib.load(model_path)
        print("[OK] Datos cargados exitosamente\n")
        
        # Información básica del modelo
        print("=" * 80)
        print("ESTRUCTURA DE DATOS CARGADA")
        print("=" * 80)
        print(f"Tipo: {type(loaded_data).__name__}")
        
        # Si es un diccionario, intentar obtener el modelo real
        model = None
        encoders = {}
        expected_features = []
        
        if isinstance(loaded_data, dict):
            print(f"\n[INFO] Los datos son un diccionario con las siguientes claves:")
            for key in loaded_data.keys():
                print(f"  - {key}: {type(loaded_data[key]).__name__}")
            
            # Extraer componentes del diccionario
            if 'model' in loaded_data:
                model = loaded_data['model']
                print(f"\n[INFO] Modelo encontrado en clave 'model'")
            
            if 'encoders' in loaded_data:
                encoders = loaded_data['encoders']
                print(f"[INFO] Encoders encontrados: {list(encoders.keys())}")
            
            if 'features' in loaded_data:
                expected_features = loaded_data['features']
                print(f"[INFO] Features esperadas: {len(expected_features)} características")
            
            # Si no encontramos el modelo, buscar
            if model is None:
                possible_keys = ['classifier', 'rf', 'random_forest', 'estimator', 'pipeline']
                for key in possible_keys:
                    if key in loaded_data:
                        model = loaded_data[key]
                        print(f"\n[INFO] Usando la clave '{key}' como modelo")
                        break
                
                # Si no encontramos por nombre, buscar el primer objeto que tenga método predict
                if model is None:
                    for key, value in loaded_data.items():
                        if hasattr(value, 'predict'):
                            model = value
                            print(f"\n[INFO] Usando la clave '{key}' como modelo (tiene método predict)")
                            break
        else:
            model = loaded_data
        
        if model is None:
            print("\n[ERROR] No se pudo identificar el modelo")
            return None
        
        print("\n" + "=" * 80)
        print("INFORMACIÓN BÁSICA DEL MODELO")
        print("=" * 80)
        print(f"Tipo de modelo: {type(model).__name__}")
        
        # Si es un Pipeline, obtener el modelo final
        if hasattr(model, 'steps') or hasattr(model, 'named_steps'):
            print("\n[INFO] El modelo es un Pipeline")
            if hasattr(model, 'named_steps'):
                print(f"Pasos del pipeline: {list(model.named_steps.keys())}")
                # Intentar obtener el modelo final
                for step_name, step_obj in model.named_steps.items():
                    if hasattr(step_obj, 'predict'):
                        model = step_obj
                        print(f"[INFO] Usando el paso '{step_name}' como modelo final")
                        break
        
        if hasattr(model, 'n_estimators'):
            print(f"Número de estimadores (árboles): {model.n_estimators}")
        if hasattr(model, 'max_depth'):
            print(f"Profundidad máxima: {model.max_depth}")
        if hasattr(model, 'random_state'):
            print(f"Random state: {model.random_state}")
        if hasattr(model, 'max_features'):
            print(f"Max features: {model.max_features}")
        
        # Obtener nombres de características esperadas
        print("\n" + "=" * 80)
        print("CARACTERÍSTICAS ESPERADAS POR EL MODELO")
        print("=" * 80)
        
        feature_names = None
        if expected_features and len(expected_features) > 0:
            feature_names = expected_features
            print(f"\n[OK] El modelo tiene {len(feature_names)} características definidas:")
        elif hasattr(model, 'feature_names_in_'):
            feature_names = model.feature_names_in_
            print(f"\n[OK] El modelo tiene {len(feature_names)} características definidas:")
        elif hasattr(model, 'feature_importances_'):
            n_features = len(model.feature_importances_)
            print(f"\n[WARN] El modelo no tiene feature_names_in_ definido")
            print(f"   Número de características: {n_features}")
        
        if feature_names:
            print("\nOrden de las características:")
            print("-" * 80)
            
            # Categorizar features
            features_tradicionales = []
            features_clima = []
            
            clima_keywords = ['temp', 'humedad', 'presion', 'visibilidad', 'viento', 'clima', 'weather', 'condicion']
            
            for i, name in enumerate(feature_names, 1):
                is_clima = any(keyword in name.lower() for keyword in clima_keywords)
                if is_clima:
                    features_clima.append((i, name))
                    print(f"{i:2d}. {name} [CLIMA]")
                else:
                    features_tradicionales.append((i, name))
                    print(f"{i:2d}. {name}")
            
            print(f"\n[RESUMEN]")
            print(f"  Features tradicionales: {len(features_tradicionales)}")
            print(f"  Features de clima: {len(features_clima)}")
            print(f"  Total: {len(feature_names)}")
            
            if features_clima:
                print(f"\n[FEATURES DE CLIMA DETECTADAS]")
                for idx, name in features_clima:
                    print(f"  - {name}")
            
            print(f"\n[Lista completa para copiar]:")
            print(f"[{', '.join([repr(name) for name in feature_names])}]")
        
        # Analizar encoders para extraer aerolíneas y aeropuertos
        print("\n" + "=" * 80)
        print("ANÁLISIS DE ENCODERS (AEROLÍNEAS Y AEROPUERTOS)")
        print("=" * 80)
        
        airlines = set()
        airports = set()
        
        if encoders:
            for encoder_name, encoder in encoders.items():
                print(f"\n[INFO] Encoder: {encoder_name}")
                print(f"   Tipo: {type(encoder).__name__}")
                
                # Si es un LabelEncoder, obtener las clases
                if hasattr(encoder, 'classes_'):
                    classes = encoder.classes_
                    print(f"   Clases encontradas: {len(classes)}")
                    print(f"   Primeras 10 clases: {list(classes[:10])}")
                    
                    # Identificar si es de aerolíneas o aeropuertos
                    if 'airline' in encoder_name.lower() or 'aerolinea' in encoder_name.lower() or 'carrier' in encoder_name.lower():
                        airlines.update(classes)
                        print(f"   [IDENTIFICADO] Este encoder contiene AEROLÍNEAS")
                    elif 'airport' in encoder_name.lower() or 'aeropuerto' in encoder_name.lower() or 'origin' in encoder_name.lower() or 'dest' in encoder_name.lower():
                        airports.update(classes)
                        print(f"   [IDENTIFICADO] Este encoder contiene AEROPUERTOS")
        
        # Mostrar aerolíneas y aeropuertos encontrados
        if airlines:
            print("\n" + "=" * 80)
            print("AEROLÍNEAS ENCONTRADAS EN EL MODELO")
            print("=" * 80)
            airlines_sorted = sorted(airlines)
            print(f"Total: {len(airlines_sorted)} aerolíneas")
            for airline in airlines_sorted:
                print(f"  - {airline}")
        
        if airports:
            print("\n" + "=" * 80)
            print("AEROPUERTOS ENCONTRADOS EN EL MODELO")
            print("=" * 80)
            airports_sorted = sorted(airports)
            print(f"Total: {len(airports_sorted)} aeropuertos")
            print("Primeros 20 aeropuertos:")
            for airport in airports_sorted[:20]:
                print(f"  - {airport}")
            if len(airports_sorted) > 20:
                print(f"  ... y {len(airports_sorted) - 20} más")
        
        # Información adicional del modelo
        print("\n" + "=" * 80)
        print("INFORMACIÓN ADICIONAL")
        print("=" * 80)
        
        if hasattr(model, 'classes_'):
            print(f"\nClases del modelo: {model.classes_}")
        
        if hasattr(model, 'feature_importances_'):
            print(f"\nNúmero de características: {len(model.feature_importances_)}")
            
            # Si tenemos nombres, mostrar importancia de cada feature
            if feature_names:
                print("\nImportancia de características (top 15):")
                print("-" * 80)
                importances = list(zip(feature_names, model.feature_importances_))
                importances.sort(key=lambda x: x[1], reverse=True)
                for name, importance in importances[:15]:
                    is_clima = any(kw in name.lower() for kw in ['temp', 'humedad', 'presion', 'visibilidad', 'viento', 'clima', 'weather'])
                    clima_marker = " [CLIMA]" if is_clima else ""
                    print(f"{name:35s}: {importance:.6f}{clima_marker}")
        
        # Versión de scikit-learn
        import sklearn
        print(f"\nVersión de scikit-learn instalada: {sklearn.__version__}")
        
        # Guardar información en un archivo JSON para referencia
        model_info = {
            'model_path': model_path,
            'model_type': type(model).__name__,
            'n_features': len(feature_names) if feature_names else None,
            'feature_names': list(feature_names) if feature_names else None,
            'features_tradicionales': len(features_tradicionales) if feature_names else None,
            'features_clima': len(features_clima) if feature_names else None,
            'encoders': list(encoders.keys()) if encoders else [],
            'airlines': sorted(list(airlines)) if airlines else [],
            'airports': sorted(list(airports)) if airports else [],
            'n_estimators': getattr(model, 'n_estimators', None),
            'max_depth': getattr(model, 'max_depth', None),
            'random_state': getattr(model, 'random_state', None),
        }
        
        output_file = 'model_clima_v1_info.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(model_info, f, indent=2, ensure_ascii=False)
        print(f"\n[INFO] Información del modelo guardada en: {output_file}")
        
        return model, encoders, expected_features, airlines, airports
        
    except FileNotFoundError:
        print(f"[ERROR] No se encontró el archivo {model_path}")
        print(f"[INFO] Asegúrese de que el archivo existe en el directorio actual")
        return None
    except Exception as e:
        print(f"[ERROR] Error al analizar el modelo: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    model_path = sys.argv[1] if len(sys.argv) > 1 else 'random_forest_clima_v1.joblib'
    
    # Asegurar que feature_engineering esté disponible en el módulo
    import __main__
    __main__.feature_engineering = feature_engineering
    
    result = analyze_model_clima_v1(model_path)
    
    if result:
        print("\n" + "=" * 80)
        print("[OK] ANÁLISIS COMPLETADO")
        print("=" * 80)