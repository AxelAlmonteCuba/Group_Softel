---
trigger: always_on
---

# Regla 01: Prioridades, Roles y Ciclos de Vida del Negocio

Esta regla define el alcance del negocio, la jerarquía y permisos de roles, el orden prioritario de desarrollo y las máquinas de estados para los módulos de Softel.

---

## 1. Alcance General y Distribución de Roles

Softel opera con **4 roles de usuario fijos y diferenciados** en el sistema:

1. **`ADMINISTRADOR`**: Control total del sistema, alta y baja lógica de usuarios, asignación de roles, aprobación y rechazo de solicitudes de caja chica, aprobación y rechazo individual de gastos, cierre y liquidación de fondos, creación y gestión de reportes fotográficos, y autorización excepcional auditada de activos en fases futuras.
2. **`CONTADOR`**: Consulta y supervisión de cajas chicas, gastos aprobados y reportes financieros; consulta y descarga de reportes fotográficos autorizados. En fases futuras gestiona ingresos, egresos generales, facturación y cobranzas. **No tiene autoridad para aprobar operaciones operativas de campo**.
3. **`SUPERVISOR`**: Solicitud y administración de cajas chicas como usuario encargado, registro de gastos y comprobantes, creación, edición, generación y descarga de reportes fotográficos. En fases futuras administra el uso y entrega de motores y EPP de su cuadrilla.
4. **`TRABAJADOR`**: Registro de gastos individuales (con o sin caja chica asignada para reembolsos directos) con carga de comprobantes, creación, actualización, generación y descarga de reportes fotográficos cuando cuente con autorización. En fases futuras registra odómetro/horómetro de motores, entrega/devolución de equipos autorizados y solicita reposición de EPP. **No aprueba gastos, cajas ni cambios financieros**.

---

## 2. Regla de Permisos Operativos Especiales

- **Prohibición de rol adicional para entrega de motores:** **NO** crear un rol llamado `ENTREGADOR_MOTOR`. La entrega o recepción de equipos es una capacidad operativa temporal, no un rol global.
- **Esquema de autorización operativa:**
  ```text
  Rol de Usuario (SUPERVISOR o TRABAJADOR)
          +
  Permiso validado en Backend para la acción concreta
          +
  Registro de auditoría / entrega con usuarios involucrados
  ```
- **Edición de Reportes Fotográficos:** Cualquier usuario activo y autorizado (`ADMINISTRADOR`, `SUPERVISOR`, o `TRABAJADOR` autorizado) puede crear o editar un reporte fotográfico existente. La edición **no se restringe** al usuario creador del proyecto.

---

## 3. Matriz de Permisos Funcionales

| Acción Funcional | Administrador | Contador | Supervisor | Trabajador Autorizado |
| :--- | :---: | :---: | :---: | :---: |
| Crear y dar de baja usuarios | **Sí** | No | No | No |
| Solicitar apertura de caja chica | **Sí** | No | **Sí** | No |
| Aprobar o rechazar caja chica | **Sí** | No | No | No |
| Registrar gastos y comprobantes | **Sí** | **Sí** | **Sí** | **Sí** |
| Aprobar o rechazar gastos individuales | **Sí** | No | No | No |
| Cerrar y liquidar caja chica | **Sí** | No | No | No |
| Crear proyectos fotográficos | **Sí** | No | **Sí** | **Sí** |
| Editar reportes fotográficos existentes | **Sí** | No | **Sí** | **Sí** |
| Cargar y eliminar evidencias fotográficas | **Sí** | No | **Sí** | **Sí** |
| Generar y descargar reporte fotográfico (Excel/PDF) | **Sí** | **Sí** | **Sí** | **Sí** |
| Entregar o devolver motor (fase futura) | **Sí** | No | **Sí** | **Sí** |
| Autorización excepcional de motor bloqueado (futuro) | **Sí** | No | No | No |

> [!IMPORTANT]
> La matriz de permisos se valida **siempre en el backend**. Ocultar o deshabilitar un botón en el frontend no sustituye la validación de seguridad y roles en el servidor.

---

## 4. Cronograma Oficial de Fases y Prioridades

El desarrollo del sistema sigue un orden estrictamente incremental. **Caja chica y gastos debe completarse y validarse antes de implementar Reporte fotográfico**.

```text
Fase 1.1: Usuarios y Accesos Base
    └── Autenticación JWT, CRUD administrativo exclusivo, activación/inactivación lógica y RBAC.
Fase 1.2: Caja Chica y Gastos (PRIMER MÓDULO OPERATIVO)
    └── Apertura, rendición de gastos con comprobantes WebP, aprobación individual, recálculo estricto de saldos y liquidación.
Fase 1.3: Reporte Fotográfico (SEGUNDO MÓDULO OPERATIVO)
    └── Proyectos, partidas, evidencias WebP, trazabilidad de creador/actualizador y compilación a Excel/PDF.
Fases Futuras (INCREMENTALES)
    ├── Motores Electrógenos (Control de horómetros, combustible, bloqueos por fallas y entregas).
    ├── EPP (Trazabilidad de vida útil, reposición con desgaste fotográfico y préstamos especiales).
    ├── Finanzas y Administración Interna (Ingresos, egresos categorizados y enlace con liquidaciones).
    └── Cobranzas y Comercial (Cotizaciones, O/C, O/S, facturación y cronogramas de cuotas 100%).
```

---

## 5. Máquinas de Estados y Ciclos de Vida

### 5.1. Ciclo de Vida de Caja Chica
```text
[SOLICITADA] ──(Admin aprueba)──> [APROBADA] ──(Entrega de fondo)──> [ABIERTA]
     │                                                                   │
     ├──(Admin rechaza)──> [RECHAZADA]                                  │ (Rendición)
     │                                                                   v
[LIQUIDADA] <──(Regularización final)── [CERRADA] <──(Revisión)── [EN_REVISION]
```
- `SOLICITADA`: Creada por el encargado, en espera de evaluación.
- `APROBADA`: Autorizada por Administración, pendiente de entrega del fondo.
- `RECHAZADA`: Solicitud denegada; no admite transacciones.
- `ABIERTA`: Fondo entregado; **único estado regular que acepta nuevos gastos**.
- `EN_REVISION`: Encargado finalizó rendición; Administración audita comprobantes. Bloquea nuevos gastos.
- `CERRADA`: Conciliación concluida; saldos congelados para emisión de liquidación.
- `LIQUIDADA`: Devolución, reembolso o regularización financiera finalizada.

### 5.2. Ciclo de Vida de Gastos Individuales
- `PENDIENTE`: Registrado por el trabajador/supervisor con comprobante obligatorio.
- `APROBADO`: Validado por el Administrador. **Único estado que afecta los saldos oficiales de la caja**.
- `RECHAZADO`: Denegado por el Administrador con `motivo_rechazo` obligatorio; no afecta los saldos.

### 5.3. Ciclo de Vida de Reportes Fotográficos
- `BORRADOR`: Proyecto en ejecución con partidas y fotografías en constante edición/carga.
- `GENERADO`: Reporte consolidado emitido en Excel/PDF para entrega formal.

### 5.4. Ciclos de Vida Futuros (Referencia)
- **Motores:** `DISPONIBLE`, `EN_USO`, `EN_MANTENIMIENTO`, `PENDIENTE_REVISION`, `FUERA_SERVICIO`.
- **Movimientos Financieros:** `PENDIENTE`, `PROGRAMADO`, `PAGADO`, `ANULADO`.
- **Cobranzas:** `PENDIENTE_PAGO`, `PAGO_PARCIAL`, `PAGADO`, `VENCIDO` (validación de cuotas al 100%).
