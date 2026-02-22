#!/bin/sh
set -e

# ============================================================
# Script de instalación inicial para BasketAllBoys
# Optimizado para Alpine Linux y Debian/Ubuntu
# ============================================================
echo ""
echo "🏀 ==========================================="
echo "   BasketAllBoys - Instalador v3.3"
echo "============================================="
echo ""

# 1. Autenticación con GitHub
echo "🔑 Paso 1: Autenticación con GitHub (GHCR.io)"
echo "--------------------------------------------------------"
echo "Necesitamos tu Token de GitHub para descargar la imagen."
echo "Creálo en: Settings > Developer Settings > Tokens (classic)"
echo "con el permiso 'read:packages'."
echo "--------------------------------------------------------"
printf "👉 Ingresá tu Token de GitHub: "
read -r GH_TOKEN < /dev/tty
echo ""

if [ -z "$GH_TOKEN" ]; then
    echo "❌ Error: El token no puede estar vacío."
    exit 1
fi

echo "🔐 Logueando en GitHub Container Registry..."
echo "$GH_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin
echo "✅ Login exitoso"
echo ""

# 2. Instalar dependencias si faltan (Alpine)
if [ -f /etc/alpine-release ] && ! command -v openssl >/dev/null; then
    echo "📦 Detectado Alpine Linux. Instalando openssl..."
    apk add --no-cache openssl
fi

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"

# 3. Crear directorio
echo "📂 Preparando directorio en $APP_DIR..."
mkdir -p "$APP_DIR" && cd "$APP_DIR"

# 4. Verificar si ya existe una instalación previa
DB_FILE="$APP_DIR/data/prod.db"
if [ -f "$DB_FILE" ]; then
    echo ""
    echo "⚠️  ¡ATENCIÓN! Se encontró una instalación existente."
    echo "   Base de datos: $DB_FILE"
    echo ""
    echo "   Si borrás la instalación, perderás TODOS los datos."
    printf "   ¿Querés borrar la instalación anterior y empezar de cero? (s/N): "
    read -r CONFIRM_RESET < /dev/tty
    echo ""
    if [ "$CONFIRM_RESET" = "s" ] || [ "$CONFIRM_RESET" = "S" ]; then
        echo "🗑️  Borrando instalación anterior..."
        docker compose down 2>/dev/null || true
        rm -rf "$APP_DIR/data"
        echo "✅ Instalación anterior borrada."
    else
        echo "ℹ️  Manteniendo instalación existente. Se actualizará la imagen."
    fi
    echo ""
fi

# 5. Descargar archivos de configuración
echo "📥 Descargando archivos desde GitHub..."
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml
wget -q "$REPO_RAW/update.sh" -O update.sh
chmod +x update.sh

# 6. Configurar entorno (.env)
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
    echo "✅ Archivo .env creado (URL: http://$IP_ADDR:3000)"
else
    IP_ADDR=$(grep NEXTAUTH_URL .env | cut -d= -f2 | sed 's|http://||' | cut -d: -f1)
    echo "ℹ️  Usando configuración .env existente."
fi

# 7. Preparar directorio de datos con permisos correctos
mkdir -p data
chmod 777 data

# 8. Descargar imagen y levantar contenedor
echo ""
echo "🐳 Descargando imagen y levantando contenedor..."
./update.sh

# 9. Esperar a que el servicio esté listo
echo "⏳ Esperando que el servicio esté listo..."
MAX_RETRIES=10
COUNT=0
until docker compose ps app --status running 2>/dev/null | grep -q "running" || [ $COUNT -eq $MAX_RETRIES ]; do
    sleep 2
    COUNT=$((COUNT + 1))
done

if ! docker compose ps app --status running 2>/dev/null | grep -q "running"; then
    echo "❌ ERROR: El contenedor no inició correctamente."
    echo "   Revisá los logs con: docker compose logs"
    exit 1
fi

# 10. Correr migraciones
echo ""
echo "💾 Ejecutando migraciones de base de datos..."
docker compose exec -T app npx prisma@5.22.0 migrate deploy

# 11. Seeding inicial (solo si no hay datos)
USER_COUNT=$(docker compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { console.log(n); p.\$disconnect(); });
" 2>/dev/null | tail -1)

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "🌱 Inicializando datos base (admin y categorías)..."
    docker compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await prisma.user.upsert({ where: { email: 'admin@allboys.com' }, update: {}, create: { id, email: 'admin@allboys.com', name: 'Administrador', password: hash, role: 'ADMIN', updatedAt: new Date() }});
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
    const cid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await prisma.categoryMapping.upsert({ where: { category: cat.category }, update: { ...cat, updatedAt: new Date() }, create: { id: cid, ...cat, updatedAt: new Date() }});
  }
  console.log('✅ Datos base creados');
  await prisma.\$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
"
else
    echo "ℹ️  Ya existen usuarios en la base de datos, saltando seed inicial."
fi

# 12. Preguntar si importar backup JSON
echo ""
echo "📦 ¿Tenés un backup JSON para importar?"
printf "   Ingresá la ruta del archivo (o Enter para omitir): "
read -r BACKUP_PATH < /dev/tty
echo ""

if [ -n "$BACKUP_PATH" ] && [ -f "$BACKUP_PATH" ]; then
    echo "📂 Copiando backup al contenedor..."
    docker compose cp "$BACKUP_PATH" app:/tmp/backup.json
    echo "🔄 Importando datos desde el backup..."
    docker compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
  const raw = fs.readFileSync('/tmp/backup.json', 'utf8');
  const data = JSON.parse(raw);
  const isPartial = Array.isArray(data.exportedEntities) && data.exportedEntities.length > 0;
  const entities = isPartial ? data.exportedEntities : ['users','players','coaches','attendance','payments','categoryMappings','auditLogs','dismissedIssues'];
  const inc = (e) => entities.includes(e) && Array.isArray(data[e]) && data[e].length > 0;
  await prisma.\$transaction(async (tx) => {
    if (inc('dismissedIssues')) await tx.dismissedAuditIssue.deleteMany();
    if (inc('auditLogs')) await tx.auditLog.deleteMany();
    if (inc('attendance')) await tx.attendance.deleteMany();
    if (inc('payments')) await tx.payment.deleteMany();
    if (inc('players')) await tx.player.deleteMany();
    if (inc('coaches')) await tx.coach.deleteMany();
    if (inc('categoryMappings')) await tx.categoryMapping.deleteMany();
    if (inc('users')) await tx.user.deleteMany();
    if (inc('users')) await tx.user.createMany({ data: data.users });
    if (inc('categoryMappings')) await tx.categoryMapping.createMany({ data: data.categoryMappings });
    if (inc('coaches')) await tx.coach.createMany({ data: data.coaches });
    if (inc('players')) await tx.player.createMany({ data: data.players });
    if (inc('payments')) await tx.payment.createMany({ data: data.payments });
    if (inc('attendance')) await tx.attendance.createMany({ data: data.attendance });
    if (inc('auditLogs')) await tx.auditLog.createMany({ data: data.auditLogs });
    if (inc('dismissedIssues')) await tx.dismissedAuditIssue.createMany({ data: data.dismissedIssues });
  });
  console.log('✅ Backup importado exitosamente. Entidades: ' + entities.join(', '));
  await prisma.\$disconnect();
}
main().catch(e => { console.error('❌ Error al importar:', e.message); process.exit(1); });
"
elif [ -n "$BACKUP_PATH" ]; then
    echo "⚠️  No se encontró el archivo: $BACKUP_PATH — Saltando importación."
fi

echo ""
echo "🎉 ============================================="
echo "   ¡Instalación completada con éxito!"
echo "============================================="
echo "📍 URL:      http://$IP_ADDR:3000"
echo "🔑 Usuario:  admin@allboys.com"
echo "🔑 Password: admin123"
echo ""
echo "  (Cambiá la contraseña después del primer login)"
echo "============================================="
echo ""
