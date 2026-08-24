# Cambios — Prioridad ALTA: Autenticación JWT + RBAC
> Fecha: 2026-08-24 | Módulo: Backend Softel

---

## Archivos Afectados

| Estado | Archivo |
|--------|---------|
| `[NUEVO]` | `src/common/decorators/public.decorator.ts` |
| `[NUEVO]` | `src/common/decorators/roles.decorator.ts` |
| `[NUEVO]` | `src/common/guards/jwt-auth.guard.ts` |
| `[NUEVO]` | `src/common/guards/roles.guard.ts` |
| `[NUEVO]` | `src/common/filters/all-exceptions.filter.ts` |
| `[NUEVO]` | `src/modulos/auth/dto/login.dto.ts` |
| `[NUEVO]` | `src/modulos/auth/strategies/jwt.strategy.ts` |
| `[NUEVO]` | `src/modulos/auth/auth.service.ts` |
| `[NUEVO]` | `src/modulos/auth/auth.controller.ts` |
| `[NUEVO]` | `src/modulos/auth/auth.module.ts` |
| `[MODIFICADO]` | `src/app.module.ts` |
| `[MODIFICADO]` | `src/main.ts` |
| `[MODIFICADO]` | `src/modulos/users/users.controller.ts` |

**Dependencias instaladas:**
```
@nestjs/jwt  @nestjs/passport  passport  passport-jwt
@types/passport-jwt  @types/passport
```

---

## 1. Decoradores (`src/common/decorators/`)

### `public.decorator.ts`
```typescript
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```
Crea el decorador `@Public()`. Cualquier endpoint marcado con él se salta la
verificación de JWT. Se usa en `POST /auth/login` porque el usuario aún no
tiene token cuando quiere autenticarse.

### `roles.decorator.ts`
```typescript
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```
Crea el decorador `@Roles('ADMINISTRADOR', 'CONTADOR')`. Guarda la lista de
roles permitidos como metadata del endpoint. El `RolesGuard` la lee y compara
contra el rol que viene en el JWT del usuario.

---

## 2. Guards (`src/common/guards/`)

### `jwt-auth.guard.ts` — Autenticación
Extiende `AuthGuard('jwt')` de Passport y se registra como guard **global**:
1. Verifica si el endpoint tiene `@Public()` → si sí, deja pasar sin token.
2. Si no es público, Passport extrae el Bearer token del header, verifica la
   firma con `JWT_SECRET` y que no haya expirado.
3. Llama a `JwtStrategy.validate()` para confirmar que el usuario sigue ACTIVO en BD.
4. Si todo pasa, adjunta `{ id, correo, rol }` al `request` como `req.user`.
5. Si falla cualquier paso → `401 Unauthorized`.

### `roles.guard.ts` — Autorización RBAC
Se ejecuta **después** del JWT guard (el usuario ya está identificado):
1. Lee la lista de roles de `@Roles(...)` del endpoint.
2. Si el endpoint no tiene `@Roles()`, permite el paso (solo necesita estar autenticado).
3. Compara `req.user.rol` contra la lista permitida.
4. Si no coincide → `403 Forbidden` con mensaje descriptivo.

> Ambos guards se registran en `app.module.ts` con `APP_GUARD`, no en `main.ts`,
> porque usan `Reflector` (inyección de dependencias), que requiere el contexto de NestJS.

---

## 3. Filtro global de excepciones (`src/common/filters/all-exceptions.filter.ts`)

Captura **cualquier** error de la app (HTTP o no) y lo normaliza a este formato:
```json
{
  "exito": false,
  "codigo_estado": 400,
  "mensaje": "Error de validación en los campos enviados",
  "errores": ["correo must be an email"],
  "fecha_hora": "2026-08-24T13:47:00.000Z",
  "ruta": "/api/v1/auth/login"
}
```
El campo `ruta` solo aparece en entorno `desarrollo`. En `produccion` se omite.
Se registra en `main.ts` con `app.useGlobalFilters(new AllExceptionsFilter())`.

---

## 4. Módulo Auth (`src/modulos/auth/`)

### `dto/login.dto.ts`
Valida que el body de login contenga:
- `correo`: formato email válido, obligatorio.
- `clave`: string, mínimo 6 caracteres, obligatorio.
El `ValidationPipe` global rechaza automáticamente si faltan o son inválidos.

### `strategies/jwt.strategy.ts`
Estrategia que Passport invoca en cada request protegida:
1. Extrae el token del header `Authorization: Bearer <token>`.
2. Verifica firma y expiración con `JWT_SECRET` del `.env`.
3. Decodifica el payload: `{ sub (id), correo, rol }`.
4. Consulta en BD que el usuario con ese `id` siga en estado `ACTIVO`.
5. Si el usuario fue inactivado después de emitir el token, lo rechaza.
6. Retorna `{ id, correo, rol }` → queda disponible como `req.user` en los controladores.

### `auth.service.ts` — Lógica de login
```
1. Busca usuario por correo (incluye clave_hash en el select).
2. Si no existe → 401 genérico (no revela si el correo existe o no).
3. Si estado === 'INACTIVO' → 401 con mensaje específico.
4. bcrypt.compare(clave_enviada, clave_hash) → si no coincide → 401.
5. Firma JWT con payload { sub: id, correo, rol }.
6. Devuelve { access_token, usuario } — sin clave_hash.
```

### `auth.controller.ts`
Endpoint único:
```
POST /api/v1/auth/login   @Public() — no requiere token
```

### `auth.module.ts`
- Registra `PassportModule` con estrategia `'jwt'` por defecto.
- Configura `JwtModule` de forma **asíncrona** (`registerAsync`) para esperar
  a que `ConfigModule` cargue el `.env` antes de leer `JWT_SECRET` y `JWT_EXPIRACION`.
- Importa `TypeOrmModule.forFeature([User])` para que `AuthService` y
  `JwtStrategy` puedan consultar la tabla `usuarios`.
- Exporta `JwtModule` por si otros módulos necesitan `JwtService`.

---

## 5. Cambios en archivos existentes

### `app.module.ts`
- Se importó `AuthModule`.
- Se registraron `JwtAuthGuard` y `RolesGuard` como `APP_GUARD` global:
  ```typescript
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  ```
  Esto protege **todos** los endpoints sin necesidad de `@UseGuards()` en cada controlador.

### `main.ts`
- Se agregó `app.useGlobalFilters(new AllExceptionsFilter())`.
  Se instancia directamente (no con DI) porque no necesita inyectar servicios.

### `users.controller.ts`
Se añadió `@Roles()` a cada endpoint según la Regla 01 §3 (Matriz de Permisos):

| Endpoint | Roles |
|----------|-------|
| `POST /users` | `ADMINISTRADOR` |
| `GET /users` | `ADMINISTRADOR`, `CONTADOR` |
| `GET /users/:id` | `ADMINISTRADOR`, `CONTADOR` |
| `DELETE /users/:id` | `ADMINISTRADOR` |
| `PATCH /users/:id` | `ADMINISTRADOR` |

---

## 6. Flujo completo de autenticación

```
[Login]
POST /api/v1/auth/login  { correo, clave }
  → AuthService valida credenciales con bcrypt
  → Emite JWT firmado con { sub, correo, rol }
  → Responde { access_token, usuario }

[Request protegida]
GET /api/v1/users
  Header: Authorization: Bearer <token>
  → JwtAuthGuard verifica el token (firma + expiración + usuario ACTIVO)
  → RolesGuard verifica que rol del usuario esté en @Roles()
  → Controller → Service → Response
```

---

## 7. Cómo probar en Thunder Client

```
# 1. Login
POST http://localhost:3000/api/v1/auth/login
Body: { "correo": "...", "clave": "..." }

# 2. Usar token → Auth → Bearer → pegar token

# 3. Sin token → 401 Unauthorized
# 4. Rol sin permiso → 403 Forbidden
```

---

## Impacto en `.env`
No se agregaron variables. Se usan `JWT_SECRET` y `JWT_EXPIRACION` ya existentes.
