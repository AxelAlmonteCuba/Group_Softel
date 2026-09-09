import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// ==============================================================================
// CONFIGURACIÓN DE URL DEL BACKEND (Regla 04)
// ==============================================================================
export const API_ENV = {
  DEV_VPS: 'https://api.g-softel.com:8443/api/v1',  // Servidor de Pruebas en VPS (Nube HTTPS)
  PROD_VPS: 'https://api.g-softel.com/api/v1',      // Servidor Oficial de Producción
  LOCAL: 'http://192.168.1.39:3000/api/v1',        // Backend local en tu PC (Hot-reload)
};

// Configuración activa para pruebas (apuntando al VPS en Desarrollo)
const BASE_URL = API_ENV.LOCAL;

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
