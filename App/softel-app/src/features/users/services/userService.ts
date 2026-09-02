import { api } from '@/services/api';

export interface User {
  id: string;
  documento_identidad: string;
  nombres: string;
  apellidos: string;
  correo: string;
  cargo: string;
  rol: 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateUser {
  documento_identidad: string;
  nombres: string;
  apellidos: string;
  correo: string;
  clave: string;
  cargo: string;
  rol: 'ADMINISTRADOR' | 'CONTADOR' | 'SUPERVISOR' | 'TRABAJADOR';
}

export type UpdateUser = Partial<CreateUser> & {
  estado?: 'ACTIVO' | 'INACTIVO';
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (user: CreateUser): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
}

export const updateUser = async (id: string, user: UpdateUser): Promise<User> => {
  const response = await api.patch(`/users/${id}`, user);
  return response.data;
}