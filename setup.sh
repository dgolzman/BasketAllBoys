#!/bin/sh
set -e

# Script de instalación inicial para BasketAllBoys en Proxmox LXC
# Optimizado para Alpine Linux y Debian/Ubuntu
echo "🚀 Iniciando instalación de BasketAllBoys..."

# 1. Instalar dependencias si faltan (Solo Alpine Detectado por APK)
if [ -f /etc/alpine-release ] && ! command -v openssl >/dev/null; then
    echo "📦 Detectado Alpine Linux. Instalando dependencias (openssl)..."
    apk add --no-cache openssl
fi

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"

# 2. Crear directorio y entrar
echo "📂 Preparando directorio en $APP_DIR..."
mkdir -p "$APP_DIR" && cd "$APP_DIR"

# 3. Descargar archivos base de GitHub
echo "📥 Descargando archivos de configuración..."
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml
wget -q "$REPO_RAW/update.sh" -O update.sh
chmod +x update.sh

# 4. Configurar entorno (.env) si no existe
if [ ! -f .env ]; then
    echo "🔐 Generando archivo de configuración inicial (.env)..."
    AUTH_SECRET=$(openssl rand -base64 32)
    
    # Forma compatible con BusyBox (Alpine) y GNU hostname
    IP_ADDR=$(hostname -i | awk '{print $1}')
    if [ -z "$IP_ADDR" ] || [ "$IP_ADDR" = "127.0.0.1" ]; then
        # Intento alternativo si hostname -i no da la IP de red
        IP_ADDR=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n1)
    fi
    
    if [ -z "$IP_ADDR" ]; then
        IP_ADDR="localhost"
    fi
    
    echo "AUTH_SECRET=$AUTH_SECRET" > .env
    echo "NEXTAUTH_URL=http://$IP_ADDR:3000" >> .env
    echo "AUTH_TRUST_HOST=true" >> .env
    echo "✅ Archivo .env creado con URL: http://$IP_ADDR:3000"
else
    echo "ℹ️ El archivo .env ya existe, saltando configuración inicial."
fi

# 5. Crear carpeta para la base de datos (persistencia)
mkdir -p data

# 6. Ejecutar despliegue inicial (pull y up)
echo "🐳 Levantando contenedores..."
if ! ./update.sh; then
    echo "--------------------------------------------------------"
    echo "❌ ERROR: No se pudo descargar la imagen de GitHub."
    echo "Probablemente necesitás loguearte primero."
    echo ""
    echo "Corré este comando con tu Token de GitHub (read:packages):"
    echo "echo 'TU_TOKEN' | docker login ghcr.io -u dgolzman --password-stdin"
    echo ""
    echo "Luego volvé a ejecutar el script de instalación."
    echo "--------------------------------------------------------"
    exit 1
fi

# 7. Inicializar base de datos
echo "💾 Ejecutando migraciones y carga de datos iniciales..."
# Esperar un momento a que el contenedor de la DB esté listo si fuera necesario, 
# pero aquí usamos SQLite, así que solo necesitamos que el servicio app esté corriendo.
docker compose exec -T app npx prisma@5.22.0 migrate deploy
docker compose exec -T app npx tsx prisma/seed.ts

echo "🎉 ¡Instalación completada con éxito!"
echo "📍 Acceso: http://$IP_ADDR:3000"
echo "🔑 Credenciales: admin@allboys.com / admin123"
