import { api } from './api';

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  cargo: string;
  rol: 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};
