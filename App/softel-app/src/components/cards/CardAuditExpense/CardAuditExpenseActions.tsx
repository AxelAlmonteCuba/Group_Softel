import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface CardAuditExpenseActionsProps {
    esAdmin?: boolean;
    estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'OBSERVADO' | string;
    loading?: boolean;
    onAprobar?: () => void;
    onObservar?: () => void;
    onRechazar?: () => void;
}

/**
 * Parte 4: Fila de Botones de Auditoría de la Tarjeta de Gasto.
 * Reutiliza los estilos centralizados de stylesComponents y stylesTexts.
 */
export const CardAuditExpenseActions: React.FC<CardAuditExpenseActionsProps> = ({
    esAdmin = true,
    estado = 'PENDIENTE',
    loading = false,
    onAprobar,
    onObservar,
    onRechazar,
}) => {
    // Si NO es Administrador, no tiene autoridad operativa para aprobar/rechazar (Regla 01)
    if (!esAdmin) {
        const esAprobado = estado === 'APROBADO';
        const esRechazado = estado === 'RECHAZADO';
        const esObservado = estado === 'OBSERVADO';

        const bg = esAprobado ? '#DCFCE7' : esRechazado ? '#FEE2E2' : esObservado ? '#FEF9C3' : '#F3F4F6';
        const textCol = esAprobado ? '#16A34A' : esRechazado ? colors.error : esObservado ? '#A16207' : colors.textSecondary;
        const icon = esAprobado ? 'checkmark-circle-outline' : esRechazado ? 'close-circle-outline' : esObservado ? 'alert-circle-outline' : 'time-outline';

        return (
            <View style={[stylesComponents.cardAuditStatusBadge, { backgroundColor: bg }]}>
                <Ionicons name={icon as any} size={18} color={textCol} />
                <Text style={[stylesTexts.badgeText, { fontSize: 13, fontWeight: '700', color: textCol }]}>
                    ESTADO: {estado}
                </Text>
            </View>
        );
    }

    // Modo Administrador con botones de decisión
    return (
        <View style={stylesComponents.cardAuditActionsRow}>
            {/* 1. Botón Rechazar */}
            <TouchableOpacity
                onPress={onRechazar}
                disabled={loading}
                activeOpacity={0.7}
                style={stylesComponents.cardAuditBtnReject}
            >
                <Ionicons name="close-outline" size={18} color={colors.error} />
                <Text style={[stylesTexts.badgeText, { fontSize: 13, fontWeight: '700', color: colors.error }]}>
                    Rechazar
                </Text>
            </TouchableOpacity>

            {/* 2. Botón Observar */}
            <TouchableOpacity
                onPress={onObservar}
                disabled={loading}
                activeOpacity={0.7}
                style={stylesComponents.cardAuditBtnObserve}
            >
                <Ionicons name="warning-outline" size={16} color="#A16207" />
                <Text style={[stylesTexts.badgeText, { fontSize: 13, fontWeight: '700', color: '#A16207' }]}>
                    Observar
                </Text>
            </TouchableOpacity>

            {/* 3. Botón Aprobar */}
            <TouchableOpacity
                onPress={onAprobar}
                disabled={loading}
                activeOpacity={0.7}
                style={stylesComponents.cardAuditBtnApprove}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                    <>
                        <Ionicons name="checkmark-outline" size={18} color={colors.textOnPrimary} />
                        <Text style={[stylesTexts.textButtonPrimary, { fontSize: 13, fontWeight: '700' }]}>
                            Aprobar
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default CardAuditExpenseActions;
