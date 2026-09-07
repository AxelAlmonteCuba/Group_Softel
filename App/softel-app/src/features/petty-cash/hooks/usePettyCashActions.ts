import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import {
    pettyCashService,
    PettyCashResponse,
    PettyCashStatus,
} from '../services/pettyCashService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export interface ActionButtonConfig {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    type?: 'MUTATION' | 'NAVIGATE';
    action?: 'APROBAR' | 'RECHAZAR' | 'ABRIR' | 'REVISAR' | 'CERRAR' | 'LIQUIDAR';
    confirmTitle?: string;
    confirmMessage?: string;
}

interface UsePettyCashActionsProps {
    caja: PettyCashResponse;
    onStatusUpdated?: (updatedCaja: PettyCashResponse) => void;
}

/**
 * Hook que encapsula toda la lógica de negocio, validación de roles y navegación/transición
 * de estados para la caja chica (Aprobar, Abrir, Cerrar, Liquidar o Registrar Gasto).
 */
export const usePettyCashActions = ({
    caja,
    onStatusUpdated,
}: UsePettyCashActionsProps) => {
    const navigation = useNavigation<NavigationProp>();
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const usuario = useAuthStore((s) => s.usuario);

    const getActionConfig = (): ActionButtonConfig | null => {
        const role = usuario?.rol || 'TRABAJADOR';

        // 1. Si NO es Administrador: la acción principal en caja abierta es Registrar Gasto
        if (role !== 'ADMINISTRADOR') {
            if (caja.status === 'ABIERTA') {
                return {
                    label: 'Registrar Gasto',
                    icon: 'receipt-outline',
                    type: 'NAVIGATE',
                };
            }
            return null;
        }

        // 2. Si ES Administrador: transiciones de ciclo de vida del fondo
        switch (caja.status) {
            case 'SOLICITADA':
                return {
                    label: 'Aprobar Caja Chica',
                    icon: 'checkmark-circle-outline',
                    type: 'MUTATION',
                    action: 'APROBAR',
                    confirmTitle: 'Aprobar Caja Chica',
                    confirmMessage: '¿Estás seguro de aprobar esta solicitud de caja chica?',
                };
            case 'APROBADA':
                return {
                    label: 'Abrir Caja Chica',
                    icon: 'wallet-outline',
                    type: 'MUTATION',
                    action: 'ABRIR',
                    confirmTitle: 'Entregar Fondo y Abrir',
                    confirmMessage: '¿Confirmas la entrega del fondo para abrir esta caja chica?',
                };
            case 'ABIERTA':
                return {
                    label: 'Cerrar Caja Chica',
                    icon: 'lock-closed-outline',
                    type: 'MUTATION',
                    action: 'CERRAR',
                    confirmTitle: 'Cerrar Caja Chica',
                    confirmMessage: '¿Estás seguro de cerrar esta caja chica? Se congelarán las operaciones para rendición.',
                };
            case 'EN_REVISION':
                return {
                    label: 'Cerrar Caja Chica',
                    icon: 'lock-closed-outline',
                    type: 'MUTATION',
                    action: 'CERRAR',
                    confirmTitle: 'Cerrar Caja Chica',
                    confirmMessage: '¿Estás seguro de cerrar esta caja chica para proceder con la liquidación?',
                };
            case 'CERRADA':
                return {
                    label: 'Liquidar Definitivamente',
                    icon: 'checkmark-done-circle-outline',
                    type: 'MUTATION',
                    action: 'LIQUIDAR',
                    confirmTitle: 'Liquidar Caja Chica',
                    confirmMessage: '¿Confirmas la liquidación definitiva y regularización de saldos de esta caja chica?',
                };
            default:
                return null;
        }
    };

    const actionConfig = getActionConfig();

    const executeAction = () => {
        if (!actionConfig) return;

        // Si es navegación a Registrar Gasto
        if (actionConfig.type === 'NAVIGATE') {
            navigation.navigate('RegisterExpense', { cajaId: caja.id });
            return;
        }

        // Si es mutación de estado con confirmación
        Alert.alert(actionConfig.confirmTitle || 'Confirmar', actionConfig.confirmMessage || '¿Deseas continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                onPress: async () => {
                    if (!actionConfig.action) return;

                    try {
                        setActionLoading(true);
                        const updated = await pettyCashService.updateStatus(caja.id, actionConfig.action);
                        onStatusUpdated?.(updated);
                        Alert.alert('Éxito', 'Estado de la caja chica actualizado correctamente.');
                    } catch (error: any) {
                        // Fallback si es objeto mock local de previsualización
                        if (!caja.id || caja.id === '2026-004') {
                            const nextStatusMap: Record<string, PettyCashStatus> = {
                                APROBAR: 'APROBADA',
                                ABRIR: 'ABIERTA',
                                CERRAR: 'CERRADA',
                                LIQUIDAR: 'LIQUIDADA',
                                REVISAR: 'EN_REVISION',
                                RECHAZAR: 'RECHAZADA',
                            };
                            const nextStatus = nextStatusMap[actionConfig.action] || caja.status;
                            const localUpdated: PettyCashResponse = { ...caja, status: nextStatus };
                            onStatusUpdated?.(localUpdated);
                            Alert.alert('Éxito', `Caja actualizada a estado ${nextStatus}.`);
                        } else {
                            const msg =
                                error?.response?.data?.mensaje ||
                                error?.message ||
                                'Error al actualizar el estado de la caja.';
                            Alert.alert('Error', msg);
                        }
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    return {
        actionConfig,
        actionLoading,
        executeAction,
    };
};
