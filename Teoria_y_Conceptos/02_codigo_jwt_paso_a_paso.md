# 🔑 ¿Cómo funciona el JWT en nuestro código?

Para entenderlo fácilmente, imagina que el **JWT (JSON Web Token)** es el *sello fluorescente* que te ponen en la mano al entrar a una discoteca exclusiva. No le muestras tu DNI (contraseña) al cantinero en cada trago; le muestras el sello.

Así es como programamos este flujo exacto en la app:

---

### 1. Obtener el Token (El Login)
Cuando presionas "Iniciar Sesión", el código manda tu correo y clave al backend. El backend los revisa en MySQL y te devuelve el JWT (una cadena larguísima de texto) y tus datos.

```tsx
// Archivo: LoginScreen.tsx 
const response = await authService.login({ correo, clave });

// Aquí "guardamos el sello" en la memoria de la app (Zustand)
setSession(response.access_token, response.usuario);
```

---

### 2. Mostrar la pantalla correcta (App.tsx)
Al guardar la sesión en Zustand, la variable `isAuthenticated` automáticamente cambia a `true`.

```tsx
// Archivo: App.tsx 
// React lee esto y dice: "Ah, hay token, quito el Login y dibujo el Home"
{isAuthenticated ? <HomeScreen /> : <LoginScreen />}
```
> **Nota:** Por eso no tuviste que usar una función clásica de "navegación". El cambio es automático e instantáneo.

---

### 3. Usar el Token (El Interceptor)
Ahora estás en el Home y quieres cargar datos desde el backend (por ejemplo, una lista de proyectos). Ya no envías tu clave; debes enviar tu JWT.

Para no tener que programar esto en *cada* pantalla, creamos un **Interceptor** en Axios. El interceptor es como un ayudante invisible que detiene tu petición un milisegundo antes de salir hacia el servidor:

```typescript
// Archivo: api.ts 
api.interceptors.request.use((config) => {
    // 1. Va a Zustand y saca el token que guardaste en el paso 1
    const token = useAuthStore.getState().token;
    
    // 2. Si existe, se lo pega en la frente a la petición en el formato "Bearer tu_token_largo..."
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Deja que la petición viaje al backend, ahora sí de forma segura
    return config;
});
```

Gracias a este código, tú solo tendrás que escribir `api.get('/reportes')` en el futuro, y Axios le pondrá el JWT automáticamente por debajo de la mesa.

---

### 4. ¿Qué pasa si el Token expira?
Si el token caduca (el sello se te borró por tiempo), el backend rechazará tu petición con un error `401 Unauthorized`. 
Tenemos otro interceptor vigilando exactamente eso:

```typescript
// Archivo: api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado — borramos la memoria automáticamente
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);
```
Al hacer `clearSession()`, `isAuthenticated` vuelve a ser `false`, y `App.tsx` te patea de regreso a la pantalla de Login al instante sin que tengas que programar nada adicional.
