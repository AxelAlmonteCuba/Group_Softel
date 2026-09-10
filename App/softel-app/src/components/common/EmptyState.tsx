import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface EmptyStateProps {
    iconName?: keyof typeof Ionicons.glyphMap;
    iconSize?: number;
    iconColor?: string;
    title: string;
    description?: string;
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Componente Genérico para Estados Vacíos (Listas o Búsquedas sin resultados).
 * Centraliza la presentación, iconos y tipografía estándar de Softel.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    iconName = 'folder-open-outline',
    iconSize = 48,
    iconColor = colors.textDisabled,
    title,
    description,
    containerStyle,
}) => {
    return (
        <View style={[stylesComponents.emptyStateContainer, containerStyle]}>
            {iconName && (
                <Ionicons
                    name={iconName}
                    size={iconSize}
                    color={iconColor}
                    style={stylesComponents.emptyStateIcon}
                />
            )}
            <Text style={[stylesTexts.textCardOptionTitle, { color: colors.textSecondary, textAlign: 'center' }]}>
                {title}
            </Text>
            {description ? (
                <Text style={[stylesTexts.subtitle, { marginTop: 4, marginBottom: 0 }]}>
                    {description}
                </Text>
            ) : null}
        </View>
    );
};

export default EmptyState;
