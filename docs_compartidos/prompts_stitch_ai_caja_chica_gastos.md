# 🎨 Prompts Oficiales para Stitch AI: Módulo Caja Chica y Gastos (Softel)

Este documento contiene los prompts optimizados y validados para **Stitch AI**, basados en el diseño exacto validado por el usuario:
- **Estilo visual:** Ultra limpio, corporativo, ejecutivo, formato vertical móvil (390x844 px).
- **Identidad de marca:** Fuerte prevalencia del **Rojo Corporativo Softel (`#B42318`)**.
- **Cero Verde en Botones o Tarjetas:** Botones principales siempre en rojo sólido `#B42318` con texto blanco. Badges de aprobado discretos y minimalistas en gris neutro `#F4F4F5` con texto gris oscuro para no saturar de verde la pantalla.

---

## 🚨 REGLAS GLOBALES DE DISEÑO Y ANTI-VERDE (OBLIGATORIAS):
1. **Dominancia del Rojo (#B42318):**
   - Todos los botones principales de acción (CTAs) son **ROJOS SÓLIDOS `#B42318`** con texto blanco en negrita.
   - Barras de progreso, avatares, bordes de enfoque, chips activos y acentos usan **`#B42318`** o rojo tenue **`#FEE4E2`**.
2. **Prohibición Total del Color Verde en Botones, Fondos y Números:**
   - `[NEGATIVE PROMPT: no green buttons, no green cards, no green metrics, no green CTA]`.
   - CERO botones verdes en cualquier pantalla.
   - Las métricas de saldos o números destacados son de color texto oscuro `#252525` o rojo `#B42318`, NUNCA VERDES.
   - Los badges de *"APROBADO"* son píldoras minimalistas en fondo gris neutro `#F4F4F5` con texto carbón `#3F3F46` y un sutil check gris.
3. **Estructura de Tarjetas:**
   - Fondo `#FFFFFF`, borde fino `#E4E4E7`, esquinas redondeadas (`border-radius: 14px`).

---

## 📱 ÍNDICE DE PROMPTS INDIVIDUALES
1. [Pantalla 1.1: Mi Caja Chica - Fondo ABIERTO (Operación)](#-pantalla-11-mi-caja-chica-escenario-1-fondo-abierto-en-operación-con-acceso-a-historial)
2. [Pantalla 1.2: Mi Caja Chica - EN REVISIÓN (Congelada)](#-pantalla-12-mi-caja-chica-escenario-2-rendición-en-revisión--solicitud-en-evaluación)
3. [Pantalla 1.3: Mi Caja Chica - SIN CAJA ACTIVA (Historial)](#-pantalla-13-mi-caja-chica-escenario-3-sin-caja-activa-con-historial-de-cajas-pasadas)
4. [Pantalla 2: Solicitud de Apertura de Fondo (Modal Supervisor)](#-pantalla-2-solicitud-de-apertura-de-caja-chica-modal-supervisor)
5. [Pantalla 3: Formulario de Gasto y Subsanación (Crear / Corregir)](#-pantalla-3-formulario-de-gasto-y-subsanación-crear-y-corregir)
6. [Pantalla 4: Control de Fondos y Cajas Chicas (Admin / Contador)](#-pantalla-4-control-de-fondos-y-cajas-chicas-admin-y-contador)
7. [Pantalla 5: Detalle y Conciliación de Caja Chica (VALIDADA)](#-pantalla-5-detalle-y-conciliación-de-caja-chica-pantalla-validada)
8. [Pantalla 6: Bandeja de Auditoría de Gastos (Admin)](#-pantalla-6-bandeja-de-auditoría-de-gastos-admin)
9. [Pantalla 7: Cuentas por Reembolsar con Filtros (Reutilizable)](#-pantalla-7-gestión-de-reembolsos-directos-con-filtros)
10. [🚀 Mega-Prompt Maestro (Las 7 Pantallas en 1 Solo Prompt)](#-mega-prompt-maestro-las-7-pantallas-en-un-solo-prompt)

---

## 📌 PANTALLA 1.1: "Mi Caja Chica" (Escenario 1: Fondo ABIERTO en Operación con Acceso a Historial)

```text
Diseña una pantalla móvil premium en React Native para "Mi Caja Chica" de Softel Telecomunicaciones (vista operativa del Supervisor cuando tiene fondo ABIERTO y activo). Formato vertical móvil (390x844 px). Estilo ultra limpio, ejecutivo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Color de botones de acción: ÚNICAMENTE #B42318 (Rojo) y blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- Métricas financieras en texto oscuro #252525 o rojo #B42318, NUNCA verde.
- Badges de "APROBADO" en gris neutro #F4F4F5 con texto gris oscuro #3F3F46 para mantener la elegancia visual.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header estándar de navegación, estilo minimalista):
   - Una sola barra limpia (sin doble fila ni marca duplicada arriba).
   - Izquierda: Botón de retroceso (<) en color oscuro #252525.
   - Centro: Título "Mi Caja Chica" (#252525, bold, 18px).
   - Derecha: Icono de acción rápida para "Historial" (icono de reloj/historial `time-outline` en color #252525 o rojo #B42318) para abrir las cajas pasadas.

2. Fila de Sub-Header / Estado:
   - Badge tipo píldora a la derecha: "• ABIERTA" (fondo gris neutro #F4F4F5 con texto oscuro #3F3F46 y borde #E4E4E7).

3. Hero Card Financiera de Saldos (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Encabezado: "FONDO ASIGNADO: S/ 1,500.00" y badge "S/ 1,250.50 Disponible" (fondo rojo suave #FEE4E2 con texto rojo #B42318).
   - 3 Columnas de métricas en cajitas suaves:
     * "Fondo Base": S/ 1,500.00 (fondo gris neutro #F4F4F5, texto #252525).
     * "Gastado Rendido": S/ 249.50 (fondo rojo suave #FEE4E2, texto destacado ROJO #B42318).
     * "Saldo Disponible": S/ 1,250.50 (fondo gris neutro #F4F4F5, texto #252525. NO VERDE).
   - Barra de progreso delgada de consumo en ROJO CORPORATIVO #B42318 (16.6% lleno) sobre carril gris #E4E4E7.
   - Recuadro informativo inferior: Fondo blanco con borde fino rojo #B42318, icono de reloj en rojo #B42318 y texto: "Cierre de rendición programado: Viernes 18:00 hrs" (#252525, bold).

4. Botonera de Acción de Cierre:
   - Botón Secundario Ancho: Fondo blanco con borde rojo #B42318 y texto rojo "Finalizar y Enviar a Revisión" con icono de check rojo.

5. Sección de Comprobantes Rendidos:
   - Encabezado: "Comprobantes Rendidos (3)" con texto a la derecha "Ver todos >" en rojo #B42318.
   - 3 Tarjetas blancas (#FFFFFF con borde #E4E4E7, radio 14px):
     * Item 1: Icono herramientas, "Bobina de cable drop 500m" | "03 Sep • Factura F001-4921" | "- S/ 180.00" | Badge minimalista gris "APROBADO" (fondo #F4F4F5, texto #52525B con mini check).
     * Item 2: Icono transporte, "Pasaje interurbano cuadrilla" | "03 Sep • Boleto Viaje" | "- S/ 25.00" | Badge ámbar "PENDIENTE" (fondo #FEF3C7, texto #B7791F).
     * Item 3: Icono alimentos, "Almuerzo de trabajo" | "02 Sep • Ticket 8823" | "- S/ 44.50" | Badge rojo suave "OBSERVADO" (fondo #FEE4E2, texto #B42318).

6. Botón Flotante (FAB):
   - Botón circular flotante en la esquina inferior derecha en ROJO CORPORATIVO #B42318 con icono "+" blanco para añadir nuevo gasto.

7. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Inicio", "Reportes", "Caja Chica" (ACTIVO con píldora de fondo rojo suave #FEE4E2, icono cash en rojo #B42318 y texto bold #B42318), "Más".
```

---

## 📌 PANTALLA 1.2: "Mi Caja Chica" (Escenario 2: Rendición EN REVISIÓN / Solicitud en Evaluación)

```text
Diseña una pantalla móvil premium en React Native para "Mi Caja Chica - Estado EN REVISIÓN" de Softel Telecomunicaciones (vista operativa del Supervisor cuando envió su rendición y está siendo auditada por Administración). Formato vertical móvil (390x844 px). Estilo ultra limpio, ejecutivo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Banner de advertencia en crema suave #FEF3C7 con borde fino #B7791F.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- La caja está congelada (sin botón de añadir gastos).

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header estándar de navegación, estilo minimalista):
   - Una sola barra limpia (sin doble fila ni marca duplicada arriba).
   - Izquierda: Botón de retroceso (<) en color oscuro #252525.
   - Centro: Título "Mi Caja Chica" (#252525, bold, 18px).
   - Derecha: Icono de acción rápida para "Historial" (icono de reloj/historial `time-outline` en color #252525 o rojo #B42318).

2. Fila de Sub-Header / Estado:
   - Badge de estado a la derecha: "• EN REVISIÓN" (fondo crema suave #FEF3C7 con texto ámbar #B7791F).

3. Banner de Alerta Informativa (Auditoría en Curso):
   - Fondo crema suave #FEF3C7 con borde fino ámbar #B7791F, radio 14px.
   - Icono de reloj de arena / candado en ámbar #B7791F.
   - Título: "Rendición en Proceso de Auditoría" (#B7791F, bold, 15px).
   - Mensaje: "Tu rendición de gastos por S/ 1,250.00 fue enviada a Administración. Los saldos se encuentran congelados hasta la liquidación final."

4. Hero Card de Conciliación Temporal (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Encabezado: "ESTADO DE CONCILIACIÓN" y badge "83.3% Ejecutado" (fondo rojo suave #FEE4E2 con texto rojo #B42318).
   - 3 Cajas Métricas Congeladas:
     * "Fondo Base": S/ 1,500.00 (fondo gris neutro #F4F4F5, texto #252525).
     * "Total Gastado": S/ 1,250.00 (fondo rojo suave #FEE4E2, texto destacado ROJO #B42318).
     * "Saldo a Devolver": S/ 250.00 (fondo gris neutro #F4F4F5, texto oscuro #252525. NO VERDE).
   - Barra de progreso delgada fija en ROJO CORPORATIVO #B42318 (83.3% lleno sobre carril gris).
   - Recuadro de arqueo: Fondo blanco con borde fino rojo #B42318, icono de balanza roja y texto: "Saldo estimado por devolver a empresa: S/ 250.00" (#252525, bold).

5. Tarjeta Informativa de Bloqueo Temporal:
   - Fondo gris muy suave #F4F4F5 con borde fino #E4E4E7, radio 12px.
   - Icono de candado gris #71717A y texto: "No es posible registrar nuevos gastos mientras la caja esté en revisión administrativa."

6. Sección de Comprobantes Rendidos en Evaluación:
   - Encabezado: "Comprobantes en Evaluación (4)".
   - Tarjetas de comprobantes bloqueadas en modo lectura con sus badges: 3 "APROBADO" (gris minimalista) y 1 "PENDIENTE" (ámbar).

7. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Inicio", "Reportes", "Caja Chica" (ACTIVO con píldora roja suave e icono en rojo #B42318), "Más".
```

---

## 📌 PANTALLA 1.3: "Mi Caja Chica" (Escenario 3: SIN CAJA ACTIVA con Historial de Cajas Pasadas)

```text
Diseña una pantalla móvil premium en React Native para "Mi Caja Chica - Sin Fondo Activo" de Softel Telecomunicaciones (vista del Supervisor cuando NO tiene caja chica abierta y consulta su HISTORIAL de cajas pasadas con botón para solicitar nueva apertura). Formato vertical móvil (390x844 px). Estilo ultra limpio, ejecutivo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Botón principal de acción: ÚNICAMENTE #B42318 (Rojo sólido) con texto blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- Badges de estado en gris neutro para "LIQUIDADA" y rojo suave para "RECHAZADA".

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header estándar de navegación, estilo minimalista):
   - Una sola barra limpia (sin doble fila ni marca duplicada arriba).
   - Izquierda: Botón de retroceso (<) en color oscuro #252525.
   - Centro: Título "Mi Caja Chica" (#252525, bold, 18px).
   - Derecha: Icono de acción rápida para filtrar historial (icono de filtro `filter-outline` como en la captura de Gestión de Usuarios).

2. Fila de Sub-Header / Estado:
   - Badge de estado a la derecha: "• SIN FONDO" (fondo gris neutro #F4F4F5 con texto gris medio #71717A).

3. Hero Card de Solicitud de Nuevo Fondo (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Icono central superior: Billetera grande en fondo rojo suave #FEE4E2 con bordes redondeados e icono en rojo #B42318.
   - Título centrado: "No tienes una caja chica activa" (#252525, bold, 18px).
   - Subtítulo centrado: "Solicita un nuevo fondo operativo a Administración para cubrir los gastos de transporte, insumos menores y viáticos en campo." (#71717A, 13px).
   - Botón Principal (CTA Destacado): BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO (#B42318) con texto blanco en negrita "+ Solicitar Apertura de Caja Chica" e icono de billetera blanco. (PROHIBIDO COLOR VERDE).

4. Sección: "Historial de Cajas Asignadas":
   - Fila de encabezado: Título "Historial de Cajas Asignadas (3)" (#252525, bold, 16px).
   - 3 Tarjetas de Cajas Chicas Pasadas (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
     * Tarjeta 1 (Última Caja Liquidada):
       - Fila superior: Código bold "HCC-2026-004" • "Obra Telecomunicaciones Norte" y badge a la derecha: "LIQUIDADA" (fondo gris neutro #F4F4F5, texto gris oscuro #3F3F46 con mini check).
       - Periodo: Icono calendario "01 Sep 2026 - 15 Sep 2026".
       - Métricas en fila: "Fondo: S/ 1,500.00" | "Gastado: S/ 1,250.00" | "Devuelto: S/ 250.00" (#252525, semiBold).
       - Línea inferior: Texto "Ver detalle de comprobantes >" en rojo #B42318.
     * Tarjeta 2 (Caja Anterior):
       - Fila superior: Código bold "HCC-2026-003" • "Mantenimiento Red Sur" y badge: "LIQUIDADA".
       - Periodo: "15 Ago 2026 - 31 Ago 2026".
       - Métricas: "Fondo: S/ 1,000.00" | "Gastado: S/ 1,000.00" | "Cuadrada exacta".
       - Línea inferior: "Ver detalle de comprobantes >" en rojo #B42318.
     * Tarjeta 3 (Solicitud Rechazada):
       - Fila superior: Código "HCC-2026-002" • Solicitud S/ 2,000.00 y badge: "RECHAZADA" (fondo suave #FEE4E2, texto rojo #B42318).
       - Fecha: "10 Ago 2026".
       - Motivo de rechazo: "Falta adjuntar orden de servicio de la obra".

5. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Inicio", "Reportes", "Caja Chica" (ACTIVO con píldora de fondo rojo suave #FEE4E2, icono cash en rojo #B42318 y texto bold #B42318), "Más".
```

---

## 📌 PANTALLA 2: "Solicitud de Apertura de Caja Chica" (Modal Supervisor)

```text
Diseña una pantalla móvil premium en React Native para "Solicitar Apertura de Fondo de Caja Chica" de Softel Telecomunicaciones (formulario modal del Supervisor). Formato vertical móvil (390x844 px). Estilo ultra limpio, corporativo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Botón principal de acción: ÚNICAMENTE #B42318 (Rojo sólido) con texto blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header Modal):
   - Marca: "SOFTEL | Fondos" con botón de cerrar (X) en gris oscuro a la derecha.
   - Fila de título: "Solicitar Fondo de Caja Chica" (#252525, bold, 18px) y subtítulo "Completa los datos para evaluación de Administración".

2. Tarjeta Informativa de Política (Fondo blanco, borde fino rojo #B42318, radio 14px):
   - Icono de billetera en rojo #B42318 y texto claro: "El fondo solicitado será transferido tras aprobación administrativa. Cada gasto requerirá comprobante digital (boleta o factura)".

3. Card de Selección de Monto (Fondo blanco #FFFFFF, borde #E4E4E7, radio 14px):
   - Etiqueta: "MONTO REQUERIDO PARA OPERACIÓN" en mayúsculas gris.
   - Input de monto gigante: Fondo gris neutro #F4F4F5 con borde #E4E4E7, prefijo fijo "S/" en rojo #B42318 y valor "1,500.00" (bold, 32px, #252525).
   - Selector Rápido de Montos (Fila de Chips):
     * Chips horizontales: "S/ 500", "S/ 1,000", "S/ 1,500" (CHIP ACTIVO: borde rojo #B42318, fondo rojo suave #FEE4E2, texto rojo #B42318), "S/ 2,000", "Otro monto".

4. Formulario de Datos Operativos:
   - Selector de Proyecto / Obra: Campo blanco con borde #E4E4E7, icono de mapa y texto: "Proyecto Telecomunicaciones Norte - Tramo 2".
   - Justificación Operativa: Campo multilínea con texto "Fondo para movilidad de cuadrilla, combustible de camioneta y compras imprevistas de ferretería en obra".
   - Duración estimada: Selector con icono de calendario: "15 días (Cierre quincenal)".

5. Botonera Fija Inferior:
   - Botón Principal (CTA Destacado): BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO (#B42318) con texto blanco en negrita "Enviar Solicitud a Administración" e icono de enviar blanco. (PROHIBIDO BOTÓN VERDE).
```

---

## 📌 PANTALLA 3: "Formulario de Gasto y Subsanación" (Crear y Corregir)

```text
Diseña una pantalla móvil premium en React Native para el "Formulario de Gasto / Subsanación de Observaciones" de Softel Telecomunicaciones (AddEditExpenseScreen). Formato vertical móvil (390x844 px). Estilo ultra limpio, corporativo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Botón principal de acción: ÚNICAMENTE #B42318 (Rojo sólido) con texto blanco.
- Banner de advertencia en ámbar suave #FEF3C7 con borde #B7791F.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header):
   - Marca: "SOFTEL | Gastos" con avatar circular rojo #B42318.
   - Fila de navegación: Botón volver (<), Título "Corregir Gasto Observado" (#252525, bold, 18px) y badge a la derecha: "• OBSERVADO" (fondo suave #FEE4E2 con texto rojo #B42318).

2. Banner Superior de Alerta de Administración:
   - Recuadro en fondo crema suave #FEF3C7 con borde fino ámbar #B7791F y radio 14px.
   - Icono de advertencia en ámbar #B7791F.
   - Título: "Observación de Administración:" (#B7791F, bold).
   - Mensaje: "La boleta adjunta no muestra el RUC legible y falta el sello de cancelado. Por favor vuelve a subir una fotografía nítida del comprobante original."

3. Selector de Tipo de Gasto (Segmented Switch):
   - Pestaña 1 (Activa): "Caja Chica Obra Norte" (fondo ROJO #B42318, texto blanco).
   - Pestaña 2: "Reembolso Directo" (fondo gris neutro #F4F4F5, texto #71717A).

4. Hero Uploader de Comprobante (Fondo blanco #FFFFFF, borde #E4E4E7, radio 14px):
   - Vista previa de fotografía de boleta arrugada/subsanada.
   - Dos botones flotantes sobre la foto:
     * "Cambiar Foto": Blanco con borde rojo #B42318 y texto rojo #B42318.
     * "Eliminar": Botón cuadrado blanco con icono de papelera roja.

5. Formulario de Datos:
   - Categoría: Selector desplegable con icono de herramientas y texto "Materiales e Insumos".
   - Importe: Campo con prefijo fijo "S/" en rojo #B42318 y valor editable "180.00" (bold, 24px, #252525).
   - Motivo del Gasto: Campo multilínea "Compra de conectores de cobre y cinta aislante para empalme urgente".
   - Fecha de Emisión: Selector con icono de calendario: "03 de Septiembre, 2026".

6. Botonera Inferior Fija:
   - Botón Principal (CTA Destacado): BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO (#B42318) con texto blanco en negrita "Reenviar Comprobante Corregido" e icono de check blanco. (PROHIBIDO COLOR VERDE).
```

---

## 📌 PANTALLA 4: "Control de Fondos y Cajas Chicas" (Admin y Contador)

```text
Diseña una pantalla móvil premium en React Native para el "Control General de Fondos y Cajas Chicas" de Softel Telecomunicaciones (PettyCashManagementScreen para Administrador y Contador). Formato vertical móvil (390x844 px). Estilo ultra limpio, ejecutivo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Pestañas activas y botones: ÚNICAMENTE #B42318 (Rojo) y blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- Saldos en texto oscuro #252525 o rojo #B42318, NUNCA verde.
- Badges de estado en gris neutro o ámbar discreto.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header):
   - Marca: "SOFTEL | Gestión" con campana de notificaciones y avatar circular rojo #B42318 con iniciales "AD".
   - Fila de título: "Control de Fondos" (#252525, bold, 20px).

2. Selector Superior de Pestañas (Segmented Tabs):
   - Pestaña 1 (ACTIVA): "Cajas Chicas (5)" (fondo ROJO CORPORATIVO #B42318, texto blanco, bold).
   - Pestaña 2: "Reembolsos Directos (3)" (fondo gris neutro #F4F4F5, texto #71717A).

3. Barra Horizontal de Filtros por Chips:
   - Píldoras deslizables: "Todas (5)", "Abiertas (3)", "En Revisión (1)" (CHIP ACTIVO: borde rojo #B42318, fondo rojo suave #FEE4E2, texto rojo #B42318), "Cerradas (1)", "Liquidadas (0)".

4. Feed de Tarjetas de Cajas Chicas (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Tarjeta 1 (En Revisión):
     * Encabezado: Avatar "JP" rojo #B42318, "Juan Pérez", subtítulo "Supervisor Obra Norte • HCC-2026-004", badge ámbar "• EN REVISIÓN".
     * Métricas: "Asignado: S/ 1,500.00" | "Gastado: S/ 1,250.00" (texto destacado rojo #B42318).
     * Barra de progreso de consumo en ROJO CORPORATIVO #B42318 (83.3% lleno sobre carril gris #E4E4E7).
     * Línea de cierre: "Saldo por devolver: S/ 250.00" (#252525, bold) y flecha ">" en rojo #B42318.
   - Tarjeta 2 (Abierta):
     * Avatar "MR" rojo #B42318, "Marcos Ramos", "Supervisor Redes Sur • HCC-2026-002", badge gris "• ABIERTA".
     * Métricas: "Asignado: S/ 2,000.00" | "Gastado: S/ 650.00". Barra de progreso roja (32.5%).
     * Línea de saldo: "Saldo disponible: S/ 1,350.00" y flecha ">".

5. Botón Flotante (FAB):
   - Botón circular en ROJO CORPORATIVO #B42318 con icono "+" blanco para aperturar nueva caja.

6. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Caja Chica", "Auditoría", "Fondos" (ACTIVO en ROJO #B42318 con punto indicador rojo), "Reembolsos".
```

---

## 📌 PANTALLA 5: "Detalle y Conciliación de Caja Chica" (PANTALLA VALIDADA)

```text
Diseña una pantalla móvil premium en React Native para el "Detalle y Conciliación de Caja Chica" de Softel Telecomunicaciones. Formato vertical móvil (390x844 px). Estilo ultra limpio, corporativo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Color de botones de acción: ÚNICAMENTE #B42318 (Rojo) y blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- La métrica de "Saldo Restante" debe ser texto oscuro neutro #252525, NO verde.
- Los badges de "APROBADO" en la lista de comprobantes deben ser píldoras minimalistas en fondo gris neutro #F4F4F5 con texto gris oscuro #3F3F46 para mantener la elegancia y que NO pinten la pantalla de verde.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header):
   - Marca: "SOFTEL | Fondos" con icono de campana y avatar circular rojo #B42318.
   - Fila de navegación: Botón volver (<), Título "Detalle de Caja Chica" (#252525, bold, 18px), y badge de estado a la derecha: "• EN REVISIÓN" (fondo crema suave #FEF3C7 con texto ámbar #B7791F).

2. Tarjeta del Custodio Responsable (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Avatar circular con iniciales "JP" en fondo ROJO CORPORATIVO #B42318 y texto blanco.
   - Nombre: "Juan Pérez" (bold, 16px, #252525), cargo: "Supervisor de Obra Norte", código: "HCC-2026-004".
   - Línea de datos: "Apertura: 01 Sep 2026" • "Auditor asignado: Admin Softel" con iconos sutiles.

3. Card de Estado de Liquidación y Saldos (Fondo blanco #FFFFFF, borde #E4E4E7):
   - Encabezado: "ESTADO DE LIQUIDACIÓN" en mayúsculas gris, y a la derecha un badge de avance: "83.3% Ejecutado" (fondo rojo suave #FEE4E2 con texto rojo #B42318).
   - 3 Columnas de métricas en recuadros limpios:
     * "Fondo Base": S/ 1,500.00 (fondo gris neutro #F4F4F5, texto #252525).
     * "Gastado": S/ 1,250.00 (fondo rojo suave #FEE4E2, texto destacado ROJO #B42318).
     * "Saldo Restante": S/ 250.00 (fondo gris neutro #F4F4F5, texto oscuro #252525. NO VERDE).
   - Barra de progreso delgada de ejecución: Línea de progreso en ROJO CORPORATIVO #B42318 (83.3% lleno) sobre carril gris #E4E4E7.
   - Caja de Arqueo Contable Final: Recuadro suave con borde fino rojo #B42318, fondo blanco, icono de balanza en rojo #B42318 y texto: "Saldo a devolver por custodio: S/ 250.00" (#252525, bold).

4. Botonera de Acciones (CON PREVALENCIA ROJA ABSOLUTA):
   - Botón Secundario: Fondo blanco con borde rojo #B42318 y texto rojo "Cerrar Caja (Congelar)" con icono de candado rojo.
   - Botón Principal (CTA Destacado): BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO (#B42318) con texto blanco en negrita "Liquidar Definitivamente" e icono de check blanco. (OBLIGATORIO: COLOR DE FONDO #B42318, PROHIBIDO CUALQUIER TONO DE VERDE).

5. Lista de Comprobantes Auditados:
   - Título: "Comprobantes Auditados" con texto "Ver todos >" a la derecha en rojo #B42318.
   - 4 Tarjetas blancas (#FFFFFF con borde #E4E4E7):
     * "Bobina de fibra drop 500m" | "02 Sep • S/ 480.00" | Badge minimalista gris "APROBADO" (fondo #F4F4F5, texto #52525B con mini check gris).
     * "Conectores SC/APC rápido" | "03 Sep • S/ 320.00" | Badge "APROBADO" gris neutro.
     * "Combustible camioneta" | "04 Sep • S/ 180.00" | Badge "APROBADO" gris neutro.
     * "Almuerzo cuadrilla emergencia" | "04 Sep • S/ 100.00" | Badge ámbar "PENDIENTE" (fondo #FEF3C7, texto #B7791F).

6. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Caja Chica", "Auditoría", "Fondos" (icono y texto ACTIVO en ROJO #B42318 con punto indicador rojo), "Reembolsos".
```

---

## 📌 PANTALLA 6: "Bandeja de Auditoría de Gastos" (Admin)

```text
Diseña una pantalla móvil premium en React Native para la "Bandeja de Auditoría y Aprobación de Gastos" de Softel Telecomunicaciones (inbox del Administrador). Formato vertical móvil (390x844 px). Estilo ultra limpio, corporativo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Botón principal de aprobación: ROJO CORPORATIVO #B42318 con texto blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- Montos en texto oscuro #252525.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header):
   - Marca: "SOFTEL | Auditoría" con campana y avatar circular rojo #B42318.
   - Fila de navegación: Botón volver (<), Título "Bandeja de Auditoría" (#252525, bold, 18px) y badge contador: "3 pendientes" (fondo rojo suave #FEE4E2 con texto rojo #B42318).

2. Barra de Búsqueda y Filtros:
   - Input gris neutro #F4F4F5 con borde #E4E4E7, icono de lupa y texto "Buscar por trabajador, obra o concepto...".

3. Feed de Tarjetas de Gastos por Auditar (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Tarjeta Principal Destacada:
     * Encabezado: Avatar "LP" rojo #B42318, "Luis Pruebas", subtítulo "Supervisor • Hoy 15:30", chip "Caja Chica Obra Norte".
     * Concepto: "Compra urgente de cinta vulcanizante y conectores" (bold, 15px, #252525).
     * Categoría: Chip gris "Materiales e Insumos".
     * Monto Destacado: "S/ 180.00" (bold, 24px, #252525).
     * Vista previa de la foto del comprobante en recuadro con borde fino y botón "Ver foto completa" en texto rojo #B42318.
     * Barra de 3 Acciones Rápidas en la base:
       - Botón "Rechazar": Fondo blanco con borde rojo #B42318, texto e icono cruz en rojo #B42318.
       - Botón "Observar": Fondo crema suave #FEF3C7 con borde ámbar #B7791F, texto e icono de alerta en ámbar #B7791F.
       - Botón "Aprobar": BOTÓN SÓLIDO EN ROJO CORPORATIVO #B42318 con texto e icono de check en blanco. (PROHIBIDO BOTÓN VERDE).

4. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Caja Chica", "Auditoría" (ACTIVO en ROJO #B42318 con punto indicador rojo), "Fondos", "Reembolsos".
```

---

## 📌 PANTALLA 7: "Gestión de Reembolsos Directos con Filtros"

```text
Diseña una pantalla móvil premium en React Native para la "Gestión de Reembolsos Directos y Cuentas por Cobrar" de Softel Telecomunicaciones (pantalla reutilizable para Trabajador y Admin). Formato vertical móvil (390x844 px). Estilo ultra limpio, corporativo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

[REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
- Color primario dominante: #B42318 (Rojo Softel).
- Botones de acción y CTA: ROJO CORPORATIVO #B42318 con texto blanco.
- PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES. NO USAR FONDOS VERDES.
- Badges de "APROBADO" en gris neutro minimalista #F4F4F5.

ESTRUCTURA VISUAL DETALLADA:

1. Barra Superior (Header):
   - Marca: "SOFTEL | Reembolsos" con campana y avatar circular rojo #B42318.
   - Fila de navegación: Botón volver (<) y Título dinámico "Mis Reembolsos por Cobrar" (#252525, bold, 18px).

2. Hero Card Financiera (Fondo blanco #FFFFFF, borde fino #E4E4E7, radio 14px):
   - Encabezado: "TOTAL PENDIENTE DE REEMBOLSO" en mayúsculas gris.
   - Monto gigante destacado: "S/ 235.00" (bold, 30px, #252525).
   - Subtexto: "2 aprobados listos para pago • 1 en evaluación".
   - Caja informativa con borde fino rojo #B42318, fondo blanco: "Los reembolsos aprobados se abonan directamente a tu cuenta sueldo registrada".

3. Barra Horizontal de Filtros por Chips:
   - Chips tipo píldora deslizables: "Todos (4)", "Por Cobrar / Aprobados (2)" (CHIP ACTIVO: borde rojo #B42318, fondo rojo suave #FEE4E2, texto rojo #B42318), "Pendientes (1)", "Pagados (1)", "Observados (0)".

4. Feed de Tarjetas de Reembolsos:
   - Item 1: Avatar "CM" rojo #B42318, "Carlos Mendoza", "Taxi a central de emergencia", "03 Sep • S/ 35.00", badge gris neutro "APROBADO". Botón compacto a la derecha: Botón ROJO CORPORATIVO #B42318 "Pagar".
   - Item 2: "Compra de cables para empalme", "02 Sep • S/ 200.00", badge gris neutro "APROBADO". Botón compacto ROJO #B42318 "Pagar".
   - Item 3: "Almuerzo de trabajo en campo", "01 Sep • S/ 45.00", badge ámbar "PENDIENTE".

5. Botonera Fija Inferior:
   - Botón Principal (CTA Destacado): BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO (#B42318) con texto blanco en negrita "+ Registrar Gasto para Reembolso". (PROHIBIDO COLOR VERDE).

6. Barra de Navegación Inferior (Bottom Tab Bar):
   - 4 pestañas: "Caja Chica", "Auditoría", "Fondos", "Reembolsos" (ACTIVO en ROJO #B42318 con punto indicador rojo).
```

---

## 🚀 MEGA-PROMPT MAESTRO (Las 7 Pantallas en un Solo Prompt)

```text
Diseña un flujo de interfaz móvil completo (7 pantallas conectadas en un solo lienzo) en React Native para la aplicación corporativa de telecomunicaciones y energía Softel. Formato vertical móvil (iOS/Android 390x844 px). Estilo ultra limpio, moderno, ejecutivo y con DOMINANCIA TOTAL DEL ROJO CORPORATIVO (#B42318).

SISTEMA DE DISEÑO Y TOKENS DE COLOR (OBLIGATORIO EN LAS 7 PANTALLAS):
- Fondo general de la app: #F4F4F5 (Gris claro neutro).
- Tarjetas y contenedores: #FFFFFF con borde fino #E4E4E7 y esquinas redondeadas de 14px.
- Color de identidad / Marca dominante: #B42318 (Rojo corporativo Softel).
- Rojo tenue de acento: #FEE4E2.
- Texto principal: #252525 (Casi negro, alta legibilidad).
- Texto secundario: #71717A (Gris medio).
- [REGLAS ESTRICTAS DE COLOR / ANTI-VERDE]:
  * TODOS LOS BOTONES PRINCIPALES (CTAs) DEBEN SER ROJOS CORPORATIVOS #B42318 con texto blanco.
  * PROHIBICIÓN ABSOLUTA: CERO BOTONES VERDES EN TODA LA APLICACIÓN. No usar fondos verdes para botones, tarjetas ni métricas numéricas.
  * [NEGATIVE PROMPT: no green buttons, no green cards, no green CTA, avoid green dominance].
  * La métrica de "Saldo Restante" debe ser texto oscuro #252525 o rojo #B42318, NUNCA verde.
  * Los badges de estado "APROBADO" deben ser píldoras minimalistas en fondo gris neutro #F4F4F5 con texto gris oscuro #3F3F46 para no saturar de verde las pantallas.

PANTALLAS A GENERAR EN EL MISMO LIENZO:

--- PANTALLA 1: "Mi Caja Chica" (Panel Operativo del Supervisor en Campo) ---
- Top Bar: Marca "SOFTEL | Mi Caja" con campana y avatar circular rojo #B42318 con iniciales "JP".
- Sub-header: Título "Mi Caja Chica" (#252525, bold, 18px) y badge superior derecho "• ABIERTA" en gris neutro #F4F4F5 con texto #3F3F46.
- Hero Card Financiera: Fondo #FFFFFF con borde #E4E4E7, título "FONDO ASIGNADO: S/ 1,500.00" y badge "S/ 1,250.50 Disponible" en rojo suave #FEE4E2 con texto #B42318.
- 3 Cajas métricas: "Fondo Base: S/ 1,500.00" (gris) | "Gastado: S/ 249.50" (rojo suave #FEE4E2 con texto #B42318) | "Saldo Disponible: S/ 1,250.50" (fondo gris #F4F4F5, texto #252525. NO VERDE).
- Barra de progreso delgada de consumo en ROJO CORPORATIVO #B42318 sobre carril gris #E4E4E7.
- Botón Secundario: Fondo blanco con borde rojo #B42318 y texto rojo "Finalizar y Enviar a Revisión".
- Sección "Comprobantes Rendidos (3)": Tarjetas blancas con miniatura, motivo, fecha, monto y badge gris minimalista "APROBADO" o ámbar "PENDIENTE".
- Botón Flotante (FAB): Circular en ROJO #B42318 con icono "+" blanco.

--- PANTALLA 2: "Solicitud de Fondo de Caja Chica" (Modal Supervisor) ---
- Header: Botón cerrar (X) y título "Solicitar Apertura de Caja Chica" (#252525, bold, 18px).
- Tarjeta informativa: Fondo blanco con borde rojo fino #B42318, icono de billetera en rojo #B42318 y texto de política de entrega de fondos.
- Card de Monto: Input gigante con fondo gris #F4F4F5, borde #E4E4E7, prefijo fijo "S/" en rojo #B42318 y valor editable "1,500.00" (bold, 32px, #252525).
- Selector rápido de montos (Chips): "S/ 500", "S/ 1,000", "S/ 1,500" (chip ACTIVO: borde rojo #B42318, fondo #FEE4E2, texto #B42318), "S/ 2,000", "Otro".
- Selectores de Proyecto y Justificación operativa limpia.
- Botón Principal Inferior: BOTÓN SÓLIDO ANCHO COLOR ROJO CORPORATIVO #B42318 con texto blanco "Enviar Solicitud a Administración".

--- PANTALLA 3: "Formulario de Gasto / Subsanación" (AddEditExpenseScreen - Crear y Corregir) ---
- Header: Botón retroceso (<), Título "Corregir Gasto Observado" (#252525, bold, 18px) y badge superior ámbar "• OBSERVADO".
- Banner de Advertencia de Administración: Fondo crema suave #FEF3C7 con borde fino ámbar #B7791F e icono de advertencia con texto explicativo: "La boleta adjunta no muestra el RUC legible y falta el sello de cancelado."
- Selector de modo (Switch): "Caja Chica Asignada" (activo en ROJO #B42318) vs "Reembolso Directo".
- Hero Uploader de Comprobante: Recuadro con borde #E4E4E7 mostrando la foto de la boleta con botones flotantes "Cambiar Foto" (borde rojo) y "Eliminar".
- Formulario: Categoría con desplegable, Importe con prefijo "S/" rojo y valor "180.00", motivo y selector de fecha.
- Botón Fijo Inferior: BOTÓN SÓLIDO ANCHO EN ROJO CORPORATIVO #B42318 con texto blanco "Reenviar Comprobante Corregido".

--- PANTALLA 4: "Control de Fondos y Cajas Chicas" (PettyCashManagementScreen - Admin y Contador) ---
- Header: Título "Control de Fondos" (#252525, bold, 20px).
- Selector Superior de Pestañas (Segmented Tabs):
  * Pestaña 1 (ACTIVA): "Cajas Chicas (5)" con fondo ROJO CORPORATIVO #B42318 y texto blanco.
  * Pestaña 2: "Reembolsos Directos (3)" con fondo gris neutro #F4F4F5 y texto gris oscuro.
- Barra de Filtros por Chips: "Todas (5)", "Abiertas (3)", "En Revisión (1)" (ACTIVO con borde rojo #B42318 y fondo suave #FEE4E2), "Cerradas", "Liquidadas".
- Tarjetas de Cajas Chicas: Nombre del responsable, cargo, badge de estado ("• EN REVISIÓN" ámbar o "• ABIERTA" gris), métricas de fondo asignado vs gastado en rojo, barra de progreso de consumo en rojo #B42318 y saldo restante con flecha ">".
- Botón Flotante (FAB): Circular en ROJO #B42318 con icono "+" blanco.

--- PANTALLA 5: "Detalle y Conciliación de Caja Chica" (PettyCashDetailScreen - Admin y Supervisor) ---
- Header: Marca "SOFTEL | Fondos", botón retroceso (<), Título "Detalle de Caja Chica" (#252525, bold, 18px) y badge a la derecha: "• EN REVISIÓN" (ámbar #B7791F en fondo crema #FEF3C7).
- Card de Custodio: Avatar "JP" en fondo rojo #B42318, "Juan Pérez", "Supervisor de Obra Norte", código "HCC-2026-004", fechas y auditor asignado.
- Hero Card de Liquidación y Saldos:
  * Badge "83.3% Ejecutado" (fondo rojo suave #FEE4E2, texto rojo #B42318).
  * 3 Columnas métricas: "Fondo Base: S/ 1,500.00" (fondo gris #F4F4F5, texto #252525) | "Gastado: S/ 1,250.00" (fondo rojo suave #FEE4E2 con texto rojo #B42318) | "Saldo Restante: S/ 250.00" (fondo gris #F4F4F5, texto oscuro #252525. NO VERDE).
  * Barra de progreso delgada de consumo en ROJO CORPORATIVO #B42318 (83.3% lleno).
  * Recuadro de Arqueo Contable Final: Borde fino rojo #B42318 con balanza roja y texto "Saldo a devolver por custodio: S/ 250.00" (#252525, bold).
- Botonera de Acciones:
  * Botón Secundario: Blanco con borde rojo #B42318 y texto rojo "Cerrar Caja (Congelar)" con candado rojo.
  * Botón Principal (CTA): BOTÓN SÓLIDO ANCHO EN ROJO CORPORATIVO #B42318 con texto blanco "Liquidar Definitivamente" e icono check blanco (CERO VERDE).
- Lista de Comprobantes Auditados: Tarjetas blancas con miniatura, motivo, monto y badges discretos en gris neutro #F4F4F5 "APROBADO".

--- PANTALLA 6: "Bandeja de Auditoría de Gastos" (Auditoría del Administrador) ---
- Header: Marca "SOFTEL | Auditoría", botón retroceso (<), título "Bandeja de Auditoría" y badge contador "3 pendientes" (rojo #B42318 con texto blanco).
- Barra de Búsqueda gris neutro #F4F4F5 con lupa.
- Feed de Tarjetas de Auditoría: Avatar rojo #B42318, nombre "Luis Pruebas (Supervisor)", fecha "Hoy 15:30", chip "Caja Chica Obra Norte", concepto "Compra urgente de cinta vulcanizante", categoría "Materiales", monto grande "S/ 180.00" y foto de boleta.
- Barra de 3 Acciones Rápidas en la base:
  * Botón "Rechazar": Fondo blanco con borde rojo #B42318 y texto rojo.
  * Botón "Observar": Fondo crema suave #FEF3C7 con borde ámbar y texto ámbar.
  * Botón "Aprobar": BOTÓN SÓLIDO DESTACADO EN ROJO CORPORATIVO #B42318 con texto y check blanco.

--- PANTALLA 7: "Gestión de Reembolsos Directos con Filtros" (ReimbursementsScreen - Reutilizable) ---
- Header: Botón retroceso (<), Título "Mis Reembolsos por Cobrar" (#252525, bold, 18px).
- Hero Card Financiera: Fondo blanco con borde superior fino rojo #B42318, etiqueta "Total por Reembolsar", monto grande "S/ 235.00" (bold, 30px, #252525) y subtexto "2 aprobados listos para pago • 1 en revisión".
- Barra Deslizable de Filtros por Chips: "Todos (4)", "Por Cobrar / Aprobados (2)" (ACTIVO con borde rojo #B42318 y fondo suave #FEE4E2), "Pendientes", "Pagados", "Observados".
- Lista de Comprobantes: Tarjetas con miniatura de boleta, motivo, categoría, monto y badge de estado en gris neutro. Botón compacto ROJO #B42318 "Pagar".
- Botón Fijo Inferior: BOTÓN SÓLIDO ANCHO EN ROJO CORPORATIVO #B42318 con texto blanco "+ Registrar Gasto para Reembolso".
```
