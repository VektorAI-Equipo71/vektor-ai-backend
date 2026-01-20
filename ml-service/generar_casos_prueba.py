#!/usr/bin/env python3
"""
Script para generar un CSV con casos de prueba que incluyan ambos tipos de predicciones (0 y 1)
"""

import pandas as pd
import joblib
import math
from datetime import datetime
import sys

# Cargar modelo
model_data = joblib.load('random_forest_intento4_version2.joblib')
model = model_data['model']
expected_features = model_data.get('features', [])

# Casos variados para probar
casos = [
    ('1', 'ATL', 'CLT', '2026-01-20T04:30:00'),  # Muy temprano, ruta corta
    ('1', 'ATL', 'MIA', '2026-01-20T05:00:00'),  # Muy temprano
    ('2', 'OAK', 'LAX', '2026-01-20T05:15:00'),  # Muy temprano, ruta muy corta
    ('1', 'CLT', 'ATL', '2026-01-20T05:30:00'),  # Muy temprano
    ('2', 'SFO', 'LAX', '2026-01-20T05:45:00'),  # Muy temprano, ruta corta
    ('1', 'ATL', 'LAX', '2026-01-20T14:30:00'),  # Tarde, ruta larga
    ('2', 'LAX', 'DEN', '2026-01-20T17:00:00'),  # Muy tarde
    ('1', 'JFK', 'LAX', '2026-01-20T17:30:00'),  # Muy tarde, ruta larga
    ('1', 'MIA', 'ATL', '2026-01-20T08:00:00'),  # Temprano
    ('2', 'DEN', 'ORD', '2026-01-20T16:00:00'),  # Tarde
]

def preparar_features(aerolinea, origen, destino, fecha_str, expected_features):
    """Prepara features para el modelo"""
    dt = datetime.fromisoformat(fecha_str)
    
    # Distancias aproximadas (simplificadas)
    distancias = {
        ('ATL', 'CLT'): 600, ('CLT', 'ATL'): 600,
        ('OAK', 'LAX'): 560, ('LAX', 'OAK'): 560,
        ('SFO', 'LAX'): 560, ('LAX', 'SFO'): 560,
        ('ATL', 'LAX'): 3125, ('LAX', 'ATL'): 3125,
        ('JFK', 'LAX'): 3944, ('LAX', 'JFK'): 3944,
        ('ATL', 'MIA'): 600, ('MIA', 'ATL'): 600,
        ('LAX', 'DEN'): 937, ('DEN', 'LAX'): 937,
        ('DEN', 'ORD'): 920, ('ORD', 'DEN'): 920,
    }
    distancia = distancias.get((origen, destino), 1500)
    
    # Características
    month = dt.month
    quarter = (month - 1) // 3 + 1
    day_of_month = dt.day
    day_of_week = dt.weekday()
    
    mes_sin = math.sin(2 * math.pi * month / 12)
    mes_cos = math.cos(2 * math.pi * month / 12)
    dia_semana_sin = math.sin(2 * math.pi * day_of_week / 7)
    dia_semana_cos = math.cos(2 * math.pi * day_of_week / 7)
    es_fin_de_semana = 1 if day_of_week >= 5 else 0
    
    crs_dep_time = dt.hour * 100 + dt.minute
    
    # Calcular hora de llegada
    tiempo_vuelo_horas = distancia / 800.0
    tiempo_vuelo_minutos = int(tiempo_vuelo_horas * 60)
    total_minutos = dt.hour * 60 + dt.minute + tiempo_vuelo_minutos
    arrival_hour = (total_minutos // 60) % 24
    arrival_minute = total_minutos % 60
    crs_arr_time = arrival_hour * 100 + arrival_minute
    
    op_unique_carrier = int(aerolinea)
    origin_code = origen
    dest_code = destino
    tail_num = abs(hash(f"{aerolinea}{origen}{destino}")) % 10000
    dep_time = crs_dep_time
    
    data = {
        'mes_sin': [mes_sin],
        'mes_cos': [mes_cos],
        'dia_semana_sin': [dia_semana_sin],
        'dia_semana_cos': [dia_semana_cos],
        'es_fin_de_semana': [es_fin_de_semana],
        'MONTH': [month],
        'QUARTER': [quarter],
        'DAY_OF_MONTH': [day_of_month],
        'DAY_OF_WEEK': [day_of_week],
        'OP_UNIQUE_CARRIER': [op_unique_carrier],
        'ORIGIN': [origin_code],
        'DEST': [dest_code],
        'CRS_DEP_TIME': [crs_dep_time],
        'CRS_ARR_TIME': [crs_arr_time],
        'TAIL_NUM': [tail_num],
        'DEP_TIME': [dep_time]
    }
    
    df = pd.DataFrame(data)
    
    # Aplicar encoders si están disponibles
    encoders = model_data.get('encoders', {})
    for feature_name, encoder in encoders.items():
        if feature_name in df.columns and hasattr(encoder, 'transform'):
            try:
                original_values = df[feature_name].values
                encoded_values = encoder.transform(original_values)
                df[feature_name] = encoded_values
            except:
                pass
    
    # Reordenar según features esperadas
    if expected_features:
        df = df[expected_features]
    
    return df

print("Probando casos para identificar predicciones 0 y 1...\n")

resultados = []
for aerolinea, origen, destino, fecha in casos:
    try:
        features_df = preparar_features(aerolinea, origen, destino, fecha, expected_features)
        
        probabilidades = model.predict_proba(features_df)[0]
        prediccion = int(model.predict(features_df)[0])
        prob_retraso = probabilidades[1]
        
        resultados.append({
            'aerolinea': aerolinea,
            'origen': origen,
            'destino': destino,
            'fecha': fecha,
            'prediccion': prediccion,
            'probabilidad_retraso': prob_retraso
        })
        
        print(f"{origen}->{destino} [{aerolinea}] {fecha}: Pred={prediccion}, Prob={prob_retraso:.4f}")
    except Exception as e:
        print(f"Error procesando {origen}->{destino}: {e}")

casos_0 = [r for r in resultados if r['prediccion'] == 0]
casos_1 = [r for r in resultados if r['prediccion'] == 1]

print(f"\n{'='*60}")
print(f"Casos con predicción 0 (Puntual): {len(casos_0)}")
print(f"Casos con predicción 1 (Retrasado): {len(casos_1)}")
print(f"{'='*60}\n")

# Crear CSV con casos que incluyan ambos tipos
if casos_0 and casos_1:
    # Casos balanceados con ambos tipos
    casos_csv = casos_0[:min(10, len(casos_0))] + casos_1[:min(10, len(casos_1))]
elif casos_1:
    # Si solo hay predicciones 1, incluir casos con menor probabilidad como "cercanos a 0"
    casos_ordenados = sorted(resultados, key=lambda x: x['probabilidad_retraso'])
    casos_csv = casos_ordenados[:5] + casos_ordenados[-5:]
    print("⚠️ Nota: El modelo predice retraso (1) para todos los casos.")
    print("   Se incluyen casos con menor y mayor probabilidad.\n")

# Escribir CSV
with open('../casos_prueba_con_predicciones.csv', 'w') as f:
    f.write('aerolinea,origen,destino,fecha_partida,prediccion_esperada,probabilidad_retraso\n')
    for caso in casos_csv:
        f.write(f"{caso['aerolinea']},{caso['origen']},{caso['destino']},{caso['fecha']},{caso['prediccion']},{caso['probabilidad_retraso']:.4f}\n")

print("✅ Archivo CSV generado: casos_prueba_con_predicciones.csv")
