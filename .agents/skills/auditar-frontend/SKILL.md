---
name: auditar-frontend
description: >-
  Usa esta skill cuando el usuario te pida auditar el código del FRONTEND (React Native, Expo, hooks, componentes UI). Esta skill define umbrales objetivos, accesibilidad, dependencias y reglas de generación de tickets.
---

# Skill: Auditoría de Frontend (React Native) y Generación de Tickets

Esta skill define el procedimiento estricto y objetivo para auditar el código del Frontend (App Móvil / React Native) y reportar incidencias priorizadas por impacto real.

---

## 1. Umbrales de Gravedad (Referencia Obligatoria)

Antes de generar cualquier ticket, clasifica usando **estrictamente** esta tabla:

| Nivel | Criterio Objetivo |
|-------|-------------------|
| **ALTA** | Crashea la app, expone datos sensibles, rompe el flujo completo del usuario, bucles infinitos, desincronización crítica de tipos con el backend, o llamadas a red que saturen la API. |
| **MEDIA** | Degrada la UX o el rendimiento sin romper el flujo (ej. falta de estado de carga/vacío/error, touch targets inaccesibles, memory leak moderado, testing ausente en lógica crítica). |
| **BAJA** | Sugerencia de estilo, convención, refactorización cosmética, o preferencia de diseño visual sin impacto funcional. |

---

## 2. Alcance y Límites por Sesión
- Si el módulo tiene **más de 10 archivos**, prioriza los 5 problemas de mayor impacto (ALTA o MEDIA) antes de reportar hallazgos menores. Evita generar decenas de tickets de bajo valor en una sola pasada.
- **Límite de Ruido:** Genera un máximo de **5 a 7 tickets** por sesión. Los tickets BAJA son opcionales si ya hay tickets ALTA/MEDIA.

---

## 3. Procedimiento de Auditoría

Sigue estos pasos en orden:

### Paso 1 — Reconocimiento y Dependencias
Revisa el `package.json` en busca de librerías deprecated o versiones de Expo/React Native desactualizadas con vulnerabilidades conocidas.

### Paso 2 — Sincronización con Backend (Contrato de API)
Compara los tipos/interfaces del frontend con los DTOs reales de la API NestJS. Reporta cualquier desincronización como ticket de categoría **Arquitectura / ALTA o MEDIA**.

### Paso 3 — Análisis Estático Profundo

#### 3a. Arquitectura de Estilos (Severidad: MEDIA/ALTA — Objetivo)
- Cero colores, tamaños o números hardcodeados fuera del archivo de `theme/styles`. Toda constante de diseño debe venir del sistema de tokens centralizados.
- Toda Screen con JSX extenso (> ~150 líneas de retorno) debe extraer secciones en componentes reutilizables.
- Estos puntos son **verificables** y generan tickets MEDIA si se infringen.

#### 3b. Estética Visual (Severidad: BAJA — Sugerencia Nunca Bloqueante)
- Si se observan paletas de color o animaciones que podrían mejorarse estéticamente, se puede incluir como **sugerencia BAJA**. Nunca se genera un ticket ALTA o MEDIA por opinión visual subjetiva.

#### 3c. Estados de UI: Carga, Vacío y Error
- Toda pantalla que consuma datos remotos debe manejar explícitamente los tres estados: **cargando** (loader/skeleton), **vacío** ("sin datos") y **error** (mensaje amigable al usuario). La ausencia de cualquiera es ticket MEDIA.

#### 3d. Accesibilidad (a11y)
- Exige `accessibilityLabel` y `accessibilityRole` en botones e inputs interactivos.
- Revisa tamaños de touch target mínimos (44x44 puntos).
- Verifica soporte para escalado de fuente del sistema.
- La ausencia de estos es ticket MEDIA.

#### 3e. Rendimiento y Red
- Detecta bucles de recomposición infinita (`useEffect` sin array de dependencias).
- Advierte sobre llamadas a la API en exceso o polling descontrolado.
- Revisa optimización de `FlatList` (keyExtractor, getItemLayout si aplica).

#### 3f. Separación de Responsabilidades
- La lógica de negocio y las llamadas a servicios deben estar en *Custom Hooks*, no en el JSX del componente.

#### 3g. Gestión de Errores
- Exige `try/catch` en todas las llamadas a red con feedback visual (Toast/Alert).

#### 3h. Fugas de Memoria
- Exige que los `useEffect` con listeners, subscripciones o timers devuelvan su función de limpieza.

#### 3i. Gestión de Estado (Prop Drilling)
- Si una prop se pasa por **más de 2 niveles sin transformación** y no forma parte de un patrón de composición explícito (render props, children), **sugerir** estado global (Zustand/Context) como ticket BAJA o MEDIA según el impacto.
- El prop drilling moderado o la composición legítima de componentes son aceptables y **no deben generar tickets**.

#### 3j. Tipado Fuerte y Magic Strings
- Prohíbe tipos `any`. Textos y números mágicos deben venir del `theme` o constantes.

#### 3k. Limpieza de Código
- Reporta `console.log` abandonados y código comentado sin justificación como ticket BAJA.

#### 3l. Testing
- Verifica si los componentes/hooks críticos tienen tests unitarios o snapshots. La ausencia en flujos críticos (ej. autenticación, registro de gastos, solicitud de caja chica) es ticket MEDIA.
- **Importante (Regla 01):** El rol `CONTADOR` solo consulta y descarga; **no aprueba**. No reportes ausencia de flujos de aprobación en pantallas del Contador.

#### 3m. Alineación con Máquinas de Estado del Negocio
- Verifica que la UI respete los estados válidos de caja chica (`SOLICITADA`, `APROBADA`, `ABIERTA`, `EN_REVISION`, `CERRADA`, `LIQUIDADA`, `RECHAZADA`) y de gastos (`PENDIENTE`, `APROBADO`, `RECHAZADO`).
- Reporta como MEDIA si la UI muestra acciones que no corresponden al estado actual de la entidad (ej. mostrar botón "Registrar Gasto" en una caja con estado `CERRADA`).
- Reporta como ALTA si la UI permite que un rol ejecute una acción que le está prohibida según la Matriz de Permisos del negocio (Regla 01).

---

## 4. Formato y Creación de Tickets

Crea los tickets en `tickets-auditoria/frontend/` usando la herramienta `write_to_file`.

- **Ruta:** `tickets-auditoria/frontend/TICKET-[YYYYMMDD]-[Nombre_Corto].md`

**Plantilla:**

```markdown
# 📱 Ticket Frontend: [Título del problema]

- **Fecha:** [Fecha actual]
- **Pantalla/Componente:** [Ruta del archivo]
- **Gravedad:** [ALTA / MEDIA / BAJA]
- **Categoría:** [Arquitectura / Accesibilidad / Rendimiento / Estados UI / Tipado / Testing / Estética]

## 🚨 Descripción del Problema
[Explica objetivamente qué falla, referenciando el criterio de severidad].

## 💻 Evidencia del Código
// Fragmento infractor (máx. 20 líneas)

## 🛠️ Solución Propuesta
[Código corregido o pasos concretos para resolver el problema].
```

---

## 5. Cierre
Finaliza mostrando al usuario un resumen de hallazgos (cuántos ALTA/MEDIA/BAJA) y los enlaces a los archivos `.md` generados.
