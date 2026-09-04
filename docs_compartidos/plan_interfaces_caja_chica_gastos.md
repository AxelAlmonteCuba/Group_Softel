# Plan Maestro de Interfaces de Usuario: Módulo Caja Chica y Gastos (Fase 1.2)

Este documento define la arquitectura consolidada de interfaces de usuario para la aplicación móvil (`App/softel-app`). Refleja la simplificación y unificación de pantallas para optimizar la experiencia de usuario (UX), reducir código redundante y mantener consistencia con los patrones ya establecidos en el proyecto.

---

## 📌 1. Estado Actual del Frontend (¿Qué hay ya diseñado?)

En la aplicación móvil (`App/softel-app/src`) ya contamos con una arquitectura probada:

| Módulo / Elemento | Estado Actual | Archivos Existentes |
| :--- | :---: | :--- |
| **Autenticación** | ✅ Completo | `LoginScreen.tsx`, persistencia de token JWT, `authService.ts`, interceptores Axios. |
| **Navegación Base** | ✅ Completo | `RootNavigator.tsx`, `AuthStack.tsx`, `MainStack.tsx` (con soporte de roles y tipos TypeScript). |
| **Gestión de Usuarios** | ✅ Completo | `UserManagementScreen.tsx`, `AddEditUserScreen.tsx` (patrón de formulario unificado por `mode: 'create' \| 'edit' \| 'view'`). |
| **Dashboard Home** | ⚠️ Parcial | • `HomeAdminScreen.tsx`: Diseñado con tarjetas de resumen y accesos rápidos.<br>• `HomeOperatorScreen.tsx`: Pantalla placeholder básica para supervisores y trabajadores. |
| **Librería de Componentes UI** | 🔄 Base lista | `ButtonPrimary`, `ButtonSecondary`, `ButtonTertiary`, `CardHome`, `CardOptions`, `CustomInput`, `UserTopBar`, `SearchBar`, `FilterChips`, `FabButton`, paleta de colores y estilos en `src/theme/`. |
| **Módulo Caja Chica y Gastos** | 🚀 **En diseño** | Endpoints de backend 100% listos en `/api/v1/cajas-chicas` y `/api/v1/gastos`. Procedemos a construir las pantallas consolidadas. |

---

## 🎯 2. Matriz Consolidada de Interfaces por Rol de Usuario

Hemos unificado pantallas clave para maximizar la reusabilidad (reduciendo de 9 a **6 pantallas principales**):

1. **Pantallas 1 y 8 UNIDAS:** `PettyCashManagementScreen` (combina Cajas Chicas y Cuentas por Pagar mediante pestañas/filtros).
2. **Pantalla 2:** `PettyCashDetailScreen` (detalle y conciliación de caja).
3. **Pantalla 3:** `MyPettyCashScreen` (centro de mando del Supervisor).
4. **Pantalla 4:** `RequestPettyCashModalScreen` (solicitud de fondo base).
5. **Pantalla 5:** `ExpenseApprovalInboxScreen` (bandeja de auditoría ágil para el Administrador).
6. **Pantallas 6 y 7 UNIDAS:** `AddEditExpenseScreen` (formulario unificado para crear, subsanar observados y ver detalle de gasto).
7. **Pantalla de Gasto Sin Caja Chica:** `MyReimbursementsScreen` (pantalla dedicada para que el trabajador consulte sus reembolsos a favor).

| Pantalla / Interfaz | Administrador | Contador | Supervisor | Trabajador |
| :--- | :---: | :---: | :---: | :---: |
| **1. Control de Fondos y Cuentas por Pagar** (1 y 8 unidas) | **Sí** (control total) | **Sí** (auditoría/pago) | No | No |
| **2. Detalle de Caja Chica** | **Sí** (gestionar) | **Sí** (auditar) | **Sí** (su caja) | No |
| **3. Panel "Mi Caja Chica"** | No | No | **Sí** (gestión activa) | No |
| **4. Solicitar Apertura de Fondo** | No | No | **Sí** (solicitante) | No |
| **5. Bandeja de Aprobación de Gastos** | **Sí** (aprobar/observar/rechazar) | No | No | No |
| **6. Formulario de Gasto** (6 y 7 unidas: Crear/Subsanar) | **Sí** | No | **Sí** (con/sin caja) | **Sí** (reembolso directo) |
| **7. Mis Reembolsos Directos** (Gastos sin caja chica) | No | No | **Sí** (ver deuda propia) | **Sí** (ver deuda a favor) |

---

## 📱 3. Catálogo Detallado de Pantallas Consolidadas

Ubicación proyectada en código: `App/softel-app/src/features/petty-cash/screens/`

### 3.1 `PettyCashManagementScreen` (Cajas Chicas y Cuentas por Pagar — UNIÓN de Pantallas 1 y 8)
- **Roles:** `ADMINISTRADOR`, `CONTADOR`.
- **Propósito:** Panel central unificado para supervisar tanto los fondos asignados (Cajas Chicas) como las deudas pendientes de reembolso directo a trabajadores.
- **Estructura y Componentes:**
  - **Selector de Pestañas (Segmented Tabs):**
    - **Tab A: "Cajas Chicas"**:
      - Chips de filtro por estado: `Todas`, `Abiertas`, `En Revisión`, `Cerradas`, `Liquidadas`.
      - Tarjetas de Cajas Chicas con: nombre de supervisor, monto asignado, saldo disponible, barra de progreso y badge de estado.
      - Al pulsar navega a `PettyCashDetailScreen`.
    - **Tab B: "Reembolsos Directos (Por Pagar)"**:
      - Tarjeta de resumen superior: "Total por reembolsar a personal: S/ X,XXX.XX".
      - Lista agrupada por trabajador con el total que se le adeuda (`totalOwed`).
      - Botón directo de acción: **"Pagar / Reembolsar"** (ejecuta `PATCH /gastos/:id/reembolsar`).
- **Endpoints:** `GET /api/v1/cajas-chicas`, `GET /api/v1/gastos/reembolsos-directos/usuarios-con-deuda`.

---

### 3.2 `PettyCashDetailScreen` (Detalle de Caja Chica y Auditoría de Saldos)
- **Roles:** `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`.
- **Propósito:** Radiografía completa de una caja chica específica con saldos en tiempo real y lista de comprobantes asociados.
- **Estructura y Componentes:**
  - Header financiero con métricas claras: Fondo Asignado, Saldo Disponible (`currentBalance`), Saldo Final (`finalBalance`).
  - Barra visual de progreso de consumo del fondo.
  - Botones de transición de estado según permisos:
    - `SOLICITADA`: Botones *Aprobar* / *Rechazar*.
    - `APROBADA`: Botón *Entregar Fondo (Abrir)*.
    - `EN_REVISION`: Botón *Cerrar Caja*.
    - `CERRADA`: Botón *Liquidar Caja Definitivamente*.
  - Lista de comprobantes rendidos con miniatura de foto y estado.
- **Endpoints:** `GET /api/v1/gastos/caja/:cajaId`, `PATCH /api/v1/cajas-chicas/:id/estado`.

---

### 3.3 `MyPettyCashScreen` (Panel Operativo "Mi Caja Chica" — Supervisor)
- **Roles:** `SUPERVISOR`.
- **Propósito:** Espacio diario del supervisor en campo para controlar su fondo asignado y registrar comprobantes.
- **Estructura y Componentes:**
  - **Si no tiene caja activa:** Tarjeta vacía ilustrada con botón `+ Solicitar Apertura de Caja Chica`.
  - **Si tiene caja activa (`ABIERTA`):**
    - Widget financiero con saldo disponible en tipografía grande (`S/ 1,250.50`).
    - Barra de progreso del gasto acumulado.
    - Botón ancho: `Finalizar y Enviar a Revisión` (con diálogo de confirmación).
    - Lista de comprobantes rendidos (Aprobados, Pendientes, Observados).
    - Botón flotante circular (`FabButton`) en rojo `#B42318` para `+ Registrar Gasto con Boleta`.
- **Endpoints:** `GET /api/v1/cajas-chicas/usuario/:usuarioId`, `PATCH /api/v1/cajas-chicas/:id/estado` (acción `REVISAR`).

---

### 3.4 `RequestPettyCashModalScreen` (Solicitud de Apertura de Fondo)
- **Roles:** `SUPERVISOR`.
- **Propósito:** Formulario modal para que el supervisor solicite un fondo base.
- **Estructura:**
  - Input de monto (`assignedAmount`) con prefijo fijo `S/`.
  - Recordatorio de rendición de comprobantes obligatorios.
  - Botón "Enviar Solicitud".
- **Endpoints:** `POST /api/v1/cajas-chicas`.

---

### 3.5 `ExpenseApprovalInboxScreen` (Bandeja de Aprobación de Gastos — Administrador)
- **Roles:** `ADMINISTRADOR`.
- **Propósito:** Bandeja estilo "inbox" para auditar y dictaminar sobre cada comprobante pendiente con 1 solo toque.
- **Estructura y Componentes:**
  - Contador de gastos pendientes en el header (Badge numérico).
  - Feed vertical de tarjetas de comprobantes:
    - Avatar, nombre del trabajador y fecha.
    - Miniatura de la boleta con visor a pantalla completa.
    - Categoría, monto y concepto/justificación.
    - Botonera rápida de decisión:
      - **Aprobar** (verde `#16803C`): Recalcula automáticamente el saldo.
      - **Observar** (ámbar `#B7791F`): Abre diálogo pidiendo `evaluationComment` (ej: "Boleta borrosa").
      - **Rechazar** (rojo `#B42318`): Abre diálogo pidiendo motivo de rechazo definitivo.
- **Endpoints:** `GET /api/v1/gastos/pendientes`, `PATCH /api/v1/gastos/:id/evaluar`.

---

### 3.6 `AddEditExpenseScreen` (Formulario de Gasto — UNIÓN de Pantallas 6 y 7)
- **Roles:** `SUPERVISOR`, `TRABAJADOR`, `ADMINISTRADOR`.
- **Propósito:** Formulario unificado que se adapta dinámicamente mediante el parámetro `mode`:
  - **`mode === 'create'` (Registrar Nuevo Gasto):**
    - Selector de tipo de gasto: `Caja Chica Asignada` vs `Reembolso Directo (Pagué de mi bolsillo)`.
    - Selector de cámara o galería para captura de comprobante.
    - Campos: Categoría (desplegable con iconos), Monto (`amount`), Motivo (`reason`), Fecha.
    - Botón: "Guardar y Enviar Comprobante".
  - **`mode === 'edit'` (Subsanar Gasto Observado):**
    - Banner de advertencia superior en color ámbar (`#FEF3C7`) mostrando la observación de la administración (ej: *"La foto no muestra el total legible"*).
    - Campos precargados con opción de sustituir la foto del comprobante o corregir montos.
    - Botón: "Reenviar Comprobante Corregido" (regresa a estado `PENDIENTE`).
  - **`mode === 'view'` (Ver Detalle de Gasto):**
    - Campos de solo lectura, visor de comprobante en alta resolución, evaluador y fecha de aprobación.
- **Endpoints:** `POST /api/v1/gastos`, `PATCH /api/v1/gastos/:id`.

---

### 3.7 `ReimbursementsScreen` (Gestión y Detalle de Reembolsos Directos con Filtros — Reutilizable)
- **Roles:** `TRABAJADOR`, `SUPERVISOR`, `ADMINISTRADOR`, `CONTADOR`.
- **Propósito:** Pantalla única impulsada por un sistema de **Filtros por Chips** que atiende tanto al trabajador (para consultar su saldo y comprobantes) como al administrador (para auditar y liquidar los comprobantes de un trabajador específico).
- **Estructura y Comportamiento según Rol:**
  - **Header Dinámico:**
    - *Trabajador:* "Mis Reembolsos" (subtítulo: "Gastos personales pendientes de cobro").
    - *Administrador:* "Reembolsos: [Nombre Trabajador]" (subtítulo: "DNI y cargo del colaborador").
  - **Tarjeta Resumen Financiera (Hero Card):**
    - Muestra el monto total adeudado ("Total por reembolsar: S/ 235.00" en verde `#16803C`).
    - Desglose: "X aprobados por pagar • Y en revisión".
  - **Barra Deslizable de Filtros por Chips (Píldoras):**
    - Chips: `Todos`, `Por Cobrar / Aprobados`, `Pendientes`, `Pagados`, `Observados`.
    - Permite alternar de inmediato entre las boletas ya pagadas históricas y las que están pendientes de abono.
  - **Lista de Comprobantes:**
    - Tarjeta con miniatura de la foto, motivo, categoría, fecha y monto.
    - Badges semánticos: `APROBADO - PENDIENTE DE PAGO`, `PENDIENTE`, `PAGADO`, `OBSERVADO`.
    - **Acción Exclusiva de Administrador:** Cada comprobante aprobado incluye el botón verde **"Pagar / Reembolsar"** (ejecuta `PATCH /gastos/:id/reembolsar`).
  - **Botón de Acción:**
    - *Trabajador:* Botón `+ Registrar Gasto para Reembolso`.
    - *Administrador:* Botón "Pagar Todo el Saldo Pendiente".
- **Endpoints:** `GET /api/v1/gastos/reembolsos-directos/pendientes/:usuarioId`, `PATCH /api/v1/gastos/:id/reembolsar`.

---

## 🧭 4. Integración en Navegación (`MainStack.tsx`)

Las nuevas rutas a registrar en `src/navigation/types.ts` y `MainStack.tsx` son:

```typescript
export type MainStackParamList = {
  Home: undefined;
  UserManagement: { initialFilter?: string } | undefined;
  AddEditUser: { mode: 'create' | 'edit' | 'view'; user?: User };
  
  // === Módulo Caja Chica y Gastos (Consolidado) ===
  PettyCashManagement: undefined;                 // Pantallas 1 y 8 unidas (Admin/Contador)
  PettyCashDetail: { pettyCashId: string };       // Pantalla 2 (Detalle y conciliación)
  MyPettyCash: undefined;                         // Pantalla 3 (Panel del Supervisor)
  RequestPettyCash: undefined;                    // Pantalla 4 (Modal solicitud fondo)
  ExpenseApprovalInbox: undefined;                // Pantalla 5 (Bandeja auditoría Admin)
  AddEditExpense: {                               // Pantallas 6 y 7 unidas
    mode: 'create' | 'edit' | 'view';
    expenseId?: string;
    isDirectReimbursement?: boolean;
    initialData?: any;
  };
  Reimbursements: {                               // Pantalla con Filtros (Trabajador y Admin)
    userId?: string; 
    userName?: string; 
  } | undefined;
};
```

---

## 🎨 5. Componentes UI Reutilizables a Diseñar

1. `PettyCashStatusBadge`: Badge de estado oficial (`SOLICITADA`, `APROBADA`, `ABIERTA`, `EN_REVISION`, `CERRADA`, `LIQUIDADA`).
2. `ExpenseStatusBadge`: Badge de estado de gastos (`PENDIENTE`, `APROBADO`, `OBSERVADO`, `RECHAZADO`).
3. `BalanceHeroWidget`: Tarjeta destacada de saldo disponible vs fondo asignado con barra de progreso.
4. `ReceiptViewerModal`: Visor modal con zoom para revisar boletas y facturas antes de aprobar.
5. `EvaluationActionModal`: Modal para ingresar comentarios obligatorios al observar o rechazar comprobantes.
