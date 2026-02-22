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

# Agregar la URL de tu aplicación (IP de tu servidor)
echo "NEXTAUTH_URL=http://10.1.60.8:3000" >> .env
echo "AUTH_TRUST_HOST=true" >> .env
```

*Nota: Podés editar este archivo en cualquier momento con `nano .env` si cambia tu IP.*

## 3. Primer Acceso y Usuario Administrador

Cuando inicies la aplicación por primera vez, la base de datos estará vacía. Para crear el usuario administrador y cargar las categorías iniciales, ejecutá este comando en tu servidor (dentro de `/opt/basket-app`):

```bash
# Ejecutar migraciones y cargar datos iniciales (Seed)
# Es IMPORTANTE usar la versión @5.22.0 para evitar errores
docker compose exec app npx prisma@5.22.0 migrate deploy
docker compose exec app npx prisma@5.22.0 db seed
```

### Credenciales por defecto:
*   **Email**: `admin@allboys.com`
*   **Contraseña**: `admin123`

> [!TIP]
> **Seguridad**: Una vez que entres, te recomendamos crear un usuario nuevo con tu DNI y borrar el usuario administrador por defecto o cambiarle la contraseña.

## 4. Despliegue y Actualización

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

## Solución de Problemas / Autenticación

Si el comando `./update.sh` da un error de **"unauthorized"**, es porque necesitás loguear tu servidor a GitHub:

1.  **Crear Token en GitHub**:
    *   Andá a [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens).
    *   Generá un nuevo token (clásico) con el permiso: `read:packages`.
    *   Copiá el token generado (ej: `ghp_...`).

2.  **Loguear en el Servidor**:
    *   En tu Proxmox LXC, ejecutá:
        ```bash
        echo "TU_TOKEN_AQUÍ" | docker login ghcr.io -u dgolzman --password-stdin
        ```
    *   Reemplazá `TU_TOKEN_AQUÍ` por el token que copiaste.

3.  **Probar de nuevo**: Corré `./update.sh` y ahora debería bajar la imagen sin problemas.

*   **Ver logs en vivo**: `docker compose logs -f`
*   **Editar secretos**: `nano .env` (luego ejecutá `./update.sh` para aplicar cambios).
*   **Reiniciar manualmente**: `docker compose restart`
