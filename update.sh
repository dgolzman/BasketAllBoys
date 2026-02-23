#!/bin/sh
set -e


# Script para actualizar la aplicación BasketAllBoys
echo "🚀 Iniciando actualización manual..."

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
