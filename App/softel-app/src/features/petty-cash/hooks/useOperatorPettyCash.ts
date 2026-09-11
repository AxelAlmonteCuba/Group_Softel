import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/store/authStore';
import { HistoryPettyCashItem } from '@/components/cards/CardHistoryPettyCash';
import { FilterOption } from '@/components/inputs/FilterChips';
import { useAuditExpenses } from './useAuditExpenses';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

export type OperatorTab = 'caja' | 'reembolsos';

// Función auxiliar para formatear cajas en proceso e históricas
const parseOperatorBoxes = (data: PettyCashResponse[]) => {
    const enProceso = data.find(
        (c) => c.status !== 'CERRADA' && c.status !== 'LIQUIDADA' && c.status !== 'RECHAZADA'
    ) ?? null;

    const cerradas = data.filter(
        (c) => c.status === 'CERRADA' || c.status === 'LIQUIDADA' || c.status === 'RECHAZADA'
    );

    const transformedHistory: HistoryPettyCashItem[] = cerradas.map((c) => {
        const fondo = Number(c.assignedAmount) || 0;
        const saldoActual = Number(c.currentBalance) || 0;
        const gastadoCalculado = Math.max(0, fondo - saldoActual);
        const devueltoCalculado = Math.max(0, saldoActual);

        const fechaAperturaFmt = c.openingDate
            ? new Date(c.openingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : new Date(c.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        const fechaCierreFmt = c.closingDate
            ? new Date(c.closingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'En curso';

        return {
            id: c.id,
            codigo: `HCC-${c.id.substring(0, 4).toUpperCase()}`,
            obraOProyecto: c.justification || 'Operación General',
            fechaInicio: fechaAperturaFmt,
            fechaFin: fechaCierreFmt,
            estado: c.status,
            fondoBase: fondo,
            gastado: gastadoCalculado,
            devuelto: devueltoCalculado,
            comprobantesCount: c.approvedExpensesCount || 0,
        };
    });

    return { enProceso, transformedHistory };
};

/**
 * Hook personalizado que encapsula el estado, carga de caja chica activa,
 * historial de cajas finalizadas y rendición de reembolsos directos para supervisores y operarios.
 */
export const useOperatorPettyCash = () => {
    const usuario = useAuthStore((state) => state.usuario);

    const [selectedTab, setSelectedTab] = useState<OperatorTab>('caja');
    const [selectedExpenseFilter, setSelectedExpenseFilter] = useState<string>('TODOS');

    // Inicialización instantánea desde caché en memoria si existe
    const cachedBoxes = usuario?.id ? pettyCashService.getCachedUserBoxes(usuario.id) : null;
    const initialParsed = cachedBoxes ? parseOperatorBoxes(cachedBoxes) : null;

    const [loading, setLoading] = useState<boolean>(!initialParsed);
    const [refreshingCajas, setRefreshingCajas] = useState<boolean>(false);
    const [cajaEnProceso, setCajaEnProceso] = useState<PettyCashResponse | null>(initialParsed?.enProceso ?? null);
    const [historyCajas, setHistoryCajas] = useState<HistoryPettyCashItem[]>(initialParsed?.transformedHistory ?? []);

    // Hook para reembolsos directos del usuario (modo consulta personal)
    const directExpenses = useAuditExpenses(undefined, false, undefined, true);

    // Conteos reactivos por estado para los chips de Reembolsos Directos
    const pendientesCount = useMemo(
        () => directExpenses.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'PENDIENTE').length,
        [directExpenses.expenses],
    );
    const observadosCount = useMemo(
        () => directExpenses.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'OBSERVADO').length,
        [directExpenses.expenses],
    );
    const aprobadosCount = useMemo(
        () => directExpenses.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'APROBADO').length,
        [directExpenses.expenses],
    );
    const liquidadosCount = useMemo(
        () => directExpenses.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'LIQUIDADO').length,
        [directExpenses.expenses],
    );
    const rechazadosCount = useMemo(
        () => directExpenses.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'RECHAZADO').length,
        [directExpenses.expenses],
    );

    // Opciones estandarizadas de chips de filtro para Reembolsos Directos
    const filterOptionsReembolsos: FilterOption[] = useMemo(
        () => [
            { label: 'Todos', value: 'TODOS', count: directExpenses.expenses.length },
            {
                label: 'Pendientes',
                value: 'PENDIENTE',
                count: pendientesCount,
                dotColor: pendientesCount > 0 ? colors.warning : undefined,
            },
            {
                label: 'Observados',
                value: 'OBSERVADO',
                count: observadosCount,
                dotColor: observadosCount > 0 ? '#CA8A04' : undefined,
            },
            {
                label: 'Aprobados',
                value: 'APROBADO',
                count: aprobadosCount,
                dotColor: aprobadosCount > 0 ? colors.success : undefined,
            },
            {
                label: 'Liquidados',
                value: 'LIQUIDADO',
                count: liquidadosCount,
                dotColor: liquidadosCount > 0 ? colors.liquidated : undefined,
            },
            {
                label: 'Rechazados',
                value: 'RECHAZADO',
                count: rechazadosCount,
                dotColor: rechazadosCount > 0 ? colors.error : undefined,
            },
        ],
        [directExpenses.expenses.length, pendientesCount, observadosCount, aprobadosCount, liquidadosCount, rechazadosCount],
    );

    // Filtrado de reembolsos directos según chip activo
    const filteredReembolsos = useMemo(() => {
        return directExpenses.expenses.filter((e) => {
            if (selectedExpenseFilter === 'TODOS') return true;
            return (e.estado || '').trim().toUpperCase() === selectedExpenseFilter;
        });
    }, [directExpenses.expenses, selectedExpenseFilter]);

    // Consulta y formateo de cajas asignadas al usuario
    const fetchCajas = useCallback(async (force = false) => {
        if (!usuario?.id) return;
        try {
            const data = await pettyCashService.getByUser(usuario.id, force);
            const { enProceso, transformedHistory } = parseOperatorBoxes(data);
            setCajaEnProceso(enProceso);
            setHistoryCajas(transformedHistory);
        } catch (error) {
            console.log('Error al consultar cajas chicas del usuario:', error);
            if (force) setHistoryCajas([]);
        } finally {
            setLoading(false);
        }
    }, [usuario?.id]);

    const fetchDirectExpensesRef = useRef(directExpenses.fetchExpenses);
    fetchDirectExpensesRef.current = directExpenses.fetchExpenses;

    // Recargar datos al enfocar la pantalla reutilizando caché (<60s)
    useFocusEffect(
        useCallback(() => {
            fetchCajas(false);
            fetchDirectExpensesRef.current?.(false, false);
        }, [fetchCajas])
    );

    const handleRefresh = useCallback(() => {
        if (selectedTab === 'caja') {
            setRefreshingCajas(true);
            fetchCajas(true).finally(() => setRefreshingCajas(false));
        } else {
            directExpenses.handleRefresh();
        }
    }, [selectedTab, fetchCajas, directExpenses]);

    const isRefreshing = selectedTab === 'caja' ? refreshingCajas : directExpenses.refreshing;

    return {
        selectedTab,
        setSelectedTab,
        selectedExpenseFilter,
        setSelectedExpenseFilter,
        loading,
        isRefreshing,
        cajaEnProceso,
        historyCajas,
        totalReembolsos: directExpenses.expenses.length,
        filterOptionsReembolsos,
        filteredReembolsos,
        directExpenses,
        handleRefresh,
    };
};
