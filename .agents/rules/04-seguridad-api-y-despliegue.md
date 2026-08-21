# Regla 04: Seguridad, Validación, Sincronización y Despliegue

Esta regla establece las políticas de seguridad de la API, autenticación, validación de datos, preparación para sincronización offline y variables de despliegue.

---

## 1. Autenticación y Autorización por Roles (RBAC)

1. **Tokens JWT:** Emisión de tokens firmados mediante `@nestjs/jwt` con expiración configurada (`JWT_EXPIRACION`).
2. **Hash de Contraseñas:** Uso de `bcrypt` o `argon2` con 10-12 rondas de salt para el almacenamiento seguro de contraseñas.
3. **Control de Acceso (Guards):**
   - Todo endpoint protegido debe usar `JwtAuthGuard`.
   - La autorización por roles se aplica con el decorador `@Roles(...)` y el `RolesGuard`.
   - Roles válidos: `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`, `TRABAJADOR`.
4. **Validación de la Autoridad en Backend:** No confiar en validaciones ni estados calculados por el cliente. Las operaciones críticas (aprobaciones, cierres, saldos) son recalculadas y validadas en el backend.

---

## 2. Validación Estricta de Entradas (DTOs)

- Todo endpoint de mutación (`POST`, `PUT`, `PATCH`) o consulta con parámetros (`GET`) debe tener una clase DTO con validadores de `class-validator`.
- Configuración global obligatoria del `ValidationPipe`:
  ```typescript
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  ```
- No procesar tipos `any` o payloads sin validar en los controladores.

---

## 3. Manejo Global de Errores y Formato de Respuestas

1. Usar un filtro global de excepciones (`AllExceptionsFilter`) para capturar errores HTTP y excepciones no controladas.
2. Todas las respuestas de error deben tener una estructura consistente:
   ```json
   {
     "exito": false,
     "codigo_estado": 400,
     "mensaje": "Descripción clara del error",
     "errores": ["campo_especifico invalido"],
     "fecha_hora": "2026-08-21T18:30:00.000Z"
   }
   ```
3. Ocultar trazas de error internas (`stack traces`) en respuestas al cliente cuando el entorno sea `produccion`.

---

## 4. Preparación para SQLite y Sincronización Offline Futura

- **Separación de Estados:**
  - *Estado de Negocio:* `PENDIENTE`, `APROBADO`, `RECHAZADO`, `CERRADO`, `LIQUIDADO`.
  - *Estado de Sincronización:* `PENDIENTE_SYNC`, `SINCRONIZANDO`, `SINCRONIZADO`, `CONFLICTO`.
  - **Prohibido** mezclar ambos conceptos en la misma columna.
- **Endpoints de Sincronización:** Diseñados para procesar operaciones en lote (`/api/v1/sincronizacion/lote`) con validación de idempotencia (`id_operacion`) y subida diferida de imágenes procesadas con Sharp.

---

## 5. Configuración de Entornos y Despliegue

La migración entre desarrollo local y producción en la VPS Contabo se realiza **únicamente mediante variables de entorno**, sin reescribir código:

```env
# ==========================================
# ENTORNO Y SERVIDOR
# ==========================================
ENTORNO=desarrollo
PUERTO=3000
URL_API=http://localhost:3000
PREFIJO_GLOBAL=api/v1

# ==========================================
# BASE DE DATOS MYSQL
# ==========================================
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NOMBRE=softel_db
DB_USUARIO=softel_app
DB_CLAVE=clave_local
DB_SINCRONIZAR=false
DB_LOGGING=true

# ==========================================
# SEGURIDAD Y JWT
# ==========================================
JWT_SECRET=super_secreto_para_firmar_tokens_seguros_2026
JWT_EXPIRACION=8h

# ==========================================
# ALMACENAMIENTO (LOCAL O VPS)
# ==========================================
STORAGE_PROVIDER=local
STORAGE_LOCAL_RUTA=./almacenamiento-local
STORAGE_PUBLIC_URL=http://localhost:3000/uploads
MAX_TAMANO_IMAGEN_MB=10
CALIDAD_WEBP=80
```
