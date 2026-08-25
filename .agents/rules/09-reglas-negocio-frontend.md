# Regla 09: Lógica de Negocio y Estados (Frontend)

Esta regla alinea el comportamiento del cliente móvil/web con la base de datos y la Regla 03 del Backend.

---

## 1. Usuarios y Roles
- **Roles**: `UserRole = 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR'`.
- **Estados**: `UserStatus = 'ACTIVO' | 'INACTIVO'`. (No existe eliminación física).
- **Gestión**: Solo el `ADMINISTRADOR` tiene acceso a crear o inactivar usuarios.

---

## 2. Gastos y Caja Chica
- **Estados de Gasto**: `ExpenseStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'`.
- **Restricción Estricta**: En el frontend, **no se permite registrar un gasto sin tener una caja chica asignada** (la DB requiere `caja_chica_id` obligatoriamente).

---

## 3. Reportes Fotográficos
- **Estados del Reporte**: `PhotoReportStatus = 'BORRADOR' | 'GENERADO'`.
- **Estructura de Partida**: Cada partida tiene exactamente dos campos obligatorios:
  - `itemNumber` (número correlativo, ej. 1.1)
  - `description` (texto técnico)
  *(Las partidas no tienen estado ni validación individual).*

### Ciclo de Vida y UI
1. **Creación**: Inicia como `BORRADOR`.
2. **Carga en Lote**: Subida de fotos simple desde cámara o galería (sin pedir descripciones o coordenadas manuales en el frontend para cada foto; el backend asigna auditoría interna).
3. **Persistencia Parcial**: El botón "Guardar cambios" salva el avance y mantiene el estado `BORRADOR`.
4. **Finalización**: El botón "Finalizar y generar PDF" exige confirmación. Al aceptarse, el reporte pasa a `GENERADO` y su edición se bloquea permanentemente, mostrándose en formato solo-lectura.
