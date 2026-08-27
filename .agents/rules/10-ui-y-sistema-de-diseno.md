# Regla 10: Interfaz de Usuario y Sistema de Diseño

Centraliza las directivas visuales y de usabilidad para SOFTEL, prohibiendo el uso de estilos ad-hoc.

---

## 1. Textos y Consistencia
- **UI en Español Formal**: Todo texto renderizado para el usuario debe ser formal y claro (ej. "Registrar gasto", "Guardar cambios", "Finalizar y generar PDF").

---

## 2. Paleta de Colores y Tokens
- **Uso Obligatorio**: Todos los componentes deben importar los colores desde `src/theme/colors.ts`.
- **Restricciones**: Prohibido usar hexadecimales directos en los estilos, colores con degradados, efectos neón, o la implementación de modo oscuro (Dark Mode) hasta que se solicite explícitamente.

### Tokens Oficiales (`src/theme/colors.ts`)
```typescript
export const colors = {
  // Fondos y Superficies Neutras
  background: '#F4F4F5',
  surface: '#FFFFFF',
  border: '#E4E4E7',
  borderFocus: '#B42318',

  // Identidad y Acentos (Rojo Corporativo)
  primary: '#B42318',
  primaryPressed: '#7F1D1D',
  primarySoft: '#FEE4E2',

  // Tipografía Neutra
  textPrimary: '#252525',
  textSecondary: '#71717A',
  textDisabled: '#A1A1AA',
  textOnPrimary: '#FFFFFF',

  // Estados Semánticos
  success: '#16803C',      // ACTIVO, GENERADO, APROBADO
  successSoft: '#DCFCE7',
  warning: '#B7791F',      // BORRADOR, PENDIENTE, EN REVISIÓN
  warningSoft: '#FEF3C7',
  error: '#B42318',        // INACTIVO, RECHAZADO
  errorSoft: '#FEE4E2',
  info: '#3F3F46',         // CERRADO, NO APLICA
  infoSoft: '#F4F4F5',
} as const;
```
