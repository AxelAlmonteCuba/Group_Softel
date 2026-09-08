# ==============================================================================
# Dockerfile para Softel: Toma directamente la compilación preconstruida (dist/)
# Ultra ligero, inicio instantáneo sin consumo de compilador en VPS
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Instalar wget para healthcheck y pm2 globalmente para gestión de procesos
RUN apk add --no-cache wget && npm install -g pm2

ENV NODE_ENV=production
ENV PUERTO=3000

# 1. Copiar manifiestos e instalar exclusivamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 2. Copiar directamente la carpeta compilada generada en Backend/backend/dist
COPY dist ./dist

# 3. Copiar configuración de procesos de PM2
COPY ecosystem.config.js ./ecosystem.config.js

# 4. Crear carpetas para logs y almacenamiento local de respaldo
RUN mkdir -p uploads logs

EXPOSE 3000

# Docker Healthcheck nativo apuntando a /api/v1/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# Ejecución de la compilación mediante PM2 Runtime (clúster y auto-reinicio)
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
