#!/bin/sh
set -e


# Script para actualizar la aplicación BasketAllBoys
echo "🚀 Iniciando actualización manual..."

# 1. Bajar la última versión de la imagen
echo "📦 Descargando última versión desde GitHub..."
docker compose pull

# 2. Reiniciar el contenedor
echo "🔄 Reiniciando servicios..."
docker compose up -d --remove-orphans

# 3. Limpiar imágenes viejas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ ¡Actualización completada con éxito!"
