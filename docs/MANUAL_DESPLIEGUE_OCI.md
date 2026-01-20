# Manual de Despliegue en OCI (Oracle Cloud Infrastructure)

Este manual describe paso a paso cómo desplegar la aplicación **Vektor AI Backend** (FlightOnTime) en una instancia de computación de OCI, utilizando Docker y Docker Compose, y configurando Apache (httpd) como proxy inverso.

## 1. Prerrequisitos

*   **Instancia de Compute en OCI**: Una máquina virtual (VM) activa con **Oracle Linux 9.6** (versión confirmada).
*   **Acceso SSH**: Clave privada (`.key` o `.pem`) para conectarse a la instancia.
*   **OCI Cloud Shell**: Se utilizará como terminal de administración.
*   **Servidor Web Apache (httpd)**: Ya instalado en el servidor.
*   **Archivo del Modelo**: `random_forest_clima_v1.joblib` (~500MB) listo para transferir.

---

## 2. Conexión al Servidor desde Cloud Shell

1.  Inicia sesión en **OCI Console**.
2.  Abre **Cloud Shell** (icono de terminal en la barra superior).
3.  Verifica que tus llaves SSH estén disponibles en la carpeta `.shh` (o `.ssh`):
    *Verifica el contenido de la carpeta (el nombre puede variar según tu configuración, ej. .ssh o .shh):*
    ```bash
    ls -la ~/.shh
    ```
    *Ajusta permisos si es necesario:*
    ```bash
    chmod 600 ~/.shh/id_rsa
    ```
4.  Conéctate a tu instancia usando la llave privada almacenada en Cloud Shell.
    *Reemplaza `<IP_PUBLICA>` con la IP de tu servidor:*
    ```bash
    ssh -i ~/.shh/id_rsa opc@<IP_PUBLICA>
    ```

---

## 3. Preparación del Entorno (Docker en Oracle Linux 9)

El servidor cuenta con `httpd`, pero requerimos Docker para el despliegue de los microservicios.

1.  **Limpiar versiones antiguas (Opcional pero recomendado)**:
    ```bash
    sudo dnf remove docker \
                    docker-client \
                    docker-client-latest \
                    docker-common \
                    docker-latest \
                    docker-latest-logrotate \
                    docker-logrotate \
                    docker-engine
    ```

2.  **Agregar el repositorio de Docker CE**:
    *Para Oracle Linux 9, utilizamos el repositorio de CentOS Stream compatible:*
    ```bash
    sudo dnf install -y dnf-utils
    ```
    ```bash
    sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    ```

3.  **Instalar Docker Engine**:
    ```bash
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

4.  **Iniciar y habilitar Docker**:
    *Inicia el servicio:*
    ```bash
    sudo systemctl start docker
    ```
    *Habilitar al inicio del sistema:*
    ```bash
    sudo systemctl enable docker
    ```

5.  **Instalar Docker Compose (Standalone)**:
    *Nota: Si prefieres el binario standalone `docker-compose` en lugar del plugin:*
    *Descargar el binario:*
    ```bash
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    ```
    *Dar permisos de ejecución:*
    ```bash
    sudo chmod +x /usr/local/bin/docker-compose
    ```

6.  **Configurar permisos de usuario**:
    *Añadir usuario al grupo docker:*
    ```bash
    sudo usermod -aG docker opc
    ```
    *Aplicar cambios de grupo:*
    ```bash
    newgrp docker
    ```

---

## 4. Despliegue de la Aplicación

### 4.1. Clonar el Repositorio

Clona el código fuente utilizando la URL pública del repositorio del desarrollador.

*Clonar repositorio:*
```bash
git clone https://github.com/JoseBenin82/flightontime-desarrollo.git vektor-ai-backend
```
*Entrar al directorio:*
```bash
cd vektor-ai-backend
```

### 4.2. Subir el Modelo ML (Paso Crítico)

El archivo `random_forest_clima_v1.joblib` (500MB) no está en el repositorio y debe subirse manualmente a la carpeta `ml-service`.

**Opción A: Usando SCP desde tu máquina local (Recomendado)**
Abre una terminal en tu computadora y ejecuta el comando de copia.

*Comando SCP:*
```bash
scp -i path/a/mi_clave.key path/a/random_forest_clima_v1.joblib opc@<IP_PUBLICA>:~/vektor-ai-backend/ml-service/
```

**Opción B: Subir desde Cloud Shell (Usando las llaves guardadas)**
1.  Sube el archivo `.joblib` a tu entorno de Cloud Shell (menú "Upload").
2.  Transfiere el archivo al servidor usando la llave privada guardada en `.shh`.

*Comando SCP desde Cloud Shell:*
```bash
scp -i ~/.shh/id_rsa random_forest_clima_v1.joblib opc@<IP_PUBLICA>:~/vektor-ai-backend/ml-service/
```

**Verificación:**
Asegúrate de que el archivo esté en la ubicación correcta dentro del servidor.

*Listar el archivo:*
```bash
ls -lh ~/vektor-ai-backend/ml-service/random_forest_clima_v1.joblib
```

### 4.3. Inicio con Docker Compose

Una vez que el modelo está en su lugar, levanta los servicios.

*Navegar al directorio:*
```bash
cd ~/vektor-ai-backend
```
*Levantar servicios:*
```bash
docker-compose up -d --build
```

Verifica que los contenedores estén corriendo:

*Comprobar estado:*
```bash
docker-compose ps
```
Deberías ver `frontend` corriendo en el puerto `8081` (mapeado desde el 80 del contenedor).

---

## 5. Configuración de Apache (httpd) como Proxy

Dado que ya tienes `httpd` instalado, lo usaremos para recibir las peticiones en el puerto 80 (estándar web) y redirigirlas al puerto 8081 de nuestra aplicación Dockerizada.

1.  **Crear archivo de configuración del Proxy**:
    *Abrir editor:*
    ```bash
    sudo vi /etc/httpd/conf.d/flightontime.conf
    ```

2.  **Agregar el siguiente contenido**:
    ```apache
    <VirtualHost *:80>
        ServerName tu-dominio-o-ip.com
        
        ProxyPreserveHost On
        ProxyRequests Off
        
        # Redirigir todo el tráfico al Frontend en Docker (Puerto 8081)
        ProxyPass / http://localhost:8081/
        ProxyPassReverse / http://localhost:8081/
    </VirtualHost>
    ```

3.  **Permitir conexiones de red (SELinux)**:
    Si estás en Oracle Linux/RHEL, SELinux puede bloquear el proxy. Habilítalo:
    *Habilitar conexión de red para httpd:*
    ```bash
    sudo setsebool -P httpd_can_network_connect 1
    ```

4.  **Reiniciar Apache**:
    *Reiniciar servicio:*
    ```bash
    sudo systemctl restart httpd
    ```

---

## 6. Verificación Final

1.  Abre un navegador web.
2.  Ingresa la IP pública de tu instancia: `http://<IP_PUBLICA>`.
3.  Deberías ver la interfaz de **FlightOnTime**.
4.  Apache (`:80`) está recibiendo la petición -> Redirige a Docker (`:8081`) -> Nginx Frontend servirá la web -> Las peticiones a `/api` irán al Backend.

### Solución de Problemas Comunes

*   **Error de Permisos con el Modelo**: Asegúrate que el archivo `.joblib` tenga permisos de lectura antes del build (`chmod 644`).
*   **Puerto 80 bloqueado**: Verifica que la **Security List** en la consola de OCI (Networking > VCN) permita tráfico entrante (Ingress) en el puerto 80 desde `0.0.0.0/0`.
*   **Firewall del SO**: Si no carga, abre el puerto HTTP en el firewall local:
    *Abrir puerto HTTP:*
    ```bash
    sudo firewall-cmd --permanent --add-service=http
    ```
    *Recargar reglas:*
    ```bash
    sudo firewall-cmd --reload
    ```
