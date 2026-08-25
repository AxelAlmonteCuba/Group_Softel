/**
 * Sistema de Colores — Softel
 * Fuente única de verdad. Definido en Regla 08: UI y Sistema de Diseño.
 * Prohibido usar hexadecimales directos en los componentes.
 */
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

export type ColorKey = keyof typeof colors;
