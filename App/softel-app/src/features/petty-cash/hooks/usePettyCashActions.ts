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
    variant?: 'primary' | 'secondary';
}

interface UsePettyCashActionsProps {
    caja: PettyCashResponse;
    onStatusUpdated?: (updatedCaja: PettyCashResponse) => void;
}

/**
 * Hook que encapsula la lógica de negocio, validación de roles y transiciones
 * de estado para la caja chica respetando el ciclo de vida oficial:
 * SOLICITADA -> APROBADA -> ABIERTA -> EN_REVISION -> CERRADA -> LIQUIDADA.
 */
export const usePettyCashActions = ({
    caja,
    onStatusUpdated,
}: UsePettyCashActionsProps) => {
    const navigation = useNavigation<NavigationProp>();
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const usuario = useAuthStore((s) => s.usuario);

    const getActionConfigs = (): {
        primary: ActionButtonConfig | null;
        secondary: ActionButtonConfig | null;
    } => {
        const role = usuario?.rol || 'TRABAJADOR';

        // 1. Si NO es Administrador:
        if (role !== 'ADMINISTRADOR') {
            if (caja.status === 'ABIERTA') {
                return {
                    primary: null, // El registro de gasto se realiza mediante el botón flotante '+'
                    secondary: {
                        label: 'Finalizar y Enviar a Revisión',
                        icon: 'checkmark-circle-outline',
                        type: 'MUTATION',
                        action: 'REVISAR',
                        confirmTitle: 'Enviar a Revisión',
                        confirmMessage:
                            '¿Confirmas que has subido todos los comprobantes? Al enviar a revisión se pausará el registro de nuevos gastos para proceder con la auditoría de Administración.',
                        variant: 'secondary',
                    },
                };
            }
            return { primary: null, secondary: null };
        }

        // 2. Si ES Administrador: transiciones oficiales del ciclo de vida
        switch (caja.status) {
            case 'SOLICITADA':
                return {
                    primary: {
                        label: 'Aprobar Caja Chica',
                        icon: 'checkmark-circle-outline',
                        type: 'MUTATION',
                        action: 'APROBAR',
                        confirmTitle: 'Aprobar Caja Chica',
                        confirmMessage: '¿Estás seguro de aprobar esta solicitud de caja chica?',
                        variant: 'primary',
                    },
                    secondary: null,
                };
            case 'APROBADA':
                return {
                    primary: {
                        label: 'Abrir Caja Chica',
                        icon: 'wallet-outline',
                        type: 'MUTATION',
                        action: 'ABRIR',
                        confirmTitle: 'Entregar Fondo y Abrir',
                        confirmMessage: '¿Confirmas la entrega del fondo para abrir esta caja chica?',
                        variant: 'primary',
                    },
                    secondary: null,
                };
            case 'ABIERTA':
                return {
                    primary: {
                        label: 'Pasar a Revisión',
                        icon: 'clipboard-outline',
                        type: 'MUTATION',
                        action: 'REVISAR',
                        confirmTitle: 'Pasar a Revisión',
                        confirmMessage:
                            '¿Deseas pasar esta caja chica a estado En Revisión? Se bloqueará el registro de nuevos gastos para proceder con la auditoría.',
                        variant: 'primary',
                    },
                    secondary: null,
                };
            case 'EN_REVISION':
                return {
                    primary: {
                        label: 'Cerrar Caja Chica',
                        icon: 'lock-closed-outline',
                        type: 'MUTATION',
                        action: 'CERRAR',
                        confirmTitle: 'Cerrar Caja Chica',
                        confirmMessage:
                            '¿Estás seguro de cerrar esta caja chica? Se congelarán los saldos para proceder con la liquidación definitiva.',
                        variant: 'primary',
                    },
                    secondary: null,
                };
            case 'CERRADA':
                return {
                    primary: {
                        label: 'Liquidar Definitivamente',
                        icon: 'checkmark-done-circle-outline',
                        type: 'MUTATION',
                        action: 'LIQUIDAR',
                        confirmTitle: 'Liquidar Caja Chica',
                        confirmMessage:
                            '¿Confirmas la liquidación definitiva y regularización de saldos de esta caja chica?',
                        variant: 'primary',
                    },
                    secondary: null,
                };
            default:
                return { primary: null, secondary: null };
        }
    };

    const { primary: actionConfig, secondary: secondaryActionConfig } = getActionConfigs();

    const executeAction = (targetConfig?: ActionButtonConfig | null) => {
        const config = targetConfig || actionConfig;
        if (!config) return;

        // Si es navegación a Registrar Gasto
        if (config.type === 'NAVIGATE') {
            navigation.navigate('RegisterExpense', { cajaId: caja.id });
            return;
        }

        // Si es mutación de estado con confirmación
        Alert.alert(config.confirmTitle || 'Confirmar', config.confirmMessage || '¿Deseas continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                onPress: async () => {
                    if (!config.action) return;

                    try {
                        setActionLoading(true);
                        const updated = await pettyCashService.updateStatus(caja.id, config.action);
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
                            const nextStatus = nextStatusMap[config.action] || caja.status;
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
        secondaryActionConfig,
        actionLoading,
        executeAction,
    };
};
