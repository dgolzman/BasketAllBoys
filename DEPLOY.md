# Guía de Despliegue en Producción (Proxmox LXC)

Esta guía explica cómo desplegar y mantener la aplicación en un contenedor LXC de Proxmox con Docker.

## 1. Preparación del Servidor (Solo una vez)

Ejecutá estos comandos en la terminal de tu Proxmox LXC para preparar el entorno:

```bash
# Crear carpeta de la aplicación
mkdir -p /opt/basket-app && cd /opt/basket-app

# Descargar archivos de control directamente de GitHub
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/docker-compose.yml
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/update.sh

# Dar permisos de ejecución
chmod +x update.sh

# Crear carpeta para la base de datos (persistencia)
mkdir -p data
```

## 2. Configuración Local de Secretos (Archivo .env)

Para mantener la seguridad localmente en tu servidor, creá un archivo `.env` en `/opt/basket-app`:

```bash
# Crear el archivo con las llaves de seguridad
touch .env

# Generar un AUTH_SECRET aleatorio y guardarlo
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Agregar la URL de tu aplicación (cambiá por tu IP o dominio)
echo "NEXTAUTH_URL=http://tu-ip-servidor:3000" >> .env
```

*Nota: Podés editar este archivo en cualquier momento con `nano .env` si cambia tu IP.*

## 3. Despliegue y Actualización

Cada vez que quieras instalar por primera vez o actualizar a la versión más reciente:

1.  Aseguráte de haber hecho `git push` de tus cambios a GitHub y que el "Action" (pestaña Actions) esté en verde.
2.  En tu servidor, dentro de `/opt/basket-app`, ejecutá:
    ```bash
    ./update.sh
    ```

El script se encargará de:
*   Bajar la última imagen de GitHub.
*   Reiniciar el contenedor con el nuevo código (usando tu `.env` local).
*   Mantener tu base de datos intacta en `./data/prod.db`.
*   Borrar versiones viejas para ahorrar espacio.

## Solución de Problemas

*   **Ver logs en vivo**: `docker compose logs -f`
*   **Editar secretos**: `nano .env` (luego ejecutá `./update.sh` para aplicar cambios).
*   **Reiniciar manualmente**: `docker compose restart`
*   **Verificar que estés logueado a GHCR**: Si el pull falla, asegurate de que el repositorio sea público.
