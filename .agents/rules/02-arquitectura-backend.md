---
trigger: always_on
---

# Regla 02: Arquitectura del Backend, Servicios y Transacciones

Esta regla establece los patrones de arquitectura, diseño de capas, manejo transaccional ACID, procesamiento de almacenamiento y directrices de código en NestJS para Softel.

---

## 1. Principio de Backend Único y Stack Tecnológico

El backend central atiende de forma unificada tanto a la aplicación web como a la aplicación móvil. **Prohibido crear backends o servicios separados por plataforma**.

- **Runtime & Lenguaje:** Node.js (v20+ LTS) con TypeScript (`strict: true`).
- **Framework:** NestJS 11.x (Inyección de Dependencias, Módulos, Controladores, Servicios, Guards, Pipes e Interceptores).
- **Persistencia:** TypeORM con driver `mysql2`.
- **Validación:** `class-validator` + `class-transformer` con `ValidationPipe` global.
- **Procesamiento de Imágenes:** Sharp para compresión y conversión obligatoria a formato **WebP**.
- **Generación de Documentos:** Librerías backend especializadas para emitir reportes en formato **Excel (.xlsx)** y **PDF**.

---

## 2. Arquitectura Modular y Capas Limpias

El código se organiza estrictamente por módulos de dominio dentro de `src/modulos/<dominio>/`:

```text
src/modulos/
├── usuarios/
├── caja-chica/
├── reporte-fotografico/
├── motores/                  # Módulo futuro
├── epp/                      # Módulo futuro
├── administracion-interna/   # Módulo futuro
├── cobranzas/                # Módulo futuro
└── sincronizacion/           # Módulo futuro
```

### Flujo Unidireccional en Capas
```text
HTTP Request
   -> Controller (Rutas, DTOs de entrada, Documentación Swagger)
   -> Guards / Interceptors (Autenticación JWT, RBAC, Logging)
   -> Service (Casos de Uso, Lógica de Negocio, Transacciones ACID)
   -> Repository / TypeORM (Consultas y Persistencia en MySQL)
   -> Base de Datos MySQL
```

### Restricciones Estrictas de Capas
1. **Controladores:** Prohibido incluir lógica de negocio, cálculos de saldos o sentencias SQL directas.
2. **Servicios:** Prohibido recibir o manipular objetos de transporte HTTP (`Request`, `Response`). Operan exclusivamente con DTOs y tipos puros.
3. **Aislamiento entre Módulos:** No consultar repositorios de otro dominio directamente; comunicarse a través de servicios inyectados exportados.

---

## 3. Transacciones ACID Obligatorias

Toda operación que afecte múltiples registros o involucre cálculos financieros debe ejecutarse dentro de una transacción gestionada por `DataSource.transaction()` o `QueryRunner`:

1. **Aprobación o Apertura de Caja Chica:** Actualización de estado, asignación de aprobador, registro de fechas y configuración de saldo inicial.
2. **Aprobación o Rechazo de Gastos:**
   - Al aprobar un gasto: cambiar estado a `APROBADO`, asignar `usuario_aprobador_id`, y **recalcular atómicamente** `saldo_actual` y `saldo_final` en la tabla `cajas_chicas`.
   - Al rechazar un gasto: cambiar estado a `RECHAZADO`, registrar `motivo_rechazo`, asignar `usuario_aprobador_id` y asegurar que no altere los saldos.
3. **Cierre y Liquidación de Caja:** Conciliación final de saldos y congelamiento de estado.
4. **Estructura de Reporte Fotográfico:** Creación o modificación de proyecto junto con sus partidas fotográficas.

> [!WARNING]
> Nunca dejar una caja con saldo actualizado si el gasto no se persistió con éxito, ni un gasto aprobado si el saldo de caja no fue recalculado en la misma transacción.

---

## 4. Patrón de Almacenamiento y Multimedia con Sharp

### 4.1. Patrón Adaptador para Almacenamiento
Toda interacción con archivos físicos se delega a `StorageService` implementando la interfaz:
```typescript
export interface AlmacenamientoInterfaz {
  guardarArchivo(buffer: Buffer, rutaRelativa: string): Promise<string>;
  obtenerUrlPublica(rutaRelativa: string): string;
  eliminarArchivo(rutaRelativa: string): Promise<boolean>;
}
```
- El proveedor se selecciona mediante la variable `STORAGE_PROVIDER` (`local`, `r2`, `s3`).
- **Prohibido:** Usar `fs`, `fs/promises` o SDKs de nube dentro de los servicios de negocio.

### 4.2. Procesamiento de Imágenes
- Validación obligatoria de tipo MIME real antes de procesar.
- Conversión inmediata a **WebP** y compresión optimizada (factor calidad: 80%).
- Almacenamiento con identificador inmutable: `UUIDv4 + .webp`.
- **En la base de datos se almacena únicamente la ruta relativa** (ej. `/gastos/2026/08/uuid.webp`).
- Limpieza de archivos temporales si la inserción en base de datos falla.

---

## 5. Generación y Descarga de Documentos (Excel y PDF)

- **Reportes Fotográficos en Excel:** El backend consulta `proyectos_fotograficos`, `partidas_fotograficas` y `registros_fotograficos`, y genera el archivo `.xlsx` en memoria para su descarga directa.
- **Sin tablas innecesarias:** No crear tablas intermedias para descargas a menos que se requiera una auditoría formal de descargas aprobada.
- **Validación de Permisos en Descarga:** La generación de archivos respeta las políticas RBAC del backend.

---

## 6. Idempotencia y Versionado

- **Idempotencia:** Los endpoints de mutación sensible aceptan un encabezado o campo `id_operacion` (UUID) para evitar duplicidad de registros en reintentos de red.
- **Versionado Global:** Todos los endpoints se exponen obligatoriamente bajo el prefijo unificado `/api/v1/`.
