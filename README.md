# FlightOnTime - Sistema de Predicción de Puntualidad de Vuelos

![FlightOnTime](https://img.shields.io/badge/FlightOnTime-v1.0.0-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Python](https://img.shields.io/badge/Python-3.11-green)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-brightgreen)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 📋 Descripción

**FlightOnTime** es un sistema empresarial de predicción de puntualidad de vuelos que integra:

- 🤖 **Machine Learning** con modelo Random Forest entrenado
- 🌤️ **Datos meteorológicos en tiempo real** vía OpenWeatherMap API
- 📏 **Cálculo automático de distancias** usando fórmula de Haversine
- 🏢 **Arquitectura de microservicios** con Java Spring Boot y Python FastAPI
- 🎨 **Frontend moderno** estilo Oracle Redwood
- 💾 **Persistencia PostgreSQL** para historial y estadísticas
- 📊 **Dashboard de estadísticas** con gráficas interactivas
- 📦 **Procesamiento por lotes** mediante archivos CSV

---

## 🌐 Acceso al Sistema

### 🚀 Entorno de Producción

El sistema está desplegado y disponible en:

**🔗 URL de Producción**: [http://159.54.159.244/index.html](http://159.54.159.244/index.html)

> 🌟 Accede directamente a la aplicación en producción para probar todas las funcionalidades del sistema.

---

## 🚀 Cómo Levantar el Sistema en Local (Docker)

### Prerrequisitos

| Herramienta | Versión Mínima | Instalación |
|-------------|----------------|-------------|
| **Docker** | 20.10+ | [docker.com/get-docker](https://www.docker.com/get-docker) |
| **Docker Compose** | 2.0+ | Incluido con Docker Desktop |

> 💡 **Verificar instalación**: Ejecutar `docker --version` y `docker compose version` en terminal

---

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd vektor-ai-backend
```

---

### Paso 2: Configurar Variable de Entorno

Crear un archivo `.env` en la raíz del proyecto con la API Key de OpenWeatherMap:

```env
OPENWEATHER_API_KEY=tu_api_key_aqui
```

> 📝 **Obtener API Key gratuita**: [openweathermap.org/api](https://openweathermap.org/api)

---

### Paso 3: Descargar Modelo ML (⚠️ Importante)

Debido a restricciones de tamaño de GitHub (>100MB), el modelo entrenado no se incluye en el repositorio.

1. **Descargar el archivo** `random_forest_clima_v1.joblib` desde el siguiente enlace:
   
   👉 [**Descargar Modelo ML (Google Drive)**](https://drive.google.com/file/d/1queVcz3SF7OzxB6B92lmlzKv9X4tbJnH/view?usp=drive_link)

2. **Mover el archivo descargado** a la carpeta `ml-service/` dentro del proyecto.

> ❌ **Si omites este paso**, el servicio de Machine Learning fallará al iniciar.

---

### Paso 4: Construir y Levantar los Servicios

```bash
docker compose up --build
```

> ⚠️ **Importante**: Este es el comando principal para levantar el proyecto por primera vez en local.

Este comando:
1. Construye las imágenes de Docker para cada servicio
2. Levanta todos los contenedores
3. Configura la red interna entre servicios
4. Inicializa la base de datos PostgreSQL

---

### Paso 5: Verificar que los Servicios estén Corriendo

Esperar aproximadamente **90 segundos** para que todos los servicios inicien completamente.

#### Tiempos de inicio aproximados:

| Servicio | Tiempo |
|----------|--------|
| PostgreSQL | ~10 segundos |
| ML Service | ~40 segundos (carga del modelo) |
| Backend | ~60 segundos (compilación Maven) |
| Frontend | ~10 segundos |

#### Verificar estado de contenedores:

```bash
docker compose ps
```

**Salida esperada:**
```
NAME                    STATUS
flightontime-postgres   Up (healthy)
flightontime-ml         Up (healthy)
flightontime-backend    Up (healthy)
flightontime-frontend   Up (healthy)
```

---

### Paso 6: Acceder a la Aplicación

Una vez que todos los servicios estén corriendo, acceder a:

| Servicio | URL |
|----------|-----|
| **🌐 Frontend (Aplicación Web)** | http://localhost:8081 |
| **📡 Backend API** | http://localhost:8080/api |
| **🤖 ML Service** | http://localhost:8001 |
| **📊 Métricas Prometheus** | http://localhost:8080/actuator/prometheus |

#### Health Checks:

| Servicio | URL de Health Check |
|----------|---------------------|
| Backend | http://localhost:8080/api/health |
| ML Service | http://localhost:8001/health |

---

## 🐳 Comandos Docker Útiles

### Ver logs de todos los servicios

```bash
docker compose logs -f
```

### Ver logs de un servicio específico

```bash
docker compose logs -f backend
docker compose logs -f ml-service
docker compose logs -f frontend
docker compose logs -f postgres
```

### Detener todos los servicios

```bash
docker compose down
```

### Detener y eliminar volúmenes (reset completo)

```bash
docker compose down -v
```

### Reconstruir un servicio específico

```bash
docker compose up --build backend
```

### Ejecutar en modo detached (segundo plano)

```bash
docker compose up -d --build
```

---

## 📁 Estructura del Proyecto

```
vektor-ai-backend/
├── backend/                          # Backend Java Spring Boot (Puerto 8080)
│   ├── src/main/java/...             # Código fuente Java
│   ├── src/main/resources/           # Configuración y schema SQL
│   ├── pom.xml                       # Dependencias Maven
│   └── Dockerfile
│
├── ml-service/                       # Servicio ML Python FastAPI (Puerto 8001)
│   ├── main.py                       # Aplicación FastAPI
│   ├── airport_coords.py             # Coordenadas de aeropuertos
│   ├── random_forest_clima_v1.joblib # Modelo ML entrenado
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                         # Frontend HTML/CSS/JS (Puerto 8081)
│   ├── index.html                    # Dashboard principal
│   ├── batch.html                    # Predicción por lotes
│   ├── history.html                  # Historial
│   ├── stats.html                    # Estadísticas
│   ├── styles.css                    # Estilos
│   ├── app.js                        # Lógica JavaScript
│   └── Dockerfile
│
├── docs/                             # Documentación
│   ├── ARCHITECTURE.md               # Arquitectura del sistema
│   ├── CONTRATO_INTEGRACION.md       # Contrato de integración API
│   ├── MANUAL-DESPLIEGUE-OCI.pdf     # Manual de despliegue en Oracle Cloud
│   └── testing/                      # Guías de pruebas
│
├── postman/                          # Colección Postman
│   ├── FlightOnTime_Postman_Collection.json
│   └── FlightOnTime_Environment.json
│
├── docker-compose.yml                # Orquestación de servicios
├── .env                              # Variables de entorno (crear)
└── README.md                         # Este archivo
```

---

## 🔑 Credenciales de Base de Datos

| Parámetro | Valor |
|-----------|-------|
| Host | localhost |
| Puerto | 5432 |
| Base de datos | flightontime |
| Usuario | flightontime |
| Contraseña | flightontime123 |

> 📝 **Acceso directo**: 
> ```bash
> docker exec -it flightontime-postgres psql -U flightontime -d flightontime
> ```

---

## 📡 Endpoints Principales

### Backend API (http://localhost:8080)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/predict` | Predicción individual de vuelo |
| POST | `/api/batch-predict` | Predicción por lotes (CSV) |
| GET | `/api/predictions` | Consultar historial con paginación |
| GET | `/api/stats` | Estadísticas agregadas |
| GET | `/api/health` | Health check |
| GET | `/api/docs` | Documentación de API |

### ML Service (http://localhost:8001)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/predict_internal` | Predicción ML interna |
| GET | `/airports` | Lista de aeropuertos |
| GET | `/health` | Health check |

---

## 🧪 Probar la API

### Predicción Individual

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

### Health Check

```bash
curl http://localhost:8080/api/health
```

---

## 🚨 Solución de Problemas

### Error: "Port already in use"

Algún puerto ya está siendo usado por otra aplicación.

**Solución**: Detener el proceso que usa el puerto o modificar los puertos en `docker-compose.yml`

### Error: ML Service no carga el modelo

El archivo del modelo ML es muy grande (~500MB) y puede tardar en cargar. También puede fallar si no descargaste el archivo manualmente.

**Solución**: 
1. Asegúrate de haber completado el **Paso 3** (Descargar Modelo ML).
2. Verifica que el archivo `random_forest_clima_v1.joblib` esté en la carpeta `ml-service/`.
3. Si ya está, espera 40-60 segundos adicionales.

Verificar logs:
```bash
docker compose logs ml-service
```

### Error: Backend no conecta a PostgreSQL

El backend intenta conectarse antes de que PostgreSQL esté listo.

**Solución**: Docker Compose usa health checks para garantizar el orden. Si persiste, reiniciar:
```bash
docker compose down
docker compose up --build
```

### Error: API Key de OpenWeatherMap inválida

Los datos meteorológicos no se obtienen correctamente.

**Solución**: Verificar que el archivo `.env` contenga una API Key válida:
```env
OPENWEATHER_API_KEY=tu_api_key_valida
```

---

## 👥 Aerolíneas Soportadas

| Código | Nombre |
|--------|--------|
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

## 👥 Equipo de Desarrollo

El proyecto **FlightOnTime** fue desarrollado por el **Equipo 71 - Vektor AI** como parte del **Hackathon Oracle ONE 2025**.

### 🎯 Product Owner
- **Kevin Joel Lemos** - [@niveKJ](https://github.com/niveKJ)

### 📊 Scrum Master
- **Gloria Carolina Guerrero Velandia** - [@CarolinaG2024](https://github.com/CarolinaG2024)

### 🤖 Data Science Team
- **Líder Técnico DS**: Sofía Martínez Véjar - [@smv1980](https://github.com/smv1980)
- **Data Scientists**:
  - Karen Brenes - [@Karen-13C](https://github.com/Karen-13C)
  - Miguel Baillon - [@MPBOga](https://github.com/MPBOga)
  - Ronald Varela - [@Ronaldvarela852](https://github.com/Ronaldvarela852)
  - Gloria Carolina Guerrero Velandia - [@CarolinaG2024](https://github.com/CarolinaG2024)
  - Cristian Camilo Maje - [@CamiloTrr](https://github.com/CamiloTrr)
  - Kevin Lemos - [@niveKJ](https://github.com/niveKJ)

### ⚙️ FullStack Team
- **Líder Técnico Backend & Frontend**: Edgar Alejandro Nestor Castillo - [@EdgarNestorC](https://github.com/EdgarNestorC)
- **Desarrollador FullStack**: Jose Julio Rodriguez - [@JoseBenin82](https://github.com/JoseBenin82)

### 🔗 Repositorio del Equipo

Organización en GitHub: **[VektorAI-Equipo71](https://github.com/VektorAI-Equipo71)**

---

## 📚 Documentación Adicional

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura del sistema
- **[CONTRATO_INTEGRACION.md](docs/CONTRATO_INTEGRACION.md)** - Contrato de integración API
- **[MANUAL-DESPLIEGUE-OCI.pdf](docs/MANUAL-DESPLIEGUE-OCI.pdf)** - Manual de despliegue en Oracle Cloud
- **[GUIA_PRUEBAS.md](docs/testing/GUIA_PRUEBAS.md)** - Guía de pruebas
- **[Colección Postman](postman/)** - Colección para probar la API

---

## 📄 Licencia

Copyright © 2026 FlightOnTime - Vektor AI

---

**¡Gracias por usar FlightOnTime!** ✈️
