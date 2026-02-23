#!/bin/sh
# ============================================================
# BasketAllBoys - Instalador Interactivo v3.5
# ============================================================
# Manejo robusto de errores y compatibilidad con Alpine/BusyBox.

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"
STEP=0

# ── Helpers ─────────────────────────────────────────────────
step() {
    STEP=$((STEP + 1))
    echo ""
    echo "──────────────────────────────────────────────"
    echo "  Paso $STEP: $1"
    echo "──────────────────────────────────────────────"
}

ok()   { echo "✅ $1"; }
info() { echo "ℹ️  $1"; }
warn() { echo "⚠️  $1"; }

fail() {
    echo ""
    echo "❌ ERROR en Paso $STEP: $1"
    echo ""
    echo "   Para continuar manualmente desde acá, corré:"
    echo "   $2"
    echo ""
    echo "   Luego podés re-ejecutar el instalador o continuar manualmente."
    exit 1
}

ask() {
    printf "👉 %s " "$1" > /dev/tty
    read -r REPLY < /dev/tty
    echo "$REPLY"
}

# ── Inicio ───────────────────────────────────────────────────
echo ""
echo "🏀 ==========================================="
echo "   BasketAllBoys - Instalador v3.5"
echo "============================================="

# ── Paso 1: Autenticación ────────────────────────────────────
step "Autenticación con GitHub (GHCR.io)"
echo "   Necesitamos tu Token de GitHub para descargar la imagen."
echo "   Creálo en: Settings > Developer Settings > Tokens (classic)"
echo "   con el permiso 'read:packages'."
GH_TOKEN=$(ask "Token de GitHub:")

if [ -z "$GH_TOKEN" ]; then
    fail "Token vacío" "Volvé a correr el instalador e ingresá un token válido."
fi

if ! echo "$GH_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin; then
    fail "No se pudo autenticar con GHCR.io" \
         "echo 'TU_TOKEN' | docker login ghcr.io -u dgolzman --password-stdin"
fi
ok "Login exitoso"

# ── Paso 2: Dependencias ─────────────────────────────────────
step "Verificando dependencias del sistema"
if [ -f /etc/alpine-release ] && ! command -v openssl >/dev/null; then
    info "Alpine detectado — instalando openssl..."
    apk add --no-cache openssl || warn "No se pudo instalar openssl, continuando..."
fi
ok "Dependencias OK"

# ── Paso 3: Directorio ───────────────────────────────────────
step "Preparando directorio $APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR" || fail "No se pudo acceder a $APP_DIR" "mkdir -p $APP_DIR && cd $APP_DIR"
ok "Directorio listo"

# ── Paso 4: Instalación existente ───────────────────────────
step "Verificando instalación previa"
DB_FILE="$APP_DIR/data/prod.db"
if [ -f "$DB_FILE" ]; then
    warn "Se encontró una base de datos existente en: $DB_FILE"
    echo ""
    echo "   ¿Qué querés hacer?"
    echo "   [s] Borrar todo y empezar de cero (PERDÉS LOS DATOS)"
    echo "   [n] Mantener la instalación actual y solo actualizar la imagen"
    CONFIRM=$(ask "Opción (s/N):")
    if [ "$CONFIRM" = "s" ] || [ "$CONFIRM" = "S" ]; then
        docker compose down 2>/dev/null || true
        rm -rf "$APP_DIR/data"
        ok "Instalación anterior eliminada."
    else
        info "Manteniendo datos existentes. Solo se actualizará la imagen."
    fi
else
    info "No hay instalación previa. Instalación limpia."
fi

# ── Paso 5: Archivos de configuración ───────────────────────
step "Descargando archivos de configuración"
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml || \
    fail "No se pudo descargar docker-compose.yml" \
         "wget $REPO_RAW/docker-compose.yml -O $APP_DIR/docker-compose.yml"
wget -q "$REPO_RAW/update.sh" -O update.sh || \
    fail "No se pudo descargar update.sh" \
         "wget $REPO_RAW/update.sh -O $APP_DIR/update.sh"
chmod +x update.sh
ok "Archivos descargados"

# ── Paso 6: Entorno (.env) ───────────────────────────────────
step "Configurando entorno (.env)"
if [ ! -f .env ]; then
    AUTH_SECRET=$(openssl rand -base64 32)
    IP_ADDR=$(hostname -i 2>/dev/null | awk '{print $1}')
    if [ -z "$IP_ADDR" ] || [ "$IP_ADDR" = "127.0.0.1" ]; then
        IP_ADDR=$(ip addr show 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n1)
    fi
    [ -z "$IP_ADDR" ] && IP_ADDR="localhost"
    printf "AUTH_SECRET=%s\nNEXTAUTH_URL=http://%s:3000\nAUTH_TRUST_HOST=true\n" "$AUTH_SECRET" "$IP_ADDR" > .env
    ok ".env creado (URL: http://$IP_ADDR:3000)"
else
    IP_ADDR=$(grep NEXTAUTH_URL .env | cut -d= -f2 | sed 's|http://||;s|:3000||')
    info ".env existente conservado (URL: http://$IP_ADDR:3000)"
fi

# ── Paso 7: Permisos de datos ───────────────────────────────
step "Preparando directorio de datos (SQLite)"
mkdir -p data
chmod 777 data
ok "Permisos OK"

# ── Paso 8: Descargar imagen y levantar contenedor ──────────
step "Descargando imagen Docker y levantando el contenedor"
if ! ./update.sh; then
    fail "No se pudo descargar o levantar el contenedor" \
         "cd $APP_DIR && ./update.sh"
fi

# ── Paso 9: Verificar que el contenedor esté corriendo ──────
step "Verificando que el contenedor esté en ejecución"
echo "   Esperando inicialización (10s)..."
sleep 10
MAX=10; COUNT=0
while [ $COUNT -lt $MAX ]; do
    STATUS=$(docker inspect --format='{{.State.Status}}' basket-app 2>/dev/null || echo "not_found")
    [ "$STATUS" = "running" ] && break
    info "Estado actual: $STATUS — reintentando ($((COUNT+1))/$MAX)..."
    sleep 3
    COUNT=$((COUNT + 1))
done

if [ "$STATUS" != "running" ]; then
    echo ""
    echo "   Logs del contenedor:"
    docker compose logs --tail=20 2>/dev/null || true
    fail "El contenedor no está corriendo" \
         "docker compose -f $APP_DIR/docker-compose.yml up -d && docker compose -f $APP_DIR/docker-compose.yml logs"
fi
ok "Contenedor corriendo"

# ── Paso 10: Correr migraciones ─────────────────────────────
step "Ejecutando migraciones de base de datos"
MIGRATE_CMD="docker compose -f $APP_DIR/docker-compose.yml exec app npx prisma@5.22.0 migrate deploy"
if ! docker compose exec -T app npx prisma@5.22.0 migrate deploy; then
    fail "Las migraciones fallaron" "$MIGRATE_CMD"
fi
ok "Migraciones aplicadas"

# ── Paso 11: Seeding ────────────────────────────────────────
step "Creando datos iniciales (admin y categorías)"

# Creamos script JS temporal para contar usuarios
cat << 'EOF' > count_users.js
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { 
    process.stdout.write(String(n)); 
    p.$disconnect(); 
}).catch(e => { 
    process.stderr.write(e.message);
    p.$disconnect(); 
    process.exit(1); 
});
EOF

docker compose cp count_users.js app:/tmp/count_users.js
USER_COUNT=$(docker compose exec -T app node /tmp/count_users.js 2>/dev/null | tr -d '[:space:]' | tr -dc '0-9')
rm count_users.js

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    info "Inicializando datos base..."
    
    cat << 'EOF' > seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
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
    const cid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await prisma.categoryMapping.upsert({ 
        where: { category: cat.category }, 
        update: { ...cat, updatedAt: new Date() }, 
        create: { id: cid, ...cat, updatedAt: new Date() }
    });
  }
}
main()
  .then(() => { prisma.$disconnect(); process.exit(0); })
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
EOF

    docker compose cp seed.js app:/tmp/seed.js
    if docker compose exec -T app node /tmp/seed.js; then
        ok "Datos iniciales creados (admin + categorías)"
    else
        warn "El seed automático falló. El sistema puede estar listo pero sin usuario admin."
    fi
    rm seed.js
else
    info "Ya existen $USER_COUNT usuarios — seed omitido."
fi

# ── Paso 12: Importar backup (opcional) ─────────────────────
step "Importar backup JSON (opcional)"
echo "   Si tenés un archivo de backup (.json), podés restaurarlo ahora."
BACKUP_PATH=$(ask "Ruta del backup (Enter para omitir):")

if [ -n "$BACKUP_PATH" ] && [ -f "$BACKUP_PATH" ]; then
    info "Copiando backup al contenedor..."
    docker compose cp "$BACKUP_PATH" app:/tmp/backup.json
    
    cat << 'EOF' > import_backup.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
  const rawData = fs.readFileSync('/tmp/backup.json','utf8');
  const data = JSON.parse(rawData);
  const entities = Array.isArray(data.exportedEntities) && data.exportedEntities.length > 0
    ? data.exportedEntities
    : ['users','players','coaches','attendance','payments','categoryMappings','auditLogs','dismissedIssues'];
  
  const inc = e => entities.includes(e) && Array.isArray(data[e]) && data[e].length > 0;
  
  await prisma.$transaction(async tx => {
    // Delete in reverse dependency order
    if (inc('dismissedIssues')) await tx.dismissedAuditIssue.deleteMany();
    if (inc('auditLogs')) await tx.auditLog.deleteMany();
    if (inc('attendance')) await tx.attendance.deleteMany();
    if (inc('payments')) await tx.payment.deleteMany();
    if (inc('players')) await tx.player.deleteMany();
    if (inc('coaches')) await tx.coach.deleteMany();
    if (inc('categoryMappings')) await tx.categoryMapping.deleteMany();
    if (inc('users')) await tx.user.deleteMany();

    // Create in dependency order
    if (inc('users')) await tx.user.createMany({ data: data.users });
    if (inc('categoryMappings')) await tx.categoryMapping.createMany({ data: data.categoryMappings });
    if (inc('coaches')) await tx.coach.createMany({ data: data.coaches });
    if (inc('players')) await tx.player.createMany({ data: data.players });
    if (inc('payments')) await tx.payment.createMany({ data: data.payments });
    if (inc('attendance')) await tx.attendance.createMany({ data: data.attendance });
    if (inc('auditLogs')) await tx.auditLog.createMany({ data: data.auditLogs });
    if (inc('dismissedIssues')) await tx.dismissedAuditIssue.createMany({ data: data.dismissedIssues });
  });
  console.log('Entidades restauradas: ' + entities.join(', '));
}
main()
  .then(() => { prisma.$disconnect(); process.exit(0); })
  .catch(e => { console.error('Error al importar:', e); prisma.$disconnect(); process.exit(1); });
EOF

    docker compose cp import_backup.js app:/tmp/import_backup.js
    if docker compose exec -T app node /tmp/import_backup.js; then
        ok "Backup importado exitosamente"
    else
        warn "El backup falló. Podés intentarlo desde la UI en Administración > Backup."
    fi
    rm import_backup.js
elif [ -n "$BACKUP_PATH" ]; then
    warn "Archivo no encontrado: $BACKUP_PATH — Importación omitida."
else
    info "Sin backup. Instalación limpia."
fi

# ── Fin ───────────────────────────────────────────────────────
echo ""
echo "🎉 ============================================="
echo "   ¡Instalación completada con éxito!"
echo "============================================="
echo "   📍 URL:      http://$IP_ADDR:3000"
echo "   🔑 Usuario:  admin@allboys.com"
echo "   🔑 Password: admin123"
echo ""
echo "   💡 Cambiá la contraseña después del primer login."
echo "============================================="
echo ""
