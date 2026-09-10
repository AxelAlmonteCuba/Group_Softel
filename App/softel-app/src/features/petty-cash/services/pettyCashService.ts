import { api } from '@/services/api';
import { dashboardService } from '@/features/home/services/dashboardService';

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
    approvedAmount?: number;
    pendingAmount?: number;
    effectiveBalance?: number;
    approvedExpensesCount?: number;
    totalExpensesCount?: number;
    status: PettyCashStatus;
    justification?: string | null;
    projectId?: string | null;
    openingDate: string | null;
    closingDate: string | null;
    createdAt: string;
    managerUser: PettyCashManagerUser;
    evaluatorUser: PettyCashEvaluatorUser | null;
}

const CACHE_TTL_MS = 60 * 1000; // 60 segundos de gracia

interface CacheRecord<T> {
    data: T;
    timestamp: number;
}

let allBoxesCache: CacheRecord<PettyCashResponse[]> | null = null;
const userBoxesCache = new Map<string, CacheRecord<PettyCashResponse[]>>();
let allDirectExpensesCache: CacheRecord<ExpenseItemResponse[]> | null = null;
const userDirectExpensesCache = new Map<string, CacheRecord<ExpenseItemResponse[]>>();

/**
 * Invalida toda la caché de caja chica, reembolsos y dashboard cuando ocurre una mutación.
 */
export const invalidatePettyCashCache = () => {
    allBoxesCache = null;
    userBoxesCache.clear();
    allDirectExpensesCache = null;
    userDirectExpensesCache.clear();
    dashboardService.clearCache();
};

/**
 * Servicio para consultar y gestionar cajas chicas en el frontend.
 * Conectado a /api/v1/cajas-chicas según Postman spec con caché inteligente en memoria.
 */
export const pettyCashService = {
    /**
     * Consulta todas las cajas chicas asociadas a un usuario específico.
     * GET /api/v1/cajas-chicas/usuario/:usuarioId
     */
    getByUser: async (usuarioId: string, forceRefresh = false): Promise<PettyCashResponse[]> => {
        const now = Date.now();
        const cached = userBoxesCache.get(usuarioId);
        if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
        const response = await api.get<PettyCashResponse[]>(`/cajas-chicas/usuario/${usuarioId}`);
        userBoxesCache.set(usuarioId, { data: response.data, timestamp: now });
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
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Consulta todas las cajas chicas del sistema (Administrador y Contador).
     * GET /api/v1/cajas-chicas
     */
    getAll: async (forceRefresh = false): Promise<PettyCashResponse[]> => {
        const now = Date.now();
        if (!forceRefresh && allBoxesCache && now - allBoxesCache.timestamp < CACHE_TTL_MS) {
            return allBoxesCache.data;
        }
        const response = await api.get<PettyCashResponse[]>('/cajas-chicas');
        allBoxesCache = { data: response.data, timestamp: now };
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
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Registra un nuevo gasto con comprobante fotográfico (multipart/form-data).
     * POST /api/v1/gastos
     */
    registerExpense: async (data: RegisterExpenseData): Promise<ExpenseResponse> => {
        const formData = new FormData();

        if (data.pettyCashId) {
            formData.append('pettyCashId', data.pettyCashId);
        }
        formData.append('categoryId', String(data.categoryId));
        formData.append('amount', String(data.amount));
        formData.append('reason', data.reason);
        formData.append('expenseDate', data.expenseDate);

        const filename = data.imageUri.split('/').pop() || 'comprobante.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

        formData.append('receipt', {
            uri: data.imageUri,
            name: filename,
            type,
        } as any);

        const response = await api.post<ExpenseResponse>('/gastos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Consulta todos los gastos/comprobantes de una caja chica específica.
     * GET /api/v1/gastos/caja/:cajaId
     */
    getExpensesByPettyCash: async (cajaId: string): Promise<ExpenseItemResponse[]> => {
        const response = await api.get<ExpenseItemResponse[]>(`/gastos/caja/${cajaId}`);
        return response.data;
    },

    /**
     * Consulta todos los gastos pendientes de revisión (para el Administrador).
     * GET /api/v1/gastos/pendientes
     */
    getPendingExpenses: async (): Promise<ExpenseItemResponse[]> => {
        const response = await api.get<ExpenseItemResponse[]>('/gastos/pendientes');
        return response.data;
    },

    /**
     * Evalúa un gasto (Aprobar, Observar, Rechazar).
     * PATCH /api/v1/gastos/:id/evaluar
     */
    evaluateExpense: async (
        id: string,
        data: {
            decision: 'APROBADO' | 'RECHAZADO' | 'OBSERVADO';
            evaluationComment?: string;
        },
    ): Promise<ExpenseItemResponse> => {
        const response = await api.patch<ExpenseItemResponse>(`/gastos/${id}/evaluar`, data);
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Subsanar / Actualizar un gasto en estado OBSERVADO.
     * PATCH /api/v1/gastos/:id
     */
    updateExpense: async (
        id: string,
        data: UpdateExpenseData,
    ): Promise<ExpenseItemResponse> => {
        const formData = new FormData();
        if (data.categoryId !== undefined) formData.append('categoryId', String(data.categoryId));
        if (data.amount !== undefined) formData.append('amount', String(data.amount));
        if (data.reason !== undefined) formData.append('reason', data.reason);
        if (data.expenseDate !== undefined) formData.append('expenseDate', data.expenseDate);

        // Si se seleccionó una nueva foto local, adjuntarla en multipart
        if (
            data.imageUri &&
            !data.imageUri.startsWith('http://') &&
            !data.imageUri.startsWith('https://')
        ) {
            const filename = data.imageUri.split('/').pop() || 'comprobante.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

            formData.append('receipt', {
                uri: data.imageUri,
                name: filename,
                type,
            } as any);
        }

        const response = await api.patch<ExpenseItemResponse>(`/gastos/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Consulta todos los gastos directos (sin caja chica asignada) registrados con caché.
     * GET /api/v1/gastos/reembolsos-directos
     */
    getAllDirectExpenses: async (forceRefresh = false): Promise<ExpenseItemResponse[]> => {
        const now = Date.now();
        if (!forceRefresh && allDirectExpensesCache && now - allDirectExpensesCache.timestamp < CACHE_TTL_MS) {
            return allDirectExpensesCache.data;
        }
        const response = await api.get<ExpenseItemResponse[]>('/gastos/reembolsos-directos');
        allDirectExpensesCache = { data: response.data, timestamp: now };
        return response.data;
    },

    /**
     * Consulta los colaboradores que cuentan con reembolsos directos (deuda de la empresa).
     * GET /api/v1/gastos/reembolsos-directos/usuarios-con-deuda
     */
    getDirectReimbursementsUsers: async (): Promise<DirectReimbursementUser[]> => {
        const response = await api.get<DirectReimbursementUser[]>('/gastos/reembolsos-directos/usuarios-con-deuda');
        return response.data;
    },

    /**
     * Consulta los reembolsos directos de un usuario específico con caché.
     * GET /api/v1/gastos/reembolsos-directos/pendientes/:usuarioId
     */
    getPendingDirectReimbursementsByUser: async (usuarioId: string, forceRefresh = false): Promise<ExpenseItemResponse[]> => {
        const now = Date.now();
        const cached = userDirectExpensesCache.get(usuarioId);
        if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
        const response = await api.get<{ expenses?: ExpenseItemResponse[]; totalOwed?: number } | ExpenseItemResponse[]>(
            `/gastos/reembolsos-directos/pendientes/${usuarioId}`
        );
        let list: ExpenseItemResponse[] = [];
        if (response.data && 'expenses' in response.data && Array.isArray(response.data.expenses)) {
            list = response.data.expenses;
        } else if (Array.isArray(response.data)) {
            list = response.data;
        }
        userDirectExpensesCache.set(usuarioId, { data: list, timestamp: now });
        return list;
    },

    /**
     * Marca un gasto directo como reembolsado (pagado).
     * PATCH /api/v1/gastos/:id/reembolsar
     */
    markAsReimbursed: async (id: string): Promise<ExpenseItemResponse> => {
        const response = await api.patch<ExpenseItemResponse>(`/gastos/${id}/reembolsar`);
        invalidatePettyCashCache();
        return response.data;
    },

    /**
     * Obtiene sincrónicamente las cajas chicas del sistema desde la caché si son válidas (<60s).
     */
    getCachedAllBoxes: (): PettyCashResponse[] | null => {
        if (allBoxesCache && Date.now() - allBoxesCache.timestamp < CACHE_TTL_MS) {
            return allBoxesCache.data;
        }
        return null;
    },

    /**
     * Obtiene sincrónicamente las cajas chicas del usuario desde la caché si son válidas (<60s).
     */
    getCachedUserBoxes: (usuarioId: string): PettyCashResponse[] | null => {
        const cached = userBoxesCache.get(usuarioId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
        return null;
    },

    /**
     * Obtiene sincrónicamente los gastos directos desde la caché si son válidos (<60s).
     */
    getCachedAllDirectExpenses: (): ExpenseItemResponse[] | null => {
        if (allDirectExpensesCache && Date.now() - allDirectExpensesCache.timestamp < CACHE_TTL_MS) {
            return allDirectExpensesCache.data;
        }
        return null;
    },

    /**
     * Obtiene sincrónicamente los gastos directos del usuario desde la caché si son válidos (<60s).
     */
    getCachedUserDirectExpenses: (usuarioId: string): ExpenseItemResponse[] | null => {
        const cached = userDirectExpensesCache.get(usuarioId);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
        return null;
    },

    invalidateCache: invalidatePettyCashCache,
};

export interface DirectReimbursementUser {
    userId: string;
    userNames: string;
    document: string;
    totalOwed: number;
}

export interface UpdateExpenseData {
    categoryId?: number;
    amount?: number;
    reason?: string;
    expenseDate?: string;
    imageUri?: string | null;
}

export interface RegisterExpenseData {
    pettyCashId?: string | null;
    categoryId: number;
    amount: number;
    reason: string;
    expenseDate: string;
    imageUri: string;
}

export interface ExpenseResponse {
    id: string;
    caja_chica_id: string | null;
    usuario_gasto_id: string;
    categoria_id: number;
    monto: number;
    motivo: string;
    url_comprobante: string;
    estado: string;
    fecha_gasto: string;
    creado_en: string;
}

export interface ExpenseItemResponse {
    id: string;
    amount: number;
    reason: string;
    receiptUrl: string;
    status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO' | 'OBSERVADO' | string;
    isReimbursed?: boolean;
    pettyCashId?: string | null;
    pettyCash?: {
        id: string;
        status?: string;
    } | null;
    evaluationComment?: string | null;
    expenseDate: string;
    createdAt: string;
    category?: {
        id: number;
        name: string;
    };
    expenseUser?: {
        id: string;
        nombres: string;
        apellidos: string;
        documento_identidad?: string;
        rol?: string;
        cargo?: string;
    };
    evaluatorUser?: {
        id: string;
        nombres: string;
        apellidos: string;
    } | null;
}

