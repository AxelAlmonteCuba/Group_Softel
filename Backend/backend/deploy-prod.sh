#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue SOLO PARA PRODUCCIÓN (Backend-Prod)
# ==============================================================================
set -e

echo "🚀 [1/4] Iniciando despliegue de PRODUCCIÓN en VPS..."

cd /opt/softel

if [ ! -f .env ]; then
  echo "❌ Error: El archivo /opt/softel/.env no existe."
  exit 1
fi

echo "📦 [2/4] Construyendo imagen de producción..."
# Construye específicamente el servicio backend-prod sin tocar backend-dev
docker compose build backend-prod

echo "🔄 [3/4] Levantando contenedor de producción..."
# Levanta específicamente backend-prod.
docker compose up -d --no-deps backend-prod

echo "⏳ Esperando 10 segundos a que el servicio estabilice el Healthcheck..."
sleep 10

echo "🔍 [4/4] Verificando estado del servicio de producción..."
docker compose ps backend-prod

echo "======================================================================"
echo "✅ Despliegue de PRODUCCIÓN completado con éxito."
echo "Producción: https://api.g-softel.com/api/v1/health"
echo "======================================================================"
