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

printf "📦 Ingresá la versión a descargar (default: $DEFAULT_VERSION): "
read VERSION_INPUT

if [ -z "$VERSION_INPUT" ]; then
    export VERSION="$DEFAULT_VERSION"
else
    export VERSION="$VERSION_INPUT"
fi

# Configuración SMTP (Proactiva)
if [ -f .env ]; then
    if ! grep -q "SMTP_HOST" .env || [ "$1" = "--reconfig-smtp" ]; then
        if ! grep -q "SMTP_HOST" .env; then
            echo "⚠️  No se detectó configuración SMTP. Es necesaria para los reportes de auditoría."
            CONFIRM_SMTP="s"
        else
            echo "🔧 Modo RECONFIGURACIÓN SMTP detectado..."
            CONFIRM_SMTP=$(printf "¿Desea reconfigurar el servidor de Email? (s/N): " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
        fi

        if [ "$CONFIRM_SMTP" = "s" ] || [ "$CONFIRM_SMTP" = "S" ]; then
            SMTP_HOST=$(printf "Servidor SMTP (ej: smtp.gmail.com): " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
            if [ -n "$SMTP_HOST" ]; then
                SMTP_PORT=$(printf "Puerto SMTP (ej: 587): " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
                SMTP_SECURE=$(printf "¿Usar TLS/SSL? (s/N): " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
                [ "$SMTP_SECURE" = "s" ] || [ "$SMTP_SECURE" = "S" ] && SMTP_SECURE="true" || SMTP_SECURE="false"
                
                SMTP_AUTH=$(printf "¿Requiere Autenticación? (s/N): " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
                if [ "$SMTP_AUTH" = "s" ] || [ "$SMTP_AUTH" = "S" ]; then
                    SMTP_USER=$(printf "Usuario SMTP: " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
                    SMTP_PASS=$(printf "Contraseña SMTP: " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")
                fi
                SMTP_FROM=$(printf "Email de origen: " > /dev/tty; read -r REPLY < /dev/tty; echo "$REPLY")

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

echo "📥 Usando versión: $VERSION"

# 1. Bajar la versión seleccionada
echo "📦 Descargando imagen desde GitHub (Tag: $VERSION)..."
docker compose pull

# 2. Reiniciar el contenedor
echo "🔄 Reiniciando servicios con versión $VERSION..."
docker compose up -d --remove-orphans

# 3. Limpiar imágenes viejas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Actualización a $VERSION completada con éxito!"
