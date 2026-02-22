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
echo "🐳 Levantando contenedores (descargando imagen)..."
if ! ./update.sh; then
    echo ""
    echo "--------------------------------------------------------"
    echo "❌ ERROR: No se pudo descargar la imagen de GitHub."
    echo "El servidor no tiene permisos para acceder a GHCR.io."
    echo ""
    echo "DEBÉS CORRER ESTE COMANDO CON TU TOKEN DE GITHUB:"
    echo "echo 'TU_TOKEN' | docker login ghcr.io -u dgolzman --password-stdin"
    echo ""
    echo "Si no tenés un token, crealo en GitHub Settings > Developer Settings"
    echo "con el permiso 'read:packages'."
    echo "--------------------------------------------------------"
    exit 1
fi

# 7. Inicializar base de datos
echo "💾 Configurando base de datos..."
# Esperar a que el contenedor esté realmente arriba
MAX_RETRIES=5
COUNT=0
until [ $(docker compose ps app --status running | wc -l) -gt 1 ] || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "⏳ Esperando a que el servicio esté listo ($COUNT/$MAX_RETRIES)..."
    sleep 2
    COUNT=$((COUNT + 1))
done

if [ $(docker compose ps app --status running | wc -l) -le 1 ]; then
    echo "❌ ERROR: El contenedor no inició correctamente. Revisá con 'docker compose logs'."
    exit 1
fi

echo "🔄 Ejecutando migraciones y seeding..."
docker compose exec -T app npx prisma@5.22.0 migrate deploy
docker compose exec -T app npx tsx prisma/seed.ts


echo "🎉 ¡Instalación completada con éxito!"
echo "📍 Acceso: http://$IP_ADDR:3000"
echo "🔑 Credenciales: admin@allboys.com / admin123"
