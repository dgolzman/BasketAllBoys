# Guía de Despliegue en Producción (Proxmox LXC)

Esta guía explica cómo desplegar y mantener la aplicación en un contenedor LXC de Proxmox con Docker.

## 1. Preparación del Servidor (Solo una vez)

Ejecutá estos comandos en la terminal de tu Proxmox LXC para preparar el entorno. 

> [!IMPORTANT]
> **Nota sobre Privacidad**: Como tu repositorio es **Privado**, el comando `wget` podría fallar (404). Si eso pasa, simplemente creá los archivos manualmente con `nano` y pegá el contenido que te paso abajo.

### Opción A: Descarga Directa (Si fuera público o con token)
```bash
# Crear carpeta de la aplicación
mkdir -p /opt/basket-app && cd /opt/basket-app

# Intentar descargar (puede fallar en repo privado)
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/docker-compose.yml
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/update.sh
```

### Opción B: Creación Manual (Recomendado para repo privado)
Si los comandos de arriba fallan, ejecutá estos:

1. **Crear docker-compose.yml**:
   `nano docker-compose.yml` (Pegá el contenido del archivo que está al final de esta guía)
2. **Crear update.sh**:
   `nano update.sh` (Pegá el contenido del archivo que está al final de esta guía)

```bash
# Después de crearlos, dales permisos y prepará la carpeta:
chmod +x update.sh
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

---

## Anexo: Contenidos de los Archivos para Copiar y Pegar

### Archivo: `docker-compose.yml`
```yaml
services:
  app:
    image: ghcr.io/dgolzman/basketallboys:latest
    container_name: basket-app
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
    environment:
      - DATABASE_URL=file:/app/data/prod.db
      - NODE_ENV=production
```

### Archivo: `update.sh`
```bash
#!/bin/sh

# Script para actualizar la aplicación BasketAllBoys
echo "🚀 Iniciando actualización manual..."

# 1. Bajar la última versión de la imagen
echo "📦 Descargando última versión desde GitHub..."
docker compose pull

# 2. Reiniciar el contenedor
echo "🔄 Reiniciando servicios..."
docker compose up -d --remove-orphans

# 3. Limpiar imágenes viejas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Actualización completada con éxito!"
```
