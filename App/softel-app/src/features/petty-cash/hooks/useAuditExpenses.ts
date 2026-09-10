import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { AuditExpenseData } from '@/components/cards/CardAuditExpense';
import {
    pettyCashService,
    ExpenseItemResponse,
} from '@/features/petty-cash/services/pettyCashService';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

/**
 * Normaliza y resuelve la URL de la imagen del comprobante.
 * Soporta URLs absolutas de Cloudinary y relativas del backend.
 */
export const resolveImageUrl = (receiptUrl?: string): string => {
    if (!receiptUrl) return '';
    if (receiptUrl.startsWith('http://') || receiptUrl.startsWith('https://')) {
        return receiptUrl;
    }
    const cleanPath = receiptUrl.startsWith('/') ? receiptUrl : `/${receiptUrl}`;
    const baseHost =
        api.defaults.baseURL?.replace(/\/api\/v1\/?$/, '') || 'http://192.168.1.39:3000';
    return `${baseHost}${cleanPath}`;
};

/**
 * Convierte la respuesta del backend (según Postman spec) al modelo de la tarjeta de auditoría.
 */
export const mapBackendExpenseToAuditData = (
    item: ExpenseItemResponse,
    esReembolsoDirecto = false,
): AuditExpenseData => {
    const usuarioNombre = item.expenseUser
        ? `${item.expenseUser.nombres} ${item.expenseUser.apellidos}`.trim()
        : 'Usuario de campo';

    const serieSubtitulo = item.expenseDate
        ? `${item.expenseDate} • Por: ${usuarioNombre}`
        : `Por: ${usuarioNombre}`;

    const nombreArchivo = item.receiptUrl
        ? item.receiptUrl.split('/').pop() || 'Comprobante.webp'
        : 'Comprobante.webp';

    return {
        id: item.id,
        motivo: item.reason || 'Gasto operativo de campo',
        monto: Number(item.amount || 0),
        categoriaNombre: item.category?.name || 'Materiales e Insumos',
        comprobanteNumero: serieSubtitulo,
        metodoPago: 'Efectivo',
        tipoComprobante: 'Comprobante',
        nombreArchivo,
        pesoArchivo: 'WebP Optimizado',
        ruc: item.expenseUser?.documento_identidad
            ? `DNI: ${item.expenseUser.documento_identidad}`
            : undefined,
        urlComprobante: resolveImageUrl(item.receiptUrl),
        estado: (item.status === 'APROBADO' && item.isReimbursed) ? 'LIQUIDADO' : item.status,
        comentariosAuditoria: item.evaluationComment,
        isReimbursed: Boolean(item.isReimbursed),
        esReembolsoDirecto,
    };
};

/**
 * Hook personalizado que encapsula toda la lógica de negocio, llamadas al backend
 * y gestión de estados para la pantalla de Auditoría de Gastos.
 * Garantiza el congelamiento estricto si la caja chica está LIQUIDADA o CERRADA.
 */
export const useAuditExpenses = (
    cajaId?: string,
    isAdmin = false,
    initialCajaStatus?: string,
    isDirectOnly = false,
) => {
    const usuario = useAuthStore((state) => state.usuario);
    const [cajaStatus, setCajaStatus] = useState<string | undefined>(initialCajaStatus);
    // Inicialización instantánea desde caché en memoria para gastos directos si existe
    const cachedDirect = isDirectOnly
        ? (isAdmin
            ? pettyCashService.getCachedAllDirectExpenses()
            : usuario?.id
            ? pettyCashService.getCachedUserDirectExpenses(usuario.id)
            : null)
        : null;

    const [expenses, setExpenses] = useState<AuditExpenseData[]>(
        cachedDirect ? cachedDirect.map((e) => mapBackendExpenseToAuditData(e, true)) : []
    );
    const [loading, setLoading] = useState<boolean>(!cachedDirect);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Estado derivado: caja congelada (LIQUIDADA o CERRADA)
    const normalizedStatus = (cajaStatus || initialCajaStatus || '').trim().toUpperCase();
    const isCajaLiquidada = normalizedStatus === 'LIQUIDADA';
    const isCajaCerrada = normalizedStatus === 'CERRADA';
    const isCajaCongelada = !isDirectOnly && (isCajaLiquidada || isCajaCerrada);

    // Modal de previsualización de foto
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Modal de justificación para Observar o Rechazar
    const [auditModalVisible, setAuditModalVisible] = useState<boolean>(false);
    const [auditDecision, setAuditDecision] = useState<'OBSERVADO' | 'RECHAZADO'>('OBSERVADO');
    const [auditExpenseId, setAuditExpenseId] = useState<string | null>(null);
    const [auditComment, setAuditComment] = useState<string>('');
    const [submittingAudit, setSubmittingAudit] = useState<boolean>(false);

    /**
     * Carga los gastos desde el backend según la cajaId, reembolsos directos o bandeja general.
     */
    const fetchExpenses = useCallback(async (isRefresh = false, forceNetwork = false) => {
        if (!isRefresh && !expenses.length) setLoading(true);
        try {
            if (isDirectOnly) {
                let rawExpenses: ExpenseItemResponse[] = [];
                if (isAdmin) {
                    rawExpenses = await pettyCashService.getAllDirectExpenses(forceNetwork || isRefresh);
                } else if (usuario?.id) {
                    rawExpenses = await pettyCashService.getPendingDirectReimbursementsByUser(usuario.id, forceNetwork || isRefresh);
                }
                const mapped = (rawExpenses || []).map((e) => mapBackendExpenseToAuditData(e, true));
                setExpenses(mapped);
            } else if (cajaId) {
                const [rawExpenses, cajaData] = await Promise.all([
                    pettyCashService.getExpensesByPettyCash(cajaId),
                    pettyCashService.getById(cajaId).catch(() => null),
                ]);

                if (cajaData?.status) {
                    setCajaStatus(cajaData.status);
                }

                const mapped = (rawExpenses || []).map((e) => mapBackendExpenseToAuditData(e, false));
                setExpenses(mapped);
            } else if (isAdmin) {
                const rawExpenses = await pettyCashService.getPendingExpenses();
                const mapped = (rawExpenses || []).map((e) => mapBackendExpenseToAuditData(e, !e.pettyCashId));
                setExpenses(mapped);
            }
        } catch (error: any) {
            console.error('Error al obtener gastos desde el backend:', error);
            Alert.alert(
                'Error al cargar gastos',
                error?.response?.data?.mensaje ||
                    'No se pudieron cargar los comprobantes desde el servidor.',
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [cajaId, isAdmin, isDirectOnly, usuario?.id, expenses.length]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchExpenses(true, true);
    }, [fetchExpenses]);

    /**
     * Acción: Aprobar Gasto
     * Bloqueado si la caja está LIQUIDADA o CERRADA
     */
    const handleAprobar = (id: string) => {
        if (isCajaCongelada) {
            Alert.alert(
                'Caja Congelada',
                `La caja chica está en estado ${normalizedStatus}. Sus saldos y gastos están congelados y no admiten modificaciones.`,
            );
            return;
        }

        const target = expenses.find((e) => e.id === id);
        const confirmMsg = isDirectOnly
            ? `¿Estás seguro de aprobar este reembolso directo de S/ ${target?.monto.toFixed(2) || '0.00'}?`
            : `¿Estás seguro de aprobar este gasto de S/ ${target?.monto.toFixed(2) || '0.00'}?\n\nAl aprobarlo, el saldo de la caja chica se recalculará automáticamente.`;

        Alert.alert(
            'Aprobar Gasto',
            confirmMsg,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aprobar Gasto',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setActionLoadingId(id);
                            await pettyCashService.evaluateExpense(id, { decision: 'APROBADO' });
                            setExpenses((prev) =>
                                prev.map((item) =>
                                    item.id === id ? { ...item, estado: 'APROBADO' } : item,
                                ),
                            );
                            Alert.alert('Éxito', 'El gasto fue aprobado exitosamente.');
                        } catch (error: any) {
                            console.error('Error al aprobar gasto:', error);
                            Alert.alert(
                                'Error',
                                error?.response?.data?.mensaje || 'No se pudo aprobar el gasto.',
                            );
                        } finally {
                            setActionLoadingId(null);
                        }
                    },
                },
            ],
        );
    };

    /**
     * Acción: Abrir modal para Observar
     * Bloqueado si la caja está LIQUIDADA o CERRADA
     */
    const handleObservar = (id: string) => {
        if (isCajaCongelada) {
            Alert.alert(
                'Caja Congelada',
                `La caja chica está en estado ${normalizedStatus}. No se pueden observar comprobantes de una caja cerrada o liquidada.`,
            );
            return;
        }

        setAuditExpenseId(id);
        setAuditDecision('OBSERVADO');
        setAuditComment('');
        setAuditModalVisible(true);
    };

    /**
     * Acción: Abrir modal para Rechazar
     * Bloqueado si la caja está LIQUIDADA o CERRADA
     */
    const handleRechazar = (id: string) => {
        if (isCajaCongelada) {
            Alert.alert(
                'Caja Congelada',
                `La caja chica está en estado ${normalizedStatus}. No se pueden rechazar comprobantes de una caja cerrada o liquidada.`,
            );
            return;
        }

        setAuditExpenseId(id);
        setAuditDecision('RECHAZADO');
        setAuditComment('');
        setAuditModalVisible(true);
    };

    /**
     * Envía la justificación de auditoría al backend
     */
    const submitAuditDecision = async () => {
        if (isCajaCongelada) {
            Alert.alert(
                'Caja Congelada',
                `La caja chica está en estado ${normalizedStatus}. Los gastos están congelados.`,
            );
            setAuditModalVisible(false);
            return;
        }

        if (!auditExpenseId) return;
        const cleanComment = auditComment.trim();
        if (!cleanComment) {
            Alert.alert(
                'Comentario requerido',
                `Debes ingresar una justificación para ${
                    auditDecision === 'OBSERVADO' ? 'observar' : 'rechazar'
                } el comprobante.`,
            );
            return;
        }

        try {
            setSubmittingAudit(true);
            setActionLoadingId(auditExpenseId);

            await pettyCashService.evaluateExpense(auditExpenseId, {
                decision: auditDecision,
                evaluationComment: cleanComment,
            });

            setExpenses((prev) =>
                prev.map((item) =>
                    item.id === auditExpenseId
                        ? {
                              ...item,
                              estado: auditDecision,
                              comentariosAuditoria: cleanComment,
                          }
                        : item,
                ),
            );

            setAuditModalVisible(false);
            Alert.alert(
                'Acción completada',
                `El gasto ha sido marcado como ${auditDecision}.`,
            );
        } catch (error: any) {
            console.error(`Error al ${auditDecision} gasto:`, error);
            Alert.alert(
                'Error',
                error?.response?.data?.mensaje ||
                    `No se pudo registrar la decisión de ${auditDecision}.`,
            );
        } finally {
            setSubmittingAudit(false);
            setActionLoadingId(null);
        }
    };

    /**
     * Acción: Abrir visor de fotografía
     */
    const handleVerFoto = (url?: string) => {
        if (!url) {
            Alert.alert('Comprobante', 'No se encontró la imagen del comprobante.');
            return;
        }
        setPreviewImage(url);
    };

    /**
     * Acción: Liquidar Reembolso Directo (Marcar como Pagado)
     */
    const handleLiquidar = (id: string) => {
        const target = expenses.find((e) => e.id === id);
        Alert.alert(
            'Confirmar Liquidación',
            `¿El fondo de S/ ${target?.monto.toFixed(2) || '0.00'} ya fue depositado al colaborador para liquidar este reembolso directo?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, ya fue depositado',
                    onPress: async () => {
                        setActionLoadingId(id);
                        try {
                            await pettyCashService.markAsReimbursed(id);
                            Alert.alert('Reembolso Liquidado', 'El reembolso directo ha sido marcado como liquidado exitosamente.');
                            fetchExpenses(true);
                        } catch (error: any) {
                            console.error('Error al liquidar reembolso directo:', error);
                            Alert.alert(
                                'Error al liquidar',
                                error?.response?.data?.mensaje ||
                                    'No se pudo liquidar el reembolso. Intenta nuevamente.',
                            );
                        } finally {
                            setActionLoadingId(null);
                        }
                    },
                },
            ],
        );
    };

    const closePreview = () => setPreviewImage(null);
    const closeAuditModal = () => {
        if (!submittingAudit) setAuditModalVisible(false);
    };

    return {
        expenses,
        loading,
        refreshing,
        actionLoadingId,
        previewImage,
        auditModalVisible,
        auditDecision,
        auditComment,
        submittingAudit,
        cajaStatus: normalizedStatus,
        isCajaLiquidada,
        isCajaCerrada,
        isCajaCongelada,
        fetchExpenses,
        handleRefresh,
        handleAprobar,
        handleObservar,
        handleRechazar,
        handleLiquidar,
        submitAuditDecision,
        handleVerFoto,
        closePreview,
        closeAuditModal,
        setAuditComment,
    };
};

export default useAuditExpenses;
