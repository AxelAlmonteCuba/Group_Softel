---
trigger: always_on
---

# Regla 04: Seguridad, Validación, Autoridad del Backend y Despliegue

Esta regla establece las directrices de seguridad de la API, autenticación JWT, control de acceso por roles (RBAC), validación estricta de DTOs, manejo de excepciones y configuración de despliegue en VPS.

---

## 1. Autenticación y Autorización por Roles (RBAC)

1. **Tokens JWT:** Emisión de tokens firmados mediante `@nestjs/jwt` con expiración configurada (`JWT_EXPIRACION`).
2. **Hash de Contraseñas:** Uso de `bcrypt` o `argon2` con 10-12 rondas de salt para almacenar `clave_hash`.
   - El cliente envía la propiedad `clave` en texto plano sobre HTTPS.
   - El backend **nunca** devuelve el campo `clave_hash` en las respuestas de la API (`@Exclude()` en entidades y DTOs).
3. **Guards y Control de Acceso:**
   - Todo endpoint protegido requiere `JwtAuthGuard`.
   - La autorización de roles se aplica con el decorador `@Roles(...)` y el `RolesGuard`.
   - Roles válidos del sistema: `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`, `TRABAJADOR`.
4. **Backend como Autoridad Inapelable:** Las validaciones de permisos, cambios de estado y cálculos de saldos se realizan obligatoriamente en el backend. Ocultar componentes en la interfaz no reemplaza la seguridad del servidor.

---

## 2. Validación Estricta de Entradas (DTOs)

- Todo endpoint de mutación (`POST`, `PUT`, `PATCH`) o consulta con parámetros (`GET`) debe definir una clase DTO con validadores de `class-validator` y transformadores de `class-transformer`.
- Configuración global obligatoria del `ValidationPipe` en `main.ts`:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  ```
- Prohibido el uso de tipos `any` o payloads sin validar en los controladores.

---

## 3. Manejo Global de Errores y Formato de Respuestas

1. Usar un filtro global de excepciones (`AllExceptionsFilter`) para capturar errores HTTP y excepciones no controladas.
2. Todas las respuestas de error deben presentar una estructura homogénea:
   ```json
   {
     "exito": false,
     "codigo_estado": 400,
     "mensaje": "Descripción clara del error",
     "errores": ["campo_especifico invalido"],
     "fecha_hora": "2026-08-22T05:30:00.000Z"
   }
   ```
3. Ocultar trazas de error internas (`stack traces`) en respuestas HTTP cuando el entorno sea `produccion`.

---

## 4. Migraciones y Despliegue en VPS

- **Control de Esquema en Producción:** `DB_SINCRONIZAR` debe ser obligatoriamente `false` en entornos compartidos y VPS.
- **Migraciones Versionadas:** Todo cambio estructural de base de datos se implementa a través de archivos de migración TypeORM ejecutados mediante CLI.
- **Configuración mediante Variables de Entorno:**
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
