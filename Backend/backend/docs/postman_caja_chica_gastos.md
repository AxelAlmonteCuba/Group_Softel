# Manual de Endpoints y Pruebas en Postman: Módulo Caja Chica y Gastos (Fase 1.2)

Esta documentación técnica contiene la totalidad de los endpoints implementados para el módulo de **Caja Chica y Gastos**, incluyendo rendiciones con fondo y reembolsos directos (sin caja), respetando estrictamente las reglas de negocio (**Regla 01 a 05**), los roles de usuario (RBAC), el filtrado seguro de datos (sin exposición de claves ni campos redundantes) y el ciclo de vida oficial.

Sirve como contrato oficial entre Backend y Frontend para la construcción de las interfaces de usuario.

---

## 🔐 Configuración Global y Autenticación

Todas las rutas operativas requieren un token JWT válido.

### 1. Iniciar Sesión (Login)
Obtén el token de acceso para el usuario deseado (`ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR` o `TRABAJADOR`).

- **URL:** `http://localhost:3000/api/v1/auth/login`
- **Método:** `POST`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la Petición (JSON):**
```json
{
  "correo": "admin@g-softel.com",
  "clave": "tu_clave_secreta"
}
```
- **Respuesta Exitosa (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f166cbd4-57a2-42c0-8543-3047f2c6e1d6",
    "documento_identidad": "71234567",
    "nombres": "Administrador",
    "apellidos": "Sistema",
    "correo": "admin@g-softel.com",
    "cargo": "Gerente General",
    "rol": "ADMINISTRADOR",
    "estado": "ACTIVO"
  }
}
```

> [!TIP]
> En Postman, copia el `accessToken` y colócalo en la pestaña **Authorization -> Type: Bearer Token** en cada una de las peticiones subsiguientes. (O usa los scripts de la sección 8 para automatizarlo).

---

## 📦 2. Ciclo de Vida de Caja Chica

```text
[SOLICITADA] ──(Admin aprueba)──> [APROBADA] ──(Entrega de fondo)──> [ABIERTA]
     │                                                                   │
     ├──(Admin rechaza)──> [RECHAZADA]                                  │ (Rendición de Gastos)
     │                                                                   v
[LIQUIDADA] <──(Liquidación final)── [CERRADA] <──(Envío auditoría)── [EN_REVISION]
```

### 2.1 Solicitar Apertura de Caja Chica
El encargado solicita un fondo base para su cuadrilla o proyecto.

- **URL:** `http://localhost:3000/api/v1/cajas-chicas`
- **Método:** `POST`
- **Rol Permitido:** `SUPERVISOR`
- **Headers:** `Content-Type: application/json`
- **Cuerpo de la Petición (JSON):**
```json
{
  "assignedAmount": 1500.50
}
```
- **Respuesta Exitosa (201 Created):**
```json
{
  "id": "b2f5df91-fbfe-464c-8ac5-d33a506595f1",
  "managerUserId": "b529df08-a9e5-43be-8770-b09c2be12eda",
  "assignedAmount": "1500.50",
  "currentBalance": 1500.5,
  "finalBalance": -1500.5,
  "status": "SOLICITADA",
  "openingDate": null,
  "closingDate": null,
  "evaluatorUserId": null,
  "createdAt": "2026-09-03T18:10:33.000Z"
}
```

---

### 2.2 Transiciones de Estado de Caja Chica
Todas las transiciones de estado de una caja chica se canalizan a través del endpoint centralizado:
- **URL:** `http://localhost:3000/api/v1/cajas-chicas/{id}/estado`
- **Método:** `PATCH`
- **Headers:** `Content-Type: application/json`

#### A. Aprobar Solicitud (`APROBAR`)
El Administrador autoriza la solicitud de fondo.
- **Rol:** `ADMINISTRADOR`
- **Body:**
```json
{
  "action": "APROBAR"
}
```

#### B. Rechazar Solicitud (`RECHAZAR`)
El Administrador deniega la apertura de la caja chica. Pasa a estado `RECHAZADA` y termina el ciclo.
- **Rol:** `ADMINISTRADOR`
- **Body:**
```json
{
  "action": "RECHAZAR"
}
```

#### C. Abrir Caja Chica (`ABRIR`)
El Administrador entrega formalmente el dinero en efectivo o transferencia. Pasa a estado `ABIERTA` y registra `fecha_apertura`. **Único estado regular que admite registro de gastos contra la caja**.
- **Rol:** `ADMINISTRADOR`
- **Body:**
```json
{
  "action": "ABRIR"
}
```

#### D. Enviar a Revisión (`REVISAR`)
El Supervisor finaliza la rendición de comprobantes y envía la caja para auditoría de Administración. Bloquea nuevos gastos.
- **Rol:** `SUPERVISOR`
- **Body:**
```json
{
  "action": "REVISAR"
}
```

#### E. Cerrar Caja Chica (`CERRAR`)
El Administrador culmina la auditoría de comprobantes. Pasa a estado `CERRADA` y congela los saldos para conciliación contable.
- **Rol:** `ADMINISTRADOR`
- **Body:**
```json
{
  "action": "CERRAR"
}
```

#### F. Liquidar Caja Chica (`LIQUIDAR`)
El Administrador ejecuta la regularización final (devolución de sobrante por el encargado o reembolso al encargado). Recalcula atómicamente saldos finales con base en gastos `APROBADOS` y registra `fecha_cierre`. Pasa a estado `LIQUIDADA`.
- **Rol:** `ADMINISTRADOR`
- **Body:**
```json
{
  "action": "LIQUIDAR"
}
```

---

## 🧾 3. Registro y Gestión de Gastos

### 3.1 Registrar un Gasto (Con o Sin Caja Chica)
Permite a un Supervisor o Trabajador registrar un gasto obligatorio con su comprobante digital. El backend convierte y optimiza automáticamente la imagen a formato **WebP**.

> [!WARNING]
> En Postman, selecciona la pestaña **Body -> form-data** (no uses raw JSON).

- **URL:** `http://localhost:3000/api/v1/gastos`
- **Método:** `POST`
- **Roles Permitidos:** `SUPERVISOR`, `TRABAJADOR`
- **Campos en form-data:**
  | Clave | Tipo | Requerido | Descripción |
  | :--- | :--- | :---: | :--- |
  | `pettyCashId` | Text | **Opcional** | UUID de la caja chica abierta. **Si se omite**, el gasto se registra como **Reembolso Directo**. |
  | `categoryId` | Text/Number | **Sí** | ID numérico de categoría (1: Movilidad, 2: Materiales, 3: Viáticos, 4: Combustible, 5: Otros). |
  | `amount` | Text/Number | **Sí** | Monto del gasto (> 0.00). Ej: `250.00`. |
  | `reason` | Text | **Sí** | Concepto o justificación clara del gasto. |
  | `expenseDate` | Text | **Sí** | Fecha del gasto en formato `YYYY-MM-DD`. Ej: `2026-09-03`. |
  | `receipt` | **File** | **Sí** | Archivo de imagen del comprobante (JPEG, PNG, WEBP). |

- **Respuesta Exitosa (201 Created):**
```json
{
  "id": "33487d97-2ab0-4e5a-99b7-9b44f16d6f97",
  "expenseUserId": "b529df08-a9e5-43be-8770-b09c2be12eda",
  "categoryId": 2,
  "amount": "250.00",
  "reason": "Compra de cables para instalación en obra X",
  "receiptUrl": "uploads/gastos/5f4a8b79-0123-4567-89ab-cdef01234567.webp",
  "expenseDate": "2026-09-03T00:00:00.000Z",
  "pettyCashId": "b2f5df91-fbfe-464c-8ac5-d33a506595f1",
  "status": "PENDIENTE",
  "isReimbursed": false,
  "evaluationComment": null,
  "evaluatorUserId": null,
  "createdAt": "2026-09-03T18:25:00.000Z"
}
```

---

### 3.2 Evaluar un Gasto (Aprobar, Observar, Rechazar)
El Administrador revisa el gasto y toma una decisión formal.

- **URL:** `http://localhost:3000/api/v1/gastos/{id}/evaluar`
- **Método:** `PATCH`
- **Rol Permitido:** `ADMINISTRADOR`
- **Headers:** `Content-Type: application/json`

#### Decisión 1: APROBADO
Valida el gasto. Si pertenece a una caja chica, **recalcula de forma inmediata y atómica el `saldo_actual` y `saldo_final`** de la caja (Regla 03).
```json
{
  "decision": "APROBADO"
}
```

#### Decisión 2: OBSERVADO
El comprobante tiene problemas legibles o faltan datos. Permite subsanación por el creador. El campo `evaluationComment` es **obligatorio**.
```json
{
  "decision": "OBSERVADO",
  "evaluationComment": "La boleta está ilegible, adjuntar comprobante nítido o con mejor resolución."
}
```

#### Decisión 3: RECHAZADO
Rechazo definitivo del gasto. No afecta los saldos de la caja chica. El campo `evaluationComment` es **obligatorio**.
```json
{
  "decision": "RECHAZADO",
  "evaluationComment": "Gasto no autorizado fuera del alcance del proyecto."
}
```

---

### 3.3 Subsanar o Modificar un Gasto Observado
Permite al creador original del gasto actualizar los datos o sustituir la imagen del comprobante. Al guardarse, regresa automáticamente a estado `PENDIENTE` para nueva revisión.

- **URL:** `http://localhost:3000/api/v1/gastos/{id}`
- **Método:** `PATCH`
- **Roles Permitidos:** `SUPERVISOR`, `TRABAJADOR` (Solo el creador del gasto)
- **Body (form-data):** *(Todos los campos son opcionales; solo envía los que requieran cambio)*
  - `categoryId`: `2`
  - `amount`: `230.00`
  - `reason`: `Corrección de monto según boleta`
  - `expenseDate`: `2026-09-03`
  - `receipt`: *(Archivo de imagen "File" nuevo)*

---

## 📊 4. Consultas y Reportes (GET) - Para el Frontend

Estas rutas entregan datos **optimizados, limpios y sin información sensible**, listos para ser consumidos por tablas, tarjetas y dashboards.

### 4.1 Listar Todas las Cajas Chicas
Historial completo de cajas chicas con sus custodios y evaluadores.
- **URL:** `http://localhost:3000/api/v1/cajas-chicas`
- **Método:** `GET`
- **Roles Permitidos:** `ADMINISTRADOR`, `CONTADOR`
- **Respuesta (200 OK):**
```json
[
  {
    "id": "b2f5df91-fbfe-464c-8ac5-d33a506595f1",
    "assignedAmount": "1500.50",
    "currentBalance": "1250.50",
    "finalBalance": "-1250.50",
    "status": "ABIERTA",
    "openingDate": "2026-09-03T18:19:56.000Z",
    "closingDate": null,
    "createdAt": "2026-09-03T18:10:33.000Z",
    "managerUser": {
      "id": "b529df08-a9e5-43be-8770-b09c2be12eda",
      "nombres": "Luis",
      "apellidos": "Pruebas",
      "documento_identidad": "12345123",
      "cargo": "Operario Eléctrico",
      "rol": "SUPERVISOR"
    },
    "evaluatorUser": {
      "id": "f166cbd4-57a2-42c0-8543-3047f2c6e1d6",
      "nombres": "Admin",
      "apellidos": "Softel",
      "cargo": "Gerente General"
    }
  }
]
```

---

### 4.2 Listar Gastos de una Caja Chica
Obtiene la lista cronológica de los gastos rendidos dentro de una caja chica específica.
- **URL:** `http://localhost:3000/api/v1/gastos/caja/{caja_chica_id}`
- **Método:** `GET`
- **Roles Permitidos:** `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`
- **Respuesta (200 OK):**
```json
[
  {
    "id": "33487d97-2ab0-4e5a-99b7-9b44f16d6f97",
    "amount": "250.00",
    "reason": "Compra de cables para instalación en obra X",
    "receiptUrl": "uploads/gastos/5f4a8b79-0123-4567-89ab-cdef01234567.webp",
    "status": "APROBADO",
    "evaluationComment": null,
    "expenseDate": "2026-09-03",
    "createdAt": "2026-09-03T18:25:00.000Z",
    "category": {
      "id": 2,
      "name": "Materiales"
    },
    "expenseUser": {
      "id": "b529df08-a9e5-43be-8770-b09c2be12eda",
      "nombres": "Luis",
      "apellidos": "Pruebas",
      "documento_identidad": "12345123",
      "rol": "SUPERVISOR",
      "cargo": "Operario Eléctrico"
    },
    "evaluatorUser": {
      "id": "f166cbd4-57a2-42c0-8543-3047f2c6e1d6",
      "nombres": "Admin",
      "apellidos": "Softel"
    }
  }
]
```

---

### 4.3 Bandeja de Gastos Pendientes de Aprobación
Obtiene todos los gastos en estado `PENDIENTE` que requieren decisión del Administrador (omite gastos huérfanos de cajas ya cerradas o liquidadas).
- **URL:** `http://localhost:3000/api/v1/gastos/pendientes`
- **Método:** `GET`
- **Rol Permitido:** `ADMINISTRADOR`
- **Respuesta (200 OK):**
```json
[
  {
    "id": "57686b19-590c-4e4f-91b3-731c9be68af9",
    "amount": "50.00",
    "reason": "Pasajes en bus a obra",
    "receiptUrl": "uploads/gastos/7c8d9e0f-1234-5678-9abc-def012345678.webp",
    "status": "PENDIENTE",
    "expenseDate": "2026-09-03",
    "createdAt": "2026-09-03T18:30:00.000Z",
    "category": {
      "id": 1,
      "name": "Movilidad"
    },
    "expenseUser": {
      "id": "b529df08-a9e5-43be-8770-b09c2be12eda",
      "nombres": "Luis",
      "apellidos": "Pruebas",
      "documento_identidad": "12345123",
      "rol": "SUPERVISOR",
      "cargo": "Operario Eléctrico"
    },
    "pettyCash": {
      "id": "b2f5df91-fbfe-464c-8ac5-d33a506595f1",
      "assignedAmount": "1500.50",
      "currentBalance": "1250.50",
      "status": "ABIERTA"
    }
  }
]
```
*(Nota: En caso de ser un gasto directo sin caja, `pettyCash` será `null`).*

---

### 4.4 Panel de Usuarios con Reembolsos Pendientes (Deudas por Pagar)
Agrupa y totaliza las deudas de la empresa con trabajadores por gastos directos aprobados que aún no han sido cancelados.
- **URL:** `http://localhost:3000/api/v1/gastos/reembolsos-directos/usuarios-con-deuda`
- **Método:** `GET`
- **Roles Permitidos:** `ADMINISTRADOR`, `CONTADOR`
- **Respuesta (200 OK):**
```json
[
  {
    "userId": "b529df08-a9e5-43be-8770-b09c2be12eda",
    "userNames": "Luis Pruebas",
    "document": "12345123",
    "totalOwed": 150.00
  }
]
```

---

### 4.5 Detalle de Reembolsos Pendientes de un Usuario
Entrega el desglose individual de los gastos directos aprobados no pagados de un usuario específico, junto con el monto `totalOwed`.
- **URL:** `http://localhost:3000/api/v1/gastos/reembolsos-directos/pendientes/{usuario_id}`
- **Método:** `GET`
- **Roles Permitidos:** `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`, `TRABAJADOR`
- **Respuesta (200 OK):**
```json
{
  "expenses": [
    {
      "id": "57686b19-590c-4e4f-91b3-731c9be68af9",
      "amount": "150.00",
      "reason": "Taxi a obra de emergencia",
      "receiptUrl": "uploads/gastos/7c8d9e0f-1234-5678-9abc-def012345678.webp",
      "status": "APROBADO",
      "expenseDate": "2026-09-03",
      "category": {
        "id": 1,
        "name": "Movilidad"
      }
    }
  ],
  "totalOwed": 150.00
}
```

---

## 💰 5. Pago de Reembolsos Directos

### 5.1 Marcar Gasto como Reembolsado (Pagado)
Cuando Administración o Contabilidad transfiere o paga en efectivo el reembolso directo al trabajador, se ejecuta esta acción para cancelar la deuda.

- **URL:** `http://localhost:3000/api/v1/gastos/{id}/reembolsar`
- **Método:** `PATCH`
- **Roles Permitidos:** `ADMINISTRADOR`, `CONTADOR`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Vacío (No requiere payload)
- **Respuesta Exitosa (200 OK):**
```json
{
  "id": "57686b19-590c-4e4f-91b3-731c9be68af9",
  "isReimbursed": true,
  "status": "APROBADO",
  "amount": "150.00",
  "reason": "Taxi a obra de emergencia"
}
```

---

## 🚀 6. Guías de Flujo Operativo Paso a Paso

### Flujo A: Ciclo Completo de Caja Chica
1. **Supervisor** solicita caja chica (`POST /cajas-chicas` con `assignedAmount: 1500.50`). Estado: `SOLICITADA`.
2. **Administrador** aprueba caja (`PATCH /cajas-chicas/:id/estado` con `action: "APROBAR"`). Estado: `APROBADA`.
3. **Administrador** entrega el dinero y abre la caja (`action: "ABRIR"`). Estado: `ABIERTA`.
4. **Supervisor o Trabajador** suben gastos con boletas (`POST /gastos` vía form-data con `pettyCashId`). Estado: `PENDIENTE`.
5. **Administrador** evalúa y aprueba cada gasto (`PATCH /gastos/:id/evaluar` con `decision: "APROBADO"`). El saldo de la caja chica se reduce automáticamente.
6. **Supervisor** envía a revisión al terminar de rendir (`action: "REVISAR"`). Estado: `EN_REVISION`.
7. **Administrador** concluye la auditoría (`action: "CERRAR"`). Estado: `CERRADA`.
8. **Administrador** realiza el recálculo final y liquida la caja (`action: "LIQUIDAR"`). Estado: `LIQUIDADA`.

---

### Flujo B: Ciclo de Reembolso Directo (Sin Caja Chica)
1. **Trabajador o Supervisor** registra un gasto que pagó de su propio bolsillo (`POST /gastos` vía form-data **sin enviar `pettyCashId`**). Estado: `PENDIENTE`.
2. **Administrador** evalúa y aprueba el gasto (`PATCH /gastos/:id/evaluar` con `decision: "APROBADO"`). Pasa a estado `APROBADO` con `isReimbursed = false`.
3. **Contador o Administrador** revisan el panel de deudas (`GET /gastos/reembolsos-directos/usuarios-con-deuda`) y el detalle por trabajador (`GET /gastos/reembolsos-directos/pendientes/:usuarioId`).
4. **Contador o Administrador** efectúan el pago y marcan el gasto como reembolsado (`PATCH /gastos/:id/reembolsar`). El gasto desaparece de las deudas activas.

---

## 🤖 7. Automatización de Pruebas (Scripts en Postman)

Agrega estos fragmentos en la pestaña **Tests** de tus solicitudes en Postman para automatizar variables de entorno:

### Test 1: Guardar Token JWT en Login
Colocar en la pestaña **Tests** de `POST /api/v1/auth/login`:
```javascript
pm.test("Status code is 200/201", function () {
    pm.response.to.be.success;
});

pm.test("Guardar Access Token en Variable", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.accessToken).to.exist;
    pm.environment.set("token", jsonData.accessToken);
});
```

### Test 2: Guardar ID de Caja Chica Creada
Colocar en la pestaña **Tests** de `POST /api/v1/cajas-chicas`:
```javascript
pm.test("Caja Chica creada exitosamente", function () {
    pm.response.to.be.success;
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.exist;
    pm.environment.set("caja_chica_id", jsonData.id);
});
```

### Test 3: Guardar ID de Gasto Creado
Colocar en la pestaña **Tests** de `POST /api/v1/gastos`:
```javascript
pm.test("Gasto registrado exitosamente", function () {
    pm.response.to.be.success;
    var jsonData = pm.response.json();
    pm.expect(jsonData.id).to.exist;
    pm.environment.set("gasto_id", jsonData.id);
});
```

### Test 4: Validar Respuestas Exitosas
Colocar en la pestaña **Tests** de cualquier petición `GET` o `PATCH`:
```javascript
pm.test("Operación completada con éxito", function () {
    pm.response.to.be.success;
});
```
