# Plan de Implementación: Módulo Caja Chica (Backend)

Este documento servirá como guía detallada para la implementación del módulo **Caja Chica y Gastos** en el backend, respetando estrictamente las Reglas de Negocio (01 a 05).

Siguiendo la estructura del proyecto, los **nombres de los archivos y clases serán en inglés** (ej. `user.entity.ts`, `User`), pero las **propiedades y tablas en base de datos serán en español** (ej. `cajas_chicas`), tal como se define en el diccionario de datos oficial.

El módulo residirá en: `src/modulos/petty-cash/` (equivalente a caja chica).

---

## Etapa 1: Creación de Entidades (Entities)

En esta etapa definiremos los esquemas de base de datos con TypeORM, configurando correctamente las columnas, enums, claves primarias (UUIDs) y relaciones (FKs), asegurando que ninguna entidad manipule lógica de negocio.

### Fase 1.1: Entidad Categoría de Gastos
- **Archivo:** `src/modulos/petty-cash/entities/expense-category.entity.ts`
- **Clase:** `ExpenseCategory`
- **Tabla:** `categorias_gastos`
- **Columnas:** 
  - `id` (INT, PK, Auto Incremental)
  - `nombre` (VARCHAR 50, UNIQUE, NOT NULL)
  - `activo` (BOOLEAN, DEFAULT TRUE)

### Fase 1.2: Entidad Caja Chica
- **Archivo:** `src/modulos/petty-cash/entities/petty-cash.entity.ts`
- **Clase:** `PettyCash`
- **Tabla:** `cajas_chicas`
- **Columnas:**
  - `id` (CHAR 36 / UUIDv4, PK)
  - `usuario_encargado_id` (Relación `ManyToOne` con `User`)
  - `usuario_aprobador_id` (Relación `ManyToOne` con `User`, nullable)
  - `monto_asignado`, `saldo_actual`, `saldo_final` (DECIMAL 10,2)
  - `estado` (ENUM: SOLICITADA, APROBADA, RECHAZADA, ABIERTA, EN_REVISION, CERRADA, LIQUIDADA. Default: SOLICITADA)
  - `fecha_apertura`, `fecha_cierre` (TIMESTAMP, nullable)
  - `creado_en` (CreateDateColumn)

### Fase 1.3: Entidad Gastos
- **Archivo:** `src/modulos/petty-cash/entities/expense.entity.ts`
- **Clase:** `Expense`
- **Tabla:** `gastos`
- **Columnas:**
  - `id` (CHAR 36 / UUIDv4, PK)
  - `caja_chica_id` (Relación `ManyToOne` con `PettyCash`, nullable)
  - `usuario_gasto_id` (Relación `ManyToOne` con `User`)
  - `categoria_id` (Relación `ManyToOne` con `ExpenseCategory`)
  - `usuario_aprobador_id` (Relación `ManyToOne` con `User`, nullable)
  - `monto` (DECIMAL 10,2)
  - `motivo` (VARCHAR 255)
  - `url_comprobante` (TEXT)
  - `estado` (ENUM: PENDIENTE, APROBADO, RECHAZADO. Default: PENDIENTE)
  - `motivo_rechazo` (VARCHAR 255, nullable)
  - `fecha_gasto` (DATE)
  - `creado_en` (CreateDateColumn)

---

## Etapa 2: Creación de Lógica y Controladores (Module, Services, Controllers)

En esta etapa construiremos la lógica de negocio, asegurando que las operaciones financieras usen **Transacciones ACID**, y los endpoints estén protegidos por RBAC (Roles).

### Fase 2.1: Módulo Principal (Module)
- **Archivo:** `src/modulos/petty-cash/petty-cash.module.ts`
- **Clase:** `PettyCashModule`
- **Responsabilidad:** 
  - Registrar las 3 entidades en `TypeOrmModule.forFeature([...])`.
  - Proveer los servicios (`PettyCashService`, `ExpensesService`).
  - Registrar los controladores (`PettyCashController`, `ExpensesController`).
  - Importar el futuro `StorageModule` para manejo de comprobantes webp.

### Fase 2.2: Servicios (Services)

#### A. Servicio de Caja Chica
- **Archivo:** `src/modulos/petty-cash/services/petty-cash.service.ts`
- **Clase:** `PettyCashService`
- **Responsabilidad:**
  - `requestPettyCash()`: Crea la caja chica en estado `SOLICITADA` (Solo Supervisores).
  - `approvePettyCash()`: (Transaccional) Cambia a `APROBADA`, asocia el `usuario_aprobador_id` y configura saldos.
  - `openPettyCash()`: Pasa la caja a `ABIERTA` registrando la `fecha_apertura`.
  - `liquidatePettyCash()`: Cierra y calcula el `saldo_final` oficial.

#### B. Servicio de Gastos
- **Archivo:** `src/modulos/petty-cash/services/expenses.service.ts`
- **Clase:** `ExpensesService`
- **Responsabilidad:**
  - `registerExpense()`: Sube y procesa la imagen (WebP) y crea el gasto `PENDIENTE`.
  - `evaluateExpense()`: (Transaccional) Actualiza el gasto. Si es aprobado, **recalcula atómicamente** el `saldo_actual` y `saldo_final` de la caja chica vinculada usando la regla matemática oficial.

### Fase 2.3: Controladores y DTOs (Controllers & DTOs)

#### A. DTOs (Data Transfer Objects)
- **Carpeta:** `src/modulos/petty-cash/dtos/`
- Archivos: `create-petty-cash.dto.ts`, `update-petty-cash-status.dto.ts`, `create-expense.dto.ts`, `evaluate-expense.dto.ts`.
- **Responsabilidad:** Validación estricta con `class-validator` de campos obligatorios y transformaciones.

#### B. Controladores (Rutas HTTP)
- **Archivos:** `src/modulos/petty-cash/controllers/petty-cash.controller.ts` y `expenses.controller.ts`
- **Responsabilidad:**
  - Exponer rutas REST (`/api/v1/cajas-chicas` y `/api/v1/gastos`).
  - Aplicar `JwtAuthGuard` y `RolesGuard` para asegurar que operaciones sensibles solo las ejecuta el Administrador, mientras que operaciones operativas las ejecuta el Supervisor/Trabajador.
  - Implementar subida de comprobantes con `FileInterceptor`.

---

## Próximos Pasos (Para iniciar la ejecución)

Si apruebas este plan de implementación, comenzaremos inmediatamente con la **Etapa 1**, escribiendo el código de las tres entidades de TypeORM (`expense-category.entity.ts`, `petty-cash.entity.ts` y `expense.entity.ts`).
