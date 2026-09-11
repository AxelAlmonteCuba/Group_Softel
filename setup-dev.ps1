# ==============================================================================
# setup-dev.ps1 — Softel Development Environment Setup
# Ejecutar como Administrador en la nueva PC (Windows 10/11)
# Instala: Git, Node.js 20, Docker Desktop, VS Code, EAS CLI, Expo CLI
# ==============================================================================

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   SOFTEL - Configuracion de Entorno de Desarrollo" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si winget esta disponible
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] winget no esta disponible. Instala 'App Installer' desde la Microsoft Store." -ForegroundColor Red
    exit 1
}

# ------------------------------------------------------------------------------
# 1. Git
# ------------------------------------------------------------------------------
Write-Host "[1/5] Instalando Git..." -ForegroundColor Yellow
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
Write-Host "[OK] Git instalado." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 2. Node.js 20 LTS
# ------------------------------------------------------------------------------
Write-Host "[2/5] Instalando Node.js 20 LTS..." -ForegroundColor Yellow
winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
Write-Host "[OK] Node.js 20 LTS instalado." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 3. Visual Studio Code
# ------------------------------------------------------------------------------
Write-Host "[3/5] Instalando Visual Studio Code..." -ForegroundColor Yellow
winget install --id Microsoft.VisualStudioCode -e --source winget --accept-package-agreements --accept-source-agreements
Write-Host "[OK] VS Code instalado." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 4. Docker Desktop
# ------------------------------------------------------------------------------
Write-Host "[4/5] Instalando Docker Desktop..." -ForegroundColor Yellow
winget install --id Docker.DockerDesktop -e --source winget --accept-package-agreements --accept-source-agreements
Write-Host "[OK] Docker Desktop instalado." -ForegroundColor Green

# ------------------------------------------------------------------------------
# 5. Herramientas globales de Node.js
# ------------------------------------------------------------------------------
Write-Host "[5/5] Instalando herramientas globales (EAS CLI, Expo CLI)..." -ForegroundColor Yellow

# Refrescar PATH para usar el node recien instalado
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

npm install -g eas-cli expo-cli typescript ts-node
Write-Host "[OK] EAS CLI, Expo CLI y TypeScript instalados globalmente." -ForegroundColor Green

# ------------------------------------------------------------------------------
# Resumen Final
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   INSTALACION COMPLETA" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Versiones instaladas:" -ForegroundColor White
Write-Host "  - node   : $(node --version 2>$null)" -ForegroundColor Gray
Write-Host "  - npm    : $(npm --version 2>$null)" -ForegroundColor Gray
Write-Host "  - git    : $(git --version 2>$null)" -ForegroundColor Gray
Write-Host "  - eas    : $(eas --version 2>$null)" -ForegroundColor Gray
Write-Host ""
Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Reiniciar la PC para aplicar todos los cambios de PATH"
Write-Host "  2. Clonar el repositorio: git clone <URL_DEL_REPO>"
Write-Host "  3. Abrir VS Code en la carpeta del proyecto"
Write-Host "  4. Instalar la extension Antigravity IDE en VS Code"
Write-Host "  5. Ver el archivo SETUP.md para continuar"
Write-Host ""
Write-Host "  Docker Desktop requiere reinicio y configuracion manual de WSL2." -ForegroundColor DarkYellow
Write-Host ""
