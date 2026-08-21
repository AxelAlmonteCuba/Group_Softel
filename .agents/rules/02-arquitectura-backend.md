# Regla 02: Arquitectura del Backend y Patrones de Diseño

Esta regla establece los patrones arquitectónicos, el stack tecnológico y las directrices de código para el backend central de Softel.

---

## 1. Principio de Backend Único y Stack Tecnológico

El backend central atiende tanto a la aplicación móvil como a la aplicación web (ambas construidas en React Native + Expo). **Prohibido crear backends o servicios separados por plataforma**.

- **Runtime & Lenguaje:** Node.js (v20+ LTS) + TypeScript (`strict: true`).
- **Framework:** NestJS 11.x (Inyección de Dependencias, Módulos, Controladores, Servicios, Guards, Pipes e Interceptores).
- **Persistencia:** TypeORM con driver `mysql2`.
- **Validación:** `class-validator` + `class-transformer` con `ValidationPipe` global.
- **Multimedia:** Sharp para compresión y conversión forzada a **WebP**.

---

## 2. Arquitectura Modular y Capas Limpias

El código se organiza estrictamente por módulos de dominio en `src/modulos/<dominio>/`:

```text
src/modulos/
├── usuarios/
├── reporte-fotografico/
├── caja-chica/
├── motores/
├── epp/
├── administracion-interna/
├── cobranzas/
└── sincronizacion/
```

### Flujo Unidireccional en Capas
```text
HTTP Request
   -> Controller (Rutas, DTOs de entrada, Documentación Swagger)
   -> Guards / Interceptors (Autenticación JWT, RBAC, Logging)
   -> Service (Casos de Uso, Lógica de Negocio, Transacciones)
   -> Repository / TypeORM (Consultas y Persistencia en MySQL)
   -> Base de Datos MySQL
```

### Restricciones de Capas
1. **Controladores:** Prohibido incluir lógica de negocio o consultas SQL directas.
2. **Servicios:** Prohibido recibir o manipular objetos de transporte HTTP (`Request`, `Response`). Los servicios solo operan con DTOs y tipos puros de TypeScript.
3. **Módulos:** No acceder a tablas de otro dominio de forma directa; comunicarse mediante servicios inyectados exportados.

---

## 3. Patrones de Diseño Mandatorios

### 3.1. Patrón Adaptador y Estrategia para Almacenamiento
Toda subida de archivos pasa por `StorageService` a través de una interfaz abstracta:
```typescript
export interface AlmacenamientoInterfaz {
  guardarArchivo(buffer: Buffer, rutaRelativa: string): Promise<string>;
  obtenerUrlPublica(rutaRelativa: string): string;
  eliminarArchivo(rutaRelativa: string): Promise<boolean>;
}
```
- La estrategia se selecciona mediante `STORAGE_PROVIDER` (`local`, `r2`, `s3`).
- **Prohibido:** Usar `fs`, `fs/promises` o SDKs de nube dentro de los módulos de negocio.

### 3.2. Procesamiento de Multimedia con Sharp
- Toda imagen recibida se valida en MIME real y se convierte inmediatamente a **WebP**.
- Se aplica compresión optimizada (factor calidad: 80%) y redimensionamiento seguro.
- Las imágenes se guardan fuera de la base de datos con nombres inmutables `UUIDv4 + .webp`.

### 3.3. Transacciones ACID
Toda operación que afecte múltiples tablas (aprobación de cajas chicas, liquidación de saldos con actualización de gastos, creación de proyectos con partidas) debe envolverse en una transacción con `DataSource.transaction()` o `QueryRunner`.

### 3.4. Idempotencia y Trazabilidad
Los endpoints de registro admiten un `id_operacion` (UUID) para garantizar que solicitudes repetidas por problemas de conexión no dupliquen movimientos contables ni registros operativos.

### 3.5. Versionado de API
Todos los endpoints se exponen bajo el prefijo unificado `/api/v1/`.
