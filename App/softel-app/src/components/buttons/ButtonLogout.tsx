import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface ButtonLogoutProps {
    onPress: () => void;
    isLoading?: boolean;
}

/**
 * Botón de Cerrar Sesión diseñado según especificación:
 * Tarjeta blanca con borde sutil, ícono log-out-outline rojo Softel y texto "Cerrar sesión".
 */
const ButtonLogout: React.FC<ButtonLogoutProps> = ({ onPress, isLoading = false }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.7}
            style={stylesComponents.buttonLogout}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : (
                <Ionicons name="log-out-outline" size={22} color={colors.primary} />
            )}
            <Text style={stylesTexts.textButtonLogout}>Cerrar sesión</Text>
        </TouchableOpacity>
    );
};

export default ButtonLogout;
