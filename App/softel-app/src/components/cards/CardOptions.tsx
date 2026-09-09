import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts, stylesComponents } from '@/theme/styles';
import StatusBadge from '@/components/common/StatusBadge';

export type ActivityType = 'NUEVO_USUARIO' | 'REPORTE' | 'RECHAZO' | 'CONFIGURACION';
export type ExpenseStatus = 'APROBADO' | 'PENDIENTE' | 'RECHAZADO' | 'OBSERVADO' | string;

interface Props {
    title: string;
    subtitle: string;
    type?: ActivityType;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
    iconShape?: 'circle' | 'square';
    amount?: string | number;
    status?: ExpenseStatus;
    rightComponent?: React.ReactNode;
    isLast?: boolean;
    style?: ViewStyle;
    onPress?: () => void;
}

const activityConfig: Record<ActivityType, { iconName: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
    NUEVO_USUARIO: {
        iconName: 'person-add-outline',
        color: colors.primary,
        bgColor: colors.errorSoft,
    },
    REPORTE: {
        iconName: 'clipboard-outline',
        color: colors.textSecondary,
        bgColor: colors.infoSoft,
    },
    RECHAZO: {
        iconName: 'warning-outline',
        color: colors.textSecondary,
        bgColor: colors.infoSoft,
    },
    CONFIGURACION: {
        iconName: 'settings-outline',
        color: colors.textSecondary,
        bgColor: colors.infoSoft,
    }
};

const CardOptions = ({
    title,
    subtitle,
    type,
    iconName,
    iconColor,
    iconBgColor,
    iconShape,
    amount,
    status,
    rightComponent,
    isLast,
    style,
    onPress
}: Props) => {
    const config = type ? activityConfig[type] : null;
    const resolvedIconName = iconName || config?.iconName || 'receipt-outline';
    const resolvedIconColor = iconColor || config?.color || colors.textPrimary;
    const resolvedIconBg = iconBgColor || config?.bgColor || '#F4F4F5';
    const borderRadius = iconShape === 'square' || (!type && iconShape !== 'circle') ? 14 : 24;

    const renderRight = () => {
        if (rightComponent) {
            return rightComponent;
        }

        if (amount !== undefined || status !== undefined) {
            const displayAmount = typeof amount === 'number'
                ? `- S/ ${amount.toFixed(2)}`
                : amount;

            return (
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    {displayAmount ? (
                        <Text
                            style={[
                                stylesTexts.textCardOptionTitle,
                                { fontWeight: '700', fontSize: 15, marginBottom: 4, textAlign: 'right' }
                            ]}
                        >
                            {displayAmount}
                        </Text>
                    ) : null}
                    {status ? <StatusBadge status={status} /> : null}
                </View>
            );
        }

        return <Ionicons name="chevron-forward" size={24} color={colors.textDisabled} />;
    };

    return (
        <TouchableOpacity
            style={[
                stylesComponents.cardOptionContainer,
                isLast && { borderBottomWidth: 0 },
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View
                style={[
                    stylesComponents.cardOptionIconContainer,
                    { backgroundColor: resolvedIconBg, borderRadius }
                ]}
            >
                <Ionicons name={resolvedIconName} size={24} color={resolvedIconColor} />
            </View>

            <View style={stylesComponents.cardOptionTextContainer}>
                <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>{title}</Text>
                <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]} numberOfLines={1}>{subtitle}</Text>
            </View>

            {renderRight()}
        </TouchableOpacity>
    );
};

export default CardOptions;

