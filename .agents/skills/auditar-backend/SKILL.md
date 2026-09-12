---
name: auditar-backend
description: >-
  Usa esta skill cuando el usuario te pida auditar el código del BACKEND (NestJS, TypeORM, MySQL, servicios, controladores). Esta skill define umbrales de severidad, reglas de concurrencia, idempotencia, seguridad y testing.
---

# Skill: Auditoría de Backend (NestJS) y Generación de Tickets

Esta skill define el procedimiento estricto y objetivo para auditar el código del Backend del proyecto (NestJS) y reportar incidencias priorizadas por impacto real.

---

## 1. Umbrales de Gravedad (Referencia Obligatoria)

Antes de generar cualquier ticket, clasifica usando **estrictamente** esta tabla:

| Nivel | Criterio Objetivo |
|-------|-------------------|
| **ALTA** | Puede corromper un saldo, exponer datos sensibles, permitir acceso no autorizado, duplicar una transacción financiera (falla de idempotencia), o abrir una brecha de seguridad (Inyección SQL, Path Traversal, Secrets expuestos). |
| **MEDIA** | Afecta rendimiento, mantenibilidad o consistencia sin romper integridad: N+1 grave, endpoints sin paginación, errores de BD no controlados que filtran info al frontend, alta complejidad ciclomática, falta de tests en lógica crítica. |
| **BAJA** | Estilo, convención o mejora menor: falta de Enum, variable sin usar, acoplamiento leve, deuda técnica cosmética. |

---

## 2. Alcance y Límites por Sesión
- **Límite de Ruido:** Genera un máximo de **5 a 7 tickets** por sesión, priorizando siempre los de gravedad ALTA. No reportes convenciones de estilo si hay problemas financieros o de seguridad abiertos.

---

## 3. Procedimiento de Auditoría Backend

Sigue estos pasos en orden:

### Paso 1 — Reconocimiento y Secrets
Revisa el código completo del módulo buscando:
- Credenciales, API keys o `JWT_SECRET` hardcodeados.
- Variables de entorno que debería leer del `ConfigService` (`.env`) pero están quemadas.
- Cualquier hallazgo aquí es automáticamente **ALTA**.

### Paso 2 — Integridad Financiera (Regla Crítica del Negocio)
Para cualquier operación que modifique saldos o estados de `cajas_chicas` o `gastos`:
- **Idempotencia:** Exige que la operación valide un token de idempotencia (`id_operacion`) para evitar que un reintento de red duplique un aprobación o descuento de saldo.
- **Transacciones y Locking (Race Conditions):** Además de `DataSource.transaction()`, exige bloqueo de concurrencia cuando dos peticiones simultáneas podrían descontar el mismo saldo: bloqueo **pesimista** (`SELECT ... FOR UPDATE`) o **optimista** (`@VersionColumn`).
- **Audit Trail:** Exige que entidades críticas registren `usuario_creador_id`, `usuario_evaluador_id`, y `creado_en`/`actualizado_en`. Reporta como ALTA si una operación financiera no deja rastro de quién la ejecutó.

### Paso 3 — Seguridad y Autorización
- **Ownership Check (Autorización a nivel de dato):** `@Roles()` valida el tipo de usuario, pero no el recurso. Exige que el servicio valide que el usuario solo opera sobre recursos que le pertenecen (ej. un TRABAJADOR solo puede registrar gastos en una caja que le fue asignada a él, no en la de otro).
- **Inyección SQL:** Si se usa `query()` o `.raw()`, castiga severamente si los parámetros no están parametrizados explícitamente.
- **Validación de Archivos:** En endpoints de subida exige: validar el tipo MIME real (no solo extensión), límite de tamaño máximo definido en bytes, y sanitización del nombre de archivo contra *Path Traversal*.
- **Rate Limiting:** Advierte como MEDIA si endpoints sensibles (login, aprobación) carecen de `ThrottlerGuard`.
- **Paginación:** Reporta como MEDIA los endpoints de listado (`GET`) sin paginación obligatoria (riesgo de exportar tablas completas).

### Paso 4 — Arquitectura y Capas
- **Separación de Capas:** Cero lógica de negocio en Controllers. Cero instanciación manual (`new`) de servicios o repositorios.
- **N+1 Queries:** Castiga bucles que ejecuten consultas por iteración. Exige `QueryBuilder` con `JOIN` o `relations` de TypeORM.
- **Complejidad Ciclomática:** Reporta como MEDIA/ALTA métodos con:
  - Más de 3 niveles de anidamiento de condicionales.
  - `switch` extensos o más de 4 `if/else` encadenados.
  - Servicios de 50+ líneas que mezclan validación + cálculo + persistencia en un solo método.
  - Más de 4 parámetros sueltos en un método (exige un DTO o un objeto de configuración).
  - **Solución esperada:** Dividir en métodos privados, usar *guard clauses / early returns*, o extraer a clases auxiliares.

### Paso 5 — Calidad de Código y Testing
- **Manejo de Errores:** Exige uso de excepciones de NestJS (`BadRequestException`, `NotFoundException`) en bloques `try/catch`. NUNCA filtrar errores crudos de la base de datos al frontend.
- **Tipos y Magic Strings:** Prohíbe tipos `any`. Todos los métodos deben tener tipo de retorno explícito. Los estados de base de datos deben usar `Enums`, nunca strings quemados.
- **Testing:** Reporta como MEDIA la ausencia de pruebas unitarias o e2e en servicios que afectan integridad financiera (ej. cálculo de saldo, aprobación de gastos, cierre de caja).

---

## 4. Formato y Creación de Tickets

Crea los tickets en `tickets-auditoria/backend/` usando la herramienta `write_to_file`.

- **Ruta:** `tickets-auditoria/backend/TICKET-[YYYYMMDD]-[Nombre_Corto].md`

**Plantilla:**

```markdown
# 🎫 Ticket Backend: [Título del problema]

- **Fecha:** [Fecha actual]
- **Módulo/Archivo Afectado:** [Ruta del archivo]
- **Gravedad:** [ALTA / MEDIA / BAJA]
- **Categoría:** [Integridad Financiera / Seguridad / Concurrencia / Rendimiento / Arquitectura / Complejidad / Testing]

## 🚨 Descripción del Problema
[Explica objetivamente qué falla referenciando el criterio de severidad de la skill].

## 💻 Evidencia del Código
// Fragmento infractor (máx. 20 líneas)

## 🛠️ Solución Propuesta (NestJS)
[Muestra cómo aplicar idempotencia, locking, ownership check, paginación, guard clause, etc.].
```

---

## 5. Cierre
Finaliza mostrando al usuario un resumen de hallazgos (cuántos ALTA/MEDIA/BAJA) y los enlaces a los archivos `.md` generados.
