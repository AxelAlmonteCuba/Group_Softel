import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
    size?: 'medium' | 'small';
    disabled?: boolean;
    loading?: boolean;
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
    loading = false,
    style,
    textStyle,
    iconSize,
    iconColor = colors.textOnPrimary,
    numberOfLines,
    activeOpacity = 0.8,
}) => {
    const isSmall = size === 'small';
    const computedIconSize = iconSize ?? (isSmall ? 18 : 20);
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={isDisabled ? 1 : activeOpacity}
            style={[
                stylesComponents.buttonPrimary,
                isSmall && stylesComponents.buttonSmall,
                isDisabled && stylesComponents.buttonDisabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={iconColor} />
            ) : (
                <>
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
                </>
            )}
        </TouchableOpacity>
    );
};

export default ButtonPrimary;
