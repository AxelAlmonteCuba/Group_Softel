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
};
