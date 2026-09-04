# 📡 Tabla Maestra de Endpoints: Backend <-> Frontend (Softel)

Este documento centraliza el contrato de interfaz entre el **Backend** y el **Frontend** (Web y Móvil) para todos los módulos operativos desarrollados.

- **URL Base:** `http://localhost:3000/api/v1` (o la IP/dominio del servidor en red local/VPS).
- **Autenticación:** Cabecera `Authorization: Bearer <accessToken>` obligatoria en todas las rutas (excepto `/auth/login`).

---

## 🔐 1. Módulo de Autenticación (`/api/v1/auth`)

| Método | Endpoint | Roles Permitidos | Formato Entrada | ¿Qué hace? | Ejemplo de Respuesta Exitosa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | **Público** | JSON:<br>`correo`<br>`clave` | Autentica al usuario y devuelve el token JWT con su perfil básico. | `{ "accessToken": "eyJ...", "user": { "id": "...", "nombres": "...", "rol": "ADMINISTRADOR" } }` |

---

## 👥 2. Módulo de Usuarios (`/api/v1/users`)

| Método | Endpoint | Roles Permitidos | Formato Entrada | ¿Qué hace? | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/users` | `ADMINISTRADOR` | JSON: `documento_identidad`, `nombres`, `apellidos`, `correo`, `clave`, `cargo`, `rol` | Da de alta a un nuevo trabajador en el sistema. | La contraseña se almacena con hash `bcrypt`. |
| `GET` | `/users` | `ADMINISTRADOR`, `CONTADOR` | Ninguna | Lista todos los usuarios activos. | Filtro automático `estado = 'ACTIVO'`. |
| `GET` | `/users/:id` | `ADMINISTRADOR`, `CONTADOR` | Parámetro URL: `id` (UUID) | Obtiene los datos detallados de un trabajador. | Oculta siempre `clave_hash`. |
| `PATCH` | `/users/:id` | `ADMINISTRADOR` | JSON: campos opcionales | Modifica los datos o rol de un usuario. | Permite actualizar parcialmente. |
| `DELETE`| `/users/:id` | `ADMINISTRADOR` | Parámetro URL: `id` (UUID) | **Baja lógica**: Cambia el estado del usuario a `INACTIVO`. | No borra el registro para preservar trazabilidad. |

---

## 📦 3. Módulo de Caja Chica (`/api/v1/cajas-chicas`)

| Método | Endpoint | Roles Permitidos | Formato Entrada | ¿Qué hace? | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/cajas-chicas` | `SUPERVISOR` | JSON: `assignedAmount` | Solicita apertura de fondo base. | Estado inicial: `SOLICITADA`. Valida que el usuario no tenga otra caja abierta. |
| `PATCH` | `/cajas-chicas/:id/estado` | `ADMINISTRADOR`, `SUPERVISOR` | JSON:<br>`action` | **Máquina de estados de la caja**:<br>• `APROBAR`: Admin aprueba solicitud (`APROBADA`).<br>• `RECHAZAR`: Admin rechaza solicitud (`RECHAZADA`).<br>• `ABRIR`: Admin entrega dinero (`ABIERTA`).<br>• `REVISAR`: Supervisor culmina rendición (`EN_REVISION`).<br>• `CERRAR`: Admin audita y congela saldos (`CERRADA`).<br>• `LIQUIDAR`: Admin recalcula atómicamente saldos finales (`LIQUIDADA`). | La acción se envía en español. `action` acepta verbos de acción (`APROBAR`, `RECHAZAR`, `ABRIR`, `REVISAR`, `CERRAR`, `LIQUIDAR`). |
| `GET` | `/cajas-chicas` | `ADMINISTRADOR`, `CONTADOR` | Ninguna | Lista el historial completo de todas las cajas chicas. | Incluye datos del custodio (`managerUser`) y evaluador (`evaluatorUser`). |
| `GET` | `/cajas-chicas/usuario/:usuarioId` | `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR` | Parámetro URL: `usuarioId` (UUID) | Lista el historial de cajas chicas asignadas a ese trabajador específico. | Ideal para que el Supervisor consulte sus cajas o el Administrador audite a un responsable. |

---

## 🧾 4. Módulo de Gastos y Reembolsos Directos (`/api/v1/gastos`)

| Método | Endpoint | Roles Permitidos | Formato Entrada | ¿Qué hace? | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/gastos` | `SUPERVISOR`, `TRABAJADOR` | **multipart/form-data**:<br>• `pettyCashId` (UUID, opcional)<br>• `categoryId` (int, obligatorio)<br>• `amount` (decimal, obligatorio)<br>• `reason` (string, obligatorio)<br>• `expenseDate` (YYYY-MM-DD)<br>• `receipt` (archivo imagen) | Registra un gasto obligatorio con su boleta. La imagen se optimiza a **WebP**. | • Con `pettyCashId`: gasto de caja chica.<br>• Sin `pettyCashId`: **Reembolso Directo** a favor del trabajador. |
| `PATCH` | `/gastos/:id/evaluar` | `ADMINISTRADOR` | JSON:<br>`decision` (`APROBADO`, `OBSERVADO`, `RECHAZADO`)<br>`evaluationComment` (texto) | Audita y resuelve la solicitud de gasto. | Si se aprueba un gasto de caja chica, **recalcula de inmediato y atómicamente** el `saldo_actual` y `saldo_final` en MySQL. |
| `PATCH` | `/gastos/:id` | `SUPERVISOR`, `TRABAJADOR` (Solo creador) | **multipart/form-data**: campos a modificar y/o nuevo `receipt` | **Subsanación**: Permite corregir un gasto en estado `OBSERVADO`. | Al guardar, regresa automáticamente a estado `PENDIENTE` para nueva auditoría. |
| `GET` | `/gastos/caja/:cajaId` | `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR` | Parámetro URL: `cajaId` (UUID) | Lista todos los gastos rendidos dentro de una caja chica específica. | Ordenados cronológicamente descendente. |
| `GET` | `/gastos/pendientes` | `ADMINISTRADOR` | Ninguna | **Bandeja de auditoría**: Lista todos los gastos pendientes de aprobación. | Omite gastos de cajas cerradas o liquidadas. |
| `GET` | `/gastos/reembolsos-directos/usuarios-con-deuda` | `ADMINISTRADOR`, `CONTADOR` | Ninguna | **Panel de Cuentas por Pagar**: Lista qué trabajadores tienen reembolsos directos aprobados por cobrar y su monto `totalOwed`. | Agrupa y totaliza por usuario. |
| `GET` | `/gastos/reembolsos-directos/pendientes/:usuarioId` | `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`, `TRABAJADOR` | Parámetro URL: `usuarioId` (UUID) | Detalle de los gastos directos aprobados y pendientes de pago de un trabajador específico, junto con `totalOwed`. | Muestra el desglose de comprobantes a pagar. |
| `PATCH` | `/gastos/:id/reembolsar` | `ADMINISTRADOR`, `CONTADOR` | Parámetro URL: `id` (UUID) | Marca un gasto directo aprobado como pagado (`reembolsado = true`). | Liquida la deuda de la empresa con el trabajador. |
