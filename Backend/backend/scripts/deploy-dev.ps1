# ==============================================================================
# Script de Despliegue Exclusivo a DESARROLLO (Softel Backend)
# Actualiza api.g-softel.com:8443 sin tocar Producción
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "`n🚀 [1/4] Compilando NestJS localmente (npm run build)..." -ForegroundColor Cyan
Set-Location -Path (Join-Path $PSScriptRoot "..")
npm run build

Write-Host "`n📦 [2/4] Empaquetando dist/ y transfiriendo a la VPS..." -ForegroundColor Cyan
tar -czf dist.tar.gz dist
scp dist.tar.gz softel-vps:/opt/softel/
ssh softel-vps "cd /opt/softel && tar -xzf dist.tar.gz && rm dist.tar.gz"
Remove-Item dist.tar.gz -Force

Write-Host "`n🔄 [3/4] Reconstruyendo y reiniciando contenedor backend-dev..." -ForegroundColor Cyan
ssh softel-vps "cd /opt/softel && docker compose build --no-cache backend-dev && docker compose up -d --force-recreate backend-dev"

Write-Host "`n🩺 [4/4] Verificando salud en https://api.g-softel.com:8443/api/v1/health..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
curl.exe -sSL https://api.g-softel.com:8443/api/v1/health

Write-Host "`n✅ ¡Despliegue a DESARROLLO completado con éxito!`n" -ForegroundColor Green
