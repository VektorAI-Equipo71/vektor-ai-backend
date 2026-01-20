#!/usr/bin/env python3
"""
Script para analizar el modelo ML y obtener información sobre las características esperadas.
"""

import joblib
import pandas as pd
import sys

def analyze_model(model_path='random_forest_v1.pkl'):
    """Analiza el modelo ML y extrae información sobre las características."""
    
    print("=" * 80)
    print("ANÁLISIS DEL MODELO ML")
    print("=" * 80)
    
    try:
        # Cargar el modelo
        print(f"\n[INFO] Cargando modelo desde: {model_path}")
        model = joblib.load(model_path)
        print("[OK] Modelo cargado exitosamente\n")
        
        # Información básica del modelo
        print("=" * 80)
        print("INFORMACIÓN BÁSICA DEL MODELO")
        print("=" * 80)
        print(f"Tipo de modelo: {type(model).__name__}")
        
        if hasattr(model, 'n_estimators'):
            print(f"Número de estimadores (árboles): {model.n_estimators}")
        if hasattr(model, 'max_depth'):
            print(f"Profundidad máxima: {model.max_depth}")
        if hasattr(model, 'random_state'):
            print(f"Random state: {model.random_state}")
        
        # Obtener nombres de características esperadas
        print("\n" + "=" * 80)
        print("CARACTERÍSTICAS ESPERADAS POR EL MODELO")
        print("=" * 80)
        
        if hasattr(model, 'feature_names_in_'):
            feature_names = model.feature_names_in_
            print(f"\n[OK] El modelo tiene {len(feature_names)} características definidas:")
            print("\nOrden de las características:")
            print("-" * 80)
            for i, name in enumerate(feature_names, 1):
                print(f"{i:2d}. {name}")
            
            print(f"\n[Lista completa para copiar]:")
            print(f"[{', '.join([repr(name) for name in feature_names])}]")
            
        elif hasattr(model, 'feature_importances_'):
            # Si no tiene feature_names_in_, intentar obtener número de features
            n_features = len(model.feature_importances_)
            print(f"\n[WARN] El modelo no tiene feature_names_in_ definido")
            print(f"   Número de características: {n_features}")
            print(f"   [WARN] Necesitas especificar manualmente los nombres en el mismo orden")
            
        else:
            print("\n[ERROR] No se pudo determinar información sobre las características")
        
        # Información adicional del modelo
        print("\n" + "=" * 80)
        print("INFORMACIÓN ADICIONAL")
        print("=" * 80)
        
        if hasattr(model, 'classes_'):
            print(f"\nClases del modelo: {model.classes_}")
        
        if hasattr(model, 'feature_importances_'):
            print(f"\nNúmero de características: {len(model.feature_importances_)}")
            
            # Si tenemos nombres, mostrar importancia de cada feature
            if hasattr(model, 'feature_names_in_'):
                print("\nImportancia de características:")
                print("-" * 80)
                importances = list(zip(model.feature_names_in_, model.feature_importances_))
                importances.sort(key=lambda x: x[1], reverse=True)
                for name, importance in importances:
                    print(f"{name:25s}: {importance:.6f}")
        
        # Versión de scikit-learn
        import sklearn
        print(f"\nVersión de scikit-learn: {sklearn.__version__}")
        
        return model
        
    except FileNotFoundError:
        print(f"[ERROR] No se encontro el archivo {model_path}")
        return None
    except Exception as e:
        print(f"[ERROR] Error al analizar el modelo: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    model_path = sys.argv[1] if len(sys.argv) > 1 else 'random_forest_v1.pkl'
    model = analyze_model(model_path)
    
    if model:
        print("\n" + "=" * 80)
        print("[OK] ANALISIS COMPLETADO")
        print("=" * 80)
