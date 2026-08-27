import { api } from '@/services/api';

// Tipos de respuesta según Regla 03 (modelo de usuarios del backend)
export interface LoginCredentials {
  correo: string;
  clave: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';
    cargo: string;
  };
}

// Servicio de autenticación — solo llama al endpoint, no maneja estado
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};
