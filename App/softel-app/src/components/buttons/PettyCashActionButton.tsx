import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';
import { usePettyCashActions } from '@/features/petty-cash/hooks/usePettyCashActions';

export interface PettyCashActionButtonProps {
    caja: PettyCashResponse;
    onStatusUpdated?: (updatedCaja: PettyCashResponse) => void;
    containerStyle?: ViewStyle;
}

/**
 * Botón de Acción Principal estático en el footer inferior (ej. Registrar Gasto, Pasar a Revisión, Cerrar, Liquidar).
 */
const PettyCashActionButton: React.FC<PettyCashActionButtonProps> = ({
    caja,
    onStatusUpdated,
    containerStyle,
}) => {
    const {
        actionConfig,
        actionLoading,
        executeAction,
    } = usePettyCashActions({
        caja,
        onStatusUpdated,
    });

    if (!actionConfig) return null;

    return (
        <View
            style={[
                {
                    paddingHorizontal: 14,
                    paddingTop: 8,
                    paddingBottom: 12,
                    backgroundColor: colors.background,
                },
                containerStyle,
            ]}
        >
            <TouchableOpacity
                style={[
                    stylesComponents.buttonPrimary,
                    {
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                    },
                ]}
                onPress={() => executeAction(actionConfig)}
                activeOpacity={0.8}
                disabled={actionLoading}
            >
                {actionLoading ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                    <>
                        <Ionicons
                            name={actionConfig.icon}
                            size={20}
                            color={colors.textOnPrimary}
                        />
                        <Text style={[stylesTexts.textButtonPrimary, { fontWeight: '700' }]}>
                            {actionConfig.label}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default PettyCashActionButton;
