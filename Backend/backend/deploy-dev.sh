#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue SOLO PARA DESARROLLO (Backend-Dev)
# ==============================================================================
set -e

echo "🚀 [1/4] Iniciando despliegue de DESARROLLO en VPS..."

cd /opt/softel

if [ ! -f .env ]; then
  echo "❌ Error: El archivo /opt/softel/.env no existe."
  exit 1
fi

echo "📦 [2/4] Construyendo imagen de desarrollo..."
# Construye específicamente el servicio backend-dev sin tocar backend-prod
docker compose build backend-dev

echo "🔄 [3/4] Levantando contenedor de desarrollo..."
# Levanta específicamente backend-dev. 
# --no-deps evita reiniciar dependencias si ya están corriendo.
docker compose up -d --no-deps backend-dev

echo "⏳ Esperando 10 segundos a que el servicio estabilice el Healthcheck..."
sleep 10

echo "🔍 [4/4] Verificando estado del servicio de desarrollo..."
docker compose ps backend-dev

echo "======================================================================"
echo "✅ Despliegue de DESARROLLO completado con éxito."
echo "Pruebas:    https://api.g-softel.com:8443/api/v1/health"
echo "======================================================================"
