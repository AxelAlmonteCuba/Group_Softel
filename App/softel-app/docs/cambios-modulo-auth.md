# Cambios — Capa de Conexión al Backend + Esquema Zod de Login
> Fecha: 2026-08-26 | Módulo: Frontend (App/softel-app)

## Archivos Afectados

| Estado | Archivo |
| :--- | :--- |
| [NUEVO] | `src/services/api.ts` |
| [NUEVO] | `src/features/auth/services/authService.ts` |
| [NUEVO] | `src/features/auth/schemas/loginSchema.ts` |
| [MODIFICADO] | `src/components/UserTopBar.tsx` |

## Dependencias Instaladas

```
axios      → Cliente HTTP para comunicación con el backend NestJS
zod        → Validación de esquemas en formularios (Regla 08)
```

## Explicación por Archivo

### `src/services/api.ts` [NUEVO]
Cliente base Axios configurado para el backend de Softel.
- **`baseURL`**: Apunta a `http://192.168.1.33:3000/api/v1` (IP Wi-Fi del equipo + prefijo global de la Regla 04).
- **Timeout**: 10 segundos para evitar peticiones colgadas en campo con mala señal.
- **Interceptor de Request**: Stub preparado para inyectar el token JWT desde el store de Zustand (Paso 3 pendiente).
- **Interceptor de Response**: Captura errores `401 Unauthorized` globalmente para manejar sesiones expiradas.

### `src/features/auth/services/authService.ts` [NUEVO]
Servicio puro de autenticación (`.ts` sin JSX, conforme a Regla 08).
- Expone `authService.login(credentials)` que llama a `POST /api/v1/auth/login`.
- Tipos `LoginCredentials` y `LoginResponse` alineados exactamente con el modelo `usuarios` de la Regla 03 (campos en español: `correo`, `clave`).
- No maneja estado; solo realiza la petición HTTP y retorna los datos.

### `src/features/auth/schemas/loginSchema.ts` [NUEVO]
Esquema Zod del formulario de login (`.ts` sin JSX, conforme a Regla 08).
- Creado **antes** de conectar el componente visual, cumpliendo el mandato de Regla 08.
- Valida `correo` (1-120 caracteres, obligatorio) y `clave` (mínimo 6 caracteres).
- Exporta el tipo `LoginFormData` inferido automáticamente desde el esquema para tipado estricto en React Hook Form.

### `src/components/UserTopBar.tsx` [MODIFICADO]
- **Bug corregido**: Se eliminó el objeto de estilos vacío `[styles.imageProfile, {}]` que causaba el error `ReferenceError: Property 'flex' doesn't exist` en runtime.

## Flujo de Conexión (Próximos pasos)

```
LoginScreen (UI)
   └── loginSchema (Zod valida correo y clave)
          └── authService.login({ correo, clave })
                 └── api (Axios → POST /api/v1/auth/login)
                        └── Backend NestJS
                               └── Responde { token, usuario }
                                      └── authStore (Zustand guarda sesión)
                                             └── Navegar al Home
```

## Impacto

- **Variables de entorno afectadas**: `BASE_URL` hardcodeada temporalmente. Mover a `.env` cuando se configure `expo-constants` o similar en la siguiente fase.
- **Endpoints nuevos**: `POST /api/v1/auth/login` — requiere que el backend tenga este endpoint implementado y funcionando.
- **Efectos sobre otros módulos**: Ninguno en esta etapa; la capa de servicios es totalmente independiente.

---

# Cambios — Paso 3: Store Zustand de Autenticación
> Fecha: 2026-08-26 | Módulo: Frontend (App/softel-app)

## Archivos Afectados

| Estado | Archivo |
| :--- | :--- |
| [NUEVO] | `src/store/authStore.ts` |
| [MODIFICADO] | `src/services/api.ts` |

## Dependencias Instaladas

```
zustand → Estado global sin boilerplate (Regla 08)
```

## Explicación por Archivo

### `src/store/authStore.ts` [NUEVO]
Store de Zustand para la sesión del usuario autenticado (`.ts` sin JSX, conforme a Regla 08).
- **Estado**: `token`, `usuario`, `isAuthenticated`.
- **`setSession(token, usuario)`**: Llamada tras el login exitoso. Guarda el JWT y los datos del usuario en memoria.
- **`clearSession()`**: Llamada en logout o cuando el interceptor detecta un `401`. Limpia toda la sesión.
- **Tipos**: `AuthUser` y `UserRole` alineados exactamente con la tabla `usuarios` de la Regla 03.

### `src/services/api.ts` [MODIFICADO]
- **Interceptor de Request**: Ahora lee el token real desde `useAuthStore.getState().token` y lo inyecta como `Authorization: Bearer <token>` en cada petición automáticamente.
- **Interceptor de Response**: Ahora llama a `clearSession()` cuando el backend devuelve `401 Unauthorized`, limpiando la sesión expirada.

## Flujo Completo Actualizado

```
LoginScreen (UI)
   └── loginSchema (Zod valida datos)
          └── authService.login({ correo, clave })
                 └── api.post → POST /api/v1/auth/login
                        └── Backend NestJS
                               └── { token, usuario }
                                      └── authStore.setSession(token, usuario)
                                             └── isAuthenticated = true
                                                    └── Navegar al Home ← Paso 4 pendiente

Cualquier petición protegida posterior:
   api.interceptors.request → agrega header Authorization: Bearer <token>
   api.interceptors.response → si 401, llama clearSession() automáticamente
```

## Próximo Paso
Implementar Expo Router con rutas protegidas para una navegación más robusta.

---

# Cambios — Paso 4: Conexión Real al Backend desde LoginScreen
> Fecha: 2026-08-26 | Módulo: Frontend (App/softel-app)

## Archivos Afectados

| Estado | Archivo |
| :--- | :--- |
| [MODIFICADO] | `src/features/auth/screens/LoginScreen.tsx` |
| [MODIFICADO] | `App.tsx` |

## Explicación por Archivo

### `src/features/auth/screens/LoginScreen.tsx` [MODIFICADO]
- **Zod `safeParse`**: Valida `correo` y `clave` antes de llamar al backend. Si falla, muestra el mensaje de error al usuario sin hacer ninguna petición de red.
- **`authService.login()`**: Reemplaza el `console.log` por la llamada HTTP real al endpoint `POST /api/v1/auth/login`.
- **`setSession()`**: Tras respuesta exitosa del backend, guarda el token y datos del usuario en el authStore de Zustand.
- **`isLoading`**: Reemplaza el botón por un `ActivityIndicator` mientras se espera la respuesta del backend, previniendo doble envío.
- **`error`**: Muestra el mensaje de error del backend (`response.data.mensaje`) o un mensaje genérico de red si no hay respuesta.

### `App.tsx` [MODIFICADO]
- Lee `isAuthenticated` del authStore con `useAuthStore`.
- Renderiza `<LoginScreen />` si no hay sesión, y `<HomeScreen />` si hay sesión activa.
- La "navegación" es automática: cuando `setSession()` cambia `isAuthenticated` a `true`, React re-renderiza y muestra el Home sin ninguna llamada a `navigate()`.

## Flujo Completo ✅

```
Usuario escribe correo + clave → presiona "Iniciar Sesión"
   └── loginSchema.safeParse() → ¿Datos válidos?
          ├── NO → muestra error en rojo (sin petición de red)
          └── SÍ → setIsLoading(true) + ActivityIndicator
                    └── authService.login({ correo, clave })
                           └── POST /api/v1/auth/login
                                  ├── Error de red/401/500 → setError(mensaje)
                                  └── Éxito → setSession(token, usuario)
                                                 └── isAuthenticated = true
                                                        └── App.tsx renderiza <HomeScreen />
```

## Impacto
- El campo `correo` acepta email; futuros ajustes pueden aceptar también nombre de usuario (cambiar `keyboardType` y esquema Zod).
- El backend debe responder con la estructura `{ exito, datos: { token, usuario } }` definida en `authService.ts`.
