---
trigger: always_on
---

# Regla 03: Estándares y Modelo de Datos MySQL (Fase 1)

Esta regla define la configuración técnica del motor, el diccionario de datos oficial de la Fase 1, las restricciones de clave foránea, los índices y las reglas matemáticas de saldo en MySQL 8.0+.

---

## 1. Configuración de Base de Datos y Motor

- **Motor de Almacenamiento:** Obligatoriamente `ENGINE=InnoDB` para soporte transaccional ACID y restricciones de clave foránea.
- **Codificación y Collation:** `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` en todas las tablas y columnas.
- **Nomenclatura:** Tablas y columnas en español, utilizando estrictamente formato `snake_case` (ej. `cajas_chicas`, `usuario_creador_id`, `saldo_actual`).
- **Archivos:** Prohibido almacenar binarios BLOB o strings base64 en MySQL; únicamente almacenar rutas relativas (ej. `/gastos/2026/08/uuid.webp`).

---

## 2. Tipos de Datos y Estándares de Columnas

| Concepto | Tipo SQL Obligatorio | Regla / Restricción |
| :--- | :--- | :--- |
| **Identificadores (PK)** | `CHAR(36)` / UUIDv4 | Clave primaria inmutable generada por el backend. |
| **Montos Monetarios** | `DECIMAL(10, 2)` | Precisión exacta para fondos, saldos y gastos. |
| **Estados de Entidad** | `ENUM(...)` | Valores fijos controlados y validados por el backend. |
| **Fechas con Hora** | `TIMESTAMP` / `DATETIME` | `creado_en` y `actualizado_en` para auditoría temporal. |
| **Fechas sin Hora** | `DATE` | `fecha_gasto`, `fecha_inicio`, `fecha_fin`. |
| **Rutas de Archivos** | `VARCHAR(255)` o `TEXT` | Ruta relativa limpia del archivo en el storage. |

---

## 3. Esquema de Tablas Oficiales - Fase 1

### 3.1. Tabla `usuarios`
Centraliza la identidad, credenciales, cargo y rol operativo.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID identificador del usuario |
| `documento_identidad` | `VARCHAR(20)` | **UNIQUE**, NOT NULL | DNI o documento de identidad laboral |
| `nombres` | `VARCHAR(100)` | NOT NULL | Nombres del trabajador |
| `apellidos` | `VARCHAR(100)` | NOT NULL | Apellidos del trabajador |
| `correo` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | Correo electrónico de acceso |
| `clave_hash` | `VARCHAR(255)` | NOT NULL | Hash seguro (nunca devuelto en respuestas API) |
| `cargo` | `VARCHAR(100)` | NOT NULL | Puesto laboral en la empresa |
| `rol` | `ENUM` | NOT NULL | `ADMINISTRADOR`, `CONTADOR`, `SUPERVISOR`, `TRABAJADOR` |
| `estado` | `ENUM` | DEFAULT `'ACTIVO'` | `ACTIVO`, `INACTIVO` |
| `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |
| `actualizado_en` | `TIMESTAMP` | AUTO UPDATE | Fecha de última modificación |

> [!NOTE]
> `cargo` describe la posición laboral; `rol` define los permisos en el sistema. No crear tabla `perfil_usuario` hasta que se requiera información especializada en fases posteriores.

---

### 3.2. Tabla `categorias_gastos`
Catálogo de clasificación de gastos de caja chica.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | **PK**, AUTO_INCREMENT | Identificador numérico de categoría |
| `nombre` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | `Movilidad`, `Materiales`, `Viáticos`, `Combustible`, `Otros` |
| `activo` | `BOOLEAN` | DEFAULT `TRUE` | Permite habilitar o inhabilitar la categoría |

---

### 3.3. Tabla `cajas_chicas`
Control de fondos operativos asignados a un responsable.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID de la caja chica |
| `usuario_encargado_id` | `CHAR(36)` | **FK**, NOT NULL | Responsable que custodia y rinde el fondo (`ON DELETE RESTRICT`) |
| `usuario_aprobador_id` | `CHAR(36)` | **FK**, NULL | Usuario que aprueba la apertura (`ON DELETE SET NULL`) |
| `monto_asignado` | `DECIMAL(10,2)` | NOT NULL | Fondo base otorgado |
| `saldo_actual` | `DECIMAL(10,2)` | NOT NULL | Saldo disponible durante la operación |
| `saldo_final` | `DECIMAL(10,2)` | DEFAULT `0.00` | Resultado final de liquidación o cierre |
| `estado` | `ENUM` | DEFAULT `'SOLICITADA'` | `SOLICITADA`, `APROBADA`, `RECHAZADA`, `ABIERTA`, `EN_REVISION`, `CERRADA`, `LIQUIDADA` |
| `fecha_apertura` | `TIMESTAMP` | NULL | Fecha en que pasa a estado `ABIERTA` |
| `fecha_cierre` | `TIMESTAMP` | NULL | Fecha de cierre o liquidación definitiva |
| `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Fecha de solicitud de la caja |

---

### 3.4. Tabla `gastos`
Registro y comprobante individual de gasto asociado a una caja.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID del gasto |
| `caja_chica_id` | `CHAR(36)` | **FK**, NOT NULL | Caja chica asociada (`ON DELETE RESTRICT`) |
| `usuario_gasto_id` | `CHAR(36)` | **FK**, NOT NULL | Usuario que registró o ejecutó el gasto |
| `categoria_id` | `INT` | **FK**, NOT NULL | Categoría del gasto (`ON DELETE RESTRICT`) |
| `monto` | `DECIMAL(10,2)` | NOT NULL | Importe del gasto (> 0) |
| `motivo` | `VARCHAR(255)` | NOT NULL | Justificación o concepto del gasto |
| `url_comprobante` | `TEXT` | NOT NULL | Ruta relativa del comprobante procesado en WebP |
| `estado` | `ENUM` | DEFAULT `'PENDIENTE'` | `PENDIENTE`, `APROBADO`, `RECHAZADO` |
| `motivo_rechazo` | `VARCHAR(255)` | NULL | Justificación obligatoria si el gasto es rechazado |
| `usuario_aprobador_id` | `CHAR(36)` | **FK**, NULL | Usuario Administrador que evaluó el gasto |
| `fecha_gasto` | `DATE` | NOT NULL | Fecha del comprobante o emisión del gasto |
| `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Fecha de carga al sistema |

---

### 3.5. Tabla `proyectos_fotograficos`
Proyectos y servicios documentados en campo.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID del proyecto |
| `codigo` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | Código identificador único del servicio |
| `nombre` | `VARCHAR(150)` | NOT NULL | Nombre del proyecto |
| `ubicacion` | `VARCHAR(255)` | NOT NULL | Lugar geográfico de la obra |
| `fecha_inicio` | `DATE` | NOT NULL | Fecha de inicio de trabajos |
| `fecha_fin` | `DATE` | NULL | Fecha de fin de trabajos |
| `usuario_creador_id` | `CHAR(36)` | **FK**, NOT NULL | Usuario que dio de alta el proyecto (`ON DELETE RESTRICT`) |
| `usuario_ultimo_actualizador_id` | `CHAR(36)` | **FK**, NULL | Último usuario que modificó el reporte (`ON DELETE SET NULL`) |
| `estado` | `ENUM` | DEFAULT `'BORRADOR'` | `BORRADOR`, `GENERADO` |
| `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Fecha de creación del registro |
| `actualizado_en` | `TIMESTAMP` | AUTO UPDATE | Fecha de última modificación |

> [!IMPORTANT]
> **Prohibido el uso de `usuario_responsable_id`**. Se utilizan estrictamente `usuario_creador_id` (inmutable tras creación) y `usuario_ultimo_actualizador_id` (actualizado automáticamente por el backend en cada cambio relevante en proyecto, partidas o fotos).

---

### 3.6. Tabla `partidas_fotograficas`
Ítems o actividades operativas pertenecientes a un proyecto.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID de la partida |
| `proyecto_id` | `CHAR(36)` | **FK**, NOT NULL | Proyecto al que pertenece (`ON DELETE CASCADE`) |
| `numero_item` | `VARCHAR(20)` | NOT NULL | Numeración de partida (ej. `'1.0'`, `'1.1'`) |
| `descripcion` | `TEXT` | NOT NULL | Detalle de la actividad |
| `creado_en` | `TIMESTAMP` | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

- **Restricción de unicidad:** `UNIQUE KEY uk_proyecto_item (proyecto_id, numero_item)`.

---

### 3.7. Tabla `registros_fotograficos`
Evidencias visuales asociadas a una partida de trabajo.

| Campo | Tipo | Nulabilidad / Defecto | Descripción / Regla |
| :--- | :--- | :--- | :--- |
| `id` | `CHAR(36)` | **PK**, NOT NULL | UUID del registro fotográfico |
| `partida_id` | `CHAR(36)` | **FK**, NOT NULL | Partida asociada (`ON DELETE CASCADE`) |
| `usuario_id` | `CHAR(36)` | **FK**, NOT NULL | Usuario que subió la evidencia (`ON DELETE RESTRICT`) |
| `url_fotografia` | `TEXT` | NOT NULL | Ruta relativa del archivo WebP en storage |
| `descripcion` | `VARCHAR(255)` | NULL | Leyenda descriptiva de la foto |
| `fecha_captura` | `TIMESTAMP` | NOT NULL | Fecha y hora en que se tomó/cargó la foto |
| `coordenadas_gps` | `VARCHAR(100)` | NULL | Coordenadas GPS opcionales (`"lat,lng"`) |

---

## 4. Regla Matemática y Consultas de Saldos de Caja Chica

Los saldos oficiales de una caja chica se derivan **exclusivamente de los gastos con estado `APROBADO`**.

$$\text{saldo\_actual} = \text{monto\_asignado} - \sum(\text{gastos APROBADOS})$$
$$\text{saldo\_final} = \sum(\text{gastos APROBADOS}) - \text{monto\_asignado}$$

- Los gastos `PENDIENTE` o `RECHAZADO` **no** afectan los saldos.
- En caso de liquidación:
  - $\text{saldo\_final} > 0$: Monto a favor del custodio (reembolso pendiente).
  - $\text{saldo\_final} < 0$: Fondo sobrante pendiente de devolución por el custodio.
  - $\text{saldo\_final} = 0$: Caja cuadrada exactamente.

### Sentencia SQL Atómica de Recálculo (Transaccional en Backend)
```sql
UPDATE cajas_chicas cc
LEFT JOIN (
    SELECT
        caja_chica_id,
        COALESCE(SUM(monto), 0) AS total_aprobado
    FROM gastos
    WHERE estado = 'APROBADO'
    GROUP BY caja_chica_id
) g ON g.caja_chica_id = cc.id
SET
    cc.saldo_actual = cc.monto_asignado - COALESCE(g.total_aprobado, 0),
    cc.saldo_final = COALESCE(g.total_aprobado, 0) - cc.monto_asignado
WHERE cc.id = :cajaChicaId;
```

---

## 5. Índices de Rendimiento Obligatorios

1. **Claves Foráneas:** Todas las columnas `_id` que referencian otras tablas deben contar con índice explícito (`idx_...`).
2. **Filtrado Operativo:** Índices en columnas de estado (`cajas_chicas.estado`, `gastos.estado`, `usuarios.estado`, `proyectos_fotograficos.estado`).
3. **Reportes Temporales:** Índices en `gastos.fecha_gasto` y `proyectos_fotograficos.fecha_inicio`.
