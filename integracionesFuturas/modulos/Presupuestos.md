# Plan Base: Módulo de Presupuestos (Cotizaciones) y Reportes

Este documento establece la arquitectura base para la implementación del **Módulo de Presupuestos** adaptado estrictamente al formato real de cotizaciones de *Group Softel*. Según la **Regla 01 y 05**, este módulo pertenece a la fase de *Cobranzas y Comercial*.

---

## 1. Objetivo del Módulo
Permitir a los usuarios autorizados (Administrador / Roles Comerciales) generar cotizaciones formales estructuradas por categorías dinámicas (Materiales, Logística, Mano de Obra), visualizarlas y exportarlas a PDF/Excel con el membrete oficial y datos bancarios de la empresa, manteniendo sincronización con el backend central.

---

## 2. Arquitectura de Base de Datos (Backend)

Basado en la cotización real analizada (6 de Septiembre), el esquema se expande para soportar la complejidad de los datos:

### 2.1. `clientes`
Datos fiscales de las empresas a presupuestar.
- `id` (UUID - PK)
- `razon_social` (Ej. CICSA PERU S.A.C.)
- `ruc` (VARCHAR 11)
- `direccion_fiscal`

### 2.2. `presupuestos` (Cabecera)
- `id` (UUID - PK)
- `numero_cotizacion` (VARCHAR, Ej. 2026090011)
- `fecha_emision` (DATE)
- `cliente_id` (FK -> `clientes.id`)
- `usuario_creador_id` (FK -> `usuarios.id`)
- `lugar_trabajo_site` (VARCHAR, Ej. VARIOS)
- `lugar_trabajo_region` (VARCHAR, Ej. Cusco)
- `consideraciones` (TEXT, Ej. "Está incluido costos de traslado...")
- `forma_pago` (TEXT, Ej. "70% inicial...")
- `subtotal`, `igv`, `total` (DECIMAL 10,2)
- `estado` (ENUM: `BORRADOR`, `ENVIADO`, `APROBADO`, `RECHAZADO`)

### 2.3. `presupuesto_categorias` (Agrupadores de ítems)
Para soportar divisiones exactas en las tablas del PDF (Materiales, Logística, Mano de obra).
- `id` (UUID - PK)
- `presupuesto_id` (FK -> `presupuestos.id`)
- `nombre` (VARCHAR, Ej. "MATERIALES / EQUIPOS")
- `orden` (INT)

### 2.4. `presupuesto_items` (Detalle por categoría)
Refleja exactamente las columnas de la cotización real.
- `id` (UUID - PK)
- `categoria_id` (FK -> `presupuesto_categorias.id`)
- `numero_item` (INT, Ej. 1, 2, 3...)
- `descripcion` (VARCHAR)
- `unidad_medida` (VARCHAR, Ej. "UND")
- `precio_unitario` (DECIMAL 10,2)
- `dias` (INT)
- `cantidad` (INT)
- `costo_total` (DECIMAL 10,2) -> *Cálculo interno: `precio_unitario * dias * cantidad`*

### 2.5. Integración con Caja Chica (Rentabilidad de Proyecto)
Una vez que el Presupuesto cambie a estado `APROBADO`, se activará la capacidad de enlazar la ejecución financiera:
- La tabla `cajas_chicas` recibirá una FK opcional `presupuesto_id` (NULL por defecto).
- **Control de Rentabilidad:** El backend podrá cruzar el `presupuestos.total` (Ingresos proyectados) contra la sumatoria de todos los gastos aprobados de las cajas chicas enlazadas a ese presupuesto (Egresos reales).
- **Fórmula:** `Rentabilidad = Total Presupuesto - Σ (Gastos Aprobados de Cajas Chicas vinculadas)`. Esto permitirá saber en tiempo real si el proyecto u obra está en **Ganancia** o **Pérdida**.

---

## 3. Generación de Reportes (PDF Institucional)

La generación del PDF se procesará exclusivamente en **NestJS** (Regla 02). El PDF debe estar maquetado usando un motor **HTML a PDF** para replicar con píxel perfecto el formato real:

### 3.1. Estructura Fija de la Plantilla:
1. **Cabecera Oficial:** 
   - Título autogenerado: `COTIZACIÓN N°: [numero]` y Fecha.
   - Bloque de datos estáticos de *GROUP SOFTEL (RUC, Dirección, Teléfono)*.
2. **Datos del Cliente y Lugar:** Bloques de texto variables insertados.
3. **Tablas Dinámicas:** 
   - Una tabla independiente por cada `presupuesto_categorias` (Ej. Una para Logística, otra para Materiales).
   - Columnas obligatorias: `ITEM | DESCRIPCION | UNIDADES | PRECIO UNIT. | DIAS | CANTIDAD | COSTO`.
4. **Resumen de Costos:** Subtotal, IGV (18%) y Total.
5. **Bloques Legales y Financieros (Predefinidos/Editables):**
   - Consideraciones.
   - Forma de Pago.
   - Tablas bancarias fijas inyectadas por defecto (BCP, BBVA, Banco de la Nación para Detracción 12%).

---

## 4. Estructura de Pantallas (Frontend - App)

Dado que es mucha información para ingresar desde un celular, la interfaz debe optimizarse drásticamente:

1. **Dashboard Cotizaciones:** Lista de cotizaciones con estados y barra de búsqueda por Cliente.
2. **Formulario Wizard (Paso a Paso):**
   - *Paso 1 (Cabecera):* Seleccionar/Crear Cliente, Fecha y Ubicación (Site/Región).
   - *Paso 2 (Costos):* Interfaz con *Acordeones* (Materiales, Logística, Mano de Obra). Al expandir uno, se pueden añadir ítems completando: descripción, días, cantidad y precio. El Subtotal se calcula en tiempo real.
   - *Paso 3 (Términos):* Textos de Consideraciones y Forma de Pago (con plantillas por defecto).
   - *Paso 4 (Resumen):* Revisión de Subtotal, IGV y Total.
3. **Pantalla de Vista Previa y Envío:**
   - Botón Flotante para "Generar PDF Oficial".
   - Al generarse, se usa `expo-sharing` para enviarlo directamente al cliente por WhatsApp o Email desde el dispositivo.

---

## 5. Plan de Implementación Incremental

- **Fase A (Modelado Backend):** Crear las 4 entidades en NestJS (`Cliente`, `Presupuesto`, `Categoria`, `Item`) y asegurar en los Servicios que los cálculos transaccionales de `costo_total` e `igv` sean precisos.
- **Fase B (Plantilla PDF):** Diseñar el layout HTML utilizando Handlebars o Pug, asegurando que las tablas y cuentas bancarias coincidan exactamente con la imagen corporativa y la cotización del 6 de Septiembre.
- **Fase C (Frontend React Native):** Desarrollar el flujo *Wizard* (Paso a Paso) para evitar pantallas sobrecargadas y facilitar a los comerciales generar estas cotizaciones rápidas desde cualquier lugar.
