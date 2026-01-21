# ============================================================================
# DOCKERFILE - FRONTEND
# Servidor Nginx para servir archivos estáticos
# ============================================================================

FROM nginx:alpine

# Copiar archivos del frontend
COPY *.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
# Copiar carpeta de imágenes
COPY img/ /usr/share/nginx/html/img/
# Copiar archivo JSON de aerolíneas y aeropuertos
COPY aerolinea_origin_dest.json /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --spider http://127.0.0.1/ || exit 1

# Nginx se inicia automáticamente
