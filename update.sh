#!/bin/sh
set -e


# Script para actualizar la aplicación BasketAllBoys
echo "🚀 Iniciando actualización manual..."

# --- Autoupdate del propio script ---
if [ "$1" != "--no-self-update" ]; then
    echo "🔄 Buscando actualizaciones del script de gestión..."
    if wget -q -O update.sh.tmp https://raw.githubusercontent.com/dgolzman/BasketAllBoys/main/update.sh; then
        if ! cmp -s update.sh update.sh.tmp; then
            echo "✨ Nueva versión del script detectada. Actualizando..."
            mv update.sh.tmp update.sh
            chmod +x update.sh
            echo "✅ Script actualizado. Reiniciando proceso..."
            exec ./update.sh --no-self-update "$@"
        fi
    fi
    rm -f update.sh.tmp
fi

# Selección de versión
DEFAULT_VERSION="main"

# Intento detectar el último tag si git está instalado
if command -v git >/dev/null 2>&1; then
    LATEST_TAG=$(git ls-remote --tags --sort="v:refname" https://github.com/dgolzman/BasketAllBoys.git | tail -n1 | sed 's/.*\///')
    if [ -n "$LATEST_TAG" ]; then
        DEFAULT_VERSION="$LATEST_TAG"
    fi
fi

if [ -z "$VERSION" ]; then
    printf "📦 Ingresá la versión a descargar (default: $DEFAULT_VERSION): "
    if [ -t 0 ]; then
        read VERSION_INPUT
    else
        VERSION_INPUT=""
    fi

    if [ -z "$VERSION_INPUT" ]; then
        export VERSION="$DEFAULT_VERSION"
    else
        export VERSION="$VERSION_INPUT"
    fi
fi

# Configuración SMTP (Proactiva - Solo en Terminal)
if [ -f .env ] && [ -t 0 ]; then
    if ! grep -q "SMTP_HOST" .env || [ "$1" = "--reconfig-smtp" ]; then
        if ! grep -q "SMTP_HOST" .env; then
            echo "⚠️  No se detectó configuración SMTP. Es necesaria para los reportes de auditoría."
            CONFIRM_SMTP="s"
        else
            echo "🔧 Modo RECONFIGURACIÓN SMTP detectado..."
            printf "¿Desea reconfigurar el servidor de Email? (s/N): " > /dev/tty
            read -r REPLY < /dev/tty
            CONFIRM_SMTP="$REPLY"
        fi

        if [ "$CONFIRM_SMTP" = "s" ] || [ "$CONFIRM_SMTP" = "S" ]; then
            printf "Servidor SMTP (ej: smtp.gmail.com): " > /dev/tty
            read -r REPLY < /dev/tty
            SMTP_HOST="$REPLY"
            
            if [ -n "$SMTP_HOST" ]; then
                printf "Puerto SMTP (ej: 587): " > /dev/tty
                read -r REPLY < /dev/tty
                SMTP_PORT="$REPLY"
                
                printf "¿Usar TLS/SSL? (s/N): " > /dev/tty
                read -r REPLY < /dev/tty
                [ "$REPLY" = "s" ] || [ "$REPLY" = "S" ] && SMTP_SECURE="true" || SMTP_SECURE="false"
                
                printf "¿Requiere Autenticación? (s/N): " > /dev/tty
                read -r REPLY < /dev/tty
                if [ "$REPLY" = "s" ] || [ "$REPLY" = "S" ]; then
                    printf "Usuario SMTP: " > /dev/tty
                    read -r REPLY < /dev/tty
                    SMTP_USER="$REPLY"
                    printf "Contraseña SMTP: " > /dev/tty
                    read -r REPLY < /dev/tty
                    SMTP_PASS="$REPLY"
                fi
                printf "Email de origen: " > /dev/tty
                read -r REPLY < /dev/tty
                SMTP_FROM="$REPLY"

                sed -i '/SMTP_/d' .env
                {
                  echo "SMTP_HOST=$SMTP_HOST"
                  echo "SMTP_PORT=$SMTP_PORT"
                  echo "SMTP_SECURE=$SMTP_SECURE"
                  [ -n "$SMTP_USER" ] && echo "SMTP_USER=$SMTP_USER"
                  [ -n "$SMTP_PASS" ] && echo "SMTP_PASS=$SMTP_PASS"
                  echo "SMTP_FROM=$SMTP_FROM"
                } >> .env
                echo "✅ Configuración SMTP guardada en .env"
            fi
        fi
    else
        echo "ℹ️  SMTP ya configurado. (Usá --reconfig-smtp si necesitás cambiarlo)"
    fi
fi

# 0. Automating infrastructure changes (Fix for Web-Update)
if [ -f docker-compose.yml ]; then
    echo "🔧 Verificando configuración de infraestructura..."
    
    # Check if docker.sock is mounted
    if ! grep -q "docker.sock" docker-compose.yml; then
        echo "➕ Agregando montura de docker.sock..."
        sed -i '/volumes:/a \      - /var/run/docker.sock:/var/run/docker.sock' docker-compose.yml
    fi

    # Check if project-root is mounted
    if ! grep -q "project-root" docker-compose.yml; then
        echo "➕ Agregando montura de raíz del proyecto..."
        sed -i '/volumes:/a \      - ./:/app/project-root' docker-compose.yml
    fi

    # Check for PROJECT_ROOT env
    if ! grep -q "PROJECT_ROOT" docker-compose.yml; then
        echo "➕ Agregando variable PROJECT_ROOT..."
        sed -i '/environment:/a \      - PROJECT_ROOT=/app/project-root' docker-compose.yml
    fi
fi

# 0.5 Persistir versión en .env
if [ -f .env ]; then
    echo "📝 Guardando versión $VERSION en .env..."
    sed -i "/VERSION=/d" .env
    echo "VERSION=$VERSION" >> .env
fi

# 0.7 Detectar comando de docker-compose
if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ Error: No se encontró 'docker compose' ni 'docker-compose'."
    exit 1
fi

echo "📥 Usando versión: $VERSION (Comando: $DOCKER_CMD)"

# 1. Autenticación y Descarga
# Si existe GHCR_TOKEN en el ambiente o en .env, nos logueamos
if [ -f .env ]; then
    # Cargamos variables de .env sin exportar todo para evitar colisiones
    GHCR_TOKEN_ENV=$(grep "^GHCR_TOKEN=" .env | cut -d= -f2-)
    [ -n "$GHCR_TOKEN_ENV" ] && export GHCR_TOKEN="$GHCR_TOKEN_ENV"
fi

# Si falta el token y estamos en una terminal interactiva, lo pedimos
if [ -z "$GHCR_TOKEN" ] && [ -t 0 ]; then
    echo "🔑 GitHub Token no detectado. Es necesario para descargar imágenes privadas."
    printf "👉 Ingresá tu Token de GitHub: " > /dev/tty
    read -r GH_TOKEN_INPUT < /dev/tty
    if [ -n "$GH_TOKEN_INPUT" ]; then
        export GHCR_TOKEN="$GH_TOKEN_INPUT"
        # Preguntar si desea guardarlo
        printf "¿Desea guardar este token en .env para futuras actualizaciones (incluyendo desde la web)? (s/N): " > /dev/tty
        read -r SAVE_CONFIRM < /dev/tty
        if [ "$SAVE_CONFIRM" = "s" ] || [ "$SAVE_CONFIRM" = "S" ]; then
            if [ -f .env ]; then
                sed -i '/GHCR_TOKEN=/d' .env
                echo "GHCR_TOKEN=$GHCR_TOKEN" >> .env
                echo "✅ Token guardado en .env"
            fi
        fi
    fi
fi

if [ -n "$GHCR_TOKEN" ]; then
    echo "🔑 Autenticando con GitHub Container Registry..."
    echo "$GHCR_TOKEN" | docker login ghcr.io -u dgolzman --password-stdin > /dev/null 2>&1 || echo "⚠️ Error de login, intentando pull sin auth..."
fi

echo "📦 Descargando imagen desde GitHub (Tag: $VERSION)..."
$DOCKER_CMD pull

# 2. Reiniciar el contenedor
echo "🔄 Reiniciando servicios con versión $VERSION..."
# Fix para conflictos de nombre entre proyectos (Web vs Consola)
# Si existe un contenedor 'basket-app' pero no pertenece a esta composición, hay que volarlo.
CONFLICT_CID=$(docker ps -aq --filter name=^/basket-app$ 2>/dev/null || docker ps -aq --filter name=^basket-app$ | head -n 1)
if [ -n "$CONFLICT_CID" ]; then
    # Verificamos si pertenece a este proyecto actual (basket-allboys)
    IS_OURS=$(docker inspect --format '{{ index .Config.Labels "com.docker.compose.project" }}' "$CONFLICT_CID" 2>/dev/null || echo "unknown")
    if [ "$IS_OURS" != "basket-allboys" ]; then
        echo "⚠️  Detectado contenedor 'basket-app' de otro proyecto ($IS_OURS). Limpiando..."
        docker rm -f "$CONFLICT_CID" >/dev/null 2>&1 || true
    fi
fi
$DOCKER_CMD up -d --remove-orphans

# 3. Aplicar migraciones con espera proactiva
echo "🚀 Preparando base de datos..."
# Esperar a que el contenedor esté 'running' (max 30s)
RETRIES=10
while [ $RETRIES -gt 0 ]; do
    STATUS=$(docker inspect -f '{{.State.Status}}' basket-app 2>/dev/null || echo "notfound")
    if [ "$STATUS" = "running" ]; then
        break
    fi
    echo "⏳ Esperando a que el sistema inicie ($STATUS)..."
    sleep 3
    RETRIES=$((RETRIES-1))
done

# Fijamos la versión de prisma a la del proyecto (5.22.0) para evitar que npx baje la v7 (breaking change)
$DOCKER_CMD exec -T app npx prisma@5.22.0 migrate deploy || echo "⚠️  No se pudieron aplicar las migraciones automáticamente."

# 4. Limpiar imágenes viejas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Actualización a $VERSION completada con éxito!"
