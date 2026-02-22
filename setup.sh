#!/bin/sh
set -e

# Script de instalación inicial para BasketAllBoys en Proxmox LXC
# Optimizado para Alpine Linux y Debian/Ubuntu
echo "🚀 Iniciando instalación de BasketAllBoys..."

# 1. Autenticación Proactiva (Solicitada por el usuario)
echo ""
echo "🔑 Paso 1: Autenticación con GitHub (GHCR.io)"
echo "--------------------------------------------------------"
echo "Para descargar las imágenes privadas, necesitamos tu Token de GitHub."
echo "Si no lo tenés, crealo en Settings > Developer Settings > Tokens (classic)"
echo "con el permiso 'read:packages'."
echo "--------------------------------------------------------"
printf "👉 Ingresá tu Token de GitHub: "
# Leemos desde /dev/tty para que funcione incluso si el script se pipea desde wget
read -r GH_TOKEN < /dev/tty
echo ""

if [ -z "$GH_TOKEN" ]; then
    echo "❌ Error: El token no puede estar vacío."
    exit 1
fi

echo "🔐 Logueando en GitHub Container Registry..."
echo "$GH_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin
echo "--------------------------------------------------------"

# 2. Instalar dependencias si faltan (Alpine)
if [ -f /etc/alpine-release ] && ! command -v openssl >/dev/null; then
    echo "📦 Detectado Alpine Linux. Instalando openssl..."
    apk add --no-cache openssl
fi

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"

# 3. Crear directorio y entrar
echo "📂 Preparando directorio en $APP_DIR..."
mkdir -p "$APP_DIR" && cd "$APP_DIR"

# 4. Descargar archivos de configuración
echo "📥 Descargando archivos desde GitHub..."
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml
wget -q "$REPO_RAW/update.sh" -O update.sh
chmod +x update.sh

# 5. Configurar entorno (.env) si no existe
if [ ! -f .env ]; then
    echo "⚙️  Generando configuración de entorno (.env)..."
    AUTH_SECRET=$(openssl rand -base64 32)
    IP_ADDR=$(hostname -i | awk '{print $1}')
    if [ -z "$IP_ADDR" ] || [ "$IP_ADDR" = "127.0.0.1" ]; then
        IP_ADDR=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n1)
    fi
    [ -z "$IP_ADDR" ] && IP_ADDR="localhost"
    
    echo "AUTH_SECRET=$AUTH_SECRET" > .env
    echo "NEXTAUTH_URL=http://$IP_ADDR:3000" >> .env
    echo "AUTH_TRUST_HOST=true" >> .env
    echo "✅ Archivo .env creado."
else
    echo "ℹ️ El archivo .env ya existe, manteniendo configuración."
fi

# 5. Crear carpeta para la base de datos (persistencia)
echo "📁 Preparando permisos para la base de datos..."
mkdir -p data
# Muy importante: Como Docker corre como usuario 1001 dentro del contenedor, 
# la carpeta de host debe ser escribible.
chmod 777 data

# 6. Descargar imágenes y levantar servicios
echo "🐳 Iniciando descarga de imágenes y contenedores..."
./update.sh

# 7. Inicializar base de datos
echo "💾 Configurando base de datos..."
MAX_RETRIES=5
COUNT=0
until [ $(docker compose ps app --status running | wc -l) -gt 1 ] || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "⏳ Esperando al servicio app ($COUNT/$MAX_RETRIES)..."
    sleep 3
    COUNT=$((COUNT + 1))
done

if [ $(docker compose ps app --status running | wc -l) -le 1 ]; then
    echo "❌ ERROR: El contenedor no inició. Revisá 'docker compose logs'."
    exit 1
fi

echo "🔄 Ejecutando migraciones y seeding..."
docker compose exec -T app npx prisma@5.22.0 migrate deploy
# Usamos node directamente para evitar problemas con tsx en el build standalone
docker compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await prisma.user.upsert({
    where: { email: 'admin@allboys.com' },
    update: {},
    create: { id, email: 'admin@allboys.com', name: 'Administrador', password: hash, role: 'ADMIN', updatedAt: new Date() }
  });
  const cats = [
    { category: 'Mosquitos', minYear: 2018, maxYear: 2030 },
    { category: 'Pre-Mini', minYear: 2016, maxYear: 2017 },
    { category: 'Mini', minYear: 2014, maxYear: 2015 },
    { category: 'U13', minYear: 2013, maxYear: 2013 },
    { category: 'U15', minYear: 2011, maxYear: 2012 },
    { category: 'U17', minYear: 2009, maxYear: 2010 },
    { category: 'U19', minYear: 2007, maxYear: 2008 },
    { category: 'Primera', minYear: 1950, maxYear: 2006 },
  ];
  for (const cat of cats) {
    const cid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await prisma.categoryMapping.upsert({ where: { category: cat.category }, update: { ...cat, updatedAt: new Date() }, create: { id: cid, ...cat, updatedAt: new Date() } });
  }
  console.log('✅ Base de datos inicializada: admin y categorías creadas');
  await prisma.\$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
"

echo ""
echo "🎉 ¡Instalación completada con éxito!"
echo "📍 Dirección: http://$(grep NEXTAUTH_URL .env | cut -d= -f2 | cut -d: -f2 | tr -d /):3000"
echo "🔑 Usuario admin: admin@allboys.com / admin123"
