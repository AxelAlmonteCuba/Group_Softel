# 📋 Plan de Integración: Justificación en Solicitud de Caja Chica (Backend y BD)

Este documento detalla la arquitectura, el análisis de impacto y el plan de migración paso a paso para incorporar el campo **justificación de solicitud** en el módulo de **Caja Chica**, garantizando compatibilidad total hacia atrás con los registros que ya existen en la base de datos MySQL de Softel.

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
> **No existe la columna `justificacion` en la tabla `cajas_chicas`**. Actualmente la tabla ya cuenta con registros históricos y cajas de prueba registradas.

### 1.2. Entidad TypeORM (`PettyCash` en `petty-cash.entity.ts`)
Solo mapea las columnas numéricas y de estado. No tiene el atributo para almacenar el motivo o justificación de la apertura.

### 1.3. DTO de Entrada (`CreatePettyCashDto` en `create-petty-cash.dto.ts`)
```typescript
export class CreatePettyCashDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  assignedAmount!: number;
}
```
Solo valida y recibe `assignedAmount`. Si el frontend enviara `justification`, el `ValidationPipe` global de NestJS (configurado con `whitelist: true` y `forbidNonWhitelisted: true`) rechazaría la petición con un error `400 Bad Request: property justification should not exist`.

### 1.4. Lógica de Servicio (`PettyCashService.requestPettyCash`)
En la transacción ACID de creación, no persiste ninguna justificación, por lo que el Administrador al evaluar la caja no tiene información del destino del fondo.

---

## 2. 🛡️ Estrategia de Migración para Base de Datos con Datos Existentes

Para cumplir estrictamente con la **Regla 05 (Crecimiento Incremental e Inmutabilidad Histórica)**:
1. **Columna Nulable Inicialmente:** Al agregar una columna a una tabla en producción o con datos existentes, la columna DEBE ser `NULL` (o tener un valor `DEFAULT`). Si se definiera `NOT NULL` sin default, MySQL fallaría al intentar poblar las filas preexistentes.
2. **Backfill de Datos Históricos:** Se actualizan las cajas creadas anteriormente con una descripción general (ej: *"Fondo operativo inicial"*), asegurando integridad y coherencia visual en el historial.
3. **Validación Estricta a Nivel de Aplicación:** Aunque en BD sea `NULL` para soportar el pasado, en el DTO (`CreatePettyCashDto`) se exige `@IsNotEmpty()` para que **toda nueva solicitud de aquí en adelante esté obligatoriamente justificada**.

---

## 3. 📐 Propuesta Técnica Detallada

### 3.1. Migración SQL (MySQL 8.0+)
Script directo a ejecutar en la base de datos `softel_db`:

```sql
-- 1. Añadir la columna 'justificacion' permitiendo NULL para no romper datos previos
ALTER TABLE cajas_chicas 
ADD COLUMN justificacion VARCHAR(255) NULL AFTER monto_asignado;

-- 2. Regularización de datos existentes (Backfill)
-- (Desactiva temporalmente el safe mode de Workbench en la sesión)
SET SQL_SAFE_UPDATES = 0;

UPDATE cajas_chicas 
SET justificacion = 'Apertura de fondo operativo inicial (Histórico)' 
WHERE justificacion IS NULL;

SET SQL_SAFE_UPDATES = 1;
```

---

### 3.2. Cambios en el Backend (NestJS)

#### A. Entidad TypeORM (`src/modulos/petty-cash/entities/petty-cash.entity.ts`)
Se agrega la columna mapeada:
```typescript
@Column({ name: 'justificacion', type: 'varchar', length: 255, nullable: true })
justification!: string | null;
```

#### B. DTO de Creación (`src/modulos/petty-cash/dtos/create-petty-cash.dto.ts`)
Se amplía el DTO con validaciones de `class-validator`:
```typescript
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreatePettyCashDto {
  @IsNotEmpty({ message: 'El monto asignado es obligatorio.' })
  @IsNumber({}, { message: 'El monto asignado debe ser un número.' })
  @IsPositive({ message: 'El monto asignado debe ser mayor a 0.' })
  assignedAmount!: number;

  @IsNotEmpty({ message: 'La justificación del fondo es obligatoria.' })
  @IsString({ message: 'La justificación debe ser texto.' })
  @MaxLength(255, { message: 'La justificación no puede exceder los 255 caracteres.' })
  justification!: string;
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
  justification: dto.justification, // <-- Nuevo campo persistido
});
```

---

### 3.3. Contrato de API Actualizado

#### `POST /api/v1/cajas-chicas`
**Headers:**
- `Authorization: Bearer <token_supervisor>`
- `Content-Type: application/json`

**Body (Nuevo):**
```json
{
  "assignedAmount": 1500.00,
  "justification": "Fondo para movilidad de cuadrilla, combustible de camioneta y ferretería urgente en Obra Norte"
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
  "justification": "Fondo para movilidad de cuadrilla, combustible de camioneta y ferretería urgente en Obra Norte",
  "openingDate": null,
  "closingDate": null,
  "evaluatorUserId": null,
  "createdAt": "2026-09-07T17:15:00.000Z"
}
```

---

### 3.4. Integración en el Frontend (`softel-app`)

1. **Tipado de Servicio (`pettyCashService.ts`):**
   - Actualizar `PettyCashResponse` agregando `justification: string | null;`.
   - Agregar método `requestPettyCash(dto: { assignedAmount: number; justification: string })`.
2. **Pantalla de Solicitud (`RequestPettyCashScreen.tsx`):**
   - Incorporar el campo multilínea de Justificación Operativa.
   - Conectar el botón de *"Enviar Solicitud a Administración"* con validación de ambos campos.
3. **Visualización de Historial / Detalle:**
   - La justificación queda lista para mostrarse tanto en la bandeja del Administrador (`AdminPettyCashScreen`) para aprobar/rechazar con criterio claro, como en el detalle del Supervisor.

---

## 4. 🚀 Pasos de Ejecución Propuestos

| Paso | Acción | Archivos Involucrados | Riesgo / Mitigación |
| :---: | :--- | :--- | :--- |
| **1** | Ejecutar script SQL en MySQL | Base de datos `softel_db` | **Cero**: Se usa `NULL` para no romper registros existentes. |
| **2** | Actualizar Entidad | `petty-cash.entity.ts` | **Bajo**: Mapeo transparente en TypeORM. |
| **3** | Actualizar DTO de entrada | `create-petty-cash.dto.ts` | **Bajo**: Validación segura con mensajes descriptivos. |
| **4** | Actualizar Servicio | `petty-cash.service.ts` | **Bajo**: Transacción ACID protegida. |
| **5** | Actualizar Postman Doc | `postman_caja_chica_gastos.md` | **Nulo**: Mantiene contrato documentado. |
| **6** | Conectar Formulario en App | `RequestPettyCashScreen.tsx` | **Nulo**: Flujo completo listo para producción. |
