---
trigger: always_on
---

# Regla 01: Prioridades, Entregas y Módulos de Negocio

Esta regla define el alcance del negocio, la distribución de roles y el orden de desarrollo para el backend y frontend de Softel.

---

## 1. Alcance General y Distribución de Roles

Softel opera con 4 roles de usuario fijos y diferenciados:

1. **`ADMINISTRADOR`**: Control total del sistema, alta/baja de usuarios, aprobación de cajas chicas, autorización de uso excepcional de motores bloqueados, control financiero y reportes.
2. **`CONTADOR`**: Visualización y registro de ingresos/egresos generales, gestión de cobranzas a clientes y reportes contables. Sin autoridad para aprobación operativa en campo.
3. **`SUPERVISOR`**: Solicitud de apertura de caja chica, registro de gastos de su cuadrilla, asignación de EPP y motores a trabajadores, y reportes fotográficos.
4. **`TRABAJADOR`**: Registro de gastos individuales con comprobantes, registro de uso de motores/odómetro, solicitud de reposición de EPP, carga de evidencias y reporte fotograficos.

---

## 2. Cronograma de Entregas Oficiales

| Entrega | Módulo / Alcance | Funcionalidades Principales |
| :--- | :--- | :--- |
| **Entrega 1** | **Usuarios y Roles** | Autenticación JWT sin auto-registro público, CRUD exclusivo por Admin, activación/inactivación lógica y RBAC. |
| **Entrega 2** | **Caja Chica y Gastos** | Solicitud de fondo, aprobación Admin, registro de gastos con comprobantes WebP, categorización, recálculo de saldo a favor, liquidación y cierre con PDF. |
| **Entrega 3** | **Reporte Fotográfico** | Submódulo temporal: proyectos, partidas (ítem + descripción), carga y optimización de fotos a WebP, y generación automática de reporte en PDF. |
| **Entrega 4** | **Registros Básicos** | Registro de motores electrógenos, registro de EPP y consultas con filtros. |

---

## 3. Reglas Específicas por Módulo de Negocio

### 3.1. Usuarios y Accesos
- **Sin auto-registro público:** Las cuentas son dadas de alta únicamente por el `ADMINISTRADOR`.
- **Desactivación:** Los usuarios cesados pasan a estado `INACTIVO` para preservar la trazabilidad histórica de gastos, reportes y activos.

### 3.2. Reporte Fotográfico (Submódulo Temporal)
- **Estructura jerárquica:** `Proyecto` -> `Partidas` (ítem + descripción) -> `Fotografías`.
- **Estados:** `BORRADOR`, `GENERADO`.
- **Generación de Reporte:** Servicio backend para compilación de documentos PDF agrupados con metadatos de usuario, fecha y evidencias.

### 3.3. Caja Chica y Control de Gastos
- **Ciclo de vida de Caja Chica:** `SOLICITADA` -> `APROBADA` -> `ABIERTA` -> `CERRADA` -> `LIQUIDADA`.
- **Aprobación de Gastos:** El Administrador aprueba o rechaza cada gasto individualmente.
- **Cálculo de Saldos:** Si los gastos aprobados superan el fondo asignado, el sistema calcula automáticamente el `saldo a favor` para la devolución al usuario.

### 3.4. Motores Electrógenos
- **Estados:** `DISPONIBLE`, `EN_USO`, `EN_MANTENIMIENTO`, `PENDIENTE_REVISION`, `FUERA_SERVICIO`.
- **Horómetros y Odómetros:** Control de horas iniciales/finales con alertas preventivas a las 50, 100 y 250 horas acumuladas.
- **Control de Combustible:** Registro obligatorio inicial y final con fotografía del indicador.
- **Incidencias y Bloqueo:** Cualquier falla reportada bloquea el motor automáticamente. Solo el `ADMINISTRADOR` puede emitir una autorización excepcional auditada.

### 3.5. EPP (Equipos de Protección Personal)
- **Trazabilidad de Vida Útil:** Alertas de renovación (1 mes para guantes/lentes, 6 meses para ropa, 1 año para cascos/zapatos).
- **Renovación:** El trabajador solicita reposición adjuntando foto del desgaste.
- **EPP Especiales:** Control de préstamo temporal con devolución obligatoria.

### 3.6. Administración Interna (Finanzas)
- **Ingresos y Egresos:** Registro contable manual con comprobante y categorización (*Proveedores*, *Sueldos*, *Bancos*, *Servicios*, *Otros*).
- **Estados:** `PENDIENTE`, `PROGRAMADO`, `PAGADO`, `ANULADO`.

### 3.7. Cobranza y Flujo Comercial
- **Flujo:** Solicitud de Servicio -> Cotización -> Orden de Compra (OC) -> Orden de Servicio (OS) -> Facturación -> Pagos Parciales.
- **Cronograma de Cuotas:** Validación estricta: **la suma de porcentajes debe ser exactamente 100%**.
- **Estados de Cobranza:** `PENDIENTE_PAGO`, `PAGO_PARCIAL`, `PAGADO`, `VENCIDO`.
