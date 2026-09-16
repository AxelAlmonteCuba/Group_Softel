---
name: deploy-vps
description: >-
  Use this skill when the user asks to deploy, upload, or update the backend code to the VPS, either to development (desarrollo) or production (producción).
---

# Despliegue del Backend a la VPS

Esta skill define el procedimiento exacto para desplegar el backend (NestJS) a la VPS sin cometer errores de mezclar entornos (desarrollo vs producción) y sin usar `git pull` en la VPS (solo se sube el código compilado).

## ⚠️ Reglas Críticas
1. **NO usar `git pull` en la VPS.** Solo se transfiere la carpeta compilada `dist`.
2. **NO usar el script general `deploy.sh`**, ya que ese script reinicia ambos entornos a la vez. 
3. Usar **única y exclusivamente** `./deploy-dev.sh` o `./deploy-prod.sh` en la VPS, según el entorno solicitado por el usuario.

## Pasos de Despliegue

### Paso 1: Compilar localmente
Asegúrate de estar en el directorio `Backend/backend` y ejecuta:
```bash
npm run build
```
Esto actualizará la carpeta `dist/` local con los últimos cambios.

### Paso 2: Subir código compilado a la VPS
Transfiere la carpeta `dist` directamente a la VPS en la ruta del proyecto. Ejecuta este comando desde la carpeta local `Backend/backend`:
```bash
scp -r dist softel-vps:/opt/softel/
```

### Paso 3: Desplegar en el entorno correcto
Conéctate por SSH y ejecuta el script correspondiente al entorno que el usuario solicitó.

- **Si el usuario pidió subir a DESARROLLO (dev/pruebas):**
  ```bash
  ssh softel-vps "cd /opt/softel && ./deploy-dev.sh"
  ```
  Esto reconstruirá y levantará **únicamente** el contenedor `backend-dev`.

- **Si el usuario pidió subir a PRODUCCIÓN (prod):**
  ```bash
  ssh softel-vps "cd /opt/softel && ./deploy-prod.sh"
  ```
  Esto reconstruirá y levantará **únicamente** el contenedor `backend-prod`.

### Paso 4: Confirmación
Una vez que el comando termine, informa al usuario que el despliegue al entorno solicitado fue exitoso y confirma expresamente que el otro entorno no fue alterado.
