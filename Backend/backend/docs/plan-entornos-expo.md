# Plan de Entornos y Despliegue: Backend NestJS + Expo (Web & Móvil)
> Estrategia de conectividad unificada para Desarrollo Local y Producción VPS

---

## La Arquitectura (Expo Universal)

Dado que usarás **Expo** para generar tanto la App Móvil (APK) como la Web App, el manejo de entornos se simplifica enormemente. Tendremos un único código frontend (`softel-app`) que consumirá al único backend (`backend`).

```
          [ Backend NestJS ]
                 │
      ┌──────────┴──────────┐
      │                     │
[ Expo Web ]         [ Expo Móvil (APK) ]
 (Navegador)          (Dispositivo Android)
```

---

## 1. Entorno de Desarrollo (Todo Local)

### 1.1 Backend (NestJS)
- **URL:** `http://localhost:3000` (vista desde la misma PC) o `http://<TU_IP_LOCAL>:3000` (vista desde el móvil).
- **Ejecución:** `npm run start:dev`
- **Configuración (`.env`):**
  ```env
  ENTORNO=desarrollo
  CORS_ORIGINS=         # Vacío para aceptar peticiones de Expo Web en dev
  ```

### 1.2 Frontend Unificado (Expo)
- **Ejecución:** `npx expo start`
  - Pulsar `w` para abrir la Web en `localhost:8081`
  - Escanear el QR con Expo Go para la App Móvil.

- **Manejo de la URL del Backend (`config/api.ts`):**
  Dado que el móvil necesita tu IP local y la web puede usar localhost o la IP local, configuraremos Expo para que tome la IP automáticamente en desarrollo, y la IP del VPS en producción.

  ```typescript
  import Constants from 'expo-constants';
  import { Platform } from 'react-native';

  // En producción (VPS) usa la IP pública
  const PROD_URL = 'http://45.32.100.50:3000/api/v1';

  // En desarrollo, intentamos obtener la IP de tu PC mágicamente usando el manifest de Expo
  let DEV_URL = 'http://localhost:3000/api/v1'; // Fallback para web local

  if (__DEV__) {
    // Si estamos en un dispositivo físico o emulador con Expo Go, obtenemos la IP del server de Expo
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      DEV_URL = `http://${ip}:3000/api/v1`;
    }
  }

  // Si estamos en desarrollo usa DEV_URL, sino PROD_URL
  export const API_URL = __DEV__ ? DEV_URL : PROD_URL;
  ```

Con esta configuración mágica, **nunca más tendrás que cambiar URLs a mano al pasar de Web a Móvil en desarrollo**. 

---

## 2. Entorno de Producción (VPS)

### 2.1 Backend (NestJS en el VPS)
- **Ejecución:** `npm run build` y luego `pm2 start dist/main.js`
- **Configuración (`.env`):**
  ```env
  ENTORNO=produccion
  CORS_ORIGINS=http://45.32.100.50   # Permite solo peticiones de tu propia web servida en Nginx
  JWT_SECRET=<clave_segura_generada>
  ```

### 2.2 Expo Web (Nginx en el VPS)
1. Construyes la web localmente:
   ```bash
   npx expo export:web
   # Genera una carpeta 'web-build' con los archivos estáticos HTML/JS/CSS
   ```
2. Subes esa carpeta al VPS:
   ```bash
   scp -r web-build/ usuario@45.32.100.50:/var/www/softel-web
   ```
3. Configuras Nginx en el VPS para servir `/var/www/softel-web` en el puerto 80 (como vimos en la guía anterior).

Al hacer el export, `__DEV__` se vuelve falso, por lo que la web intentará conectarse a `http://45.32.100.50:3000/api/v1` (el VPS).

### 2.3 Expo Móvil (APK)
1. Construyes el APK:
   ```bash
   eas build -p android --profile production
   ```
Al hacer el build en la nube de EAS, `__DEV__` también es falso. El APK resultante tendrá incrustada la URL `http://45.32.100.50:3000/api/v1`. 
CORS no aplica aquí, así que conectará perfectamente.

### 2.4 App Escritorio (.EXE) (Opcional a futuro)
Si decides empaquetar la Expo Web en un `.exe` con Electron:
1. Copias la carpeta `web-build` generada por Expo dentro de tu proyecto Electron.
2. Construyes el ejecutable.
Al igual que en la web, usará la URL del VPS y se saltará el problema de CORS si dejamos `CORS_ORIGINS` vacío (o bien, configuramos Electron correctamente).

---

## Resumen del Flujo de Trabajo

1. **Desarrollas local:** `npm run start:dev` (Backend) y `npx expo start` (Frontend). Pruebas en navegador y teléfono sin cambiar IPs gracias al código mágico en `api.ts`.
2. **Cuando vayas a Producción (VPS):**
   - Subes el backend y lo corres con PM2.
   - Corres `npx expo export:web`, subes la carpeta `web-build` y la sirves con Nginx.
   - Corres `eas build -p android` y distribuyes el `.apk`.

¡Eso es todo! Todo el código es el mismo, el cambio de entorno ocurre solo sin esfuerzo.
