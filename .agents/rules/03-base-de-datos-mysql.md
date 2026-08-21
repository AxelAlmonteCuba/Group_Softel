# Regla 03: Estándares y Diseño de Base de Datos MySQL

Esta regla establece las directrices obligatorias para el esquema, tipos de datos, integridad referencial y migraciones en MySQL 8.0+.

---

## 1. Configuración de Base de Datos y Motor

- **Motor de Almacenamiento:** Obligatoriamente `ENGINE=InnoDB` para soporte transaccional ACID y restricciones de clave foránea.
- **Codificación y Collation:** `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` en todas las tablas y columnas de texto.
- **Nomenclatura:** Tablas y columnas en español, utilizando formato `snake_case` (ej. `cajas_chicas`, `saldo_favor`, `creado_en`).

---

## 2. Tipos de Datos y Estándares de Columnas

| Concepto | Tipo SQL Obligatorio | Justificación y Regla |
| :--- | :--- | :--- |
| **Llaves Primarias (PK)** | `CHAR(36)` / `VARCHAR(36)` | UUIDv4 generado para garantizar unicidad y compatibilidad con sincronización offline futura. |
| **Montos Monetarios** | `DECIMAL(12, 2)` o `DECIMAL(14, 2)` | Prohibido el uso de `FLOAT` o `DOUBLE` para evitar errores de precisión de punto flotante en finanzas. |
| **Horómetros / Odómetros** | `INT UNSIGNED` o `DECIMAL(10, 2)` | Medición exacta de horas de trabajo y kilómetros de motores. |
| **Porcentajes de Cuotas** | `DECIMAL(5, 2)` | Control de cuotas comerciales (la suma acumulada debe validar exactamente 100.00). |
| **Fechas y Timestamps** | `DATETIME` o `TIMESTAMP` | Guardadas en formato UTC. |
| **Rutas de Archivos** | `VARCHAR(255)` / `VARCHAR(500)` | Almacenar únicamente la **ruta relativa** del archivo (ej. `gastos/2026/08/uuid.webp`). Prohibido guardar binarios BLOB en MySQL. |

---

## 3. Auditoría y Eliminación Lógica (Soft Delete)

Ninguna entidad transaccional o histórica (usuarios, gastos, cajas chicas, motores, proyectos, pagos) se elimina físicamente con sentencias `DELETE`.

Toda tabla de entidad principal debe incluir:
- `estado`: `VARCHAR(30)` con el estado de negocio (`ACTIVO`, `INACTIVO`, `APROBADO`, `RECHAZADO`, `CERRADO`, etc.).
- `creado_en`: `DATETIME` con valor por defecto `CURRENT_TIMESTAMP`.
- `actualizado_en`: `DATETIME` actualizado automáticamente en cada modificación.
- `eliminado_en`: `DATETIME NULL` que registra la fecha de baja lógica.
- `creado_por_id`: `CHAR(36)` con el UUID del usuario creador.
- `actualizado_por_id`: `CHAR(36) NULL` con el UUID del último usuario modificador.

---

## 4. Índices y Rendimiento

1. Crear índices obligatorios en:
   - Todas las claves foráneas (`FK`).
   - Columnas de filtrado frecuente de estado (`estado`).
   - Columnas temporales para reportes (`creado_en`, `fecha_gasto`, `fecha_emision`).
2. Índices compuestos para consultas recurrentes (ej. `usuario_id` + `estado`, `caja_chica_id` + `estado`).

---

## 5. Migraciones Versionadas de TypeORM

- **Entornos Compartidos y Producción:** La opción `synchronize` de TypeORM debe estar configurada en `false` (`DB_SINCRONIZAR=false`).
- **Control de Versiones:** Todo cambio de esquema (tablas, columnas, índices, tipos) debe realizarse a través de archivos de migración versionados dentro de `src/migraciones/` o `migraciones/`.
- El mismo conjunto de migraciones debe ejecutarse tanto en el entorno de desarrollo local como en el servidor VPS de producción.
