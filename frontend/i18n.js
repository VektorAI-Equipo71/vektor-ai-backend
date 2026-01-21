// ============================================================================
// VEKTOR AI - INTERNACIONALIZACIÓN (i18n)
// ============================================================================
// Sistema de traducción para soporte multiidioma (Español/Inglés)
// ============================================================================

const translations = {
    es: {
        // Header
        'header.title': 'FlightOnTime',
        'header.status.operational': 'Sistema Operativo',
        'header.status.limited': 'Modo Limitado',

        // Form Section
        'form.title': 'Predicción de Puntualidad',
        'form.description': 'Ingrese los datos del vuelo para obtener una predicción basada en ML y datos meteorológicos',
        'form.airline': 'Aerolínea',
        'form.airline.select': 'Seleccione una aerolínea',
        'form.origin': 'Aeropuerto de Origen',
        'form.origin.select': 'Seleccione origen',
        'form.destination': 'Aeropuerto de Destino',
        'form.destination.select': 'Seleccione destino',
        'form.departure': 'Fecha y Hora de Partida',
        'form.flight.date': 'Fecha de Vuelo',
        'form.flight.time': 'Hora de Vuelo',
        'form.submit': 'Obtener Predicción',
        'form.processing': 'Procesando...',

        // Results
        'results.title': 'Resultado de la Predicción',
        'results.ontime': 'Puntual',
        'results.delayed': 'Retrasado',
        'results.ontime.subtitle': 'El vuelo tiene alta probabilidad de despegar a tiempo',
        'results.delayed.subtitle': 'El vuelo podría experimentar retrasos',

        // Metrics
        'metrics.probability': 'Probabilidad de Retraso',
        'metrics.confidence': 'Confianza del Modelo',
        'metrics.distance': 'Distancia del Vuelo',

        // Weather
        'weather.title': 'Clima Detectado en Origen',
        'weather.title.origin': 'Clima en Origen',
        'weather.title.dest': 'Clima en Destino',
        'weather.condition': 'Condición',
        'weather.temperature': 'Temperatura',
        'weather.humidity': 'Humedad',
        'weather.wind': 'Viento',
        'weather.visibility': 'Visibilidad',
        
        // Weather Conditions
        'weather.condition.clear': 'cielo claro',
        'weather.condition.clouds': 'nubes',
        'weather.condition.rain': 'lluvia',
        'weather.condition.drizzle': 'llovizna',
        'weather.condition.thunderstorm': 'tormenta',
        'weather.condition.snow': 'nieve',
        'weather.condition.mist': 'niebla',
        'weather.condition.fog': 'niebla',
        'weather.condition.haze': 'neblina',
        'weather.condition.dust': 'polvo',
        'weather.condition.sand': 'arena',
        'weather.condition.ash': 'ceniza',
        'weather.condition.squall': 'chubasco',
        'weather.condition.tornado': 'tornado',
        'weather.condition.overcast': 'nublado',

        // Metadata
        'metadata.title': 'Información del Vuelo',
        'metadata.airline': 'Aerolínea',
        'metadata.route': 'Ruta de Vuelo',
        'metadata.distance': 'Distancia',
        'metadata.origin': 'Origen',
        'metadata.destination': 'Destino',
        'metadata.departure': 'Salida Programada',
        'metadata.calculated': 'Cálculo Realizado',
        'metadata.note': 'Nota del Sistema',

        // Loading
        'loading.text': 'Analizando datos de vuelo y clima...',

        // Footer
        'footer.text': '© 2026 FlightOnTime | Sistema de Misión Crítica',
        'footer.all.rights': 'Todos los derechos reservados.',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Uso',
        
        // About Page
        'about.page.title': 'Acerca de',
        'about.badge.mission.critical': 'Sistema de Misión Crítica',

        // Errors
        'error.same.airport': '⚠️ El aeropuerto de origen y destino deben ser diferentes',
        'error.not.found': '⚠️ No se hallan esos datos en la base de datos.',
        'error.verify': 'Por favor, verifique que:',
        'error.airline.valid': '• La aerolínea seleccionada sea válida',
        'error.airports.exist': '• Los aeropuertos de origen y destino existan en el sistema',
        'error.airlines.valid': 'Aerolíneas válidas: 9E, AA, AS, B6, DL, F9, G4, HA, MQ, NK, OH, OO, UA, WN, YX',
        'error.connection': '🔌 No se puede conectar con el servidor.',
        'error.backend': 'Verifique que el backend esté ejecutándose en',
        'error.timeout': '⏱️ La solicitud tardó demasiado tiempo.',
        'error.server.busy': 'El servidor puede estar sobrecargado. Intente nuevamente.',
        'error.prediction': 'Error al obtener predicción:',

        // Settings
        'settings.title': 'Configuración',
        'settings.language': 'Idioma',
        'settings.units': 'Sistema de Unidades',
        'settings.units.km': 'Kilómetros (km)',
        'settings.units.miles': 'Millas (mi)',
        'settings.save.info': 'Las preferencias se guardan automáticamente y se aplicarán en toda la aplicación.',

        // Navigation
        'nav.home': 'Inicio',
        'nav.individual': 'Predicción Individual',
        'nav.batch': 'Predicción por Lote',
        'nav.history': 'Historial',
        'nav.stats': 'Estadísticas',
        'nav.about': 'Acerca de',

        // Dashboard
        'dashboard.title': 'Dashboard Principal',
        'dashboard.subtitle': 'Gestión completa de predicciones de puntualidad de vuelos',
        'dashboard.total.predictions': 'Total Predicciones',
        'dashboard.today.predictions': 'Predicciones Hoy',
        'dashboard.delayed.percentage': '% Retrasados Hoy',
        'dashboard.ontime.percentage': '% Puntuales Hoy',
        'dashboard.card.individual.title': 'Predicción Individual',
        'dashboard.card.individual.description': 'Realice una predicción para un vuelo específico ingresando los datos del vuelo. Obtenga resultados instantáneos con análisis de clima y probabilidades.',
        'dashboard.card.individual.action': 'Ir a Predicción Individual',
        'dashboard.card.batch.title': 'Predicción por Lote',
        'dashboard.card.batch.description': 'Procese múltiples vuelos a la vez subiendo un archivo CSV. Visualice todos los resultados en una tabla con filtros avanzados.',
        'dashboard.card.batch.action': 'Ir a Predicción por Lote',
        'dashboard.card.history.title': 'Historial de Predicciones',
        'dashboard.card.history.description': 'Consulte todas las predicciones realizadas con filtros avanzados por fecha, aerolínea, aeropuertos y tipo de predicción. Tabla paginada para fácil navegación.',
        'dashboard.card.history.action': 'Ver Historial Completo',
        'dashboard.card.stats.title': 'Estadísticas',
        'dashboard.card.stats.description': 'Visualice estadísticas detalladas de todas las predicciones realizadas, incluyendo análisis por aerolínea, aeropuertos y tendencias temporales.',
        'dashboard.card.stats.action': 'Ver Estadísticas',

        // Section Titles
        'section.individual.title': 'Predicción Individual de Vuelo',

        // Buttons
        'button.clear.form': 'Limpiar Formulario',
        'button.new.query': 'Nueva Consulta',
        'button.return.home': 'Volver a Inicio',
        'button.view.history': 'Ver en Historial Completo',

        // Batch Page
        'batch.title': 'Predicción de Vuelos por Lote',
        'batch.upload': 'Subir Archivo CSV',
        'batch.process': 'Procesar Archivo',
        'batch.drag.drop': 'Arrastra y suelta tu archivo CSV aquí',
        'batch.click.select': 'o haz clic para seleccionar',

        // History Page
        'history.title': 'Historial de Predicciones',
        'history.filters': 'Filtros',
        'history.filters.search': 'Filtros de Búsqueda',
        'history.search': 'Buscar',
        'history.clear': 'Limpiar Filtros',
        'history.filter.date.start': 'Fecha Inicio',
        'history.filter.date.end': 'Fecha Fin',
        'history.filter.all': 'Todas',
        'history.filter.all.airports': 'Todos',
        'history.filter.on.time': 'Puntual',
        'history.filter.delayed': 'Retrasado',
        'history.results': 'Resultados',
        'history.this.page': 'En esta página',

        // Loading messages
        'loading.stats': 'Cargando estadísticas...',
        'loading.predictions': 'Cargando predicciones...',
        'loading.csv': 'Procesando archivo CSV...',

        // Detailed Statistics
        'stats.title': 'Estadísticas de Predicciones',
        'stats.subtitle': 'Visualice estadísticas detalladas con gráficas y análisis de todas las predicciones realizadas',
        'stats.detailed.title': 'Estadísticas Detalladas',
        'stats.by.airline': 'Estadísticas por Aerolínea',
        'stats.by.airport': 'Estadísticas por Aeropuerto de Origen (Top 10)',
        'stats.flights': 'vuelos',
        'stats.on.time': 'Puntuales:',
        'stats.ontime': 'Puntuales',
        'stats.delayed': 'Retrasados:',
        'stats.percentage.delayed': '% Retrasados',
        'stats.last.update': 'Última actualización:',
        'stats.no.data': 'No hay estadísticas disponibles aún. Realice algunas predicciones para ver las estadísticas aquí.',
        'stats.total.label': 'Total Predicciones',
        'stats.on.time.label': 'Puntuales',
        'stats.delayed.label': 'Retrasados',
        'stats.percentage.label': '% Retrasados',
        'stats.loading': 'Cargando estadísticas...',
        'stats.predictions': 'Predicciones',
        'stats.filters.title': 'Filtros',
        'stats.filters.startDate': 'Fecha Inicio',
        'stats.filters.endDate': 'Fecha Fin',
        'stats.filters.airline': 'Aerolínea',
        'stats.filters.airport': 'Aeropuerto',
        'stats.filters.all': 'Todas',
        'stats.filters.apply': 'Aplicar Filtros',
        'stats.filters.clear': 'Limpiar Filtros',
        'stats.chart1.title': 'Distribución Puntuales vs Retrasados',
        'stats.chart2.title': '% Retrasados por Aerolínea',
        'stats.chart3.title': 'Top 10 Aeropuertos (Predicciones)',
        'stats.table.title': 'Predicciones Individuales',
        'stats.table.date': 'Fecha Predicción',
        'stats.table.airline': 'Aerolínea',
        'stats.table.origin': 'Origen',
        'stats.table.destination': 'Destino',
        'stats.table.departure': 'Fecha Partida',
        'stats.table.distance': 'Distancia',
        'stats.table.prediction': 'Predicción',
        'stats.table.probability': 'Probabilidad',
        'stats.table.confidence': 'Confianza',
        'stats.table.showing': 'Mostrando',
        'stats.table.of': 'de',
        'stats.table.predictions': 'predicciones',
        'stats.table.page': 'Página',
        'stats.error.loading': 'Error al cargar predicciones',

        // Batch Page
        'batch.file.selected': 'Archivo seleccionado:',
        'batch.select.csv': 'Por favor, selecciona un archivo CSV válido (.csv)',
        'batch.file.error': 'Error al procesar el archivo. Por favor, intenta seleccionarlo manualmente.',
        'batch.no.predictions': 'No se procesaron predicciones. Verifica el formato del archivo CSV.',
        'batch.processed.success': 'predicciones procesadas exitosamente',
        'batch.process.completed': 'Proceso Finalizado',
        'batch.processing': 'Procesando archivo CSV...',
        'batch.line': 'Línea',
        'batch.airline': 'Aerolínea',
        'batch.origin': 'Origen',
        'batch.destination': 'Destino',
        'batch.departure.date': 'Fecha Partida',
        'batch.distance': 'Distancia (km)',
        'batch.prediction': 'Predicción',
        'batch.delay.probability': 'Probabilidad Retraso',
        'batch.confidence': 'Confianza',
        'batch.on.time': 'Puntual',
        'batch.delayed': 'Retrasado',
        'batch.download.template': 'Descargar Plantilla CSV',
        'batch.id.label': 'ID de Lote:',
        'batch.export.excel': 'Exportar a Excel',
        'batch.statistics.title': 'Estadísticas del Lote',
        'batch.chart.prediction': 'Distribución de Predicciones',
        'batch.chart.airline': 'Predicciones por Aerolínea',
        'batch.chart.probability': 'Distribución de Probabilidades de Retraso',
        'batch.probability.distribution': 'Cantidad de Vuelos',
        'batch.table.title': 'Predicciones Individuales',
        'batch.results.title': 'Resultados del Procesamiento por Lote',
        'batch.view.stats': 'Ver Estadísticas del Lote',

        // History Page
        'history.no.predictions': 'No se encontraron predicciones con los filtros seleccionados',
        'history.showing': 'Mostrando',
        'history.of': 'de',
        'history.predictions': 'predicciones',
        'history.page': 'Página',
        'history.filter.date': 'Fecha de Partida',
        'history.filter.airline': 'Aerolínea',
        'history.filter.origin': 'Aeropuerto Origen',
        'history.filter.destination': 'Aeropuerto Destino',
        'history.filter.all': 'Todas',

        // Countries
        'country.brazil': 'Brasil',
        'country.usa': 'Estados Unidos',
        'country.mexico': 'México',
        'country.europe': 'Europa',

        // About Page
        'about.hero.subtitle': 'Sistema empresarial de predicción de puntualidad de vuelos con Machine Learning e integración meteorológica en tiempo real',
        'about.section.product.title': 'Sobre el Producto',
        'about.section.product.description1': '<strong>FlightOnTime</strong> es una solución empresarial de misión crítica diseñada para predecir la puntualidad de vuelos comerciales. La aplicación combina tecnologías avanzadas de Machine Learning con datos meteorológicos en tiempo real para proporcionar predicciones precisas y confiables.',
        'about.section.product.description2': 'Nuestro sistema está diseñado para ayudar a aerolíneas, operadores aeroportuarios y pasajeros a tomar decisiones informadas basadas en análisis predictivo avanzado. Utilizamos un modelo Random Forest entrenado que analiza múltiples variables incluyendo condiciones climáticas, distancias de vuelo, aerolíneas y rutas específicas.',
        'about.section.problem.title': 'Problema que Resuelve',
        'about.section.problem.description': 'Los retrasos en vuelos comerciales generan costos significativos tanto para las aerolíneas como para los pasajeros. FlightOnTime permite:',
        'about.section.problem.item1': '<strong>Reducción de incertidumbre:</strong> Los pasajeros conocen la probabilidad de retraso antes del vuelo',
        'about.section.problem.item2': '<strong>Optimización operativa:</strong> Las aerolíneas pueden anticipar y mitigar retrasos',
        'about.section.problem.item3': '<strong>Mejora de experiencia:</strong> Información transparente y en tiempo real',
        'about.section.problem.item4': '<strong>Toma de decisiones:</strong> Datos precisos para planificación de recursos',
        'about.section.tech.title': 'Tecnologías Utilizadas',
        'about.section.features.title': 'Funcionalidades Principales',
        'about.section.architecture.title': 'Arquitectura del Sistema',
        'about.section.architecture.description': 'FlightOnTime utiliza una arquitectura de microservicios moderna y escalable, diseñada para alta disponibilidad y rendimiento empresarial.',
        'about.section.architecture.flow.title': 'Flujo de Datos',
        'about.section.company.title': 'Información de la Empresa',
        'about.section.company.description': '<strong>FlightOnTime</strong> es desarrollado como sistema de misión crítica para <strong>Oracle Enterprise Partner</strong>. Nuestra solución está diseñada siguiendo los más altos estándares de calidad empresarial y arquitectura escalable.',
        'about.section.company.mission.title': 'Misión',
        'about.section.company.mission': 'Proporcionar soluciones de predicción de vuelos precisas y confiables que ayuden a optimizar las operaciones aeronáuticas y mejorar la experiencia de los pasajeros mediante el uso de tecnologías avanzadas de Machine Learning e inteligencia artificial.',
        'about.section.company.vision.title': 'Visión',
        'about.section.company.vision': 'Ser la plataforma líder en predicción de puntualidad de vuelos, reconocida por su precisión, confiabilidad y capacidad de escalar para satisfacer las necesidades de las principales aerolíneas y operadores aeroportuarios del mundo.',
        'about.section.version.title': 'Versión y Actualizaciones',
        'about.section.version.current': 'Versión Actual:',
        'about.section.version.release': 'Fecha de Lanzamiento:',
        'about.section.version.status': 'Estado:',
        'about.section.version.status.value': 'Producción',
        'about.section.version.features.title': 'Características de la Versión 1.0.0',
        'about.section.contact.title': 'Contacto y Soporte',
        'about.section.contact.description': 'Para soporte técnico, consultas o más información sobre FlightOnTime, puedes contactarnos a través de:',
        'about.section.contact.docs': 'Documentación API',
        'about.section.contact.health': 'Health Checks',
        'about.section.contact.support': 'Soporte',
        'about.section.contact.resources.title': 'Recursos Adicionales',
        'about.feature.individual.title': 'Predicción Individual',
        'about.feature.individual.description': 'Realiza predicciones de puntualidad para vuelos individuales con análisis detallado de probabilidades y confianza del modelo.',
        'about.feature.batch.title': 'Procesamiento por Lotes',
        'about.feature.batch.description': 'Procesa múltiples vuelos simultáneamente mediante carga de archivos CSV, ideal para análisis masivos y reportes.',
        'about.feature.stats.title': 'Estadísticas y Análisis',
        'about.feature.stats.description': 'Visualiza estadísticas detalladas con gráficas interactivas, análisis por aerolínea, aeropuertos y franjas horarias.',
        'about.feature.history.title': 'Historial de Predicciones',
        'about.feature.history.description': 'Mantén un registro completo de todas las predicciones realizadas con filtros avanzados y búsqueda por lote ID.',
        'about.feature.ml.title': 'Machine Learning',
        'about.feature.ml.description': 'Modelo Random Forest entrenado que analiza múltiples features incluyendo clima, distancia, aerolínea y rutas.',
        'about.feature.weather.title': 'Datos Meteorológicos',
        'about.feature.weather.description': 'Integración en tiempo real con OpenWeatherMap API para obtener condiciones climáticas actuales de aeropuertos.',
        'about.section.architecture.diagram': '┌─────────────────────────────────────────────────────────────────┐\n│                         USUARIO FINAL                           │\n└────────────────────────────┬────────────────────────────────────┘\n                             │\n                             ▼\n┌─────────────────────────────────────────────────────────────────┐\n│                    FRONTEND (Nginx)                             │\n│  • HTML5 + CSS3 + JavaScript                                    │\n│  • Diseño Oracle Redwood                                        │\n│  • Puerto: 80                                                   │\n└────────────────────────────┬────────────────────────────────────┘\n                             │ HTTP\n                             ▼\n┌─────────────────────────────────────────────────────────────────┐\n│              BACKEND (Java 17 + Spring Boot)                    │\n│  • Orquestador empresarial                                      │\n│  • Validación de negocio                                        │\n│  • Persistencia PostgreSQL                                      │\n│  • Puerto: 8080                                                 │\n└────────────┬───────────────────────────────┬────────────────────┘\n             │ HTTP                          │ HTTP\n             ▼                               ▼\n┌──────────────────────────┐   ┌────────────────────────────────┐\n│  ML SERVICE (FastAPI)    │   │  OpenWeatherMap API            │\n│  • Carga modelo ML       │   │  • Clima en tiempo real        │\n│  • Cálculo Haversine     │   │                                │\n│  • Predicción ML         │   └────────────────────────────────┘\n│  • Puerto: 8001          │\n└──────────────────────────┘',
        'about.section.architecture.flow.step1': '<strong>Usuario</strong> ingresa datos del vuelo (aerolínea, origen, destino, fecha)',
        'about.section.architecture.flow.step2': '<strong>Frontend</strong> envía solicitud HTTP POST al Backend',
        'about.section.architecture.flow.step3': '<strong>Backend</strong> valida datos y reenvía al ML Service',
        'about.section.architecture.flow.step4': '<strong>ML Service</strong> calcula distancia, consulta clima y ejecuta predicción',
        'about.section.architecture.flow.step5': '<strong>Respuesta</strong> fluye de vuelta: ML → Backend → Frontend',
        'about.section.architecture.flow.step6': '<strong>Usuario</strong> visualiza predicción, probabilidades, clima y metadata',
        'about.section.version.feature1': '✅ Predicción individual de vuelos con modelo ML Random Forest',
        'about.section.version.feature2': '✅ Procesamiento por lotes mediante carga de archivos CSV',
        'about.section.version.feature3': '✅ Integración con OpenWeatherMap API para datos meteorológicos',
        'about.section.version.feature4': '✅ Cálculo automático de distancias usando fórmula de Haversine',
        'about.section.version.feature5': '✅ Dashboard de estadísticas con gráficas interactivas',
        'about.section.version.feature6': '✅ Historial completo de predicciones con filtros avanzados',
        'about.section.version.feature7': '✅ Exportación de resultados a Excel',
        'about.section.version.feature8': '✅ Arquitectura de microservicios con Docker',
        'about.section.version.feature9': '✅ Persistencia de datos en PostgreSQL',
        'about.section.version.feature10': '✅ Diseño responsive estilo Oracle Redwood',
        'about.section.contact.view.docs': 'Ver Documentación',
        'about.section.contact.resource1': '<strong>README:</strong> Documentación completa del proyecto',
        'about.section.contact.resource2': '<strong>Arquitectura:</strong> Detalles técnicos de la arquitectura del sistema',
        'about.section.contact.resource3': '<strong>Guía de Pruebas:</strong> Instrucciones para testing y validación',
        'about.section.contact.resource4': '<strong>Contrato de Integración:</strong> Especificaciones de la API'
    },
    en: {
        // Header
        'header.title': 'FlightOnTime',
        'header.status.operational': 'System Operational',
        'header.status.limited': 'Limited Mode',

        // Form Section
        'form.title': 'Flight Punctuality Prediction',
        'form.description': 'Enter flight details to get a prediction based on ML and real-time weather data',
        'form.airline': 'Airline',
        'form.airline.select': 'Select an airline',
        'form.origin': 'Origin Airport',
        'form.origin.select': 'Select origin',
        'form.destination': 'Destination Airport',
        'form.destination.select': 'Select destination',
        'form.departure': 'Departure Date and Time',
        'form.flight.date': 'Flight Date',
        'form.flight.time': 'Flight Time',
        'form.submit': 'Get Prediction',
        'form.processing': 'Processing...',

        // Results
        'results.title': 'Prediction Result',
        'results.ontime': 'On Time',
        'results.delayed': 'Delayed',
        'results.ontime.subtitle': 'The flight has a high probability of departing on time',
        'results.delayed.subtitle': 'The flight may experience delays',

        // Metrics
        'metrics.probability': 'Delay Probability',
        'metrics.confidence': 'Model Confidence',
        'metrics.distance': 'Flight Distance',

        // Weather
        'weather.title': 'Detected Weather at Origin',
        'weather.title.origin': 'Weather at Origin',
        'weather.title.dest': 'Weather at Destination',
        'weather.condition': 'Condition',
        'weather.temperature': 'Temperature',
        'weather.humidity': 'Humidity',
        'weather.wind': 'Wind',
        'weather.visibility': 'Visibility',
        
        // Weather Conditions
        'weather.condition.clear': 'clear sky',
        'weather.condition.clouds': 'clouds',
        'weather.condition.rain': 'rain',
        'weather.condition.drizzle': 'drizzle',
        'weather.condition.thunderstorm': 'thunderstorm',
        'weather.condition.snow': 'snow',
        'weather.condition.mist': 'mist',
        'weather.condition.fog': 'fog',
        'weather.condition.haze': 'haze',
        'weather.condition.dust': 'dust',
        'weather.condition.sand': 'sand',
        'weather.condition.ash': 'ash',
        'weather.condition.squall': 'squall',
        'weather.condition.tornado': 'tornado',
        'weather.condition.overcast': 'overcast',

        // Metadata
        'metadata.title': 'Flight Information',
        'metadata.airline': 'Airline',
        'metadata.route': 'Flight Route',
        'metadata.distance': 'Distance',
        'metadata.origin': 'Origin',
        'metadata.destination': 'Destination',
        'metadata.departure': 'Scheduled Departure',
        'metadata.calculated': 'Calculated At',
        'metadata.note': 'System Note',

        // Loading
        'loading.text': 'Analyzing flight and weather data...',

        // Footer
        'footer.text': '© 2026 FlightOnTime | Mission Critical System',
        'footer.all.rights': 'All rights reserved.',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Use',
        
        // About Page
        'about.page.title': 'About',
        'about.badge.mission.critical': 'Mission Critical System',

        // Errors
        'error.same.airport': '⚠️ Origin and destination airports must be different',
        'error.not.found': '⚠️ Data not found in database.',
        'error.verify': 'Please verify that:',
        'error.airline.valid': '• The selected airline is valid',
        'error.airports.exist': '• Origin and destination airports exist in the system',
        'error.airlines.valid': 'Valid airlines: 9E, AA, AS, B6, DL, F9, G4, HA, MQ, NK, OH, OO, UA, WN, YX',
        'error.connection': '🔌 Cannot connect to server.',
        'error.backend': 'Verify that the backend is running at',
        'error.timeout': '⏱️ Request took too long.',
        'error.server.busy': 'Server may be overloaded. Please try again.',
        'error.prediction': 'Error getting prediction:',

        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.units': 'Unit System',
        'settings.units.km': 'Kilometers (km)',
        'settings.units.miles': 'Miles (mi)',
        'settings.save.info': 'Preferences are saved automatically and will be applied throughout the application.',

        // Navigation
        'nav.home': 'Home',
        'nav.individual': 'Individual Prediction',
        'nav.batch': 'Batch Prediction',
        'nav.history': 'History',
        'nav.stats': 'Statistics',
        'nav.about': 'About',

        // Dashboard
        'dashboard.title': 'Main Dashboard',
        'dashboard.subtitle': 'Complete flight punctuality prediction management',
        'dashboard.total.predictions': 'Total Predictions',
        'dashboard.today.predictions': 'Predictions Today',
        'dashboard.delayed.percentage': '% Delayed Today',
        'dashboard.ontime.percentage': '% On Time Today',
        'dashboard.card.individual.title': 'Individual Prediction',
        'dashboard.card.individual.description': 'Make a prediction for a specific flight by entering flight data. Get instant results with weather analysis and probabilities.',
        'dashboard.card.individual.action': 'Go to Individual Prediction',
        'dashboard.card.batch.title': 'Batch Prediction',
        'dashboard.card.batch.description': 'Process multiple flights at once by uploading a CSV file. View all results in a table with advanced filters.',
        'dashboard.card.batch.action': 'Go to Batch Prediction',
        'dashboard.card.history.title': 'Prediction History',
        'dashboard.card.history.description': 'View all predictions made with advanced filters by date, airline, airports and prediction type. Paginated table for easy navigation.',
        'dashboard.card.history.action': 'View Full History',
        'dashboard.card.stats.title': 'Statistics',
        'dashboard.card.stats.description': 'View detailed statistics of all predictions made, including analysis by airline, airports and temporal trends.',
        'dashboard.card.stats.action': 'View Statistics',

        // Section Titles
        'section.individual.title': 'Individual Flight Prediction',

        // Buttons
        'button.clear.form': 'Clear Form',
        'button.new.query': 'New Query',
        'button.return.home': 'Return Home',
        'button.view.history': 'View in Full History',

        // Batch Page
        'batch.title': 'Batch Flight Prediction',
        'batch.upload': 'Upload CSV File',
        'batch.process': 'Process File',
        'batch.drag.drop': 'Drag and drop your CSV file here',
        'batch.click.select': 'or click to select',

        // History Page
        'history.title': 'Prediction History',
        'history.filters': 'Filters',
        'history.filters.search': 'Search Filters',
        'history.search': 'Search',
        'history.clear': 'Clear Filters',
        'history.filter.date.start': 'Start Date',
        'history.filter.date.end': 'End Date',
        'history.filter.all': 'All',
        'history.filter.all.airports': 'All',
        'history.filter.on.time': 'On Time',
        'history.filter.delayed': 'Delayed',
        'history.results': 'Results',
        'history.this.page': 'On this page',

        // Loading messages
        'loading.stats': 'Loading statistics...',
        'loading.predictions': 'Loading predictions...',
        'loading.csv': 'Processing CSV file...',

        // Detailed Statistics
        'stats.title': 'Prediction Statistics',
        'stats.subtitle': 'View detailed statistics with charts and analysis of all predictions made',
        'stats.detailed.title': 'Detailed Statistics',
        'stats.by.airline': 'Statistics by Airline',
        'stats.by.airport': 'Statistics by Origin Airport (Top 10)',
        'stats.flights': 'flights',
        'stats.on.time': 'On Time:',
        'stats.ontime': 'On Time',
        'stats.delayed': 'Delayed:',
        'stats.percentage.delayed': '% Delayed',
        'stats.last.update': 'Last update:',
        'stats.no.data': 'No statistics available yet. Make some predictions to see statistics here.',
        'stats.total.label': 'Total Predictions',
        'stats.on.time.label': 'On Time',
        'stats.delayed.label': 'Delayed',
        'stats.percentage.label': '% Delayed',
        'stats.loading': 'Loading statistics...',
        'stats.predictions': 'Predictions',
        'stats.filters.title': 'Filters',
        'stats.filters.startDate': 'Start Date',
        'stats.filters.endDate': 'End Date',
        'stats.filters.airline': 'Airline',
        'stats.filters.airport': 'Airport',
        'stats.filters.all': 'All',
        'stats.filters.apply': 'Apply Filters',
        'stats.filters.clear': 'Clear Filters',
        'stats.chart1.title': 'On Time vs Delayed Distribution',
        'stats.chart2.title': '% Delayed by Airline',
        'stats.chart3.title': 'Top 10 Airports (Predictions)',
        'stats.table.title': 'Individual Predictions',
        'stats.table.date': 'Prediction Date',
        'stats.table.airline': 'Airline',
        'stats.table.origin': 'Origin',
        'stats.table.destination': 'Destination',
        'stats.table.departure': 'Departure Date',
        'stats.table.distance': 'Distance',
        'stats.table.prediction': 'Prediction',
        'stats.table.probability': 'Probability',
        'stats.table.confidence': 'Confidence',
        'stats.table.showing': 'Showing',
        'stats.table.of': 'of',
        'stats.table.predictions': 'predictions',
        'stats.table.page': 'Page',
        'stats.error.loading': 'Error loading predictions',

        // Batch Page
        'batch.file.selected': 'Selected file:',
        'batch.select.csv': 'Please select a valid CSV file (.csv)',
        'batch.file.error': 'Error processing file. Please try selecting it manually.',
        'batch.no.predictions': 'No predictions were processed. Please verify the CSV file format.',
        'batch.processed.success': 'predictions processed successfully',
        'batch.process.completed': 'Process Completed',
        'batch.processing': 'Processing CSV file...',
        'batch.line': 'Line',
        'batch.airline': 'Airline',
        'batch.origin': 'Origin',
        'batch.destination': 'Destination',
        'batch.departure.date': 'Departure Date',
        'batch.distance': 'Distance (km)',
        'batch.prediction': 'Prediction',
        'batch.delay.probability': 'Delay Probability',
        'batch.confidence': 'Confidence',
        'batch.on.time': 'On Time',
        'batch.delayed': 'Delayed',
        'batch.download.template': 'Download CSV Template',
        'batch.id.label': 'Batch ID:',
        'batch.export.excel': 'Export to Excel',
        'batch.statistics.title': 'Batch Statistics',
        'batch.chart.prediction': 'Prediction Distribution',
        'batch.chart.airline': 'Predictions by Airline',
        'batch.chart.probability': 'Delay Probability Distribution',
        'batch.probability.distribution': 'Number of Flights',
        'batch.table.title': 'Individual Predictions',
        'batch.results.title': 'Batch Processing Results',
        'batch.view.stats': 'View Batch Statistics',

        // History Page
        'history.no.predictions': 'No predictions found with the selected filters',
        'history.showing': 'Showing',
        'history.of': 'of',
        'history.predictions': 'predictions',
        'history.page': 'Page',
        'history.filter.date': 'Departure Date',
        'history.filter.airline': 'Airline',
        'history.filter.origin': 'Origin Airport',
        'history.filter.destination': 'Destination Airport',
        'history.filter.all': 'All',

        // Countries
        'country.brazil': 'Brazil',
        'country.usa': 'United States',
        'country.mexico': 'Mexico',
        'country.europe': 'Europe',

        // About Page
        'about.hero.subtitle': 'Enterprise flight punctuality prediction system with Machine Learning and real-time meteorological integration',
        'about.section.product.title': 'About the Product',
        'about.section.product.description1': '<strong>FlightOnTime</strong> is a mission-critical enterprise solution designed to predict commercial flight punctuality. The application combines advanced Machine Learning technologies with real-time meteorological data to provide accurate and reliable predictions.',
        'about.section.product.description2': 'Our system is designed to help airlines, airport operators, and passengers make informed decisions based on advanced predictive analytics. We use a trained Random Forest model that analyzes multiple variables including weather conditions, flight distances, airlines, and specific routes.',
        'about.section.problem.title': 'Problem it Solves',
        'about.section.problem.description': 'Delays in commercial flights generate significant costs for both airlines and passengers. FlightOnTime enables:',
        'about.section.problem.item1': '<strong>Uncertainty reduction:</strong> Passengers know the probability of delay before the flight',
        'about.section.problem.item2': '<strong>Operational optimization:</strong> Airlines can anticipate and mitigate delays',
        'about.section.problem.item3': '<strong>Experience improvement:</strong> Transparent and real-time information',
        'about.section.problem.item4': '<strong>Decision making:</strong> Accurate data for resource planning',
        'about.section.tech.title': 'Technologies Used',
        'about.section.features.title': 'Main Features',
        'about.section.architecture.title': 'System Architecture',
        'about.section.architecture.description': 'FlightOnTime uses a modern and scalable microservices architecture, designed for high availability and enterprise performance.',
        'about.section.architecture.flow.title': 'Data Flow',
        'about.section.company.title': 'Company Information',
        'about.section.company.description': '<strong>FlightOnTime</strong> is developed as a mission-critical system for <strong>Oracle Enterprise Partner</strong>. Our solution is designed following the highest standards of enterprise quality and scalable architecture.',
        'about.section.company.mission.title': 'Mission',
        'about.section.company.mission': 'Provide accurate and reliable flight prediction solutions that help optimize aeronautical operations and improve passenger experience through the use of advanced Machine Learning and artificial intelligence technologies.',
        'about.section.company.vision.title': 'Vision',
        'about.section.company.vision': 'To be the leading platform in flight punctuality prediction, recognized for its accuracy, reliability, and ability to scale to meet the needs of the world\'s leading airlines and airport operators.',
        'about.section.version.title': 'Version and Updates',
        'about.section.version.current': 'Current Version:',
        'about.section.version.release': 'Release Date:',
        'about.section.version.status': 'Status:',
        'about.section.version.status.value': 'Production',
        'about.section.version.features.title': 'Version 1.0.0 Features',
        'about.section.contact.title': 'Contact and Support',
        'about.section.contact.description': 'For technical support, inquiries, or more information about FlightOnTime, you can contact us through:',
        'about.section.contact.docs': 'API Documentation',
        'about.section.contact.health': 'Health Checks',
        'about.section.contact.support': 'Support',
        'about.section.contact.resources.title': 'Additional Resources',
        'about.feature.individual.title': 'Individual Prediction',
        'about.feature.individual.description': 'Make punctuality predictions for individual flights with detailed analysis of probabilities and model confidence.',
        'about.feature.batch.title': 'Batch Processing',
        'about.feature.batch.description': 'Process multiple flights simultaneously by uploading CSV files, ideal for mass analysis and reports.',
        'about.feature.stats.title': 'Statistics and Analysis',
        'about.feature.stats.description': 'View detailed statistics with interactive charts, analysis by airline, airports, and time slots.',
        'about.feature.history.title': 'Prediction History',
        'about.feature.history.description': 'Maintain a complete record of all predictions made with advanced filters and batch ID search.',
        'about.feature.ml.title': 'Machine Learning',
        'about.feature.ml.description': 'Trained Random Forest model that analyzes multiple features including weather, distance, airline, and routes.',
        'about.feature.weather.title': 'Meteorological Data',
        'about.feature.weather.description': 'Real-time integration with OpenWeatherMap API to obtain current weather conditions for airports.',
        'about.section.architecture.diagram': '┌─────────────────────────────────────────────────────────────────┐\n│                         FINAL USER                                │\n└────────────────────────────┬────────────────────────────────────┘\n                             │\n                             ▼\n┌─────────────────────────────────────────────────────────────────┐\n│                    FRONTEND (Nginx)                             │\n│  • HTML5 + CSS3 + JavaScript                                    │\n│  • Oracle Redwood Design                                        │\n│  • Port: 80                                                     │\n└────────────────────────────┬────────────────────────────────────┘\n                             │ HTTP\n                             ▼\n┌─────────────────────────────────────────────────────────────────┐\n│              BACKEND (Java 17 + Spring Boot)                    │\n│  • Enterprise Orchestrator                                      │\n│  • Business Validation                                          │\n│  • PostgreSQL Persistence                                       │\n│  • Port: 8080                                                   │\n└────────────┬───────────────────────────────┬────────────────────┘\n             │ HTTP                          │ HTTP\n             ▼                               ▼\n┌──────────────────────────┐   ┌────────────────────────────────┐\n│  ML SERVICE (FastAPI)    │   │  OpenWeatherMap API            │\n│  • ML Model Load         │   │  • Real-time Weather           │\n│  • Haversine Calculation │   │                                │\n│  • ML Prediction         │   └────────────────────────────────┘\n│  • Port: 8001            │\n└──────────────────────────┘',
        'about.section.architecture.flow.step1': '<strong>User</strong> enters flight data (airline, origin, destination, date)',
        'about.section.architecture.flow.step2': '<strong>Frontend</strong> sends HTTP POST request to Backend',
        'about.section.architecture.flow.step3': '<strong>Backend</strong> validates data and forwards to ML Service',
        'about.section.architecture.flow.step4': '<strong>ML Service</strong> calculates distance, consults weather and executes prediction',
        'about.section.architecture.flow.step5': '<strong>Response</strong> flows back: ML → Backend → Frontend',
        'about.section.architecture.flow.step6': '<strong>User</strong> visualizes prediction, probabilities, weather and metadata',
        'about.section.version.feature1': '✅ Individual flight prediction with ML Random Forest model',
        'about.section.version.feature2': '✅ Batch processing by uploading CSV files',
        'about.section.version.feature3': '✅ Integration with OpenWeatherMap API for meteorological data',
        'about.section.version.feature4': '✅ Automatic distance calculation using Haversine formula',
        'about.section.version.feature5': '✅ Statistics dashboard with interactive charts',
        'about.section.version.feature6': '✅ Complete prediction history with advanced filters',
        'about.section.version.feature7': '✅ Export results to Excel',
        'about.section.version.feature8': '✅ Microservices architecture with Docker',
        'about.section.version.feature9': '✅ Data persistence in PostgreSQL',
        'about.section.version.feature10': '✅ Responsive design in Oracle Redwood style',
        'about.section.contact.view.docs': 'View Documentation',
        'about.section.contact.resource1': '<strong>README:</strong> Complete project documentation',
        'about.section.contact.resource2': '<strong>Architecture:</strong> Technical details of the system architecture',
        'about.section.contact.resource3': '<strong>Test Guide:</strong> Instructions for testing and validation',
        'about.section.contact.resource4': '<strong>Integration Contract:</strong> API specifications'
    }
};

// ============================================================================
// CLASE DE INTERNACIONALIZACIÓN
// ============================================================================
class I18n {
    constructor() {
        // Detectar idioma del navegador o usar español por defecto
        const browserLang = navigator.language.split('-')[0];
        this.currentLanguage = ['es', 'en'].includes(browserLang) ? browserLang : 'es';

        // Cargar desde localStorage si existe
        const savedLang = localStorage.getItem('flightontime_language');
        if (savedLang && ['es', 'en'].includes(savedLang)) {
            this.currentLanguage = savedLang;
        }
    }

    /**
     * Obtiene una traducción por su clave
     * @param {string} key - Clave de traducción (ej: 'form.title')
     * @param {object} params - Parámetros opcionales para interpolación
     * @returns {string} Texto traducido
     */
    t(key, params = {}) {
        let text = translations[this.currentLanguage][key] || key;

        // Interpolación de parámetros
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });

        return text;
    }

    /**
     * Cambia el idioma actual
     * @param {string} lang - Código de idioma ('es' o 'en')
     */
    setLanguage(lang) {
        if (!['es', 'en'].includes(lang)) {
            console.error(`Idioma no soportado: ${lang}`);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('flightontime_language', lang);

        // Actualizar atributo lang del HTML
        document.documentElement.lang = lang;

        // Emitir evento personalizado para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    /**
     * Obtiene el idioma actual
     * @returns {string} Código de idioma actual
     */
    getLanguage() {
        return this.currentLanguage;
    }
}

// ============================================================================
// CLASE DE CONVERSIÓN DE UNIDADES
// ============================================================================
class UnitConverter {
    constructor() {
        // Cargar unidad preferida desde localStorage o usar km (SI) por defecto
        const savedUnit = localStorage.getItem('flightontime_distance_unit');
        this.currentUnit = (savedUnit === 'miles' || savedUnit === 'km') ? savedUnit : 'km';
    }

    /**
     * Convierte kilómetros a la unidad actual
     * @param {number} km - Distancia en kilómetros
     * @param {boolean} includeUnit - Si debe incluir la unidad en el texto
     * @returns {string|number} Distancia convertida
     */
    convertDistance(km, includeUnit = true) {
        if (this.currentUnit === 'miles') {
            const miles = km * 0.621371;
            return includeUnit ? `${miles.toFixed(0)} mi` : miles;
        }
        return includeUnit ? `${km.toFixed(0)} km` : km;
    }

    /**
     * Convierte temperatura
     * @param {number} celsius - Temperatura en Celsius
     * @returns {string} Temperatura formateada
     */
    convertTemperature(celsius) {
        if (this.currentUnit === 'miles') {
            const fahrenheit = (celsius * 9 / 5) + 32;
            return `${fahrenheit.toFixed(1)}°F`;
        }
        return `${celsius.toFixed(1)}°C`;
    }

    /**
     * Convierte velocidad del viento
     * @param {number} ms - Velocidad en m/s
     * @returns {string} Velocidad formateada
     */
    convertWindSpeed(ms) {
        if (this.currentUnit === 'miles') {
            const mph = ms * 2.23694;
            return `${mph.toFixed(1)} mph`;
        }
        return `${ms.toFixed(1)} m/s`;
    }

    /**
     * Convierte visibilidad
     * @param {number} meters - Visibilidad en metros
     * @returns {string} Visibilidad formateada
     */
    convertVisibility(meters) {
        if (this.currentUnit === 'miles') {
            const miles = (meters / 1000) * 0.621371;
            return `${miles.toFixed(1)} mi`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    }

    /**
     * Cambia la unidad de distancia
     * @param {string} unit - 'km' o 'miles'
     */
    setUnit(unit) {
        if (!['km', 'miles'].includes(unit)) {
            console.error(`Unidad no soportada: ${unit}`);
            return;
        }

        this.currentUnit = unit;
        localStorage.setItem('flightontime_distance_unit', unit);

        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('unitChanged', { detail: { unit } }));
    }

    /**
     * Obtiene la unidad actual
     * @returns {string} Unidad actual ('km' o 'miles')
     */
    getUnit() {
        return this.currentUnit;
    }
}

// ============================================================================
// EXPORTAR INSTANCIAS GLOBALES
// ============================================================================
const i18n = new I18n();
const unitConverter = new UnitConverter();

// Hacer disponibles globalmente
window.i18n = i18n;
window.unitConverter = unitConverter;

console.log('✅ i18n.js cargado correctamente');
console.log(`📍 Idioma actual: ${i18n.getLanguage()}`);
console.log(`📏 Unidad de distancia: ${unitConverter.getUnit()}`);
