# Group Softel - Softel App Móvil
**Fecha:** 13 de Agosto del 2026

---

## 1. Visión General
El proyecto **Softel** consiste en el desarrollo de una solución integral (aplicativo móvil y portal administrativo web) diseñada para centralizar, digitalizar y optimizar la gestión operativa, logística y financiera de la empresa.

La plataforma surge como respuesta a la necesidad de controlar en tiempo real el ciclo de vida de los activos y flujos internos de la organización, integrando en un único ecosistema:
- **Monitoreo de motores electrógenos:** odómetro, horas de trabajo, mantenimientos y alquileres.
- **Equipos de Protección Personal (EPP):** asignación y control de vida útil.
- **Cajas chicas operativas:** rendición y liquidación ágil.
- **Gastos administrativos internos:** registro y control.
- **Cobranzas comerciales:** seguimiento documentario a clientes.

A través de un esquema de seguridad basado en roles (**Administrador**, **Contador**, **Supervisor** y **Trabajador**), la herramienta proporcionará a los supervisores y operarios en campo una vía rápida para registrar evidencias fotográficas, rendiciones y reportes de uso. Paralelamente, otorgará a la administración y contabilidad total visibilidad y control sobre las aprobaciones financieras, alertas preventivas de mantenimiento y el estado de las cuentas de la empresa desde cualquier dispositivo.

---

## 2. Objetivos

### Objetivo General
Desarrollar una aplicación móvil y web que centralice y facilite la gestión operativa, administrativa y financiera de Softel.

### Objetivos Específicos
- Gestionar usuarios y permisos según su rol dentro de la empresa.
- Controlar los motores electrógenos, sus horas de uso, mantenimientos, alquileres y responsables.
- Administrar la entrega, renovación y seguimiento de los EPP asignados al personal.
- Registrar y controlar los gastos, comprobantes, saldos y cierres de caja chica.
- Registrar los ingresos y egresos generales de la empresa.
- Gestionar el proceso de cobranza desde la solicitud del servicio hasta el pago del cliente.
- Centralizar documentos, fotografías y evidencias de las operaciones.
- Generar alertas y reportes para mejorar el control y la toma de decisiones.

---

## 3. Especificaciones
- **Plataforma:** Aplicación móvil y portal web administrativo.
- **Acceso:** Inicio de sesión mediante usuario y contraseña, sin registro público.
- **Roles:** 
  - **Administrador:** Control total.
  - **Contador:** Acceso financiero y reportes.
  - **Supervisor:** Solicita caja chica y gestiona equipos.
  - **Trabajador:** Registra gastos y uso de equipos.
- **Gestión de información:** Registro de datos, fotografías y documentos desde formularios.
- **Control de estados:** Seguimiento del avance de gastos, servicios, pagos, motores y solicitudes.
- **Alertas:** Notificaciones para mantenimientos, renovación de EPP y pagos pendientes.
- **Consultas:** Búsqueda y filtrado de información por usuario, cliente, fecha, categoría y estado.
- **Reportes:** Generación de reportes sobre cajas chicas, gastos, motores, EPP y cobranzas.
- **Historial:** Conservación del registro de las operaciones realizadas.
- **Integración:** Relación entre usuarios, operaciones, documentos, pagos y módulos del sistema.

---

## 4. Distribución de Roles
El sistema operará con cuatro roles diferenciados:
1. **Administrador:** Control total del sistema, aprobación de caja chica, gestión de usuarios, reportes completos.
2. **Contador:** Registro de ingresos/egresos, visualización de reportes financieros, gestión de cobranza.
3. **Supervisor:** Solicita caja chica, gestiona compras de EPP/equipos, asigna recursos a trabajadores.
4. **Trabajador:** Registra gastos personales, uso de motores, solicita EPP, sube evidencias.

*Nota: Esta estructura permite operar eficientemente en la etapa actual de la empresa, manteniendo la flexibilidad para agregar roles intermedios conforme la organización crezca.*

---

## 5. Requerimientos

### 5.1. Módulo de Manejo de Usuarios
#### Gestión de Accesos (Login)
- **Inicio de sesión único:** Los usuarios (trabajadores, gerencia, administrador) accederán a la aplicación móvil o portal web mediante un correo y una contraseña preasignada.
- **Ausencia de auto-registro:** Por seguridad, no existirá el botón de "Crear cuenta" o "Registrarse" en la pantalla de inicio. Todas las cuentas deben ser creadas por la administración.
- **Recuperación de contraseña:** De ser el caso que se solicite una nueva contraseña, se debe solicitar a administración para el cambio.

#### Panel de Administración de Usuarios (CRUD del Administrador)
- **Creación (Create):** El administrador podrá registrar nuevos usuarios en el sistema ingresando sus datos básicos (nombre, apellidos, correo, documento de identidad, puesto de trabajo) y asignándoles una contraseña inicial generada automáticamente por el sistema por temas de seguridad.
- **Visualización (Read):** El administrador tendrá acceso a un listado general de todo el personal registrado, con opciones de búsqueda y filtros.
- **Actualización (Update):** El administrador podrá modificar los datos de los usuarios, actualizar sus cargos y restablecer o cambiar contraseñas si el usuario lo solicita.
- **Desactivación/Eliminación (Delete):** En caso de cese o despido, el administrador no debe eliminar al usuario para no perder el historial (EPP, gastos de caja chica, uso de motores), sino que inhabilitará o cambiará el estado del usuario a "Inactivo".

#### Asignación de Roles y Permisos
El administrador puede asignar y modificar el rol de cada usuario dentro de su perfil:
- **Administrador:** Acceso total al CRUD de usuarios, aprobación de caja chica, finanzas, control de almacén, motores y todos los módulos del sistema.
- **Contador:** Acceso a módulos financieros (ingresos, egresos, cobranza), visualización de reportes administrativos y estados de equipos, sin capacidad de aprobar operaciones operativas.
- **Supervisor:** Solicita caja chica, registra gastos, asigna EPP y motores a su equipo, ve reportes de su cuadrilla.
- **Trabajador:** Registra gastos personales, uso de motores, solicita EPP para sí mismo y sube evidencias fotográficas.

---

### 5.2. Módulo de Caja Chica (Control de Gastos)
- **Registro de Gastos:** Los usuarios pueden ingresar el motivo del gasto, monto y foto de evidencia (boletas, facturas de combustible, etc.). *(Disponible para todos los usuarios)*.
- **Cálculo de Saldos:** El sistema suma los gastos ingresados y los compara con el monto asignado (ej. 200 soles). Si los gastos superan este monto, calcula automáticamente un "saldo a favor" (monto a devolver al usuario).
- **Liquidación de saldo a favor:** El administrador visualiza usuarios pendientes de liquidar y actualiza sus estados ("Saldo a favor", "Liquidado").
- **Aprobación de gastos:** El administrador revisa desde su celular cada gasto y puede aprobarlo o rechazarlo ("no procede").
- **Aprobación de caja chica:** El administrador revisa desde su celular cada solicitud de caja chica y puede aprobarla o rechazarla ("no procede").
- **Nuevas Solicitudes:** El Supervisor solicita la apertura de una nueva caja chica, sujeta a aprobación del Administrador.
- **Cierre:** Se procede al cierre de la caja chica una vez aprobados todos los gastos por el Administrador.
- **Reportes:** Generación de informes en PDF de cajas chicas aprobadas/rechazadas y detalle de gastos. *(No todos los usuarios tienen caja chica asignada)*.
- **Control por usuario:** Filtro de cajas chicas por usuario y por rango de fechas (para Administrador y Contador).
- **Categorización:** Clasificación de gastos por tipo (*Movilidad*, *Materiales*, *Viáticos*).
- **Resumen:** El Administrador y Contador disponen de una vista con el total acumulado de lo gastado en caja chica por todos los usuarios en conjunto.

---

### 5.3. Módulo de Administración Interna
- **Registro Contable de Egresos:** El Contador y Administrador ingresan manualmente pagos administrativos generales (proveedores, contratistas, sueldos, bancos, apoyos) detallando monto, fecha y comprobante.
- **Registro de Ingresos Generales:** Registro de ingresos por pagos de servicios u otros conceptos con su respectivo voucher/constancia.
- **Categorización de Movimientos:** Clasificación en categorías (*Proveedores*, *Contratistas*, *Sueldos*, *Bancos*, *Servicios*, *Otros*).
- **Estados de Pago:** Asignación y actualización de estados (*Pendiente*, *Programado*, *Pagado*, *Anulado*).
- **Visibilidad y Filtros en Tiempo Real:** Visualización en tiempo real de pagos efectuados y pendientes con filtros por rango de fechas, estado y categoría.
- **Resumen Financiero:** Muestra total acumulado de ingresos, egresos y saldo disponible en un periodo determinado.

---

### 5.4. Módulo de Cobranza (Flujo de Servicios a Clientes)
- **Registro de Solicitud de Servicio:** Registro de la solicitud del cliente con sus detalles y datos de contacto.
- **Generación y Envío de Cotización:** Elaboración de cotización, registro de su envío formal al cliente y actualización de estado (*Ejecutado* / *No ejecutado*).
- **Definición del Cronograma de Pagos:** Pago total o división en cuotas porcentuales (ej. 25%-25%-25%-25%, 50%-50%, 35%-35%-30%). La suma debe ser exactamente 100%.
- **Orden de Compra (OC):** Carga del documento de OC emitido por el cliente como aprobación.
- **Reporte Fotográfico:** Adjunto de evidencias fotográficas al finalizar el trabajo o etapa.

#### Submódulo Temporal de Reporte Fotográfico
- **Acceso General:** Los usuarios autorizados pueden ingresar al submódulo y generar reportes fotográficos sin depender inicialmente de los demás módulos del sistema.
- **Registro de Proyecto:** Registro de datos básicos del proyecto o servicio (código, nombre, ubicación, fechas y responsables).
- **Registro de Partidas:** Registro de partidas iniciales indicando número de ítem y descripción.
- **Carga de Fotografías:** Asociación de una o varias imágenes a su número de ítem y partida correspondiente.
- **Generación de Reporte:** Generación automática del documento agrupando imágenes por partida e ítem.
- **Datos del Reporte:** Muestra datos generales del proyecto, responsables, relación de partidas, imágenes agrupadas por partida/ítem, fecha y hora de generación.
- **Estado Básico:** Manejo de estados *Borrador* y *Generado*.
- **Carga Inicial de Fotografías:** En la primera versión, la carga de fotografías se realiza desde el dispositivo del usuario con registro automático de fecha, hora y usuario. *(La captura directa desde la aplicación con GPS integrado se implementará en una fase posterior)*.

#### Continuación Módulo de Cobranza
- **Orden de Servicio (OS):** Carga de la OS emitida por el cliente que valida conformidad y autoriza pago.
- **Emisión de Factura:** Registro del número de factura, monto total, fecha de emisión y cuota/porcentaje asociado.
- **Registro de Cuotas / Pagos Parciales:** Registro de cada pago según cronograma (porcentaje, monto, fecha, comprobante, observaciones).
- **Validación de Pagos:** El Administrador o Contador valida los pagos, cambiando la cuota a estado *Pagada*.
- **Control de Saldo Pendiente:** Cálculo automático del porcentaje/monto pagado y saldo pendiente.
- **Estados de las Cuotas:** *Pendiente*, *Registrada*, *En revisión*, *Pagada*, *Rechazada*.
- **Estado General de Cobranza:** *Pendiente de pago*, *Pago parcial*, *Pagado*, *Vencido*.
- **Seguimiento y Trazabilidad:** Estados del servicio (*Cotizado*, *Con OC*, *Trabajo realizado*, *Con OS*, *Facturado*, *Pago parcial*, *Cobrado*).
- **Validación de Porcentajes:** Restricción para no permitir guardar un cronograma cuya suma difiera del 100%.

---

### 5.5. Módulo de EPP (Equipos de Protección Personal)
- **Solicitud de Renovación:** Solicitud por parte del usuario adjuntando foto del daño (ej. guante roto).
- **Gestión de Entrega:** Administración aprueba y decide si se retira del stock o se autoriza compra vía caja chica.
- **Asignación y Seguimiento:** Registro exclusivo por Administrador y Supervisor sobre qué EPP específico se entregó a cada trabajador.
- **Tiempos de Vida Útil:** Seguimiento de la antigüedad de entrega según estimaciones (guantes/lentes ~1 mes, ropa ~6 meses, cascos/zapatos ~1 año).
- **Aviso de Renovación:** Alerta del sistema cuando un EPP requiere reemplazo y a qué usuario corresponde.
- **EPP Especiales ("Otros"):** Solicitud de EPP específicos para un trabajo puntual, los cuales deben ser devueltos al finalizar la labor.

---

### 5.6. Módulo de Motores Electrógenos
- **Registro y Estado:** Cada motor se registra con número de serie y número de motor. Estados disponibles: *Disponible*, *En uso*, *En mantenimiento*, *Pendiente de revisión* o *Fuera de servicio*.
- **Control de Horas de Trabajo y Mantenimiento:** Límites para mantenimiento (ej. 50, 100, 250 horas). Registro mediante odómetro (inicial y final) o ingreso directo de horas. Historial de horas acumuladas y alertas automáticas.
- **Control de Combustible:** Registro obligatorio antes y después de cada uso mediante porcentaje, nivel estimado o fotografía del indicador.
- **Historial de Uso:** Registro del usuario, fecha, actividad, horas trabajadas, combustible inicial/final y observaciones.
- **Gestión de Alquileres a Terceros:** Registro diferenciado para uso propio o alquiler a clientes. Incluye estado, odómetro, combustible y fotografías en entrega y devolución.
- **Registro de Incidencias:** Registro de fallas, accidentes o daños fuera o dentro de operación. Incluye tipo de problema, descripción, fecha, motor, usuario reportante, personas involucradas, fotos y observaciones.
- **Trazabilidad de Incidencias:** Control de auditoría que registra usuario, fecha/hora de creación y cada cambio de estado (*estado anterior*, *nuevo estado*, *observaciones*).
- **Observaciones y Desperfectos:** Obligatoriedad de detallar observaciones y adjuntar fotos en entrega, devolución, uso o revisión si hay anomalías.
- **Bloqueo Preventivo:** Si una incidencia compromete el funcionamiento o la seguridad, el motor cambia automáticamente a *Pendiente de revisión* o *Fuera de servicio*, impidiendo su asignación o uso.
- **Autorización Excepcional:** Solo el Administrador puede autorizar el uso de un motor con incidencia pendiente (registrando motivo, usuario autorizado, fecha y vigencia).
- **Mantenimiento y Rehabilitación:** El motor permanece bloqueado hasta que el Administrador registre la revisión/reparación y reactive su estado a *Disponible*.
- **Historial del Motor:** Registro histórico integral de usos, trabajos, alquileres, mantenimientos, incidencias, odómetro, combustible y evidencias fotográficas.

---

## 6. Alcance (Desarrollo Incremental)

| Fase | Módulos / Alcance | Descripción |
| :--- | :--- | :--- |
| **Fase 1: Módulos Prioritarios** | • Manejo de usuarios y roles<br>• Caja chica y control de gastos<br>• Submódulo temporal de Reporte Fotográfico<br>• Registro básico de motores electrógenos<br>• Registro básico de EPP | Permitirá gestionar accesos, controlar cajas chicas, generar reportes fotográficos y registrar la información inicial de motores y EPP. |
| **Fase 2: Gestión Operativa** | • Gestión completa de motores electrógenos<br>• Gestión completa de EPP<br>• Seguimiento de mantenimientos, incidencias, entregas y renovaciones | Incorporará las funciones avanzadas para el control operativo de motores y EPP. |
| **Fase 3: Módulos Administrativos** | • Administración interna<br>• Registro de ingresos y egresos<br>• Control de pagos y movimientos financieros | Permitirá gestionar y consultar los movimientos financieros generales de la empresa. |
| **Fase 4: Módulo de Cobranza** | • Solicitudes de servicio<br>• Cotizaciones<br>• Órdenes de compra y servicio<br>• Integración del Reporte Fotográfico<br>• Facturación y registro de pagos parciales o porcentuales | Permitirá controlar el flujo comercial desde la solicitud del servicio hasta el cobro al cliente. |
| **Fase 5: Mejoras y Ampliaciones** | • Reportes adicionales<br>• Optimización del sistema<br>• Notificaciones avanzadas<br>• Funcionamiento offline<br>• Integraciones con bancos o plataformas de pago, si son aprobadas | Comprenderá las funcionalidades complementarias que serán evaluadas e implementadas posteriormente. |

---

## 7. Limitaciones
- La implementación de cada módulo depende de la validación del módulo anterior y de la disponibilidad de la información necesaria por parte del cliente.
- Los módulos o funcionalidades no priorizados en la primera etapa podrán desarrollarse posteriormente, previa evaluación de tiempo, costo y complejidad.

---

## 8. Cronograma de Entregas

| Entrega | Módulo / Alcance | Funcionalidades Incluidas |
| :--- | :--- | :--- |
| **Entrega 1** | **Usuarios** | Login, roles, creación de usuarios, activación/inactivación y permisos básicos. |
| **Entrega 2** | **Caja Chica** | Solicitud de caja, aprobación, registro de gastos, carga de comprobantes, cálculo de saldo y cierre de caja. |
| **Entrega 3** | **Reporte Fotográfico** | Proyectos, partidas, carga de fotografías, asociación por ítem/partida y generación automática del documento. |
| **Entrega 4** | **Registros Básicos** | Registro de motores, registro de EPP y consulta de información registrada. |

*Nota: Las funciones avanzadas de motores, EPP, offline y las integraciones se implementarán en etapas posteriores.*

### Proceso de Validación por Entrega
Al finalizar cada entrega se ejecuta el siguiente ciclo:
1. Presentación del avance funcional al cliente.
2. Pruebas de funcionamiento por parte del cliente.
3. Registro formal de observaciones.
4. Corrección de errores y ajustes técnicos.
5. Obtención de la aprobación formal para continuar con la siguiente entrega.