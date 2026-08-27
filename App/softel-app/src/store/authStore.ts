import { create } from 'zustand';

// Tipos alineados con la Regla 03 (tabla `usuarios`) y authService.ts
type UserRole = 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';

interface AuthUser {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: UserRole;
  cargo: string;
}

interface AuthState {
  // Estado
  token: string | null;
  usuario: AuthUser | null;
  isAuthenticated: boolean;

  // Acciones
  setSession: (token: string, usuario: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Estado inicial — sin sesión
  token: null,
  usuario: null,
  isAuthenticated: false,

  // Acción: Guardar sesión tras login exitoso
  setSession: (token, usuario) =>
    set({
      token,
      usuario,
      isAuthenticated: true,
    }),

  // Acción: Limpiar sesión en logout o expiración de token
  clearSession: () =>
    set({
      token: null,
      usuario: null,
      isAuthenticated: false,
    }),
}));
