import { useState, useEffect, useCallback, useMemo } from 'react';
import { colors } from '@/theme/colors';
import { FilterOption } from '@/components/inputs/FilterChips';
import { useAuthStore } from '@/store/authStore';
import { useAuditExpenses } from './useAuditExpenses';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

export type AdminTrayTab = 'cajas' | 'reembolsos';

/**
 * Hook personalizado que encapsula toda la lógica de estado, carga de datos,
 * filtrado por estado y auditoría para la pantalla de Control de Fondos del Administrador/Contador.
 */
export const useAdminPettyCash = () => {
    const usuario = useAuthStore((state) => state.usuario);
    const isAdmin = usuario?.rol === 'ADMINISTRADOR';

    const [selectedTab, setSelectedTab] = useState<AdminTrayTab>('cajas');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('TODAS');
    const [selectedExpenseFilter, setSelectedExpenseFilter] = useState<string>('TODOS');

    // 1. Estado y carga de Cajas Chicas
    const [cajas, setCajas] = useState<PettyCashResponse[]>([]);
    const [cajasLoading, setCajasLoading] = useState<boolean>(true);
    const [cajasRefreshing, setCajasRefreshing] = useState<boolean>(false);

    const cargarCajas = useCallback(async () => {
        try {
            const data = await pettyCashService.getAll();
            setCajas(data || []);
        } catch (error) {
            console.log('Error al cargar cajas chicas para el Administrador:', error);
        } finally {
            setCajasLoading(false);
            setCajasRefreshing(false);
        }
    }, []);

    useEffect(() => {
        cargarCajas();
    }, [cargarCajas]);

    // 2. Hook de auditoría exclusivo para Reembolsos Directos (gastos sin caja chica)
    const directAudit = useAuditExpenses(undefined, isAdmin, undefined, true);

    const handleRefresh = useCallback(() => {
        if (selectedTab === 'cajas') {
            setCajasRefreshing(true);
            cargarCajas();
        } else {
            directAudit.handleRefresh();
        }
    }, [selectedTab, cargarCajas, directAudit]);

    // Conteos reactivos por estado para los chips de Cajas Chicas
    const solicitadasCount = useMemo(
        () => cajas.filter((c) => c.status === 'SOLICITADA').length,
        [cajas],
    );
    const abiertasCount = useMemo(
        () => cajas.filter((c) => c.status === 'ABIERTA').length,
        [cajas],
    );
    const enRevisionCount = useMemo(
        () => cajas.filter((c) => c.status === 'EN_REVISION').length,
        [cajas],
    );
    const cerradasCount = useMemo(
        () => cajas.filter((c) => c.status === 'CERRADA').length,
        [cajas],
    );
    const liquidadasCount = useMemo(
        () => cajas.filter((c) => c.status === 'LIQUIDADA').length,
        [cajas],
    );

    // Opciones estandarizadas de chips de filtro para Cajas Chicas
    const filterOptionsCajas: FilterOption[] = useMemo(
        () => [
            { label: 'Todas', value: 'TODAS', count: cajas.length },
            {
                label: 'Solicitadas',
                value: 'SOLICITADA',
                count: solicitadasCount,
                dotColor: solicitadasCount > 0 ? colors.warning : undefined,
            },
            { label: 'Abiertas', value: 'ABIERTA', count: abiertasCount },
            {
                label: 'En Revisión',
                value: 'EN_REVISION',
                count: enRevisionCount,
                dotColor: enRevisionCount > 0 ? colors.warning : undefined,
            },
            { label: 'Cerradas', value: 'CERRADA', count: cerradasCount },
            {
                label: 'Liquidadas',
                value: 'LIQUIDADA',
                count: liquidadasCount,
                dotColor: liquidadasCount > 0 ? colors.liquidated : undefined,
            },
        ],
        [cajas.length, solicitadasCount, abiertasCount, enRevisionCount, cerradasCount, liquidadasCount],
    );

    // Filtrado de cajas según el chip activo
    const filteredCajas = useMemo(() => {
        return cajas.filter((c) => {
            if (selectedStatusFilter === 'TODAS') return true;
            if (selectedStatusFilter === 'SOLICITADA') return c.status === 'SOLICITADA';
            if (selectedStatusFilter === 'ABIERTA') return c.status === 'ABIERTA';
            if (selectedStatusFilter === 'EN_REVISION') return c.status === 'EN_REVISION';
            if (selectedStatusFilter === 'CERRADA') return c.status === 'CERRADA';
            if (selectedStatusFilter === 'LIQUIDADA') return c.status === 'LIQUIDADA';
            return true;
        });
    }, [cajas, selectedStatusFilter]);

    // Conteos reactivos por estado para los chips de Reembolsos Directos
    const pendientesCount = useMemo(
        () => directAudit.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'PENDIENTE').length,
        [directAudit.expenses],
    );
    const observadosCount = useMemo(
        () => directAudit.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'OBSERVADO').length,
        [directAudit.expenses],
    );
    const aprobadosCount = useMemo(
        () => directAudit.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'APROBADO').length,
        [directAudit.expenses],
    );
    const liquidadosCount = useMemo(
        () => directAudit.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'LIQUIDADO').length,
        [directAudit.expenses],
    );
    const rechazadosCount = useMemo(
        () => directAudit.expenses.filter((e) => (e.estado || '').trim().toUpperCase() === 'RECHAZADO').length,
        [directAudit.expenses],
    );

    // Opciones estandarizadas de chips de filtro para Reembolsos Directos
    const filterOptionsReembolsos: FilterOption[] = useMemo(
        () => [
            { label: 'Todos', value: 'TODOS', count: directAudit.expenses.length },
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
        [directAudit.expenses.length, pendientesCount, observadosCount, aprobadosCount, liquidadosCount, rechazadosCount],
    );

    // Filtrado de comprobantes directos según el chip activo
    const filteredReembolsos = useMemo(() => {
        return directAudit.expenses.filter((e) => {
            if (selectedExpenseFilter === 'TODOS') return true;
            return (e.estado || '').trim().toUpperCase() === selectedExpenseFilter;
        });
    }, [directAudit.expenses, selectedExpenseFilter]);

    const isLoading = selectedTab === 'cajas' ? cajasLoading : directAudit.loading;
    const isRefreshing = selectedTab === 'cajas' ? cajasRefreshing : directAudit.refreshing;

    return {
        isAdmin,
        selectedTab,
        setSelectedTab,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedExpenseFilter,
        setSelectedExpenseFilter,
        totalCajas: cajas.length,
        totalReembolsos: directAudit.expenses.length,
        filterOptionsCajas,
        filterOptionsReembolsos,
        filteredCajas,
        filteredReembolsos,
        isLoading,
        isRefreshing,
        handleRefresh,
        directAudit,
    };
};
