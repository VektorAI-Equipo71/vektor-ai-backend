#!/usr/bin/env python3
"""Script para verificar qué campos tiene airportsdata"""

import airportsdata

try:
    airports = airportsdata.load('IATA')
    print(f"Total aeropuertos: {len(airports)}")
    
    # Tomar un ejemplo
    if 'ATL' in airports:
        example = airports['ATL']
        print("\nEjemplo - ATL (Atlanta):")
        print("-" * 60)
        for key, value in example.items():
            print(f"{key}: {value} (tipo: {type(value).__name__})")
        
        print("\nCampos disponibles:")
        print(f"- iata: {example.get('iata')}")
        print(f"- icao: {example.get('icao')}")
        print(f"- name: {example.get('name')}")
        print(f"- lat: {example.get('lat')}")
        print(f"- lon: {example.get('lon')}")
        
        # Buscar ID numérico
        if 'id' in example:
            print(f"- id: {example.get('id')}")
        elif 'airport_id' in example:
            print(f"- airport_id: {example.get('airport_id')}")
        else:
            print("\n[WARN] No se encontro campo 'id' o 'airport_id'")
            print("       Usaremos hash del codigo IATA como ID")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
