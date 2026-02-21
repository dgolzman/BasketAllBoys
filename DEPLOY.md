# Guía de Despliegue en Producción (Proxmox LXC)

Esta guía explica cómo desplegar y mantener la aplicación en un contenedor LXC de Proxmox con Docker.

## 1. Configuración de GitHub (Solo una vez)

Antes del primer despliegue, debés configurar las variables de entorno seguras en GitHub:

1.  Andá a tu repositorio en GitHub.
2.  Navegá a **Settings** > **Secrets and variables** > **Actions**.
3.  Crea los siguientes **Repository Secrets**:
    *   `AUTH_SECRET`: Un código largo y aleatorio. Podés generarlo en tu PC con: `openssl rand -base64 32`.
    *   `NEXTAUTH_URL`: La URL pública de tu app (ej: `http://192.168.1.100` o tu dominio).

## 2. Inicialización del Servidor (Solo una vez)

Ejecutá estos comandos en la terminal de tu Proxmox LXC para preparar el entorno:

```bash
# Crear carpeta de la aplicación
mkdir -p /opt/basket-app && cd /opt/basket-app

# Descargar archivos de control
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/docker-compose.yml
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/update.sh

# Dar permisos de ejecución
chmod +x update.sh

# Crear carpeta para la base de datos (persistencia)
mkdir -p data
```

## 3. Despliegue y Actualización

Cada vez que quieras instalar por primera vez o actualizar a la versión más reciente:

1.  Asegúrate de haber hecho `git push` de tus cambios a GitHub y que el "Action" (pestaña Actions) esté en verde.
2.  En tu servidor, dentro de `/opt/basket-app`, ejecutá:
    ```bash
    ./update.sh
    ```

El script se encargará de:
*   Bajar la última imagen de GitHub.
*   Reiniciar el contenedor con el nuevo código.
*   Mantener tu base de datos intacta en `./data/prod.db`.
*   Borrar versiones viejas para ahorrar espacio.

## Solución de Problemas

*   **Ver logs en vivo**: `docker compose logs -f`
*   **Reiniciar manualmente**: `docker compose restart`
*   **Verificar que estés logueado a GHCR**: Si el pull falla, asegurate de que el repositorio sea público o que el servidor tenga permisos de lectura.
