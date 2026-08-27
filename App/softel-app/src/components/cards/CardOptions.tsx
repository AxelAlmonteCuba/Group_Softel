import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts, stylesComponents } from '@/theme/styles';

export type ActivityType = 'NUEVO_USUARIO' | 'REPORTE' | 'RECHAZO' | 'CONFIGURACION';

interface Props {
    title: string;
    subtitle: string;
    type: ActivityType;
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
    onPress
}: Props) => {
    const config = activityConfig[type];

    return (
        <TouchableOpacity style={stylesComponents.cardOptionContainer} onPress={onPress}>
            <View style={[stylesComponents.cardOptionIconContainer, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.iconName} size={24} color={config.color} />
            </View>

            <View style={stylesComponents.cardOptionTextContainer}>
                <Text style={stylesTexts.textCardOptionTitle} numberOfLines={2}>{title}</Text>
                <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]} numberOfLines={1}>{subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={colors.textDisabled} />
        </TouchableOpacity>
    );
};

export default CardOptions;
