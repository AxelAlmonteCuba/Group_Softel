# Regla 06: Generación Automática de Documentación de Cambios

Esta regla obliga al agente a documentar cualquier cambio de código fuente,
tanto en el **Backend** como en el **Frontend**, de forma automática e inmediata,
sin esperar a que el usuario lo solicite.

---

## 1. Obligatoriedad

**SIEMPRE** que el agente realice cambios significativos (nuevos archivos,
modificaciones, refactorizaciones, instalación de dependencias, configuraciones),
**DEBE**:

1. Crear o actualizar un archivo Markdown de documentación.
2. Este archivo debe generarse **ANTES** de finalizar la respuesta al usuario.
3. El archivo debe guardarse **DENTRO DEL PROYECTO** en la carpeta `docs/` correspondiente:
   - Backend: `Backend/backend/docs/<nombre-descriptivo>.md`
   - Frontend/App: `App/<nombre-app>/docs/<nombre-descriptivo>.md`
4. Adicionalmente, también puede crearse como **Artifact** visible en la conversación.

---

## 2. Nomenclatura del Archivo

Usar nombres descriptivos en kebab-case que indiquen el contexto del cambio:
```
cambios-modulo-auth.md
cambios-prioridad-alta-jwt-rbac.md
cambios-entidad-usuario.md
cambios-caja-chica-gastos.md
```

---

## 3. Contenido Mínimo Requerido

```markdown
# Cambios — [Descripción del cambio]
> Fecha: YYYY-MM-DD | Módulo: [Backend/Frontend]

## Archivos Afectados
| Estado | Archivo |
| [NUEVO] / [MODIFICADO] / [ELIMINADO] | ruta/al/archivo |

## Dependencias Instaladas (si aplica)
Lista de paquetes npm instalados.

## Explicación por Archivo
Para cada archivo modificado:
- Qué hace el código
- Por qué se tomó esa decisión de diseño
- Si usa alguna librería o patrón no obvio, explicarlo

## Flujo / Diagrama (si aplica)
Diagrama de texto mostrando cómo interactúan los componentes.

## Impacto
- Variables de entorno afectadas
- Endpoints nuevos o modificados
- Efectos sobre otros módulos
```

---

## 4. Cuándo Crear vs. Cuándo Actualizar

- **Crear** un archivo nuevo: cuando los cambios pertenecen a un nuevo módulo o tarea distinta.
- **Actualizar** el archivo existente: cuando son cambios incrementales sobre el mismo módulo.

> [!IMPORTANT]
> El agente NO debe esperar a que el usuario pida la explicación.
> Generar el archivo MD es un paso OBLIGATORIO del proceso de escritura de código,
> igual que ejecutar el compilador para verificar errores.
