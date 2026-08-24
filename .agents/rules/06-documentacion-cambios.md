# Regla 06: Generación Automática de Documentación (Walkthrough)

Esta regla obliga al agente a generar explicaciones legibles de cualquier modificación al código fuente del frontend o backend.

---

## 1. Obligatoriedad de Documentación de Cambios

**SIEMPRE** que el agente realice cambios significativos, refactorizaciones, instalaciones de dependencias críticas o creación de nuevos módulos (tanto en Backend como en Frontend), **DEBE OBLIGATORIAMENTE** generar o actualizar un archivo Markdown temporal.

## 2. Ubicación y Formato del Archivo

- El archivo debe crearse como un **Artifact** o guardarse en la carpeta temporal de explicaciones.
- Se recomienda nombrar los archivos de forma descriptiva, por ejemplo: `guia_cambios_<modulo>.md` o usar el Artifact por defecto `walkthrough.md`.

## 3. Contenido Mínimo Requerido

Todo archivo de documentación de cambios debe incluir:
1. **Resumen de Cambios:** Qué se hizo a nivel de alto nivel.
2. **Archivos Modificados:** Lista de los archivos afectados (`[NUEVO]`, `[MODIFICADO]`, `[ELIMINADO]`).
3. **Explicación del Código:** Un desglose de **qué hace el código** y **por qué se hizo así** (decisiones de diseño, uso de librerías, inyección de dependencias, etc.).
4. **Impacto:** Si afecta variables de entorno, comandos de compilación o a otros módulos.

> [!IMPORTANT]
> El agente NO DEBE esperar a que el usuario le pida esta explicación. Es un comportamiento automático requerido tras finalizar el bloque de ejecución de código.
