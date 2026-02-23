# Guía de Despliegue en Producción (Proxmox LXC)

Esta guía explica cómo desplegar y mantener la aplicación en un contenedor LXC de Proxmox con Docker.

## 1. Instalación Rápida (Recomendado)

Si estás en un servidor nuevo (Proxmox LXC con Alpine o Debian), instalá todo con un solo comando:

```bash
wget -qO- https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/setup.sh | sh
```

El script instalador se encarga de **todo** de forma interactiva:

1. 🔑 **Autenticación**: Pedirá tu Token de GitHub (`read:packages`) y hará el `docker login` automáticamente.
2. ⚠️ **Detección de instalación existente**: Si ya hay una base de datos, pide confirmación antes de borrar.
3. 🐳 **Descarga y levantamiento**: Baja la imagen más reciente y levanta el contenedor.
4. 💾 **Migraciones y seed**: Corre las migraciones y crea el usuario admin + categorías iniciales.
5. 📦 **Importar backup (opcional)**: Al final, ofrece restaurar un backup `.json` existente si lo tenés.

### Credenciales por defecto (instalación limpia):
- **Email**: `admin@allboys.com`
- **Contraseña**: `admin123`

> [!TIP]
> **Seguridad**: Una vez que entres, te recomendamos crear un usuario nuevo y cambiarle la contraseña al admin por defecto.

---

## 2. Actualización (Instalación Existente)

Para actualizar a la última versión sin perder datos:

```bash
cd /opt/basket-app && ./update.sh
```

El script se encarga de bajar la nueva imagen, reiniciar el contenedor y mantener la base de datos intacta.

---

## 3. Preparación Manual del Servidor (Alternativa sin script)

```bash
mkdir -p /opt/basket-app && cd /opt/basket-app

# Autenticar con GitHub
echo "TU_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin

# Descargar archivos de configuración
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/docker-compose.yml
wget https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/update.sh
chmod +x update.sh

# Crear .env con secretos
echo "AUTH_SECRET=$(openssl rand -base64 32)" > .env
echo "NEXTAUTH_URL=http://IP_DEL_SERVIDOR:3000" >> .env
echo "AUTH_URL=http://IP_DEL_SERVIDOR:3000" >> .env
echo "AUTH_TRUST_HOST=true" >> .env

# Crear carpeta de datos y dar permisos
mkdir -p data && chmod 777 data

# Levantar contenedor
./update.sh

# Correr migraciones y seed
docker compose exec app npx prisma@5.22.0 migrate deploy
docker compose exec app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
bcrypt.hash('admin123', 10).then(hash => {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prisma.user.upsert({ where: { email: 'admin@allboys.com' }, update: {}, create: { id, email: 'admin@allboys.com', name: 'Administrador', password: hash, role: 'ADMIN', updatedAt: new Date() }});
}).then(() => prisma.\$disconnect());
"
```

---

## Solución de Problemas

### Error "unauthorized" al bajar la imagen

El script de instalación (`setup.sh`) maneja esto automáticamente. Si usás `update.sh` manualmente:

1. Creá un token en [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens) con permiso `read:packages`.
2. Ejecutá:
   ```bash
   echo "TU_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin
   ```
3. Volvé a correr `./update.sh`.

### Problemas de redirección al Login (Zoraxy / Nginx / Proxy Reverso)

Si pusiste la app detrás de un proxy reverso y al hacer login te redirige a una IP interna en vez de tu dominio (ej: `http://192.168.0.x:3000`), asegurate de configurar esto en tu archivo `.env`:

```env
NEXTAUTH_URL=https://tudominio.com
AUTH_URL=https://tudominio.com
AUTH_TRUST_HOST=true
```
Y en tu prexy (ej: Zoraxy) **verificá tener activada la opción de pasar el "Host Header"** para que Next.js detecte el dominio original.

### Comandos útiles

```bash
docker compose logs -f          # Ver logs en vivo
docker compose restart          # Reiniciar el contenedor
nano /opt/basket-app/.env       # Editar secretos (requiere ./update.sh después)
```
