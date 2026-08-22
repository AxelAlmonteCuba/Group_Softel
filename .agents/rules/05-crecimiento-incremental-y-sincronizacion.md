---
trigger: always_on
---

# Regla 05: Crecimiento Incremental de BD y Preparación Offline

Esta regla establece las directrices de evolución del esquema de datos sin romper el modelo existente, el diseño de entidades para fases futuras y la arquitectura para sincronización offline con SQLite en la aplicación móvil.

---

## 1. Principio de Crecimiento Incremental

La base de datos se construye por etapas funcionales aprobadas:
1. **Transversalidad de Usuarios:** La tabla `usuarios` es el eje central de auditoría y se reutiliza como referencia foránea en todos los módulos actuales y futuros.
2. **Desacoplamiento Modular:** Cada nuevo módulo incorpora sus propias tablas y foreign keys hacia las tablas existentes sin alterar las estructuras previas.
3. **Inmutabilidad de Claves Primarias:** Prohibido modificar las primary keys existentes para adaptar requerimientos futuros.
4. **Preservación Histórica:** Prohibido eliminar usuarios, cajas, gastos, reportes o evidencias con historial contable u operativo.
5. **Referencias Opcionales:** Las tablas futuras que se conecten con módulos no implementados deben definirse como columnas `NULL` (claves foráneas opcionales).
6. **No Adelantar Estructuras:** Prohibido crear tablas o columnas de fases posteriores antes de contar con la aprobación del requerimiento funcional correspondiente.

---

## 2. Mapa de Integración para Módulos Futuros

### 2.1. Módulo de Motores Electrógenos
- **Tablas Proyectadas:** `motores`, `usos_motores`, `mantenimientos_motores`, `incidencias_motores`, `entregas_motores`, `alquileres_motores`, `autorizaciones_excepcionales_motores`.
- **Trazabilidad en `entregas_motores`:**
  - Registra: `usuario_entrega_id`, `usuario_recibe_id`, `usuario_registrador_id`, `odometro_entrega`, `odometro_devolucion`, `combustible_entrega`, `combustible_devolucion`, `fotos_entrega`, `fotos_devolucion`.
  - Permite la operación de entrega/recepción a usuarios con rol `TRABAJADOR` o `SUPERVISOR` sin crear roles artificiales en la tabla `usuarios`.
- **Enlace con Caja Chica:** Si un gasto de combustible o mantenimiento se financia con fondo operativo, se añadirá una FK opcional `motor_id` en `gastos`.

### 2.2. Módulo de EPP (Equipos de Protección Personal)
- **Tablas Proyectadas:** `tipos_epp`, `inventario_epp`, `asignaciones_epp`, `solicitudes_renovacion_epp`.
- **Enlace con Usuarios:** Se vincula a través de `asignaciones_epp.usuario_trabajador_id` y `asignaciones_epp.usuario_entregador_id`.
- **Enlace con Caja Chica:** FK opcional en `gastos` hacia `solicitudes_renovacion_epp` únicamente si la compra es respaldada por caja chica.

### 2.3. Módulo de Administración Interna y Finanzas
- **Tablas Proyectadas:** `categorias_movimientos_financieros`, `movimientos_financieros`, `comprobantes_financieros`.
- **Enlace con Caja Chica:** La liquidación consolidada de una caja chica se enlaza mediante una FK opcional `caja_chica_id` en `movimientos_financieros` para evitar duplicación de egresos contables.

### 2.4. Módulo Comercial y Cobranzas
- **Tablas Proyectadas:** `clientes`, `contactos_clientes`, `solicitudes_servicio`, `cotizaciones`, `ordenes_compra`, `ordenes_servicio`, `facturas`, `cuotas_cobranza`, `pagos_cobranza`.
- **Enlace con Reporte Fotográfico:** La columna `solicitud_servicio_id` en `proyectos_fotograficos` será una FK opcional (`NULL`) para vincular proyectos de campo con órdenes comerciales formales.

### 2.5. Auditoría Centralizada
- **Tabla Proyectada:** `auditoria_acciones`.
- **Campos:** `usuario_id`, `entidad`, `entidad_id`, `accion`, `estado_anterior`, `estado_nuevo`, `observaciones`, `creado_en`.

---

## 3. Las 18 Reglas Obligatorias para Modificar el Modelo de Datos

1. Revisar exhaustivamente las tablas actuales y sus relaciones antes de proponer cambios.
2. Respetar el orden de prioridad: Caja chica antes de Reporte fotográfico; Reporte fotográfico antes de fases futuras.
3. No modificar una Clave Primaria (PK) sin evaluar el impacto en todas las Claves Foráneas (FK) dependientes.
4. No eliminar tablas, columnas o registros históricos por comodidad de desarrollo.
5. Gestionar todo cambio de esquema mediante migraciones versionadas de TypeORM.
6. Usar identificadores `CHAR(36)` / UUIDv4 en todas las nuevas entidades operativas principales.
7. Usar `DECIMAL(10,2)` para importes monetarios.
8. Crear índices en todas las Claves Foráneas y en columnas con filtros frecuentes (`estado`, fechas).
9. Mantener archivos físicos e imágenes fuera de MySQL (almacenar exclusivamente rutas relativas).
10. Envolver en transacciones ACID todo flujo que afecte gastos, saldos, aprobaciones o múltiples entidades dependientes.
11. Mantener estrictamente separados los estados de negocio de los estados de sincronización offline.
12. No agregar tablas ni columnas de módulos futuros sin un requerimiento de negocio formalmente aprobado.
13. Documentar y notificar cualquier cambio que afecte contratos de API, frontend o despliegues en VPS.
14. No crear roles adicionales en el sistema para acciones operativas (ej. no crear `ENTREGADOR_MOTOR`).
15. Actualizar automáticamente `usuario_ultimo_actualizador_id` en `proyectos_fotograficos` ante cualquier modificación relevante.
16. Calcular `saldo_actual` y `saldo_final` en cajas chicas utilizando **únicamente** gastos con estado `APROBADO`.
17. No utilizar `usuario_responsable_id` en `proyectos_fotograficos`; utilizar `usuario_creador_id` y `usuario_ultimo_actualizador_id`.
18. No restringir la edición de reportes fotográficos al usuario creador; permitir la edición a cualquier usuario activo con el permiso correspondiente.

---

## 4. Preparación para SQLite y Sincronización Offline

SQLite se implementa exclusivamente en la aplicación móvil (React Native), actuando MySQL como la única fuente central de verdad.

```text
App Móvil (React Native + SQLite)
   └── Cola de Sincronización Local
          └── HTTP / JSON Lote (/api/v1/sincronizacion/lote)
                 └── Backend NestJS (Validación, Transacciones y Sharp)
                        └── MySQL 8.0 (Persistencia) + Storage (WebP)
```

### 4.1. Separación Estricta de Estados
- **Estado de Negocio:** `PENDIENTE`, `APROBADO`, `RECHAZADO`, `ABIERTA`, `CERRADA`, `LIQUIDADA`.
- **Estado de Sincronización:** `PENDIENTE_SYNC`, `SINCRONIZANDO`, `SINCRONIZADO`, `CONFLICTO`.
- **Prohibido** mezclar ambos conceptos en una sola columna.

### 4.2. Orden de Dependencia en Sincronización
La sincronización en lote se procesa respetando la jerarquía relacional:
1. `cajas_chicas` antes que sus correspondientes `gastos`.
2. `proyectos_fotograficos` antes que `partidas_fotograficas`.
3. `partidas_fotograficas` antes que `registros_fotograficos`.

### 4.3. Idempotencia y Carga de Archivos
- El backend utiliza `id_operacion` (UUID) para evitar duplicados si una petición se reenvía por corte de red.
- Las imágenes se conservan en el almacenamiento local del dispositivo móvil hasta que el backend confirme la recepción y compresión WebP.