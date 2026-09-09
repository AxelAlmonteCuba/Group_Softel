# Guía Maestra de Despliegue y Conexión VPS (Arquitectura Dual Softel)

Esta guía documenta de forma exhaustiva toda la configuración, decisiones de diseño, infraestructura, comandos y soluciones técnicas aplicadas para desplegar el backend de **Softel** en el VPS de Contabo, operando con una **arquitectura dual (Producción y Desarrollo en paralelo)** bajo un solo dominio con certificados SSL automáticos.

---

## 1. Ficha Técnica del Entorno y Dominio

| Parámetro | Valor Configurado |
| :--- | :--- |
| **Proveedor VPS** | Contabo Cloud VPS |
| **Sistema Operativo** | Ubuntu 24.04 LTS (Noble Numbat) |
| **Dirección IP Pública** | `13.140.176.195` |
| **Alias SSH Local** | `softel-vps` (definido en `~/.ssh/config`) |
| **Dominio Unificado** | **`api.g-softel.com`** |
| **Registro DNS** | Tipo `A` hacia `13.140.176.195` con TTL 300s |
| **Ruta del Proyecto en VPS** | `/opt/softel/` |

---

## 2. Arquitectura Dual: Producción y Desarrollo en Paralelo

Para permitir que el equipo realice pruebas en la nube sin contaminar la información contable oficial, se estructuraron dos entornos completamente aislados que conviven en el mismo VPS:

```
                           INTERNET (Clientes Web / Móvil)
                                          │
                       ┌──────────────────┴──────────────────┐
                       │                                     │
              HTTPS :443 (Producción)               HTTPS :8443 (Desarrollo)
                       │                                     │
                       ▼                                     ▼
           ┌────────────────────────────────────────────────────────┐
           │              CADDY REVERSE PROXY (Docker)              │
           │     - Let's Encrypt automático (Mismo certificado)     │
           │     - Balanceo HTTP/2 y HTTP/3                         │
           └──────────────┬──────────────────────────┬──────────────┘
                          │                          │
              http://backend-prod:3000   http://backend-dev:3000
                          │                          │
                          ▼                          ▼
           ┌────────────────────────┐  ┌────────────────────────┐
           │   softel_backend_prod  │  │   softel_backend_dev   │
           │   (PM2 Cluster Mode)   │  │   (PM2 Cluster Mode)   │
           └──────────────┬─────────┘  └──────────┬─────────────┘
                          │                       │
                          │   Red Interna Docker  │
                          ├───────────────────────┤
                          ▼                       ▼
           ┌────────────────────────────────────────────────────────┐
           │             MYSQL 8.0 (softel_mysql)                   │
           │   - softel_prod (BD Oficial)                           │
           │   - softel_dev (BD Pruebas y Sync)                     │
           │   - Puerto 3306 cerrado hacia Internet (Solo SSH)      │
           └────────────────────────────────────────────────────────┘
                          │                       │
                          ▼                       ▼
           ┌────────────────────────┐  ┌────────────────────────┐
           │  Cloudinary Producción │  │  Cloudinary Desarrollo │
           │  Carpeta:              │  │  Carpeta:              │
           │  softel/produccion     │  │  softel/desarrollo     │
           └────────────────────────┘  └────────────────────────┘
```

### Tabla Comparativa de Entornos

| Concepto | Entorno de Producción | Entorno de Desarrollo / Pruebas |
| :--- | :--- | :--- |
| **URL Base de la API** | `https://api.g-softel.com/api/v1` | `https://api.g-softel.com:8443/api/v1` |
| **Puerto Público** | `443` (Estándar HTTPS) | `8443` (HTTPS Seguro Alternativo) |
| **Base de Datos** | `softel_prod` | `softel_dev` |
| **Sincronizar Esquema** | `DB_SINCRONIZAR=false` (Protección total) | `DB_SINCRONIZAR=true` (Migración continua) |
| **Carpeta Cloudinary** | `softel/produccion` | `softel/desarrollo` |
| **Logging TypeORM** | `DB_LOGGING=false` | `DB_LOGGING=true` |
| **Consumo de la App** | Modo `PROD_VPS` | Modo `DEV_VPS` (Recomendado para testing) |

---

## 3. Estrategia de Compilación: Solo `dist/` en el VPS

### ¿Por qué NO compilar TypeScript en la VPS?
Compilar NestJS con `nest build` en servidores de bajos recursos consume picos altos de memoria RAM (más de 1.5 GB) y satura la CPU, provocando lentitud o caídas por *Out of Memory* (OOM).

### La Solución Implementada:
1. **La compilación se realiza exclusivamente en tu máquina local:**
   ```bash
   npm run build
   ```
2. **El archivo `.dockerignore` excluye el código fuente y dependencias de desarrollo:**
   - Excluye: `src/`, `node_modules/`, `.git/`, tests.
   - Permite: Únicamente `dist/`, `package*.json` y `ecosystem.config.js`.
3. **El contenedor Docker se construye en menos de 3 segundos** instalando solo dependencias de producción (`npm ci --omit=dev`) y ejecutando el JavaScript precompilado con `pm2-runtime`.

---

## 4. Configuración del Servidor y Seguridad

### 4.1. Configuración del Firewall (UFW)
Para cumplir con la **Regla 04**, el puerto de MySQL (`3306`) se cerró herméticamente al exterior. Solo se habilitaron los puertos indispensables:

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH seguro
ufw allow 80/tcp    # Validación HTTP Let's Encrypt y redirección
ufw allow 443/tcp   # HTTPS Producción
ufw allow 8443/tcp  # HTTPS Desarrollo
ufw enable
```

### 4.2. Instalación de Docker y Docker Compose
Se instaló el repositorio oficial de Docker para Ubuntu:
```bash
apt-get update && apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" > /etc/apt/sources.list.d/docker.list
apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 5. Configuración de Archivos Clave

### 5.1. `Caddyfile` (Proxy Inverso con SSL Automático)
Caddy administra la emisión y renovación de certificados TLS sin requerir Certbot ni configuraciones manuales:

```caddyfile
# Entorno de Producción Oficial
api.g-softel.com:443 {
    reverse_proxy backend-prod:3000
}

# Entorno de Desarrollo y Pruebas
api.g-softel.com:8443 {
    reverse_proxy backend-dev:3000
}
```

### 5.2. `ecosystem.config.js` (PM2 en Modo Cluster)
Garantiza tolerancia a fallos, reinicio automático en caso de excepción no controlada y ejecución optimizada:

```javascript
module.exports = {
  apps: [
    {
      name: 'softel-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### 5.3. `init-databases.sql` (Inicialización MySQL 8.0)
Crea ambas bases con codificación estricta `utf8mb4_unicode_ci` (Regla 03) y otorga permisos:

```sql
CREATE DATABASE IF NOT EXISTS `softel_prod`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `softel_dev`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `softel_prod`.* TO 'softel_app'@'%';
GRANT ALL PRIVILEGES ON `softel_dev`.* TO 'softel_app'@'%';
FLUSH PRIVILEGES;
```

### 5.4. `Dockerfile` de Producción
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget && npm install -g pm2
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY dist ./dist
COPY ecosystem.config.js ./ecosystem.config.js
RUN mkdir -p uploads logs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/v1/health || exit 1
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

---

## 6. Lecciones Aprendidas y Problemas Resueltos

### Problema 1: Conflicto de Usuario en MySQL 8 (`MYSQL_USER: root`)
- **Síntoma:** El contenedor de MySQL fallaba con `The random password option was used, cannot specify both --initialize and --initialize-insecure`.
- **Causa:** En las imágenes oficiales de MySQL Docker, la variable `MYSQL_USER` no puede ser `root`. `root` ya existe por defecto.
- **Solución:** Se creó un usuario específico de aplicación `softel_app` con su contraseña propia, dejando `root` con `MYSQL_ROOT_PASSWORD`.

### Problema 2: Error de Precisión en Timestamps (`Invalid default value for 'creado_en'`)
- **Síntoma:** Al sincronizar tablas, MySQL arrojaba `Error: Invalid default value for 'creado_en'`.
- **Causa:** TypeORM generaba sentencias mezcladas: `timestamp(0)` con `DEFAULT CURRENT_TIMESTAMP(6)`. En MySQL 8, la precisión fraccionaria de la columna y de la función por defecto deben coincidir exactamente.
- **Solución:** Se configuró explícitamente `@CreateDateColumn({ type: 'timestamp', precision: 6 })` y `@UpdateDateColumn({ type: 'timestamp', precision: 6 })` en las entidades `User`, `PettyCash` y `Expense`.

### Problema 3: Ejecución de Comandos SSH en Windows PowerShell
- **Síntoma:** Comandos con `&&` fallaban en PowerShell con errores de token no reconocido.
- **Causa:** Windows PowerShell interpreta `&&` de manera diferente que bash de Linux cuando se envían dentro de cadenas con comillas.
- **Solución:** Utilizar punto y coma (`;`) o encapsular las instrucciones complejas en archivos `.sh` ejecutados en el servidor.

---

## 7. Telemetría y Endpoint `/api/v1/health`

Se implementó un módulo de salud inteligente que consulta en tiempo real el estado de los componentes clave:

### Estructura de Respuesta JSON:
```json
{
  "estado": "OK",
  "fecha_hora": "2026-09-08T23:20:08.612Z",
  "tiempo_activo": "0h 1m 9s",
  "uptime_segundos": 69,
  "base_de_datos": {
    "conectado": true,
    "nombre_bd": "softel_prod",
    "latencia_ms": 1
  },
  "almacenamiento": {
    "proveedor": "cloudinary",
    "cloudinary_activo": true,
    "carpeta_destino": "softel/produccion"
  },
  "sistema": {
    "memoria_ram_mb": { "rss": 106.52, "heap_total": 40.79, "heap_usado": 37.81 },
    "entorno": "produccion",
    "version_api": "0.0.1",
    "node_version": "v20.20.2"
  }
}
```

---

## 8. Ciclo de Vida y Flujo de Despliegues (Local -> Dev -> Prod)

Para garantizar un entorno estable y evitar errores humanos, el código pasa por tres etapas bien diferenciadas. A continuación se detallan las carpetas involucradas, la gestión de compilación y los pasos exactos para desplegar a cada entorno.

---

### 8.1. Mapa Oficial de Carpetas

```text
TU MÁQUINA LOCAL (Windows)
├── Backend/backend/
│   ├── src/                 ◄── Tu código fuente TypeScript (Donde programas)
│   ├── dist/                ◄── Salida compilada en JS puro (Generada con "npm run build")
│   ├── package.json         ◄── Dependencias
│   ├── ecosystem.config.js  ◄── Configuración del cluster PM2
│   ├── Dockerfile           ◄── Toma directamente dist/
│   └── .dockerignore        ◄── Ignora src/ y node_modules/
└── dist.tar.gz              ◄── Archivo comprimido temporal para transferencia rápida

VPS CONTABO (/opt/softel/)
├── dist/                    ◄── Carpeta recibida desde local (Sin código TypeScript)
├── docker-compose.yml       ◄── Orquestador de mysql, backend-prod, backend-dev y caddy
├── Caddyfile                ◄── Enrutador SSL (443 -> prod, 8443 -> dev)
├── ecosystem.config.js      ◄── Configuración PM2 del cluster
├── .env                     ◄── Credenciales seguras del servidor
├── init-databases.sql       ◄── Creación de softel_prod y softel_dev
└── Volúmenes Docker:
    ├── softel_mysql_data    ◄── Almacenamiento persistente de ambas bases de datos
    └── caddy_data           ◄── Almacenamiento persistente de certificados SSL

CLOUDINARY (Nube Multimedia)
├── softel/desarrollo/       ◄── Comprobantes y evidencias generadas en pruebas
└── softel/produccion/       ◄── Comprobantes y evidencias contables oficiales
```

---

### 8.2. El Ciclo de Promoción de Cambios

```text
[1. Desarrollo Local] ──(Hot-reload local)──> Pruebas iniciales en PC
         │
         ▼
[2. Compilación Local] ──("npm run build")──> Generación de carpeta dist/
         │
         ▼
[3. Subida a DEV VPS] ──(Puerto 8443)───────> Pruebas en celular con softel_dev
         │                                    (No toca producción)
         ▼ (Aprobado por el equipo)
[4. Pase a PROD VPS]  ──(Puerto 443)────────> Disponible para operación oficial
```

---

### 8.3. Procedimiento: Subir Cambios EXCLUSIVAMENTE a DESARROLLO (Dev VPS)

Usa este flujo cuando estés desarrollando nuevas funciones, ajustando endpoints o probando pantallas móviles:

#### Paso 1: Compilar en tu máquina local
```powershell
cd c:\Users\OLED\Downloads\GroupSoftel\Backend\backend
npm run build
```

#### Paso 2: Subir el `dist/` a la VPS
```powershell
tar -czf dist.tar.gz dist
scp dist.tar.gz softel-vps:/opt/softel/
ssh softel-vps "cd /opt/softel && tar -xzf dist.tar.gz && rm dist.tar.gz"
rm dist.tar.gz
```

#### Paso 3: Reconstruir y Reiniciar ÚNICAMENTE el contenedor de Desarrollo
```powershell
ssh softel-vps "cd /opt/softel && docker compose build backend-dev && docker compose up -d backend-dev"
```
*(Producción sigue funcionando sin ninguna interrupción ni reinicio).*

#### Paso 4: Verificar la salud de Desarrollo
```powershell
curl.exe -sSL https://api.g-softel.com:8443/api/v1/health
```

---

### 8.4. Procedimiento: Promover Cambios a PRODUCCIÓN (Prod VPS)

Usa este flujo únicamente cuando las funcionalidades hayan sido validadas en Desarrollo:

#### Paso 1: Manejo del Esquema de Base de Datos (Regla 04)
En `softel_prod`, la variable `DB_SINCRONIZAR` es **`false`** para proteger los datos históricos. Si en desarrollo se añadieron nuevas tablas o columnas:
1. Revisa el cambio de estructura generado en `softel_dev`.
2. Aplica la migración o alteración en `softel_prod` mediante script SQL o TypeORM CLI:
   ```powershell
   # Ejemplo: Clonar estructura limpia si hay cambios mayores:
   ssh softel-vps "docker exec -i softel_mysql mysqldump -u root -pSoftelRoot2026Secure! --no-data softel_dev > /tmp/schema.sql && docker exec -i softel_mysql mysql -u root -pSoftelRoot2026Secure! softel_prod < /tmp/schema.sql && rm /tmp/schema.sql"
   ```

#### Paso 2: Compilar y Transferir la versión final de `dist/`
```powershell
cd c:\Users\OLED\Downloads\GroupSoftel\Backend\backend
npm run build
tar -czf dist.tar.gz dist
scp dist.tar.gz softel-vps:/opt/softel/
ssh softel-vps "cd /opt/softel && tar -xzf dist.tar.gz && rm dist.tar.gz"
rm dist.tar.gz
```

#### Paso 3: Reconstruir y Reiniciar el contenedor de Producción
```powershell
ssh softel-vps "cd /opt/softel && docker compose build backend-prod && docker compose up -d backend-prod"
```

#### Paso 4: Verificar la salud de Producción
```powershell
curl.exe -sSL https://api.g-softel.com/api/v1/health
```

---

### 8.5. Scripts de Automatización para Windows (Un Solo Clic)

Para no escribir todos estos comandos manualmente cada vez, se crearon los siguientes scripts ejecutables en `Backend/backend/scripts/`:

- **`deploy-dev.ps1`**: Compila, transfiere `dist/` y reinicia el contenedor de desarrollo.
- **`deploy-prod.ps1`**: Compila, transfiere `dist/` y reinicia el contenedor de producción.
- **`deploy-all.ps1`**: Actualiza ambos entornos en paralelo.

---

## 9. Conexión desde la Aplicación Móvil (React Native / Expo)

En el frontend ([`App/softel-app/src/services/api.ts`](file:///c:/Users/OLED/Downloads/GroupSoftel/App/softel-app/src/services/api.ts)), se configuró el selector de entorno `API_ENV`:

```typescript
export const API_ENV = {
  DEV_VPS: 'https://api.g-softel.com:8443/api/v1',  // Pruebas en la nube (Nube HTTPS)
  PROD_VPS: 'https://api.g-softel.com/api/v1',      // Producción Oficial
  LOCAL: 'http://192.168.1.39:3000/api/v1',        // Backend local en tu PC (Hot-reload)
};

// Alterna fácilmente según la tarea que estés realizando:
const BASE_URL = API_ENV.LOCAL;
```

---

## 10. Comandos Útiles de Administración en la VPS

### Ver estado general de contenedores:
```bash
ssh softel-vps "cd /opt/softel && docker compose ps"
```

### Ver logs en tiempo real:
```bash
# Logs de producción
ssh softel-vps "docker logs --tail 50 -f softel_backend_prod"

# Logs de desarrollo
ssh softel-vps "docker logs --tail 50 -f softel_backend_dev"

# Logs de Caddy (certificados SSL y peticiones)
ssh softel-vps "docker logs --tail 50 -f softel_caddy"
```

### Conectarse a MySQL de forma segura desde tu PC (Túnel SSH):
Dado que el puerto `3306` no está abierto a internet, puedes conectarte desde **DBeaver** o **MySQL Workbench** creando un túnel SSH:
```powershell
ssh -L 3307:127.0.0.1:3306 softel-vps
```
Luego configuras en tu herramienta cliente:
- **Host:** `127.0.0.1`
- **Puerto:** `3307`
- **Usuario:** `softel_app`
- **Base de datos:** `softel_prod` o `softel_dev`
