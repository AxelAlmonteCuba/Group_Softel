import { api } from '@/services/api';

export interface AdminSummaryData {
    activeUsersCount: number;
    reviewBoxesCount: number;
    draftReportsCount: number;
}

export interface OperatorSummaryData {
    draftReportsCount: number;
    pendingExpensesCount: number;
    approvedExpensesCount: number;
}

// Caché en memoria para evitar llamadas redundantes a la API al cambiar de pestaña
let cachedAdminSummary: AdminSummaryData | null = null;
let lastAdminFetchTimestamp: number = 0;

let cachedOperatorSummary: OperatorSummaryData | null = null;
let lastOperatorFetchTimestamp: number = 0;

const CACHE_TTL_MS = 60 * 1000; // 60 segundos de gracia

/**
 * Servicio de métricas y resumen del Dashboard.
 * Implementa caché en memoria con Stale-While-Revalidate o tiempo de gracia de 60 segundos.
 */
export const dashboardService = {
    /**
     * Obtiene el resumen del Administrador y Contador de forma ultraligera.
     * @param forceRefresh Si es true, ignora la caché y consulta la red.
     */
    getAdminSummary: async (forceRefresh = false): Promise<AdminSummaryData> => {
        const now = Date.now();
        if (!forceRefresh && cachedAdminSummary && now - lastAdminFetchTimestamp < CACHE_TTL_MS) {
            return cachedAdminSummary;
        }

        const response = await api.get<AdminSummaryData>('/dashboard/resumen-admin');
        cachedAdminSummary = response.data;
        lastAdminFetchTimestamp = now;
        return cachedAdminSummary;
    },

    /**
     * Obtiene el resumen operativo de Supervisor y Trabajador de forma ultraligera.
     * @param forceRefresh Si es true, ignora la caché y consulta la red.
     */
    getOperatorSummary: async (forceRefresh = false): Promise<OperatorSummaryData> => {
        const now = Date.now();
        if (!forceRefresh && cachedOperatorSummary && now - lastOperatorFetchTimestamp < CACHE_TTL_MS) {
            return cachedOperatorSummary;
        }

        const response = await api.get<OperatorSummaryData>('/dashboard/resumen-operador');
        cachedOperatorSummary = response.data;
        lastOperatorFetchTimestamp = now;
        return cachedOperatorSummary;
    },

    /**
     * Limpia la caché en memoria (por ejemplo al cerrar sesión).
     */
    clearCache: () => {
        cachedAdminSummary = null;
        lastAdminFetchTimestamp = 0;
        cachedOperatorSummary = null;
        lastOperatorFetchTimestamp = 0;
    },
};
