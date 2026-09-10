import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconColor?: string;
    borderColor?: string;
    textColor?: string;
}

/**
 * Botón Outline Corporativo con fondo blanco y borde rojo primario.
 * Diseñado según especificación Stitch AI ("Finalizar y Enviar a Revisión").
 */
const ButtonOutline: React.FC<Props> = ({
    text,
    onPress,
    iconName = 'checkmark-circle-outline',
    loading = false,
    disabled = false,
    style,
    textStyle,
    iconColor = colors.primary,
    borderColor = colors.primary,
    textColor = colors.primary,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.75}
            style={[
                {
                    backgroundColor: colors.surface,
                    borderWidth: 1.5,
                    borderColor: borderColor,
                    borderRadius: 12,
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                },
                disabled && { opacity: 0.5 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <>
                    {iconName && (
                        <Ionicons name={iconName} size={20} color={iconColor} />
                    )}
                    <Text
                        style={[
                            {
                                color: textColor,
                                fontSize: 15,
                                fontWeight: '700',
                            },
                            textStyle,
                        ]}
                    >
                        {text}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default ButtonOutline;
