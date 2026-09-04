import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface HeaderBarProps {
    /** Título central del encabezado */
    title: string;
    /** Acción al presionar volver */
    onBack?: () => void;
    /** Si debe mostrar el botón de volver (por defecto true si onBack está definido) */
    showBackButton?: boolean;
    /** Nombre del icono derecho (Ionicons) */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Acción al presionar el icono derecho */
    onRightPress?: () => void;
    /** Nodo personalizado a la derecha (opcional, tiene prioridad sobre rightIcon) */
    rightAction?: React.ReactNode;
}

/**
 * Encabezado estándar reutilizable para pantallas secundarias / subpantallas.
 * Estructura: [ < ] [ Título ] [ Icono Acción ]
 */
const HeaderBar: React.FC<HeaderBarProps> = ({
    title,
    onBack,
    showBackButton = true,
    rightIcon,
    onRightPress,
    rightAction,
}) => {
    return (
        <View style={stylesComponents.headerBar}>
            {/* Lado Izquierdo: Botón Volver o Espacio */}
            {showBackButton && onBack ? (
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.7}
                    style={stylesComponents.headerBarActionBtn}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={stylesComponents.headerBarActionBtn} />
            )}

            {/* Centro: Título */}
            <Text
                style={[stylesTexts.titleHome, { fontSize: 18, textAlign: 'center', flex: 1 }]}
                numberOfLines={1}
            >
                {title}
            </Text>

            {/* Lado Derecho: Acción o Espacio reservado para centrado */}
            {rightAction ? (
                <View style={stylesComponents.headerBarActionBtn}>{rightAction}</View>
            ) : rightIcon && onRightPress ? (
                <TouchableOpacity
                    onPress={onRightPress}
                    activeOpacity={0.7}
                    style={stylesComponents.headerBarActionBtn}
                >
                    <Ionicons name={rightIcon} size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={stylesComponents.headerBarActionBtn} />
            )}
        </View>
    );
};

export default HeaderBar;
