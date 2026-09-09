# ==============================================================================
# Script de Despliegue DUAL: Desarrollo y Producción Simultáneos
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

Write-Host "`n🔄 [3/4] Reconstruyendo y reiniciando ambos contenedores (prod y dev)..." -ForegroundColor Cyan
ssh softel-vps "cd /opt/softel && docker compose build backend-prod backend-dev && docker compose up -d backend-prod backend-dev"

Write-Host "`n🩺 [4/4] Verificando salud de ambos servicios..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host "-> Producción:" -ForegroundColor Yellow
curl.exe -sSL https://api.g-softel.com/api/v1/health
Write-Host "`n-> Desarrollo:" -ForegroundColor Yellow
curl.exe -sSL https://api.g-softel.com:8443/api/v1/health

Write-Host "`n✅ ¡Despliegue DUAL completado con éxito!`n" -ForegroundColor Green
