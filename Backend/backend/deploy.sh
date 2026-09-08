#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue y Actualización para Softel en VPS Contabo
# ==============================================================================
set -e

echo "🚀 [1/4] Iniciando despliegue de Softel en VPS..."

# Asegurar que estamos en el directorio de la aplicación
cd /opt/softel

# Verificar que exista el archivo .env
if [ ! -f .env ]; then
  echo "❌ Error: El archivo /opt/softel/.env no existe. Créalo antes de continuar."
  exit 1
fi

echo "📦 [2/4] Construyendo imágenes de producción con Docker Compose..."
docker compose build

echo "🔄 [3/4] Levantando contenedores (Caddy, MySQL, Backend-Prod, Backend-Dev)..."
docker compose up -d --remove-orphans

echo "⏳ Esperando 10 segundos a que los servicios estabilicen el Healthcheck..."
sleep 10

echo "🔍 [4/4] Verificando estado de los servicios..."
docker compose ps

echo "======================================================================"
echo "✅ Despliegue completado con éxito."
echo "Producción: https://api.g-softel.com/api/v1/health"
echo "Pruebas:    https://api.g-softel.com:8443/api/v1/health"
echo "======================================================================"
