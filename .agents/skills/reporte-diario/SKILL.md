---
name: reporte-diario
description: >-
  Usa esta skill para gestionar el flujo de trabajo diario del usuario. Se activa con las frases "Inicia sesión" (comienzo del día) y "Cierra sesión" (fin del día para generar el reporte).
---

# Flujo de Trabajo y Reporte Diario (Inicia / Cierra Sesión)

Esta skill define el comportamiento del agente al empezar y terminar la jornada de trabajo con el usuario.

## 1. Cuando el usuario dice "Inicia sesión" o "Iniciamos sesión"
- Saluda al usuario y confirma que estás listo para empezar el día.
- Dile brevemente que estarás registrando mentalmente todos los avances y logros de hoy para el reporte final.
- Pregúntale con qué tarea o requerimiento van a empezar.

## 2. Cuando el usuario dice "Cierra sesión" o "Cerramos sesión"
- Es momento de generar el **Reporte Diario Ejecutivo para WhatsApp**.
- Analiza todo lo trabajado **exclusivamente desde que se dijo "Inicia sesión" hoy**. No mezcles tareas de días anteriores.
- **Evita toda jerga técnica.** Traduce conceptos complejos a valor de negocio.

## 3. Formato Ultra-Compacto (Obligatorio)
El reporte debe demostrar un gran avance pero ocupar **el menor espacio vertical posible** para no saturar el chat. 

### Reglas de Estilo Corporativo:
- **Saludo corto:** Usa un saludo breve (ej. "Buenas tardes equipo,").
- **Salto de línea entre avances:** Deja un renglón en blanco entre cada viñeta para que respire el texto y sea fácil de leer en el celular.
- **Una sola línea por punto:** Usa la estructura `✅ **[Categoría]:** [Logro resumido en 10 palabras o menos]`.
- **Estructura Fija:**

> *Reporte Softel - [Día y Mes]* 🚀
> 
> Buenas tardes equipo,
> 
> **Avances:**
> 
> ✅ **[Módulo 1]:** [Logro hiper-resumido].
> 
> ✅ **[Módulo 2]:** [Logro hiper-resumido].
> 
> ✅ **[Módulo 3]:** [Logro hiper-resumido].
> 
> 🚧 **Pendiente:** [Bloqueante o próxima tarea si existe].

## 4. Entrega
Genera el texto directamente en el chat para que el usuario pueda copiarlo y pegarlo inmediatamente. No crees archivos `.md` de salida.
