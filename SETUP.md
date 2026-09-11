# 🚀 Softel — Guía de Configuración del Entorno de Desarrollo

## ¿Qué necesitas en la nueva PC?

| Herramienta | Versión | Para qué |
|---|---|---|
| Windows 10/11 | — | Sistema operativo |
| Git | cualquier | Clonar el repositorio |
| Node.js | **20 LTS** | Backend NestJS + App Expo |
| Docker Desktop | cualquier | MySQL local en contenedor |
| VS Code | cualquier | Editor de código |
| Antigravity IDE | cualquier | Agente IA (extensión de VS Code) |

---

## Paso 1 — Instalar todas las herramientas automáticamente

Abre **PowerShell como Administrador** y ejecuta:

```powershell
# Primero, permite la ejecución de scripts (solo una vez)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Luego ejecuta el script de instalación
.\setup-dev.ps1
```

> ⚠️ **Reinicia la PC** cuando termine antes de continuar.

---

## Paso 2 — Clonar el repositorio

```powershell
git clone <URL_DEL_REPOSITORIO> GroupSoftel
cd GroupSoftel
```

---

## Paso 3 — Configurar el Backend (NestJS + MySQL local)

```powershell
cd Backend\backend

# Copia el archivo de variables de entorno
copy .env.example .env
# Edita .env con tus credenciales de Cloudinary si las tienes

# Levanta MySQL + Backend con hot-reload
docker compose -f docker-compose.dev.yml up
```

El backend estará disponible en: `http://localhost:3000/api/v1`

> 💡 La primera vez tarda ~2 minutos mientras descarga las imágenes de Docker.

---

## Paso 3.5 — Importar Base de Datos de Prueba (Opcional)

Si trajiste un respaldo de tu base de datos anterior en un archivo `.sql` dentro de tu USB:

1. Asegúrate de que el contenedor de MySQL esté corriendo (Paso 3).
2. Abre **MySQL Workbench** (o tu gestor preferido) en la PC nueva.
3. Conéctate a la base de datos local usando:
   - **Host:** `127.0.0.1` (o `localhost`)
   - **Puerto:** `3306`
   - **Usuario:** `root`
   - **Contraseña:** `SoftelRoot2026!`
4. Ve a la pestaña **Administration** y selecciona **Data Import/Restore**.
5. Selecciona **Import from Self-Contained File** y busca el archivo `.sql` en tu USB.
6. En *Default Target Schema* selecciona `softel_dev`.
7. Haz clic en **Start Import**.

---

## Paso 4 — Configurar la App Móvil (Expo)

```powershell
cd App\softel-app

# Instalar dependencias
npm install

# Iniciar en modo desarrollo (requiere celular con Expo Go o emulador)
npx expo start --tunnel
```

> Para apuntar al backend local en lugar del VPS, edita `src/services/api.ts`:
> ```typescript
> const BASE_URL = API_ENV.LOCAL; // Cambia a tu IP local
> ```

---

## Paso 5 — Instalar Antigravity IDE

1. Abre VS Code
2. Ve a **Extensiones** (Ctrl+Shift+X)
3. Busca **"Antigravity"**
4. Instala e inicia sesión con tu cuenta Google
5. Abre la carpeta `GroupSoftel` en VS Code — el agente reconocerá automáticamente las reglas del proyecto

---

## Paso 6 — Login en EAS (para builds de la app)

```powershell
eas login
# Inicia sesión con la cuenta de groupsoftel en expo.dev
```

---

## Estructura del Proyecto

```
GroupSoftel/
├── setup-dev.ps1          ← Script de instalación (ya lo usaste)
├── SETUP.md               ← Esta guía
├── Backend/
│   └── backend/
│       ├── .env.example   ← Copia a .env y configura
│       ├── docker-compose.dev.yml  ← Para desarrollo local
│       ├── docker-compose.yml      ← Para producción (VPS)
│       └── src/           ← Código fuente NestJS
└── App/
    └── softel-app/
        ├── eas.json       ← Configuración de builds
        └── src/           ← Código fuente React Native/Expo
```

---

## Comandos del día a día

| Acción | Comando |
|---|---|
| Levantar backend local | `docker compose -f docker-compose.dev.yml up` |
| Ver logs del backend | `docker compose -f docker-compose.dev.yml logs -f backend-local` |
| Parar todo | `docker compose -f docker-compose.dev.yml down` |
| Iniciar app Expo | `npx expo start --tunnel` |
| Generar nuevo APK | `eas build --platform android --profile preview` |

---

## Credenciales de acceso a la app (para pruebas)

| Campo | Valor |
|---|---|
| Correo | `admin@g-softel.com` |
| Contraseña | `SoftelAdmin2026!` |
| Rol | Administrador |
