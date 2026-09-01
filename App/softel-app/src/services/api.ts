import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// URL base del backend según Regla 04
const BASE_URL = 'http://192.168.18.42:3000/api/v1'; // IP Wi-Fi de la PC donde corre el backend

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos máximo de espera
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Agrega el JWT automáticamente a todas las peticiones protegidas
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Manejo global de errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado — limpiar sesión automáticamente
      useAuthStore.getState().clearSession();
      console.warn('Sesión expirada. Redirigiendo al login...');
    }
    return Promise.reject(error);
  }
);
