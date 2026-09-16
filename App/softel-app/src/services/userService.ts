import { api } from './api';

export const updatePushToken = async (token: string): Promise<void> => {
  try {
    await api.put('/users/token-push', { token });
  } catch (error) {
    console.error('Error al actualizar el Push Token:', error);
    throw error;
  }
};
