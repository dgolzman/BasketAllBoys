#!/bin/sh
set -e

# Script de instalación inicial para BasketAllBoys en Proxmox LXC (Alpine/Debian)
echo "🚀 Iniciando instalación de BasketAllBoys..."

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"

# 1. Crear directorio y entrar
echo "📂 Preparando directorio en $APP_DIR..."
mkdir -p "$APP_DIR" && cd "$APP_DIR"

# 2. Descargar archivos base de GitHub
echo "📥 Descargando archivos de configuración..."
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml
wget -q "$REPO_RAW/update.sh" -O update.sh
chmod +x update.sh

# 3. Configurar entorno (.env) si no existe
if [ ! -f .env ]; then
    echo "🔐 Generando archivo de configuración inicial (.env)..."
    echo "AUTH_SECRET=$(openssl rand -base64 32)" > .env
    
    # Intentar obtener la IP local
    IP_ADDR=$(hostname -I | awk '{print $1}')
    if [ -z "$IP_ADDR" ]; then
        IP_ADDR="localhost"
    fi
    
    echo "NEXTAUTH_URL=http://$IP_ADDR:3000" >> .env
    echo "AUTH_TRUST_HOST=true" >> .env
    echo "✅ Archivo .env creado con URL: http://$IP_ADDR:3000"
else
    echo "ℹ️ El archivo .env ya existe, saltando configuración inicial."
fi

# 4. Crear carpeta para la base de datos (persistencia)
mkdir -p data

# 5. Ejecutar despliegue inicial (pull y up)
echo "🐳 Levantando contenedores (esto puede demorar)..."
./update.sh

# 6. Inicializar base de datos
echo "💾 Ejecutando migraciones y carga de datos iniciales..."
docker compose exec -T app npx prisma@5.22.0 migrate deploy
docker compose exec -T app npx tsx prisma/seed.ts

echo "🎉 ¡Instalación completada con éxito!"
echo "📍 Podés acceder en: http://$IP_ADDR:3000"
echo "🔑 Credenciales por defecto: admin@allboys.com / admin123"
