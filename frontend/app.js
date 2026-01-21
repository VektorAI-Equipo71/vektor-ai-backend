// ============================================================================
// VEKTOR AI - APLICACIÓN JAVASCRIPT
// ============================================================================
// Lógica de frontend para integración con backend y visualización de resultados
// ============================================================================

// ============================================================================
// SOLUCIÓN DEFINITIVA: IIFE que previene ejecución en otras páginas
// ============================================================================
(function () {
  "use strict";

  // Verificar INMEDIATAMENTE si estamos en index.html
  // Si no estamos en index.html, NO ejecutar NADA y retornar temprano
  if (typeof document === "undefined") {
    console.log(
      "⚠️ app.js: document no está disponible. Deteniendo ejecución."
    );
    return; // Salir inmediatamente, no ejecutar NADA
  }

  // Verificar si estamos en index.html ANTES de cualquier otra operación
  const isIndexPage = document.getElementById("predictionForm") !== null;

  if (!isIndexPage) {
    // Si no estamos en index.html, NO ejecutar NADA
    // Esto previene TODOS los errores de DOM en otras páginas
    console.log(
      "⚠️ app.js: No estamos en index.html. Deteniendo ejecución completa."
    );
    return; // Salir inmediatamente, no ejecutar nada más
  }

  // ========================================================================
  // TODO EL CÓDIGO DE app.js AQUÍ DENTRO
  // ========================================================================

  // Configuración de la API
  const API_CONFIG = {
    // En desarrollo local (localhost, 127.0.0.1, con puertos como 5500, 3000, etc.)
    // se conecta directamente al backend en el puerto 8080
    // En producción con Docker, Nginx redirige /api al backend
    baseUrl: (function () {
      const hostname = window.location.hostname;
      const port = window.location.port;

      // Detectar si estamos en desarrollo local
      const isLocalDev =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.endsWith(".local");

      // Si es desarrollo local Y no es el puerto 80 (Docker), usar URL directa del backend
      if (isLocalDev && port !== "80" && port !== "") {
        return "http://localhost:8080/api";
      }

      // En producción (Docker con Nginx), usar ruta relativa
      return "/api";
    })(),
    endpoints: {
      predict: "/predict",
      health: "/health",
    },
  };

  // Variable global para almacenar los datos de aerolíneas y aeropuertos desde el JSON
  let AIRLINE_AIRPORTS_DATA = null;

  // ============================================================================
  // ELEMENTOS DEL DOM
  // ============================================================================
  // SOLUCIÓN DEFINITIVA: Verificar si estamos en index.html antes de inicializar elements
  // Si no estamos en index.html, inicializar elements como objeto vacío para evitar errores

  const elements = {
    form: isIndexPage ? document.getElementById("predictionForm") : null,
    submitBtn: isIndexPage ? document.getElementById("submitBtn") : null,
    btnText: isIndexPage ? document.getElementById("btnText") : null,
    loadingOverlay: isIndexPage
      ? document.getElementById("loadingOverlay")
      : null,
    resultsSection: isIndexPage
      ? document.getElementById("resultsSection")
      : null,
    statusIndicator: isIndexPage
      ? document.getElementById("statusIndicator")
      : null,

    // Inputs
    aerolinea: isIndexPage ? document.getElementById("aerolinea") : null,
    origen: isIndexPage ? document.getElementById("origen") : null,
    destino: isIndexPage ? document.getElementById("destino") : null,
    fechaVuelo: isIndexPage ? document.getElementById("fechaVuelo") : null,
    horaVuelo: isIndexPage ? document.getElementById("horaVuelo") : null,

    // Resultados
    predictionIcon: isIndexPage
      ? document.getElementById("predictionIcon")
      : null,
    predictionStatus: isIndexPage
      ? document.getElementById("predictionStatus")
      : null,
    predictionSubtitle: isIndexPage
      ? document.getElementById("predictionSubtitle")
      : null,

    // Métricas
    metricProbability: isIndexPage
      ? document.getElementById("metricProbability")
      : null,
    metricConfidence: isIndexPage
      ? document.getElementById("metricConfidence")
      : null,
    metricDistance: isIndexPage
      ? document.getElementById("metricDistance")
      : null,
    probabilityBar: isIndexPage
      ? document.getElementById("probabilityBar")
      : null,
    confidenceBar: isIndexPage
      ? document.getElementById("confidenceBar")
      : null,

    // Clima Origen
    weatherCondition: isIndexPage
      ? document.getElementById("weatherCondition")
      : null,
    weatherTemp: isIndexPage ? document.getElementById("weatherTemp") : null,
    weatherHumidity: isIndexPage
      ? document.getElementById("weatherHumidity")
      : null,
    weatherWind: isIndexPage ? document.getElementById("weatherWind") : null,
    weatherVisibility: isIndexPage
      ? document.getElementById("weatherVisibility")
      : null,

    // Clima Destino
    weatherConditionDest: isIndexPage
      ? document.getElementById("weatherConditionDest")
      : null,
    weatherTempDest: isIndexPage
      ? document.getElementById("weatherTempDest")
      : null,
    weatherHumidityDest: isIndexPage
      ? document.getElementById("weatherHumidityDest")
      : null,
    weatherWindDest: isIndexPage
      ? document.getElementById("weatherWindDest")
      : null,
    weatherVisibilityDest: isIndexPage
      ? document.getElementById("weatherVisibilityDest")
      : null,

    // Metadata
    metadataGrid: isIndexPage ? document.getElementById("metadataGrid") : null,
  };

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================
  document.addEventListener("DOMContentLoaded", async () => {
    // Verificar si estamos en index.html antes de ejecutar cualquier código
    // Si no estamos en index.html (batch.html, stats.html, etc.), no ejecutar nada
    const isIndexPage = document.getElementById("predictionForm") !== null;
    if (!isIndexPage) {
      // No ejecutar nada si no estamos en index.html
      return;
    }

    console.log("🚀 VEKTOR AI Frontend iniciado");

    // Cargar datos de aerolíneas y aeropuertos desde el JSON
    try {
      const response = await fetch("aerolinea_origin_dest.json");
      if (!response.ok) {
        throw new Error(
          `Error al cargar aerolinea_origin_dest.json: ${response.status}`
        );
      }
      AIRLINE_AIRPORTS_DATA = await response.json();
      console.log(
        "✅ Datos de aerolíneas y aeropuertos cargados correctamente"
      );
      console.log(
        "📊 Aerolíneas disponibles:",
        Object.keys(AIRLINE_AIRPORTS_DATA)
      );

      // Verificar datos de 9E específicamente
      if (AIRLINE_AIRPORTS_DATA["9E"]) {
        const origines9E = AIRLINE_AIRPORTS_DATA["9E"].ORIGIN || [];
        console.log(
          `📊 9E - Orígenes (${origines9E.length}):`,
          origines9E.slice(0, 20)
        );
        console.log(`📊 9E - ¿Incluye ABQ?:`, origines9E.includes("ABQ"));
      }
    } catch (error) {
      console.error("❌ Error al cargar aerolinea_origin_dest.json:", error);
      alert(
        "Error: No se pudieron cargar los datos de aerolíneas y aeropuertos. Algunas funcionalidades pueden no estar disponibles."
      );
    }

    // Establecer fecha y hora por defecto (mañana a las 10:00) - solo si los elementos existen
    if (elements.fechaVuelo && elements.horaVuelo) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Establecer fecha (formato YYYY-MM-DD)
      elements.fechaVuelo.value = tomorrow.toISOString().slice(0, 10);

      // Establecer hora (formato HH:MM)
      const hours = String(tomorrow.getHours()).padStart(2, "0");
      const minutes = String(tomorrow.getMinutes()).padStart(2, "0");
      elements.horaVuelo.value = `${hours}:${minutes}`;
    }

    // Event Listeners - solo si los elementos existen (index.html)
    if (elements.form) {
      elements.form.addEventListener("submit", handleSubmit);
    }

    // Poblar opciones de aerolíneas dinámicamente - solo si el elemento existe (index.html)
    if (elements.aerolinea) {
      populateAirlineOptions();

      // Airline Change Listener
      elements.aerolinea.addEventListener("change", handleAirlineChange);
    }

    // SOLUCIÓN DEFINITIVA: Verificar nuevamente que estamos en index.html
    // antes de ejecutar cualquier función de inicialización
    const verifyIndexPage = document.getElementById("predictionForm") !== null;
    if (!verifyIndexPage) {
      console.log("⚠️ app.js: No estamos en index.html, deteniendo ejecución");
      return;
    }

    // Inicializar i18n primero
    initializeI18n();

    // Inicializar botones de idioma en el header
    initializeLanguageButtons();

    // Inicializar panel de configuración
    initializeSettingsPanel();

    // Verificar estado del backend (solo si el elemento existe)
    // checkBackendHealth() verifica internamente si el elemento existe
    // Verificar ANTES de llamar si estamos en index.html
    // Usar setTimeout para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      if (
        document.getElementById("predictionIcon") &&
        elements &&
        elements.statusIndicator &&
        elements.statusIndicator instanceof HTMLElement &&
        document.body.contains(elements.statusIndicator)
      ) {
        checkBackendHealth();
      }
    }, 100);

    // Cargar estadísticas del dashboard (solo si estamos en index.html)
    // Verificar si los elementos del dashboard existen antes de cargar
    const totalEl = document.getElementById("totalPredictions");
    if (totalEl) {
      loadDashboardStats();
      // Actualizar estadísticas cada 5 minutos
      setInterval(loadDashboardStats, 5 * 60 * 1000);
    }
  });

  // ============================================================================
  // VERIFICACIÓN DE SALUD DEL BACKEND
  // ============================================================================
  async function checkBackendHealth() {
    // SOLUCIÓN DEFINITIVA: Retornar inmediatamente si no estamos en index.html
    // Verificar ANTES de cualquier otra operación

    // Verificar que estamos en index.html
    if (!document.getElementById("predictionIcon")) {
      return;
    }

    // Verificar que elements esté definido
    if (typeof elements === "undefined" || elements === null) {
      return;
    }

    // Verificar que statusIndicator exista y sea válido
    if (!elements.statusIndicator) {
      return;
    }

    // Verificar que statusIndicator sea un HTMLElement válido
    if (!(elements.statusIndicator instanceof HTMLElement)) {
      return;
    }

    // Verificar que statusIndicator tenga el método querySelector
    if (typeof elements.statusIndicator.querySelector !== "function") {
      return;
    }

    // Verificar que el elemento esté en el DOM
    if (!document.body.contains(elements.statusIndicator)) {
      return;
    }

    // Solo si todas las verificaciones pasan, proceder con el fetch
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`
      );
      if (response.ok) {
        console.log("✅ Backend conectado");
        // Solo actualizar el indicador si todas las verificaciones pasan
        updateStatusIndicator(true);
      } else {
        console.warn("⚠️ Backend responde pero con errores");
        updateStatusIndicator(false);
      }
    } catch (error) {
      // Solo mostrar error si estamos en index.html y el elemento existe
      // No mostrar error en otras páginas
      if (
        document.getElementById("predictionIcon") &&
        elements &&
        elements.statusIndicator &&
        elements.statusIndicator instanceof HTMLElement
      ) {
        console.error("❌ Backend no disponible:", error);
        updateStatusIndicator(false);
      }
    }
  }

  function updateStatusIndicator(isHealthy) {
    // SOLUCIÓN DEFINITIVA: Retornar inmediatamente si no estamos en index.html
    // Verificar ANTES de cualquier otra operación

    // Verificar que estamos en index.html
    if (!document.getElementById("predictionIcon")) {
      return;
    }

    // Verificar que elements esté definido
    if (typeof elements === "undefined" || elements === null) {
      return;
    }

    // Verificar que statusIndicator exista
    if (!elements.statusIndicator) {
      return;
    }

    // Verificar que statusIndicator sea un HTMLElement válido
    if (!(elements.statusIndicator instanceof HTMLElement)) {
      return;
    }

    // Verificar que statusIndicator tenga el método querySelector
    if (typeof elements.statusIndicator.querySelector !== "function") {
      return;
    }

    // Verificar que el elemento esté en el DOM
    if (!document.body.contains(elements.statusIndicator)) {
      return;
    }

    // Envolver TODO en try-catch para capturar cualquier error inesperado
    try {
      const statusIndicator = elements.statusIndicator;

      // Verificar nuevamente que statusIndicator no sea null
      if (!statusIndicator || !(statusIndicator instanceof HTMLElement)) {
        return;
      }

      // Obtener los elementos hijos de forma segura
      let statusDot = null;
      let statusText = null;

      try {
        statusDot = statusIndicator.querySelector(".status-dot");
      } catch (e) {
        // Si querySelector falla, retornar silenciosamente
        return;
      }

      try {
        statusText = statusIndicator.querySelector(".status-text");
      } catch (e) {
        // Si querySelector falla, retornar silenciosamente
        return;
      }

      // Verificar que los elementos hijos existan y sean válidos
      if (!statusDot || !statusText) {
        return;
      }

      if (
        !(statusDot instanceof HTMLElement) ||
        !(statusText instanceof HTMLElement)
      ) {
        return;
      }

      // Verificar que los elementos estén en el DOM
      if (
        !document.body.contains(statusDot) ||
        !document.body.contains(statusText)
      ) {
        return;
      }

      // Actualizar estilos de forma segura
      if (isHealthy) {
        if (statusDot && statusDot.style) {
          statusDot.style.background = "hsl(142, 71%, 45%)";
        }
        if (statusText && statusText.textContent !== undefined) {
          if (window.i18n && typeof window.i18n.t === "function") {
            statusText.textContent = window.i18n.t("header.status.operational");
          } else {
            statusText.textContent = "Operacional";
          }
        }
      } else {
        if (statusDot && statusDot.style) {
          statusDot.style.background = "hsl(45, 100%, 51%)";
        }
        if (statusText && statusText.textContent !== undefined) {
          if (window.i18n && typeof window.i18n.t === "function") {
            statusText.textContent = window.i18n.t("header.status.limited");
          } else {
            statusText.textContent = "Limitado";
          }
        }
      }
    } catch (error) {
      // Capturar CUALQUIER error y retornar silenciosamente
      // NO mostrar el error en consola para evitar ruido
      return;
    }
  }

  // ============================================================================
  // MANEJO DE ENVÍO DE FORMULARIO
  // ============================================================================
  async function handleSubmit(event) {
    event.preventDefault();

    // Validar que origen y destino sean diferentes
    if (elements.origen.value === elements.destino.value) {
      alert(window.i18n.t("error.same.airport"));
      return;
    }

    // Validar que la aerolínea tenga datos cargados
    const airlineId = elements.aerolinea.value;
    if (!AIRLINE_AIRPORTS_DATA || !AIRLINE_AIRPORTS_DATA[airlineId]) {
      alert(
        "Error: No se pudieron validar los aeropuertos para esta aerolínea. Por favor, recargue la página."
      );
      return;
    }

    const airlineAirports = AIRLINE_AIRPORTS_DATA[airlineId];
    const origenesValidos = airlineAirports.ORIGIN || [];
    const destinosValidos = airlineAirports.DEST || [];

    // Validar que el aeropuerto de origen esté en la lista permitida
    const origenValue = elements.origen.value.toUpperCase().trim();
    if (!origenesValidos.includes(origenValue)) {
      alert(
        `Error: El aeropuerto de origen "${origenValue}" no opera con la aerolínea ${airlineId}. Por favor, seleccione un aeropuerto válido de la lista.`
      );
      elements.origen.focus();
      return;
    }

    // Validar que el aeropuerto de destino esté en la lista permitida
    const destinoValue = elements.destino.value.toUpperCase().trim();
    if (!destinosValidos.includes(destinoValue)) {
      alert(
        `Error: El aeropuerto de destino "${destinoValue}" no opera con la aerolínea ${airlineId}. Por favor, seleccione un aeropuerto válido de la lista.`
      );
      elements.destino.focus();
      return;
    }

    // Combinar fecha y hora en formato ISO-8601
    let fechaPartidaISO = null;
    if (elements.fechaVuelo.value && elements.horaVuelo.value) {
      const fechaCompleta = `${elements.fechaVuelo.value}T${elements.horaVuelo.value}`;
      fechaPartidaISO = new Date(fechaCompleta).toISOString();
    }

    // Usar valores normalizados (uppercase) para origen y destino
    const requestData = {
      aerolinea: elements.aerolinea.value,
      origen: origenValue,
      destino: destinoValue,
      fecha_partida: fechaPartidaISO,
    };

    console.log("📤 Enviando solicitud:", requestData);
    await sendPredictionRequest(requestData);
  }

  // ============================================================================
  // ENVÍO DE SOLICITUD AL BACKEND
  // ============================================================================
  async function sendPredictionRequest(data) {
    // Mostrar loading
    showLoading(true);
    disableButtons(true);

    const startTime = performance.now();

    try {
      const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predict}`;

      console.log("🔄 Enviando solicitud a:", url);
      console.log("📦 Datos:", data);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("📡 Respuesta HTTP:", response.status, response.statusText);

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const endTime = performance.now();
      const clientTime = Math.round(endTime - startTime);

      console.log("📥 Respuesta recibida:", result);
      console.log(`⏱️ Tiempo Cliente: ${clientTime}ms`);

      // Verificar si hay error de validación
      if (
        result.prediccion === "Error" &&
        result.metadata &&
        result.metadata.error
      ) {
        throw new Error(result.metadata.error);
      }

      // Mostrar resultados
      displayResults(result);
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);

      let userMessage = "Error al obtener predicción:\n\n";

      // Detectar mensaje específico de validación
      if (error.message === "No se hallan esos datos en la base de datos.") {
        userMessage = "⚠️ No se hallan esos datos en la base de datos.\n\n";
        userMessage += "Por favor, verifique que:\n";
        userMessage += "• La aerolínea seleccionada sea válida\n";
        userMessage +=
          "• Los aeropuertos de origen y destino existan en el sistema\n\n";
        userMessage +=
          "Aerolíneas válidas: LATAM, GOL, AZUL, AVIANCA, COPA, AMERICAN, UNITED, DELTA";
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        userMessage += "🔌 No se puede conectar con el servidor.\n";
        userMessage += `Verifique que el backend esté ejecutándose en ${API_CONFIG.baseUrl}`;
      } else if (error.message.includes("Aeropuerto")) {
        userMessage += `✈️ ${error.message}\n\n`;
        userMessage += "Por favor, seleccione aeropuertos válidos de la lista.";
      } else if (error.message.includes("timeout")) {
        userMessage += "⏱️ La solicitud tardó demasiado tiempo.\n";
        userMessage +=
          "El servidor puede estar sobrecargado. Intente nuevamente.";
      } else {
        userMessage += `⚠️ ${error.message}`;
      }

      alert(userMessage);
    } finally {
      showLoading(false);
      disableButtons(false);
    }
  }

  // ============================================================================
  // FUNCIONES AUXILIARES DE TRADUCCIÓN
  // ============================================================================
  
  /**
   * Traduce una condición climática al idioma actual
   * @param {string} condition - Condición climática en español
   * @returns {string} - Condición traducida o la original si no hay traducción
   */
  function translateWeatherCondition(condition) {
    if (!condition || typeof condition !== 'string') {
      return condition || '';
    }
    
    const currentLang = window.i18n ? window.i18n.getLanguage() : 'es';
    
    // Si el idioma actual es español, devolver sin cambios
    if (currentLang === 'es') {
      return condition;
    }
    
    // Mapeo de condiciones climáticas comunes en español a inglés
    const weatherConditionsMap = {
      'cielo claro': 'clear sky',
      'cielo despejado': 'clear sky',
      'despejado': 'clear',
      'nubes': 'clouds',
      'nublado': 'cloudy',
      'parcialmente nublado': 'partly cloudy',
      'mayormente nublado': 'mostly cloudy',
      'lluvia': 'rain',
      'llovizna': 'drizzle',
      'lluvia ligera': 'light rain',
      'lluvia moderada': 'moderate rain',
      'lluvia intensa': 'heavy rain',
      'tormenta': 'thunderstorm',
      'tormenta eléctrica': 'thunderstorm',
      'nieve': 'snow',
      'nieve ligera': 'light snow',
      'nieve intensa': 'heavy snow',
      'niebla': 'fog',
      'neblina': 'mist',
      'bruma': 'haze',
      'polvo': 'dust',
      'arena': 'sand',
      'ceniza': 'ash',
      'chubasco': 'squall',
      'tornado': 'tornado',
      'sobrecargado': 'overcast'
    };
    
    // Normalizar la condición (minúsculas y trim)
    const normalizedCondition = condition.toLowerCase().trim();
    
    // Buscar traducción exacta
    if (weatherConditionsMap[normalizedCondition]) {
      return weatherConditionsMap[normalizedCondition];
    }
    
    // Buscar traducción parcial (por si contiene la palabra clave)
    for (const [spanish, english] of Object.entries(weatherConditionsMap)) {
      if (normalizedCondition.includes(spanish) || spanish.includes(normalizedCondition)) {
        return english;
      }
    }
    
    // Si no se encuentra traducción, devolver la original
    return condition;
  }

  // ============================================================================
  // VISUALIZACIÓN DE RESULTADOS
  // ============================================================================
  function displayResults(data) {
    // PROTECCIÓN: Solo ejecutar si estamos en index.html
    // Verificar que los elementos críticos existan antes de continuar
    if (!elements || !elements.predictionIcon || !elements.predictionStatus) {
      // No estamos en index.html, retornar silenciosamente
      console.warn(
        "⚠️ displayResults: Elementos no encontrados, probablemente no estamos en index.html"
      );
      return;
    }

    // Verificar que los elementos sean válidos y no sean null
    if (
      !elements.predictionIcon ||
      !elements.predictionStatus ||
      !(elements.predictionIcon instanceof HTMLElement) ||
      !(elements.predictionStatus instanceof HTMLElement)
    ) {
      console.warn("⚠️ displayResults: Elementos inválidos o null");
      return;
    }

    // Verificación adicional: asegurar que estamos en index.html
    if (!document.getElementById("predictionIcon")) {
      console.warn("⚠️ displayResults: No estamos en index.html, bloqueado");
      return;
    }

    // Guardar datos para re-renderizar cuando cambien las unidades
    window.lastPredictionData = data;

    // Determinar si es puntual o retrasado
    // API ahora devuelve: 0 = Puntual, 1 = Retrasado (según CONTRATO_INTEGRACION.md)
    const isPuntual = data.prediccion === 0;
    const predictionText = isPuntual
      ? window.i18n.t("results.ontime")
      : window.i18n.t("results.delayed");

    // Actualizar icono y estado (con verificación adicional)
    try {
      if (
        elements.predictionIcon &&
        elements.predictionIcon.innerHTML !== undefined
      ) {
        elements.predictionIcon.innerHTML = isPuntual ? "✈️" : "⏰";
        elements.predictionIcon.className = `prediction-icon ${
          isPuntual ? "success" : "danger"
        }`;
      }

      if (
        elements.predictionStatus &&
        elements.predictionStatus.textContent !== undefined
      ) {
        elements.predictionStatus.textContent = predictionText;
        elements.predictionStatus.className = `prediction-status ${
          isPuntual ? "success" : "danger"
        }`;
      }

      if (
        elements.predictionSubtitle &&
        elements.predictionSubtitle.textContent !== undefined
      ) {
        elements.predictionSubtitle.textContent = isPuntual
          ? window.i18n.t("results.ontime.subtitle")
          : window.i18n.t("results.delayed.subtitle");
      }
    } catch (e) {
      // Si hay algún error, retornar silenciosamente
      return;
    }

    // Actualizar métricas (usando nombres del contrato) - CON VERIFICACIÓN
    try {
      const probabilityPercent = (data.probabilidad_retraso * 100).toFixed(1);
      const confidencePercent = (data.confianza * 100).toFixed(1);

      if (
        elements.metricProbability &&
        elements.metricProbability.textContent !== undefined
      ) {
        elements.metricProbability.textContent = `${probabilityPercent}%`;
      }
      if (
        elements.metricConfidence &&
        elements.metricConfidence.textContent !== undefined
      ) {
        elements.metricConfidence.textContent = `${confidencePercent}%`;
      }

      // Usar convertidor de unidades para la distancia
      if (
        elements.metricDistance &&
        elements.metricDistance.textContent !== undefined &&
        window.unitConverter
      ) {
        elements.metricDistance.textContent =
          window.unitConverter.convertDistance(data.distancia_km, true);
      }

      // Animar barras
      if (elements.probabilityBar && elements.confidenceBar) {
        setTimeout(() => {
          if (elements.probabilityBar && elements.probabilityBar.style) {
            elements.probabilityBar.style.width = `${probabilityPercent}%`;
          }
          if (elements.confidenceBar && elements.confidenceBar.style) {
            elements.confidenceBar.style.width = `${confidencePercent}%`;
          }
        }, 100);
      }

      // Actualizar clima Origen
      if (data.clima_origen && elements.weatherCondition) {
        const clima = data.clima_origen;
        if (
          elements.weatherCondition &&
          elements.weatherCondition.textContent !== undefined
        ) {
          const conditionText = clima.descripcion || clima.condicion || '';
          elements.weatherCondition.textContent = translateWeatherCondition(conditionText);
        }
        if (
          elements.weatherTemp &&
          elements.weatherTemp.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherTemp.textContent =
            window.unitConverter.convertTemperature(clima.temperatura);
        }
        if (
          elements.weatherHumidity &&
          elements.weatherHumidity.textContent !== undefined
        ) {
          elements.weatherHumidity.textContent = `${clima.humedad}%`;
        }
        if (
          elements.weatherWind &&
          elements.weatherWind.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherWind.textContent =
            window.unitConverter.convertWindSpeed(clima.viento_velocidad);
        }
        if (
          elements.weatherVisibility &&
          elements.weatherVisibility.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherVisibility.textContent =
            window.unitConverter.convertVisibility(clima.visibilidad);
        }
      }

      // Actualizar clima Destino
      if (data.clima_destino && elements.weatherConditionDest) {
        const clima = data.clima_destino;
        if (
          elements.weatherConditionDest &&
          elements.weatherConditionDest.textContent !== undefined
        ) {
          const conditionText = clima.descripcion || clima.condicion || '';
          elements.weatherConditionDest.textContent = translateWeatherCondition(conditionText);
        }
        if (
          elements.weatherTempDest &&
          elements.weatherTempDest.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherTempDest.textContent =
            window.unitConverter.convertTemperature(clima.temperatura);
        }
        if (
          elements.weatherHumidityDest &&
          elements.weatherHumidityDest.textContent !== undefined
        ) {
          elements.weatherHumidityDest.textContent = `${clima.humedad}%`;
        }
        if (
          elements.weatherWindDest &&
          elements.weatherWindDest.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherWindDest.textContent =
            window.unitConverter.convertWindSpeed(clima.viento_velocidad);
        }
        if (
          elements.weatherVisibilityDest &&
          elements.weatherVisibilityDest.textContent !== undefined &&
          window.unitConverter
        ) {
          elements.weatherVisibilityDest.textContent =
            window.unitConverter.convertVisibility(clima.visibilidad);
        }
      }
    } catch (e) {
      // Si hay algún error, retornar silenciosamente
      return;
    }

    // Actualizar metadata - CON VERIFICACIÓN
    try {
      if (data.metadata && elements.metadataGrid) {
        displayMetadata(data.metadata);
      }

      // Mostrar sección de resultados con animación - CON VERIFICACIÓN
      if (elements.resultsSection && elements.resultsSection.style) {
        elements.resultsSection.style.display = "block";
        elements.resultsSection.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }

      // Mostrar botón de limpiar formulario si está oculto
      const clearBtnTop = document.getElementById("clearFormBtnTop");
      if (clearBtnTop && clearBtnTop.style) {
        clearBtnTop.style.display = "flex";
      }
    } catch (e) {
      // Si hay algún error, retornar silenciosamente
      return;
    }
  }

  // ============================================================================
  // VISUALIZACIÓN DE METADATA
  // ============================================================================
  function displayMetadata(metadata) {
    // PROTECCIÓN: Solo ejecutar si estamos en index.html
    if (!elements || !elements.metadataGrid) {
      return;
    }

    try {
      if (
        elements.metadataGrid &&
        elements.metadataGrid.innerHTML !== undefined
      ) {
        elements.metadataGrid.innerHTML = "";
      } else {
        return;
      }
    } catch (e) {
      return;
    }

    // 1. NOTAS IMPORTANTES (Full Width)
    if (metadata.nota) {
      const noteLabel = window.i18n ? window.i18n.t("metadata.note") : "Nota del Sistema";
      addMetadataItem(noteLabel, metadata.nota, "warning", true);
    }

    // 2. RESTO DE METADATA (Grid normal)
    // Construir mapa de metadata (priorizar nombres completos sobre códigos)
    const metadataMap = {};

    // Aerolínea: mostrar nombre completo si está disponible, sino código
    const airlineLabel = window.i18n ? window.i18n.t("metadata.airline") : "Aerolínea";
    if (metadata.aerolinea_nombre) {
      metadataMap["aerolinea_nombre"] = airlineLabel;
    } else if (metadata.aerolinea) {
      metadataMap["aerolinea"] = airlineLabel;
    }

    // Agregar otros campos usando traducciones
    metadataMap["ruta"] = window.i18n ? window.i18n.t("metadata.route") : "Ruta de Vuelo";
    metadataMap["distancia_km"] = window.i18n ? window.i18n.t("metadata.distance") : "Distancia";
    metadataMap["origen_nombre"] = window.i18n ? window.i18n.t("metadata.origin") : "Origen";
    metadataMap["destino_nombre"] = window.i18n ? window.i18n.t("metadata.destination") : "Destino";
    metadataMap["fecha_partida"] = window.i18n ? window.i18n.t("metadata.departure") : "Salida Programada";
    metadataMap["timestamp_prediccion"] = window.i18n ? window.i18n.t("metadata.calculated") : "Cálculo Realizado";

    for (const [key, label] of Object.entries(metadataMap)) {
      // Para "Cálculo Realizado", siempre mostrar con la fecha actual del cliente
      if (key === "timestamp_prediccion") {
        const date = new Date(); // Fecha actual del cliente
        // Usar el idioma actual para formatear la fecha
        const currentLang = window.i18n ? window.i18n.getLanguage() : "es";
        const locale = currentLang === "en" ? "en-US" : "es-ES";
        const value = date.toLocaleString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        addMetadataItem(label, value, "default", false);
        continue; // Continuar con el siguiente item
      }

      // Para los demás campos, solo mostrar si existen en el metadata
      if (metadata[key]) {
        let value = metadata[key];

        // Formatear origen y destino con información completa si está disponible
        if (key === "origen_nombre" || key === "destino_nombre") {
          // Si tenemos nombre del aeropuerto, construir display completo
          if (metadata[key]) {
            let displayValue = metadata[key];
            const ciudadKey =
              key === "origen_nombre" ? "origen_ciudad" : "destino_ciudad";
            if (metadata[ciudadKey]) {
              displayValue = `${metadata[key]} (${metadata[ciudadKey]})`;
            }
            // También buscar el código IATA (puede estar en 'ruta' o calcular desde el nombre)
            const codigoIATA = extractIATACode(metadata, key);
            if (codigoIATA) {
              value = `${codigoIATA} - ${displayValue}`;
            } else {
              value = displayValue;
            }
          }
        }

        // Formatear timestamp y fechas
        if (key.includes("timestamp") || key.includes("fecha")) {
          try {
            // Para otras fechas/timestamps, usar el valor del metadata
            // Usar el idioma actual para formatear la fecha
            const currentLang = window.i18n ? window.i18n.getLanguage() : "es";
            const locale = currentLang === "en" ? "en-US" : "es-ES";
            const date = new Date(value);
            value = date.toLocaleString(locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch (e) {
            /* ignore */
          }
        }

        // Append unit to distance if missing (though usually comes as number in displayResults, here it's string in metadata?)
        // Actually metadata might not have units, but let's just display as is.

        addMetadataItem(label, value, "default", false);
      }
    }
  }

  function addMetadataItem(label, value, type = "default", fullWidth = false) {
    const item = document.createElement("div");

    // Construir clases
    let className = "metadata-item";
    if (fullWidth) className += " full-width";
    if (type !== "default") className += ` ${type}`;

    item.className = className;

    // Icono opcional según tipo (solo para full width para darle más estilo)
    let icon = "";
    if (fullWidth) {
      if (type === "warning") icon = "⚠️ ";
      if (type === "success") icon = "✅ ";
      if (type === "info") icon = "ℹ️ ";
    }

    item.innerHTML = `
        <span class="metadata-label">${label}</span>
        <span class="metadata-value">${icon}${value}</span>
    `;
    elements.metadataGrid.appendChild(item);
  }

  // ============================================================================
  // UTILIDADES UI
  // ============================================================================
  function showLoading(show) {
    if (show) {
      elements.loadingOverlay.classList.add("active");
    } else {
      elements.loadingOverlay.classList.remove("active");
    }
  }

  function disableButtons(disable) {
    elements.submitBtn.disabled = disable;

    if (disable) {
      elements.btnText.textContent = window.i18n.t("form.processing");
    } else {
      elements.btnText.textContent = window.i18n.t("form.submit");
    }
  }

  // ============================================================================
  // FUNCIÓN PARA LIMPIAR EL FORMULARIO
  // ============================================================================
  /**
   * Limpia todos los campos del formulario y oculta los resultados
   * Permite realizar una nueva consulta desde cero
   */
  function clearForm() {
    console.log("🧹 Limpiando formulario...");

    // 1. Resetear todos los campos del formulario
    elements.aerolinea.value = "";
    elements.origen.value = "";
    elements.destino.value = "";

    // 2. Restablecer fecha y hora por defecto (mañana a las 10:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // Establecer fecha (formato YYYY-MM-DD)
    elements.fechaVuelo.value = tomorrow.toISOString().slice(0, 10);

    // Establecer hora (formato HH:MM)
    const hours = String(tomorrow.getHours()).padStart(2, "0");
    const minutes = String(tomorrow.getMinutes()).padStart(2, "0");
    elements.horaVuelo.value = `${hours}:${minutes}`;

    // 3. Ocultar sección de resultados
    elements.resultsSection.style.display = "none";

    // 4. Limpiar estado guardado de última predicción
    if (window.lastPredictionData) {
      delete window.lastPredictionData;
    }

    // 5. Resetear barras de progreso
    elements.probabilityBar.style.width = "0%";
    elements.confidenceBar.style.width = "0%";

    // 6. Restablecer valores de métricas
    elements.metricProbability.textContent = "0%";
    elements.metricConfidence.textContent = "0%";
    elements.metricDistance.textContent = "0 km";

    // 7. Limpiar datos de clima
    elements.weatherCondition.textContent = "";
    elements.weatherTemp.textContent = "";
    elements.weatherHumidity.textContent = "";
    elements.weatherWind.textContent = "";
    elements.weatherVisibility.textContent = "";

    elements.weatherConditionDest.textContent = "";
    elements.weatherTempDest.textContent = "";
    elements.weatherHumidityDest.textContent = "";
    elements.weatherWindDest.textContent = "";
    elements.weatherVisibilityDest.textContent = "";

    // 8. Limpiar metadata
    elements.metadataGrid.innerHTML = "";

    // 9. Restablecer estado del formulario (enabled/disabled de campos)
    // Los campos origen y destino se habilitan cuando se selecciona una aerolínea
    if (elements.origen) {
      elements.origen.disabled = true;
    }
    if (elements.destino) {
      elements.destino.disabled = true;
    }

    // 10. Ocultar overlay de carga si está visible
    showLoading(false);
    disableButtons(false);

    // 11. Ocultar botón de limpiar en el formulario principal
    const clearBtnTop = document.getElementById("clearFormBtnTop");
    if (clearBtnTop) {
      clearBtnTop.style.display = "none";
    }

    // 12. Hacer scroll suave al formulario
    const formSection = document.getElementById("prediccion-individual");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    console.log("✅ Formulario limpiado exitosamente");
  }

  // Hacer la función disponible globalmente
  window.clearForm = clearForm;

  // ============================================================================
  // MANEJO DE ERRORES GLOBAL
  // ============================================================================
  window.addEventListener("error", (event) => {
    console.error("❌ Error global:", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    // Solo mostrar errores de promesas rechazadas si estamos en index.html
    // y el error no está relacionado con elementos DOM que no existen
    const errorMessage = event.reason?.message || String(event.reason || "");
    const isDomError =
      errorMessage.includes("querySelector") ||
      errorMessage.includes("null") ||
      errorMessage.includes("Cannot read properties");

    // Si es un error de DOM y no estamos en index.html, ignorar silenciosamente
    if (isDomError && !document.getElementById("predictionIcon")) {
      event.preventDefault(); // Prevenir que el error se muestre en consola
      return;
    }

    // Para otros errores o si estamos en index.html, mostrar el error
    if (document.getElementById("predictionIcon") || !isDomError) {
      console.error("❌ Promise rechazada:", event.reason);
    } else {
      event.preventDefault(); // Prevenir que el error se muestre en consola
    }
  });

  // ============================================================================
  // INTERNACIONALIZACIÓN (i18n)
  // ============================================================================

  /**
   * Inicializa el sistema de internacionalización
   */
  function initializeI18n() {
    // Verificar que estamos en index.html antes de ejecutar
    if (
      typeof document === "undefined" ||
      document.getElementById("predictionForm") === null
    ) {
      return;
    }
    // Aplicar traducciones iniciales
    updateAllTranslations();

    // Escuchar cambios de idioma
    window.addEventListener("languageChanged", (event) => {
      console.log(
        "🌐 Idioma cambiado a:",
        event.detail?.language || window.i18n.getLanguage()
      );
      updateAllTranslations();

      // Actualizar botones del header
      const currentLang = window.i18n.getLanguage();
      const langEsBtn = document.getElementById("langEsBtn");
      const langEnBtn = document.getElementById("langEnBtn");
      if (langEsBtn && langEnBtn) {
        if (currentLang === "es") {
          langEsBtn.classList.add("active");
          langEnBtn.classList.remove("active");
        } else {
          langEnBtn.classList.add("active");
          langEsBtn.classList.remove("active");
        }
      }

      // Re-renderizar resultados si están visibles
      if (
        elements.resultsSection &&
        elements.resultsSection.style.display !== "none" &&
        window.lastPredictionData
      ) {
        displayResults(window.lastPredictionData);
      }

      // Actualizar el panel de configuración si está abierto
      const settingsPanel = document.getElementById("settingsPanel");
      if (settingsPanel && settingsPanel.classList.contains("active")) {
        updateAllTranslations();
      }
    });

    // Escuchar cambios de idioma
    document.addEventListener("languageChanged", () => {
      updateAllTranslations();
      // Re-renderizar estadísticas detalladas si están visibles
      if (window.lastStatsData) {
        updateDetailedStats(window.lastStatsData);
      }
    });

    // Escuchar cambios de unidad
    window.addEventListener("unitChanged", () => {
      // Re-renderizar resultados si están visibles
      if (
        elements.resultsSection.style.display !== "none" &&
        window.lastPredictionData
      ) {
        displayResults(window.lastPredictionData);
      }
    });

    console.log("✅ Sistema i18n inicializado");
  }

  /**
   * Actualiza todas las traducciones en la página
   */
  function updateAllTranslations() {
    // Verificar que estamos en index.html antes de ejecutar
    // Esta función puede ser llamada desde otros lugares, así que verificamos aquí también
    if (typeof document === "undefined") {
      return;
    }
    const elementsWithI18n = document.querySelectorAll("[data-i18n]");
    const elementsWithPlaceholder = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );

    elementsWithI18n.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (!key) return;

      const translation = window.i18n.t(key);

      // Actualizar el contenido del elemento
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        // Para inputs, solo actualizar placeholder si tiene data-i18n-placeholder
        if (!element.hasAttribute("data-i18n-placeholder")) {
          // Si no tiene placeholder específico, no actualizar
        }
      } else if (
        element.tagName === "OPTION" ||
        element.tagName === "OPTGROUP"
      ) {
        element.textContent = translation;
      } else {
        // Para otros elementos, verificar si tiene hijos con texto
        const textChildren = Array.from(element.children).filter(
          (child) =>
            child.nodeType === Node.ELEMENT_NODE &&
            (child.tagName === "SPAN" ||
              child.tagName === "P" ||
              child.tagName === "H1" ||
              child.tagName === "H2" ||
              child.tagName === "H3")
        );

        if (textChildren.length === 0 && element.children.length === 0) {
          // Sin hijos, actualizar directamente
          element.textContent = translation;
        } else if (element.children.length > 0) {
          // Buscar el primer nodo de texto directo
          const firstTextNode = Array.from(element.childNodes).find(
            (node) =>
              node.nodeType === Node.TEXT_NODE && node.textContent.trim()
          );
          if (firstTextNode) {
            firstTextNode.textContent = translation;
          } else if (
            element.children.length === 1 &&
            element.children[0].tagName === "SPAN"
          ) {
            // Si solo tiene un hijo span, actualizar ese span
            element.children[0].textContent = translation;
          } else {
            // Si no hay nodo de texto directo y tiene hijos, crear un nodo de texto
            const textNode = document.createTextNode(translation);
            if (element.firstChild) {
              element.insertBefore(textNode, element.firstChild);
            } else {
              element.appendChild(textNode);
            }
          }
        }
      }
    });

    // Actualizar placeholders
    elementsWithPlaceholder.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (key) {
        const translation = window.i18n.t(key);
        element.placeholder = translation;
      }
    });

    console.log("✅ Traducciones actualizadas");
  }

  // ============================================================================
  // BOTONES DE IDIOMA EN EL HEADER
  // ============================================================================

  /**
   * Inicializa los botones de idioma en el header
   */
  function initializeLanguageButtons() {
    // Verificar que estamos en index.html antes de ejecutar
    if (
      typeof document === "undefined" ||
      document.getElementById("predictionForm") === null
    ) {
      return;
    }
    const langEsBtn = document.getElementById("langEsBtn");
    const langEnBtn = document.getElementById("langEnBtn");

    if (!langEsBtn || !langEnBtn) {
      console.warn("⚠️ Botones de idioma no encontrados en el header");
      return;
    }

    // Cambiar idioma a Español
    langEsBtn.addEventListener("click", () => {
      console.log("🇪🇸 Cambiando idioma a Español");
      window.i18n.setLanguage("es");
      langEsBtn.classList.add("active");
      langEnBtn.classList.remove("active");
    });

    // Cambiar idioma a Inglés
    langEnBtn.addEventListener("click", () => {
      console.log("🇺🇸 Changing language to English");
      window.i18n.setLanguage("en");
      langEnBtn.classList.add("active");
      langEsBtn.classList.remove("active");
    });

    // Establecer estado inicial
    const currentLang = window.i18n.getLanguage();
    if (currentLang === "es") {
      langEsBtn.classList.add("active");
      langEnBtn.classList.remove("active");
    } else {
      langEnBtn.classList.add("active");
      langEsBtn.classList.remove("active");
    }

    console.log("✅ Botones de idioma inicializados en el header");
  }

  // ============================================================================
  // PANEL DE CONFIGURACIÓN
  // ============================================================================

  /**
   * Inicializa el panel de configuración
   */
  function initializeSettingsPanel() {
    // Verificar que estamos en index.html antes de ejecutar
    if (
      typeof document === "undefined" ||
      document.getElementById("predictionForm") === null
    ) {
      return;
    }
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const settingsClose = document.getElementById("settingsClose");

    // Verificar que los elementos principales existan
    if (!settingsBtn || !settingsPanel || !settingsClose) {
      // Los elementos no existen en esta página, simplemente retornar
      return;
    }

    const langEs = document.getElementById("langEs");
    const langEn = document.getElementById("langEn");
    const unitKm = document.getElementById("unitKm");
    const unitMiles = document.getElementById("unitMiles");

    // Abrir panel
    settingsBtn.addEventListener("click", () => {
      if (settingsPanel) {
        settingsPanel.classList.add("active");
      }
    });

    // Cerrar panel
    settingsClose.addEventListener("click", () => {
      if (settingsPanel) {
        settingsPanel.classList.remove("active");
      }
    });

    // Cerrar al hacer clic fuera del panel
    settingsPanel.addEventListener("click", (e) => {
      if (e.target === settingsPanel) {
        settingsPanel.classList.remove("active");
      }
    });

    // Cambiar idioma (solo si existen los botones en el panel, los del header se manejan en initializeLanguageButtons)
    if (langEs && langEn) {
      langEs.addEventListener("click", () => {
        window.i18n.setLanguage("es");
        langEs.classList.add("active");
        langEn.classList.remove("active");
        // Actualizar también los botones del header
        const langEsBtn = document.getElementById("langEsBtn");
        const langEnBtn = document.getElementById("langEnBtn");
        if (langEsBtn) langEsBtn.classList.add("active");
        if (langEnBtn) langEnBtn.classList.remove("active");
      });

      langEn.addEventListener("click", () => {
        window.i18n.setLanguage("en");
        langEn.classList.add("active");
        langEs.classList.remove("active");
        // Actualizar también los botones del header
        const langEsBtn = document.getElementById("langEsBtn");
        const langEnBtn = document.getElementById("langEnBtn");
        if (langEsBtn) langEsBtn.classList.remove("active");
        if (langEnBtn) langEnBtn.classList.add("active");
      });
    }

    // Cambiar unidad
    unitKm.addEventListener("click", () => {
      window.unitConverter.setUnit("km");
      unitKm.classList.add("active");
      unitMiles.classList.remove("active");
    });

    unitMiles.addEventListener("click", () => {
      window.unitConverter.setUnit("miles");
      unitMiles.classList.add("active");
      unitKm.classList.remove("active");
    });

    // Establecer estado inicial de los botones (solo si existen)
    if (langEs && langEn) {
      const currentLang = window.i18n.getLanguage();
      if (currentLang === "es") {
        langEs.classList.add("active");
        langEn.classList.remove("active");
      } else {
        langEn.classList.add("active");
        langEs.classList.remove("active");
      }
    }

    const currentUnit = window.unitConverter.getUnit();
    if (currentUnit === "km") {
      unitKm.classList.add("active");
      unitMiles.classList.remove("active");
    } else {
      unitMiles.classList.add("active");
      unitKm.classList.remove("active");
    }

    console.log("✅ Panel de configuración inicializado");
  }

  // ============================================================================
  // POBLADO DINÁMICO DE OPCIONES DE AEROLÍNEAS
  // ============================================================================
  function populateAirlineOptions() {
    const select = elements.aerolinea;
    if (!select) {
      console.warn("⚠️ Select de aerolínea no encontrado");
      return;
    }

    // Verificar si tenemos datos cargados
    if (typeof AIRLINE_DATA === "undefined") {
      console.error(
        "❌ AIRLINE_DATA no está definido. Verifique que airline_data.js se haya cargado."
      );
      return;
    }

    // Ordenar aerolíneas por código para mostrarlas ordenadas
    const airlineCodes = Object.keys(AIRLINE_DATA).sort();

    // Agregar opciones (mantener la opción vacía inicial si existe)
    airlineCodes.forEach((code) => {
      const airlineData = AIRLINE_DATA[code];
      if (airlineData && airlineData.name) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = airlineData.name;
        select.appendChild(option);
      }
    });

    console.log(`✅ ${airlineCodes.length} aerolíneas cargadas en el selector`);
  }

  // ============================================================================
  // GESTIÓN DINÁMICA DE AEROPUERTOS
  // ============================================================================
  function handleAirlineChange() {
    const airlineId = elements.aerolinea.value;
    const originSelect = elements.origen;
    const destSelect = elements.destino;

    // Limpiar selects
    originSelect.innerHTML = '<option value="" data-i18n="form.origin.select">Seleccione origen</option>';
    destSelect.innerHTML = '<option value="" data-i18n="form.destination.select">Seleccione destino</option>';

    // Limpiar valores si cambia la aerolínea
    originSelect.value = "";
    destSelect.value = "";

    // Deshabilitar si no hay aerolínea seleccionada
    if (!airlineId) {
      originSelect.disabled = true;
      destSelect.disabled = true;
      return;
    }

    // Verificar si tenemos los datos del JSON cargados
    if (!AIRLINE_AIRPORTS_DATA) {
      console.error(
        "❌ AIRLINE_AIRPORTS_DATA no está cargado. Verifique que aerolinea_origin_dest.json se haya cargado correctamente."
      );
      alert(
        "Error: No se pudieron cargar los datos de aeropuertos por aerolínea. Por favor, recargue la página."
      );
      return;
    }

    // Obtener datos de la aerolínea desde el JSON
    const airlineAirports = AIRLINE_AIRPORTS_DATA[airlineId];
    if (!airlineAirports) {
      console.error(
        `❌ No hay datos de aeropuertos para la aerolínea ID: ${airlineId}`
      );
      alert(
        `Error: No se encontraron datos de aeropuertos para la aerolínea ${airlineId}.`
      );
      return;
    }

    // Obtener listas de aeropuertos de origen y destino desde el JSON
    const origines = airlineAirports.ORIGIN || [];
    const destinos = airlineAirports.DEST || [];

    // Log para depuración
    console.log(`📋 Aerolínea seleccionada: ${airlineId}`);
    console.log(
      `📋 Aeropuertos de origen (${origines.length}):`,
      origines.slice(0, 10),
      origines.length > 10 ? "..." : ""
    );
    console.log(
      `📋 Aeropuertos de destino (${destinos.length}):`,
      destinos.slice(0, 10),
      destinos.length > 10 ? "..." : ""
    );

    // Verificar que ABQ no esté en la lista para 9E (para depuración)
    if (airlineId === "9E" && origines.includes("ABQ")) {
      console.error(
        "❌ ERROR: ABQ no debería estar en la lista de origen para 9E"
      );
      console.error("❌ Datos cargados:", airlineAirports);
    }

    // Poblar Origen (Datalist) - Solo aeropuertos donde opera esta aerolínea
    // Usamos Set para evitar duplicados si los hubiera y ordenar alfabéticamente
    const originesSorted = [...new Set(origines)].sort();
    originesSorted.forEach((code) => {
      const option = document.createElement("option");
      option.value = code;
      // Agregar label descriptivo si tenemos información del aeropuerto
      if (typeof getAirportInfo !== "undefined") {
        const airportInfo = getAirportInfo(code);
        if (airportInfo) {
          option.textContent = `${code} - ${airportInfo.name} (${airportInfo.city})`;
        } else {
          option.textContent = code;
        }
      } else {
        option.textContent = code;
      }
      originSelect.appendChild(option);
    });

    // Poblar Destino inicialmente con todos los destinos disponibles
    // Esta función se actualizará cuando se seleccione un origen
    updateDestinationOptions(destinos, "");

    // Habilitar selects ahora que tenemos los datos cargados
    originSelect.disabled = false;
    destSelect.disabled = false;

    // Agregar listener al select de origen para actualizar destinos cuando cambie
    originSelect.removeEventListener("change", handleOriginChange);
    originSelect.addEventListener("change", handleOriginChange);

    console.log(
      `✅ Aeropuertos cargados para ${airlineId}: ${originesSorted.length} orígenes, ${destinosSorted.length} destinos`
    );
  }

  // ============================================================================
  // MANEJO DE CAMBIO DE ORIGEN
  // ============================================================================
  function handleOriginChange() {
    const airlineId = elements.aerolinea.value;
    const originSelect = elements.origen;
    const destSelect = elements.destino;
    const selectedOrigin = originSelect.value;

    // Si no hay aerolínea seleccionada, no hacer nada
    if (!airlineId || !AIRLINE_AIRPORTS_DATA || !AIRLINE_AIRPORTS_DATA[airlineId]) {
      return;
    }

    // Obtener destinos disponibles para esta aerolínea
    const airlineAirports = AIRLINE_AIRPORTS_DATA[airlineId];
    const destinos = airlineAirports.DEST || [];

    // Actualizar opciones de destino excluyendo el aeropuerto de origen seleccionado
    updateDestinationOptions(destinos, selectedOrigin);

    // Si el destino actualmente seleccionado es el mismo que el origen, limpiarlo
    if (destSelect.value === selectedOrigin) {
      destSelect.value = "";
    }
  }

  // ============================================================================
  // ACTUALIZAR OPCIONES DE DESTINO
  // ============================================================================
  function updateDestinationOptions(destinos, excludeOrigin) {
    const destSelect = elements.destino;
    const currentValue = destSelect.value;

    // Limpiar select de destino manteniendo solo la opción vacía
    destSelect.innerHTML = '<option value="" data-i18n="form.destination.select">Seleccione destino</option>';

    // Filtrar destinos excluyendo el aeropuerto de origen si está seleccionado
    const destinosFiltrados = excludeOrigin
      ? destinos.filter(code => code !== excludeOrigin)
      : destinos;

    // Usamos Set para evitar duplicados si los hubiera y ordenar alfabéticamente
    const destinosSorted = [...new Set(destinosFiltrados)].sort();
    
    destinosSorted.forEach((code) => {
      const option = document.createElement("option");
      option.value = code;
      // Agregar label descriptivo si tenemos información del aeropuerto
      if (typeof getAirportInfo !== "undefined") {
        const airportInfo = getAirportInfo(code);
        if (airportInfo) {
          option.textContent = `${code} - ${airportInfo.name} (${airportInfo.city})`;
        } else {
          option.textContent = code;
        }
      } else {
        option.textContent = code;
      }
      destSelect.appendChild(option);
    });

    // Restaurar el valor anterior si aún está disponible
    if (currentValue && destinosFiltrados.includes(currentValue)) {
      destSelect.value = currentValue;
    }

    console.log(
      `✅ Opciones de destino actualizadas: ${destinosSorted.length} destinos${excludeOrigin ? ` (excluyendo ${excludeOrigin})` : ""}`
    );
  }

  // ============================================================================
  // CARGA DE ESTADÍSTICAS DEL DASHBOARD
  // ============================================================================
  /**
   * Carga las estadísticas del día actual desde el API y las muestra en el dashboard
   */
  async function loadDashboardStats() {
    // Verificar que estamos en index.html antes de ejecutar
    if (
      typeof document === "undefined" ||
      document.getElementById("predictionForm") === null
    ) {
      return;
    }
    try {
      console.log("📊 Cargando estadísticas del dashboard...");

      const url = `${API_CONFIG.baseUrl}/stats`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const stats = await response.json();
      console.log("✅ Estadísticas cargadas:", stats);

      // Actualizar cards principales
      updateStatsCards(stats);

      // Actualizar estadísticas detalladas
      updateDetailedStats(stats);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error);
      // Mostrar mensaje de error en las cards
      const totalEl = document.getElementById("totalPredictions");
      const todayEl = document.getElementById("todayPredictions");
      const delayedEl = document.getElementById("delayedPercentage");
      const onTimeEl = document.getElementById("onTimePercentage");

      if (totalEl) totalEl.textContent = "Error";
      if (todayEl) todayEl.textContent = "Error";
      if (delayedEl) delayedEl.textContent = "Error";
      if (onTimeEl) onTimeEl.textContent = "Error";
    }
  }

  /**
   * Actualiza las cards principales del dashboard con las estadísticas
   * Solo funciona si los elementos existen (index.html)
   */
  function updateStatsCards(stats) {
    // Verificar si los elementos existen antes de actualizar
    const totalEl = document.getElementById("totalPredictions");
    const todayEl = document.getElementById("todayPredictions");
    const delayedEl = document.getElementById("delayedPercentage");
    const onTimeEl = document.getElementById("onTimePercentage");

    // Si no existen los elementos, esta función no es relevante para esta página
    if (!totalEl && !todayEl && !delayedEl && !onTimeEl) {
      return; // Los elementos no existen en esta página, simplemente retornar
    }

    // Total de predicciones del día
    const totalPredicciones = stats.total_predicciones || 0;
    if (totalEl) totalEl.textContent = totalPredicciones.toLocaleString();

    // Predicciones de hoy
    if (todayEl) todayEl.textContent = totalPredicciones.toLocaleString();

    // Porcentaje de retrasados
    const porcentajeRetrasados = stats.porcentaje_retrasados;
    if (delayedEl) {
      if (porcentajeRetrasados !== null && porcentajeRetrasados !== undefined) {
        delayedEl.textContent = `${porcentajeRetrasados.toFixed(1)}%`;
      } else {
        delayedEl.textContent = "N/A";
      }
    }

    // Porcentaje de puntuales
    const porcentajePuntuales = stats.porcentaje_puntuales;
    if (onTimeEl) {
      if (porcentajePuntuales !== null && porcentajePuntuales !== undefined) {
        onTimeEl.textContent = `${porcentajePuntuales.toFixed(1)}%`;
      } else {
        onTimeEl.textContent = "N/A";
      }
    }
  }

  /**
   * Actualiza las estadísticas detalladas (por aerolínea y aeropuerto)
   */
  function updateDetailedStats(stats) {
    // Guardar datos para re-renderizar cuando cambie el idioma
    window.lastStatsData = stats;

    // Crear o actualizar sección de estadísticas detalladas
    let statsSection = document.getElementById("detailedStatsSection");

    if (!statsSection) {
      // Crear la sección si no existe
      const i18n = window.i18n || { t: (key) => key };
      statsSection = document.createElement("section");
      statsSection.id = "detailedStatsSection";
      statsSection.className = "quick-access-section";
      statsSection.innerHTML = `
            <h2 data-i18n="stats.detailed.title">${i18n.t(
              "stats.detailed.title"
            )}</h2>
            <div id="detailedStatsContent"></div>
        `;

      // Insertar después de las cards de estadísticas rápidas
      const statsCards = document.getElementById("statsCards");
      if (statsCards && statsCards.parentNode) {
        statsCards.parentNode.insertBefore(
          statsSection,
          statsCards.nextSibling
        );
      }
    }

    const content = document.getElementById("detailedStatsContent");
    if (!content) return;

    let html = "";

    // Estadísticas por aerolínea
    if (
      stats.estadisticas_por_aerolinea &&
      stats.estadisticas_por_aerolinea.length > 0
    ) {
      html += `
            <div class="stats-detail-card">
                <h3 style="margin-bottom: 1rem; color: var(--color-gray-800); display: flex; align-items: center;">
                    <svg style="width: 20px; height: 20px; margin-right: 0.5rem;" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" />
                    </svg>
                    ${
                      window.i18n
                        ? window.i18n.t("stats.by.airline")
                        : "Estadísticas por Aerolínea"
                    }
                </h3>
                <div class="stats-grid">
        `;

      const i18nAirline = window.i18n || { t: (key) => key };
      stats.estadisticas_por_aerolinea.forEach((stat) => {
        // Usar el nombre completo de la aerolínea del backend, o el código como fallback
        const aerolineaNombre = stat.aerolinea_nombre || stat.aerolinea;
        const porcentaje = stat.porcentaje_retrasados || 0;
        const barWidth = Math.min(porcentaje, 100);

        html += `
                <div class="stats-item-card">
                    <div class="stats-item-header">
                        <h4>${aerolineaNombre}</h4>
                        <span class="stats-item-badge">${
                          stat.total || 0
                        } ${i18nAirline.t("stats.flights")}</span>
                    </div>
                    <div class="stats-item-body">
                        <div class="stats-item-row">
                            <span>${i18nAirline.t("stats.on.time")}</span>
                            <strong style="color: var(--color-success);">${
                              (stat.total || 0) - (stat.retrasados || 0)
                            }</strong>
                        </div>
                        <div class="stats-item-row">
                            <span>${i18nAirline.t("stats.delayed")}</span>
                            <strong style="color: var(--color-danger);">${
                              stat.retrasados || 0
                            }</strong>
                        </div>
                        <div class="stats-item-row">
                            <span>${i18nAirline.t(
                              "stats.percentage.delayed"
                            )}</span>
                            <strong>${porcentaje.toFixed(1)}%</strong>
                        </div>
                        <div class="stats-bar-container">
                            <div class="stats-bar" style="width: ${barWidth}%; background: ${
          porcentaje > 50
            ? "var(--color-danger)"
            : porcentaje > 25
            ? "var(--color-warning)"
            : "var(--color-success)"
        };"></div>
                        </div>
                    </div>
                </div>
            `;
      });

      html += `</div></div>`;
    }

    // Estadísticas por aeropuerto de origen
    if (
      stats.estadisticas_por_aeropuerto_origen &&
      stats.estadisticas_por_aeropuerto_origen.length > 0
    ) {
      html += `
            <div class="stats-detail-card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--color-gray-800); display: flex; align-items: center;">
                    <svg style="width: 20px; height: 20px; margin-right: 0.5rem;" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L3 7V11C3 16.55 7.84 21.74 12 23C16.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" stroke-width="2" />
                    </svg>
                    ${
                      window.i18n
                        ? window.i18n.t("stats.by.airport")
                        : "Estadísticas por Aeropuerto de Origen (Top 10)"
                    }
                </h3>
                <div class="stats-grid">
        `;

      // Mostrar solo los top 10 aeropuertos
      const topOrigenes = stats.estadisticas_por_aeropuerto_origen
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .slice(0, 10);

      topOrigenes.forEach((stat) => {
        const porcentaje = stat.porcentaje_retrasados || 0;
        const barWidth = Math.min(porcentaje, 100);

        // Construir título del aeropuerto con código, nombre y ciudad
        let aeropuertoTitulo = stat.aeropuerto || "N/A";
        if (
          stat.aeropuerto_nombre &&
          stat.aeropuerto_nombre !== stat.aeropuerto
        ) {
          aeropuertoTitulo = `${stat.aeropuerto} - ${stat.aeropuerto_nombre}`;
          if (stat.aeropuerto_ciudad) {
            aeropuertoTitulo += ` (${stat.aeropuerto_ciudad})`;
          }
        } else if (stat.aeropuerto_ciudad) {
          aeropuertoTitulo = `${stat.aeropuerto} (${stat.aeropuerto_ciudad})`;
        }

        const i18n = window.i18n || { t: (key) => key };
        const flightsText = i18n.t("stats.flights");
        const onTimeText = i18n.t("stats.on.time");
        const delayedText = i18n.t("stats.delayed");
        const percentageText = i18n.t("stats.percentage.delayed");

        html += `
                <div class="stats-item-card">
                    <div class="stats-item-header">
                        <h4 style="font-size: 0.95rem; line-height: 1.3;">${aeropuertoTitulo}</h4>
                        <span class="stats-item-badge">${
                          stat.total || 0
                        } ${flightsText}</span>
                    </div>
                    <div class="stats-item-body">
                        <div class="stats-item-row">
                            <span>${onTimeText}</span>
                            <strong style="color: var(--color-success);">${
                              (stat.total || 0) - (stat.retrasados || 0)
                            }</strong>
                        </div>
                        <div class="stats-item-row">
                            <span>${delayedText}</span>
                            <strong style="color: var(--color-danger);">${
                              stat.retrasados || 0
                            }</strong>
                        </div>
                        <div class="stats-item-row">
                            <span>${percentageText}</span>
                            <strong>${porcentaje.toFixed(1)}%</strong>
                        </div>
                        <div class="stats-bar-container">
                            <div class="stats-bar" style="width: ${barWidth}%; background: ${
          porcentaje > 50
            ? "var(--color-danger)"
            : porcentaje > 25
            ? "var(--color-warning)"
            : "var(--color-success)"
        };"></div>
                        </div>
                    </div>
                </div>
            `;
      });

      html += `</div></div>`;
    }

    // Información de actualización
    if (stats.timestamp) {
      const lastUpdateText = window.i18n
        ? window.i18n.t("stats.last.update")
        : "Última actualización:";
      const locale =
        window.i18n && window.i18n.currentLanguage === "en" ? "en-US" : "es-ES";
      html += `
            <div style="margin-top: 2rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px; text-align: center; color: var(--color-gray-600); font-size: 0.9rem;">
                ${lastUpdateText} ${new Date(stats.timestamp).toLocaleString(
        locale
      )}
            </div>
        `;
    }

    if (html === "") {
      const noDataText = window.i18n
        ? window.i18n.t("stats.no.data")
        : "No hay estadísticas disponibles aún. Realice algunas predicciones para ver las estadísticas aquí.";
      html = `<p style="color: var(--color-gray-600); text-align: center; padding: 2rem;">${noDataText}</p>`;
    }

    content.innerHTML = html;

    // Actualizar traducciones del título y otros elementos dinámicos
    if (window.i18n && typeof updateAllTranslations === "function") {
      // Pequeño delay para asegurar que el HTML se haya insertado
      setTimeout(() => {
        updateAllTranslations();
      }, 50);
    }
  }

  /**
   * Extrae el código IATA de un aeropuerto desde el metadata
   */
  function extractIATACode(metadata, key) {
    // Intentar obtener desde la ruta (formato "XXX → YYY")
    if (metadata.ruta) {
      const parts = metadata.ruta.split("→");
      if (key === "origen_nombre" && parts.length > 0) {
        return parts[0].trim();
      } else if (key === "destino_nombre" && parts.length > 1) {
        return parts[1].trim();
      }
    }
    // Si no está disponible, retornar null
    return null;
  }

  // Hacer funciones disponibles globalmente
  window.loadDashboardStats = loadDashboardStats;

  console.log("✅ App.js cargado correctamente");

  // ========================================================================
  // FIN DEL CÓDIGO DE app.js
  // ========================================================================
})(); // FIN DE LA IIFE
