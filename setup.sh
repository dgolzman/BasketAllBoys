#!/bin/sh
# ============================================================
# BasketAllBoys - Instalador Interactivo v3.8
# ============================================================
# Incluye resumen de warnings al final y fixes de módulos.

APP_DIR="/opt/basket-app"
REPO_RAW="https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main"
STEP=0
WARNINGS=""

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

warn() { 
    echo "⚠️  $1"
    WARNINGS="$WARNINGS\n  - Paso $STEP: $1"
}

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
echo "   BasketAllBoys - Instalador v3.8"
echo "============================================="

# ── Paso 1: Autenticación ────────────────────────────────────
step "Autenticación con GitHub (GHCR.io)"
echo "   Necesitamos tu Token de GitHub para descargar la imagen."
GH_TOKEN=$(ask "Token de GitHub:")

if [ -z "$GH_TOKEN" ]; then
    fail "Token vacío" "Volvé a correr el instalador e ingresá un token válido."
fi

if ! echo "$GH_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin; then
    fail "No se pudo autenticar con GHCR.io" \
         "echo 'TU_TOKEN' | docker login ghcr.io -u dgolzman --password-stdin"
fi
ok "Login exitoso"

# Guardar token para actualizaciones desde la web
echo "   ¿Querés guardar este token en el .env para permitir actualizaciones desde el panel web?"
SAVE_TOKEN=$(ask "Guardar token (s/N):")
if [ "$SAVE_TOKEN" = "s" ] || [ "$SAVE_TOKEN" = "S" ]; then
    if [ -f .env ]; then
        sed -i '/GHCR_TOKEN=/d' .env
        echo "GHCR_TOKEN=$GH_TOKEN" >> .env
        ok "Token guardado en .env (GHCR_TOKEN)"
    else
        # Si no existe .env todavía (se crea en el paso 6), lo creamos con el token
        echo "GHCR_TOKEN=$GH_TOKEN" > .env
        ok "Token guardado en .env inicial"
    fi
fi

# ── Paso 2: Dependencias ─────────────────────────────────────
step "Verificando dependencias del sistema"
if [ -f /etc/alpine-release ] && ! command -v openssl >/dev/null; then
    info "Alpine detectado — instalando openssl..."
    apk add --no-cache openssl < /dev/null || warn "No se pudo instalar openssl."
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
    warn "Se encontró una base de datos existente."
    echo "   ¿Querés [s] Borrar todo o [n] Solo actualizar e intentar login?"
    CONFIRM=$(ask "Opción (s/N):")
    if [ "$CONFIRM" = "s" ] || [ "$CONFIRM" = "S" ]; then
        docker compose down < /dev/null || true
        rm -rf "$APP_DIR/data"
        ok "Instalación anterior eliminada."
    else
        info "Manteniendo datos existentes."
    fi
else
    info "Instalación limpia."
fi

# ── Paso 5: Archivos de configuración ───────────────────────
step "Descargando archivos de configuración"
wget -q "$REPO_RAW/docker-compose.yml" -O docker-compose.yml || fail "Error bajando docker-compose"
wget -q "$REPO_RAW/update.sh" -O update.sh || fail "Error bajando update.sh"
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
    
    echo "   Si usás un Proxy Reverso (como Zoraxy, Nginx) ingresá la URL final externa (ej: https://basket.allboys.com)."
    echo "   Si es local o prueba directa, podés dejarlo vacío para usar la IP por defecto ($IP_ADDR)."
    USER_DOMAIN=$(ask "URL Pública (Enter para IP local):")

    if [ -z "$USER_DOMAIN" ]; then
         APP_URL="http://$IP_ADDR:3000"
    else
         APP_URL="$USER_DOMAIN"
    fi

    printf "AUTH_SECRET=%s\nNEXTAUTH_URL=%s\nAUTH_URL=%s\nAUTH_TRUST_HOST=true\n" "$AUTH_SECRET" "$APP_URL" "$APP_URL" > .env
    ok ".env creado con URL: $APP_URL"
else
    info ".env existente conservado. Si tenés problemas de redirección, asegurate de tener AUTH_URL y NEXTAUTH_URL definidos."
fi

# ── Paso 7: Configuración SMTP (Opcional) ────────────────────
step "Configuración de Email (SMTP)"
echo "   Esto es necesario para el Resumen de Auditoría y alertas."
if grep -q "SMTP_HOST" .env; then
    info "Configuración SMTP ya existe en .env."
    CONFIRM_SMTP=$(ask "¿Desea reconfigurar el servidor de Email? (s/N):")
else
    CONFIRM_SMTP="s"
fi

if [ "$CONFIRM_SMTP" = "s" ] || [ "$CONFIRM_SMTP" = "S" ]; then
    SMTP_HOST=$(ask "Servidor SMTP (ej: smtp.gmail.com o relay.local):")
    if [ -n "$SMTP_HOST" ]; then
        SMTP_PORT=$(ask "Puerto SMTP (ej: 587, 465, 25):")
        SMTP_SECURE=$(ask "¿Usar TLS/SSL? (s/N):")
        [ "$SMTP_SECURE" = "s" ] || [ "$SMTP_SECURE" = "S" ] && SMTP_SECURE="true" || SMTP_SECURE="false"
        
        SMTP_AUTH=$(ask "¿Requiere Autenticación (User/Pass)? (s/N):")
        if [ "$SMTP_AUTH" = "s" ] || [ "$SMTP_AUTH" = "S" ]; then
            SMTP_USER=$(ask "Usuario SMTP:")
            SMTP_PASS=$(ask "Contraseña SMTP:")
        fi
        SMTP_FROM=$(ask "Email de origen (ej: Basket AllBoys <noreply@tudominio.com>):")

        # Limpiar variables SMTP viejas si existen
        sed -i '/SMTP_/d' .env
        
        {
          echo "SMTP_HOST=$SMTP_HOST"
          echo "SMTP_PORT=$SMTP_PORT"
          echo "SMTP_SECURE=$SMTP_SECURE"
          [ -n "$SMTP_USER" ] && echo "SMTP_USER=$SMTP_USER"
          [ -n "$SMTP_PASS" ] && echo "SMTP_PASS=$SMTP_PASS"
          echo "SMTP_FROM=$SMTP_FROM"
        } >> .env
        ok "Configuración SMTP guardada."
    else
        info "Configuración SMTP omitida."
    fi
fi

# ── Paso 8: Directorio de datos y permisos ───────────────────
step "Preparando directorio de datos"
mkdir -p data
chmod 777 data
ok "Permisos OK"

# ── Paso 9: Descargar imagen y levantar contenedor ──────────
step "Descargando imagen Docker y levantando el contenedor"
if ! ./update.sh < /dev/null; then
    fail "Fallo al levantar el contenedor" "./update.sh"
fi

# ── Paso 10: Verificar que el contenedor esté corriendo ─────
step "Verificando ejecución"
sleep 5
MAX=10; COUNT=0
while [ $COUNT -lt $MAX ]; do
    STATUS=$(docker inspect --format='{{.State.Status}}' basket-app 2>/dev/null || echo "not_found")
    [ "$STATUS" = "running" ] && break
    sleep 3
    COUNT=$((COUNT + 1))
done

if [ "$STATUS" != "running" ]; then
    fail "El contenedor no está corriendo" "docker compose logs"
fi
ok "Contenedor corriendo"

# ── Paso 11: Validar Conexión SMTP ──────────────────────────
if grep -q "SMTP_HOST" .env; then
    step "Validando conexión SMTP de salida"
    cat << 'EOF_SMTP_TEST' > smtp_test.js
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    ...(process.env.SMTP_USER && { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
});
transporter.verify((error, success) => {
    if (error) { console.error('FAILED:' + error.message); process.exit(1); }
    else { console.log('OK'); process.exit(0); }
});
EOF_SMTP_TEST
    docker compose cp smtp_test.js app:/app/smtp_test.js < /dev/null
    if docker compose exec -T app node smtp_test.js < /dev/null; then
        ok "Conexión SMTP validada con éxito."
    else
        warn "La conexión SMTP falló. Revisa tus credenciales o el firewall del servidor."
    fi
    rm smtp_test.js
fi

# ── Paso 12: Correr migraciones ─────────────────────────────
step "Ejecutando migraciones"
if ! docker compose exec -T app npx prisma@5.22.0 migrate deploy < /dev/null; then
    fail "Fallo en migraciones" "docker compose exec app npx prisma migrate deploy"
fi
ok "Migraciones aplicadas"

# ── Paso 13: Seeding y datos iniciales ──────────────────────
step "Creando datos iniciales y reseteando admin"

cat << 'EOF_JS_SEED_V38' > seed_robust.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await prisma.user.upsert({ 
    where: { email: 'admin@allboys.com' }, 
    update: { password: hash, role: 'ADMIN' }, 
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
main().then(() => { prisma.$disconnect(); process.exit(0); }).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
EOF_JS_SEED_V38

docker compose cp seed_robust.js app:/app/seed_robust.js < /dev/null
if docker compose exec -T app node seed_robust.js < /dev/null; then
    ok "Datos base y admin reseteados."
else
    warn "No se pudo resetear el admin (posible error de módulos)."
fi
rm seed_robust.js

# ── Paso 14: Importar backup ────────────────────────────────
step "Importar backup JSON (opcional)"
BACKUP_PATH=$(ask "Ruta del backup (Enter para omitir):")

if [ -n "$BACKUP_PATH" ] && [ -f "$BACKUP_PATH" ]; then
    info "Importando backup..."
    docker compose cp "$BACKUP_PATH" app:/app/backup.json < /dev/null
    cat << 'EOF_JS_IMPORT_V38' > import_robust.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
  const data = JSON.parse(fs.readFileSync('/app/backup.json','utf8'));
  const entities = Array.isArray(data.exportedEntities) && data.exportedEntities.length > 0 ? data.exportedEntities : ['users','players','coaches','attendance','payments','categoryMappings','auditLogs','dismissedIssues'];
  const inc = e => entities.includes(e) && Array.isArray(data[e]) && data[e].length > 0;
  await prisma.$transaction(async tx => {
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
}
main().then(() => { prisma.$disconnect(); process.exit(0); }).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
EOF_JS_IMPORT_V38
    docker compose cp import_robust.js app:/app/import_robust.js < /dev/null
    if docker compose exec -T app node import_robust.js < /dev/null; then
        ok "Backup importado."
    else
        warn "Error importando backup."
    fi
    rm import_robust.js
fi

# ── Fin ───────────────────────────────────────────────────────
echo ""
echo "🎉 ¡Instalación completada con éxito!"
echo "📍 URL Configurada: $(grep NEXTAUTH_URL .env | cut -d= -f2-)"
echo "🔑 admin@allboys.com / admin123"

if [ -n "$WARNINGS" ]; then
    echo ""
    echo "⚠️  ATENCIÓN — Hubo advertencias durante la instalación:"
    printf "$WARNINGS\n"
    echo ""
    echo "   Se recomienda revisar los logs con: docker compose logs app"
fi
echo ""
echo "============================================="
