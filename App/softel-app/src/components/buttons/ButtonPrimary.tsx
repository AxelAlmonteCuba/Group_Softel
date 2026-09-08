import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
    size?: 'medium' | 'small';
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    iconSize?: number;
    iconColor?: string;
    numberOfLines?: number;
    activeOpacity?: number;
}

const ButtonPrimary: React.FC<props> = ({
    text,
    onPress,
    iconName,
    size = 'medium',
    disabled = false,
    style,
    textStyle,
    iconSize,
    iconColor = colors.textOnPrimary,
    numberOfLines,
    activeOpacity = 0.8,
}) => {
    const isSmall = size === 'small';
    const computedIconSize = iconSize ?? (isSmall ? 18 : 20);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={disabled ? 1 : activeOpacity}
            style={[
                stylesComponents.buttonPrimary,
                isSmall && stylesComponents.buttonSmall,
                disabled && stylesComponents.buttonDisabled,
                style,
            ]}
        >
            {iconName && (
                <Ionicons name={iconName} size={computedIconSize} color={iconColor} />
            )}
            <Text
                numberOfLines={numberOfLines}
                style={[
                    stylesTexts.textButtonPrimary,
                    isSmall && stylesTexts.textButtonSmall,
                    textStyle,
                ]}
            >
                {text}
            </Text>
        </TouchableOpacity>
    );
};

export default ButtonPrimary;
