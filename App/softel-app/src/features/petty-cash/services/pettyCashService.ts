import { api } from '@/services/api';

export type PettyCashStatus =
    | 'SOLICITADA'
    | 'APROBADA'
    | 'RECHAZADA'
    | 'ABIERTA'
    | 'EN_REVISION'
    | 'CERRADA'
    | 'LIQUIDADA';

export interface PettyCashManagerUser {
    id: string;
    nombres: string;
    apellidos: string;
    documento_identidad: string;
    cargo: string;
    rol: string;
}

export interface PettyCashEvaluatorUser {
    id: string;
    nombres: string;
    apellidos: string;
    cargo: string;
}

export interface PettyCashResponse {
    id: string;
    assignedAmount: string | number;
    currentBalance: string | number;
    finalBalance: string | number;
    status: PettyCashStatus;
    justification?: string | null;
    projectId?: string | null;
    openingDate: string | null;
    closingDate: string | null;
    createdAt: string;
    managerUser: PettyCashManagerUser;
    evaluatorUser: PettyCashEvaluatorUser | null;
}

/**
 * Servicio para consultar y gestionar cajas chicas en el frontend.
 * Conectado a /api/v1/cajas-chicas según Postman spec.
 */
export const pettyCashService = {
    /**
     * Consulta todas las cajas chicas asociadas a un usuario específico.
     * GET /api/v1/cajas-chicas/usuario/:usuarioId
     */
    getByUser: async (usuarioId: string): Promise<PettyCashResponse[]> => {
        const response = await api.get<PettyCashResponse[]>(`/cajas-chicas/usuario/${usuarioId}`);
        return response.data;
    },

    /**
     * Solicita la apertura de una nueva caja chica.
     * POST /api/v1/cajas-chicas
     */
    requestPettyCash: async (data: {
        assignedAmount: number;
        justification: string;
        projectId?: string | null;
    }): Promise<PettyCashResponse> => {
        const response = await api.post<PettyCashResponse>('/cajas-chicas', data);
        return response.data;
    },

    /**
     * Consulta todas las cajas chicas del sistema (Administrador y Contador).
     * GET /api/v1/cajas-chicas
     */
    getAll: async (): Promise<PettyCashResponse[]> => {
        const response = await api.get<PettyCashResponse[]>('/cajas-chicas');
        return response.data;
    },

    /**
     * Consulta una caja chica específica por su ID.
     * GET /api/v1/cajas-chicas/:id
     */
    getById: async (id: string): Promise<PettyCashResponse> => {
        const response = await api.get<PettyCashResponse>(`/cajas-chicas/${id}`);
        return response.data;
    },

    /**
     * Actualiza el estado de la caja chica (Aprobar, Abrir, Cerrar, Liquidar, Rechazar, Revisar).
     * PATCH /api/v1/cajas-chicas/:id/estado
     */
    updateStatus: async (
        id: string,
        action: 'APROBAR' | 'RECHAZAR' | 'ABRIR' | 'REVISAR' | 'CERRAR' | 'LIQUIDAR',
    ): Promise<PettyCashResponse> => {
        const response = await api.patch<PettyCashResponse>(`/cajas-chicas/${id}/estado`, { action });
        return response.data;
    },
};
