# 📋 Plan de Integración: Justificación y Vinculación Futura de Proyecto en Solicitud de Caja Chica (Backend y BD)

Este documento detalla la arquitectura, el análisis de impacto y el plan de migración paso a paso para incorporar los campos **justificación de solicitud** y **proyecto_id (preparación para proyectos futuros)** en el módulo de **Caja Chica**, garantizando compatibilidad total hacia atrás con los registros que ya existen en la base de datos MySQL de Softel.

---

## 1. 🔍 Diagnóstico y Estado Actual del Backend

### 1.1. Base de Datos (`softel_db.cajas_chicas`)
Actualmente, la tabla oficial según la **Regla 03** contiene:
- `id` (CHAR 36 / UUID)
- `usuario_encargado_id` (CHAR 36)
- `usuario_evaluador_id` (CHAR 36, NULL)
- `monto_asignado` (DECIMAL 10,2)
- `saldo_actual` (DECIMAL 10,2)
- `saldo_final` (DECIMAL 10,2)
- `estado` (ENUM)
- `fecha_apertura` (TIMESTAMP NULL)
- `fecha_cierre` (TIMESTAMP NULL)
- `creado_en` (TIMESTAMP)

> [!WARNING]
> **No existen las columnas `justificacion` ni `proyecto_id` en la tabla `cajas_chicas`**. Actualmente la tabla ya cuenta con registros históricos y cajas de prueba registradas.

### 1.2. Entidad TypeORM (`PettyCash` en `petty-cash.entity.ts`)
Solo mapea las columnas numéricas y de estado. No tiene los atributos para almacenar el motivo de apertura ni el enlace opcional con proyectos.

### 1.3. DTO de Entrada (`CreatePettyCashDto` en `create-petty-cash.dto.ts`)
```typescript
export class CreatePettyCashDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  assignedAmount!: number;
}
```
Solo valida y recibe `assignedAmount`. Si el frontend enviara propiedades adicionales, el `ValidationPipe` global de NestJS (configurado con `whitelist: true` y `forbidNonWhitelisted: true` según la **Regla 04**) rechazaría la petición con un error `400 Bad Request`.

### 1.4. Lógica de Servicio (`PettyCashService.requestPettyCash`)
En la transacción ACID de creación, solo persiste monto y estado, por lo que el Administrador al evaluar la caja no tiene información del destino del fondo ni del proyecto al que corresponde.

---

## 2. 🛡️ Estrategia de Migración y Crecimiento Incremental (Reglas 03 y 05)

Para cumplir estrictamente con la **Regla 05 (Crecimiento Incremental, Preservación Histórica y Referencias Opcionales)**:
1. **Columnas Nulables Inicialmente:** Al agregar columnas a una tabla en producción o con datos existentes, ambas columnas DEBEN ser `NULL`. Si se definieran `NOT NULL` sin default, MySQL fallaría al intentar poblar las filas preexistentes.
2. **Backfill de Datos Históricos:** Se actualizan las cajas creadas anteriormente con una descripción general (ej: *"Apertura de fondo operativo inicial (Histórico)"*), asegurando consistencia en reportes y consultas.
3. **Manejo de `proyecto_id` sin Foreign Key prematura:**
   - La tabla de proyectos (`proyectos_fotograficos` o comercial) pertenece a la **Fase 1.3 / fases comerciales** y aún no está creada en la base de datos.
   - Si intentáramos crear una `FOREIGN KEY` hacia una tabla que aún no existe, MySQL arrojará `Error 1824: Failed to open the referenced table`.
   - Por tanto, se crea como columna estándar `CHAR(36) NULL` con su correspondiente índice explícito (`idx_cajas_chicas_proyecto_id`) conforme a la **Regla 03**.
   - En la Fase 1.3, cuando la tabla de proyectos exista, simplemente se ejecutará un `ALTER TABLE cajas_chicas ADD CONSTRAINT fk_cajas_chicas_proyecto FOREIGN KEY (proyecto_id) REFERENCES ... (id) ON DELETE SET NULL;` sin alterar los datos.
4. **Validación Diferenciada en Aplicación (DTO):**
   - `justification`: Obligatorio (`@IsNotEmpty()`, `@MaxLength(255)`). Toda nueva solicitud debe estar justificada.
   - `projectId`: Opcional (`@IsOptional()`, `@IsUUID('4')`). Si no se envía (como en la fase actual de la app móvil), entra como `null` sin error.

---

## 3. 📐 Propuesta Técnica Detallada

### 3.1. Migración SQL (MySQL 8.0+)
Script directo a ejecutar en la base de datos `softel_db`:

```sql
-- 1. Añadir las columnas 'justificacion' y 'proyecto_id' permitiendo NULL para no romper datos previos
ALTER TABLE cajas_chicas 
ADD COLUMN justificacion VARCHAR(255) NULL AFTER monto_asignado,
ADD COLUMN proyecto_id CHAR(36) NULL AFTER justificacion,
ADD INDEX idx_cajas_chicas_proyecto_id (proyecto_id);

-- 2. Regularización de datos existentes para 'justificacion' (Backfill)
-- Se desactiva temporalmente el Safe Update Mode de Workbench para esta sesión
SET SQL_SAFE_UPDATES = 0;

UPDATE cajas_chicas 
SET justificacion = 'Apertura de fondo operativo inicial (Histórico)' 
WHERE justificacion IS NULL;

SET SQL_SAFE_UPDATES = 1;
```

---

### 3.2. Cambios en el Backend (NestJS)

#### A. Entidad TypeORM (`src/modulos/petty-cash/entities/petty-cash.entity.ts`)
Se agregan las columnas mapeadas:
```typescript
@Column({ name: 'justificacion', type: 'varchar', length: 255, nullable: true })
justification!: string | null;

@Column({ name: 'proyecto_id', type: 'char', length: 36, nullable: true })
projectId!: string | null;
```

#### B. DTO de Creación (`src/modulos/petty-cash/dtos/create-petty-cash.dto.ts`)
Se amplía el DTO con validaciones de `class-validator`:
```typescript
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePettyCashDto {
  @IsNotEmpty({ message: 'El monto asignado es obligatorio.' })
  @IsNumber({}, { message: 'El monto asignado debe ser un número.' })
  @IsPositive({ message: 'El monto asignado debe ser mayor a 0.' })
  assignedAmount!: number;

  @IsNotEmpty({ message: 'La justificación del fondo es obligatoria.' })
  @IsString({ message: 'La justificación debe ser texto.' })
  @MaxLength(255, { message: 'La justificación no puede exceder los 255 caracteres.' })
  justification!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del proyecto debe ser un UUID v4 válido.' })
  projectId?: string;
}
```

#### C. Servicio Transaccional (`src/modulos/petty-cash/services/petty-cash.service.ts`)
En el método `requestPettyCash`:
```typescript
const newPettyCash = queryRunner.manager.create(PettyCash, {
  managerUserId: managerUserId,
  assignedAmount: dto.assignedAmount,
  currentBalance: dto.assignedAmount,
  finalBalance: 0.0,
  status: 'SOLICITADA',
  justification: dto.justification,
  projectId: dto.projectId ?? null, // Persiste null si no se envía
});
```

---

### 3.3. Contrato de API Actualizado

#### `POST /api/v1/cajas-chicas`
**Headers:**
- `Authorization: Bearer <token_supervisor>`
- `Content-Type: application/json`

**Body (Caso 1: Sin vincular proyecto aún - Actual):**
```json
{
  "assignedAmount": 1500.00,
  "justification": "Fondo para movilidad de cuadrilla, combustible de camioneta y ferretería urgente"
}
```

**Body (Caso 2: Con proyecto vinculado - Futuro):**
```json
{
  "assignedAmount": 1500.00,
  "justification": "Fondo para compras de obra en proyecto central",
  "projectId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": "b2f5df91-fbfe-464c-8ac5-d33a506595f1",
  "managerUserId": "b529df08-a9e5-43be-8770-b09c2be12eda",
  "assignedAmount": "1500.00",
  "currentBalance": 1500.0,
  "finalBalance": -1500.0,
  "status": "SOLICITADA",
  "justification": "Fondo para movilidad de cuadrilla, combustible de camioneta y ferretería urgente",
  "projectId": null,
  "openingDate": null,
  "closingDate": null,
  "evaluatorUserId": null,
  "createdAt": "2026-09-07T17:15:00.000Z"
}
```

---

### 3.4. Integración en el Frontend (`softel-app`)

1. **Tipado de Servicio (`pettyCashService.ts`):**
   - Actualizar `PettyCashResponse` agregando:
     ```typescript
     justification: string | null;
     projectId: string | null;
     ```
   - Actualizar método `requestPettyCash`:
     ```typescript
     requestPettyCash: async (data: { assignedAmount: number; justification: string; projectId?: string }) => { ... }
     ```
2. **Pantalla de Solicitud (`RequestPettyCashScreen.tsx`):**
   - Incorporar el campo multilínea de Justificación Operativa.
   - Dejar la estructura lista para que en el futuro se pueda inyectar un selector de proyectos sin alterar la lógica base.
   - Validar que monto > 0 y justificación no esté vacía antes de emitir la llamada API.
3. **Visualización de Historial / Detalle:**
   - La justificación se visualiza tanto en la bandeja del Administrador (`AdminPettyCashScreen`) para aprobar/rechazar con criterio claro, como en el historial del Supervisor.

---

## 4. 🚀 Matriz de Pasos y Riesgos

| Paso | Acción | Archivos Involucrados | Riesgo / Mitigación |
| :---: | :--- | :--- | :--- |
| **1** | Ejecutar script SQL en MySQL | Base de datos `softel_db` | **Cero**: Se usan columnas `NULL`, índice explícito y safe updates desactivado solo en la sesión de regularización. |
| **2** | Actualizar Entidad TypeORM | `petty-cash.entity.ts` | **Bajo**: Mapeo nativo de `justification` y `projectId`. |
| **3** | Actualizar DTO de entrada | `create-petty-cash.dto.ts` | **Bajo**: Validación obligatoria para justificación y opcional para proyecto. |
| **4** | Actualizar Servicio | `petty-cash.service.ts` | **Bajo**: Transacción ACID protegida. |
| **5** | Actualizar Postman Doc | `postman_caja_chica_gastos.md` | **Nulo**: Mantiene contrato documentado. |
| **6** | Conectar Formulario en App | `RequestPettyCashScreen.tsx` | **Nulo**: Flujo completo listo para producción. |
