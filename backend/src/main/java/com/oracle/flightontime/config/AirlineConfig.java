package com.oracle.flightontime.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.*;

/**
 * ===========================================================================
 * CONFIGURACIÓN DE AEROLÍNEAS Y AEROPUERTOS
 * ===========================================================================
 * Define las aerolíneas soportadas y sus aeropuertos disponibles.
 * Carga los datos desde aerolinea_origin_dest.json para mantener consistencia
 * con el frontend.
 * ===========================================================================
 */
public class AirlineConfig {

    /**
     * Mapa de aerolíneas y sus aeropuertos disponibles
     * Key: Código IATA de aerolínea (ej: "DL", "AA", "UA")
     * Value: Set de códigos IATA de aeropuertos
     */
    public static final Map<String, Set<String>> AEROLINEAS_AEROPUERTOS;

    /**
     * Nombres de las aerolíneas
     */
    public static final Map<String, String> NOMBRES_AEROLINEAS;

    /**
     * Conjunto común de aeropuertos principales de EE.UU.
     * Combinación de aeropuertos de Delta y Southwest, más aeropuertos principales adicionales
     */
    private static final Set<String> AEROPUERTOS_PRINCIPALES_USA = new HashSet<>(Arrays.asList(
        "ABQ","AGS","ALB","AMA","ANC","ATL","ATW","AUS","AVL","BDL","BGR","BHM","BIL","BIS",
        "BNA","BOI","BOS","BTR","BTV","BUF","BUR","BWI","BZN","CAE","CHA","CHO","CHS",
        "CID","CLE","CLT","CMH","COS","CRP","CVG","DAB","DAL","DAY","DCA","DEN","DFW","DLH",
        "DSM","DTW","ECP","EGE","ELP","EWR","EUG","EYW","FAI","FAR","FAT","FAY","FCA","FLL",
        "FSD","GEG","GNV","GPT","GRB","GRR","GSO","GSP","HDN","HNL","HOU","HPN","HRL",
        "HSV","IAD","IAH","ICT","IDA","ILM","IND","ISP","ITO","JAC","JAN","JAX","JFK","JNU","KOA",
        "LAS","LAX","LBB","LEX","LGA","LGB","LIH","LIT","MAF","MCI","MCO","MDT","MDW","MEM","MHT",
        "MIA","MKE","MLB","MOB","MSN","MSO","MSP","MSY","MTJ","MYR","OAK","OGG","OKC","OMA",
        "ONT","ORD","ORF","PBI","PDX","PHL","PHX","PIT","PNS","PSC","PSP","PVD","PWM",
        "RAP","RDU","RIC","RNO","ROA","ROC","RSW","SAN","SAT","SAV","SBA","SBN","SDF",
        "SEA","SFO","SGF","SHV","SJC","SJU","SLC","SMF","SNA","SRQ","STL","STT","STX",
        "SYR","TLH","TPA","TRI","TUL","TUS","TVC","TYS","VPS","XNA"
    ));

    static {
        Map<String, Set<String>> aeropuertosMap = new HashMap<>();
        Map<String, String> nombresMap = new HashMap<>();
        
        // Nombres de aerolíneas (mantener compatibilidad)
        nombresMap.put("9E", "Endeavor Air Inc. (9E)");
        nombresMap.put("AA", "American Airlines Inc. (AA)");
        nombresMap.put("AS", "Alaska Airlines Inc. (AS)");
        nombresMap.put("B6", "JetBlue Airways (B6)");
        nombresMap.put("DL", "Delta Air Lines Inc. (DL)");
        nombresMap.put("F9", "Frontier Airlines Inc. (F9)");
        nombresMap.put("G4", "Allegiant Air (G4)");
        nombresMap.put("HA", "Hawaiian Airlines Inc. (HA)");
        nombresMap.put("MQ", "Envoy Air (MQ)");
        nombresMap.put("NK", "Spirit Air Lines (NK)");
        nombresMap.put("OH", "PSA Airlines Inc. (OH)");
        nombresMap.put("OO", "SkyWest Airlines Inc. (OO)");
        nombresMap.put("UA", "United Air Lines Inc. (UA)");
        nombresMap.put("WN", "Southwest Airlines Co. (WN)");
        nombresMap.put("YX", "Republic Airline (YX)");
        
        // Intentar cargar datos desde el JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream jsonStream = AirlineConfig.class.getClassLoader()
                    .getResourceAsStream("aerolinea_origin_dest.json");
            
            if (jsonStream != null) {
                @SuppressWarnings("unchecked")
                Map<String, Map<String, List<String>>> jsonData = (Map<String, Map<String, List<String>>>) mapper.readValue(
                        jsonStream, 
                        mapper.getTypeFactory().constructMapType(Map.class, String.class, Map.class)
                );
                
                // Procesar cada aerolínea del JSON
                for (Map.Entry<String, Map<String, List<String>>> entry : jsonData.entrySet()) {
                    String airlineCode = entry.getKey();
                    Map<String, List<String>> data = entry.getValue();
                    
                    // Combinar aeropuertos de ORIGIN y DEST
                    Set<String> airports = new HashSet<>();
                    if (data.get("ORIGIN") != null) {
                        airports.addAll(data.get("ORIGIN"));
                    }
                    if (data.get("DEST") != null) {
                        airports.addAll(data.get("DEST"));
                    }
                    
                    // Normalizar todos los códigos a mayúsculas
                    Set<String> normalizedAirports = new HashSet<>();
                    for (String airport : airports) {
                        normalizedAirports.add(airport.toUpperCase().trim());
                    }
                    
                    aeropuertosMap.put(airlineCode, normalizedAirports);
                }
                
                System.out.println("✅ Datos de aerolíneas y aeropuertos cargados desde aerolinea_origin_dest.json");
            } else {
                System.err.println("⚠️ No se pudo cargar aerolinea_origin_dest.json, usando configuración por defecto");
                // Fallback a configuración por defecto
                initializeDefaultConfiguration(aeropuertosMap, nombresMap);
            }
        } catch (Exception e) {
            System.err.println("❌ Error al cargar aerolinea_origin_dest.json: " + e.getMessage());
            e.printStackTrace();
            // Fallback a configuración por defecto
            initializeDefaultConfiguration(aeropuertosMap, nombresMap);
        }
        
        AEROLINEAS_AEROPUERTOS = Collections.unmodifiableMap(aeropuertosMap);
        NOMBRES_AEROLINEAS = Collections.unmodifiableMap(nombresMap);
    }
    
    /**
     * Inicializa la configuración por defecto (fallback si no se puede cargar el JSON)
     */
    private static void initializeDefaultConfiguration(Map<String, Set<String>> aeropuertosMap, Map<String, String> nombresMap) {
        // Usar la lista de aeropuertos principales como fallback
        for (String airlineCode : Arrays.asList("9E", "AA", "AS", "B6", "DL", "F9", "G4", "HA", "MQ", "NK", "OH", "OO", "UA", "WN", "YX")) {
            aeropuertosMap.put(airlineCode, new HashSet<>(AEROPUERTOS_PRINCIPALES_USA));
        }
    }

    /**
     * Verifica si una aerolínea es válida
     */
    public static boolean esAerolineaValida(String codigo) {
        return AEROLINEAS_AEROPUERTOS.containsKey(codigo);
    }

    /**
     * Verifica si un aeropuerto está disponible para una aerolínea
     */
    public static boolean esAeropuertoValido(String aerolinea, String aeropuerto) {
        Set<String> aeropuertos = AEROLINEAS_AEROPUERTOS.get(aerolinea);
        return aeropuertos != null && aeropuertos.contains(aeropuerto.toUpperCase());
    }

    /**
     * Obtiene el nombre de una aerolínea
     */
    public static String getNombreAerolinea(String codigo) {
        return NOMBRES_AEROLINEAS.getOrDefault(codigo, "Aerolínea Desconocida");
    }

    /**
     * Obtiene todos los aeropuertos de una aerolínea
     */
    public static Set<String> getAeropuertos(String aerolinea) {
        return AEROLINEAS_AEROPUERTOS.getOrDefault(aerolinea, Collections.emptySet());
    }

    /**
     * Obtiene todas las aerolíneas disponibles
     */
    public static Set<String> getAerolineasDisponibles() {
        return AEROLINEAS_AEROPUERTOS.keySet();
    }
}
