import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export type AlertBannerType = 'error' | 'warning' | 'info' | 'success';

export interface AlertBannerProps {
    title?: string;
    message: string;
    type?: AlertBannerType;
    iconName?: keyof typeof Ionicons.glyphMap;
    containerStyle?: ViewStyle;
}

interface BannerTypeConfig {
    defaultIcon: keyof typeof Ionicons.glyphMap;
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
    messageColor: string;
}

const bannerConfigs: Record<AlertBannerType, BannerTypeConfig> = {
    error: {
        defaultIcon: 'alert-circle',
        backgroundColor: colors.errorSoft,
        borderColor: '#FCA5A5',
        iconColor: colors.error,
        titleColor: colors.error,
        messageColor: '#7F1D1D',
    },
    warning: {
        defaultIcon: 'alert-circle-outline',
        backgroundColor: '#FEF9C3',
        borderColor: '#FDE68A',
        iconColor: '#CA8A04',
        titleColor: '#A16207',
        messageColor: '#854D0E',
    },
    info: {
        defaultIcon: 'information-circle-outline',
        backgroundColor: colors.infoSoft,
        borderColor: colors.border,
        iconColor: colors.info,
        titleColor: colors.textPrimary,
        messageColor: colors.textSecondary,
    },
    success: {
        defaultIcon: 'checkmark-circle-outline',
        backgroundColor: colors.successSoft,
        borderColor: '#86EFAC',
        iconColor: colors.success,
        titleColor: colors.success,
        messageColor: '#14532D',
    },
};

/**
 * Componente modular reutilizable para mostrar banners de alerta, advertencia,
 * información u observaciones de auditoría.
 */
const AlertBanner: React.FC<AlertBannerProps> = ({
    title,
    message,
    type = 'error',
    iconName,
    containerStyle,
}) => {
    if (!message) return null;

    const config = bannerConfigs[type] || bannerConfigs.error;
    const resolvedIcon = iconName || config.defaultIcon;

    return (
        <View
            style={[
                stylesComponents.alertBannerContainer,
                {
                    backgroundColor: config.backgroundColor,
                    borderColor: config.borderColor,
                },
                containerStyle,
            ]}
        >
            <Ionicons
                name={resolvedIcon}
                size={20}
                color={config.iconColor}
                style={{ marginTop: 1 }}
            />
            <View style={stylesComponents.alertBannerContent}>
                {title ? (
                    <Text style={[stylesTexts.alertBannerTitle, { color: config.titleColor }]}>
                        {title}
                    </Text>
                ) : null}
                <Text style={[stylesTexts.alertBannerMessage, { color: config.messageColor }]}>
                    {message}
                </Text>
            </View>
        </View>
    );
};

export default AlertBanner;
