# Cambios — CORS configurado
> Fecha: 2026-08-24 | Módulo: Backend

## Archivos Afectados

| Estado | Archivo |
|--------|---------|
| `[MODIFICADO]` | `src/main.ts` |
| `[MODIFICADO]` | `.env` |

---

## Qué se hizo

### `src/main.ts`
Se añadió `app.enableCors()` con la configuración:
```typescript
app.enableCors({
  origin: corsOrigins,           // desde variable CORS_ORIGINS del .env
  methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,             // necesario para enviar cookies/tokens
});
```

`corsOrigins` se lee del `.env`:
- Si `CORS_ORIGINS` está **vacío** → acepta `'*'` (cualquier origen — modo desarrollo).
- Si `CORS_ORIGINS` tiene valores → los separa por coma y solo acepta esos.

### `.env`
Se añadió la variable:
```env
CORS_ORIGINS=
```

---

## Cómo configurar según el entorno

### Desarrollo (actual)
```env
CORS_ORIGINS=
# Acepta peticiones de cualquier origen
```

### Cuando el frontend web esté listo
```env
CORS_ORIGINS=http://localhost:3001
```

### Con app móvil Expo también
```env
CORS_ORIGINS=http://localhost:3001,http://localhost:8081
```

### En producción (VPS)
```env
CORS_ORIGINS=https://app.softel.com,https://softel.com
```

---

## Impacto
- Sin `CORS_ORIGINS` definido: el servidor acepta peticiones de cualquier origen (útil para desarrollo y pruebas con Postman).
- En producción: **OBLIGATORIO** definir los orígenes exactos del frontend y la app móvil.
