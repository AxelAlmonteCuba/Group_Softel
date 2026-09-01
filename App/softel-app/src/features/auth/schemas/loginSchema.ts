import { z } from 'zod';

// Esquema de validación del formulario de login
// Regla 08: El esquema se define ANTES del componente visual
export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Debe ingresar un correo válido')
    .max(120, 'Máximo 120 caracteres'),

  clave: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'Máximo 100 caracteres'),
});

// Tipo TypeScript inferido automáticamente desde el esquema
export type LoginFormData = z.infer<typeof loginSchema>;
