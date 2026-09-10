import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';

interface FabButtonProps {
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

const FabButton: React.FC<FabButtonProps> = ({
    onPress,
    iconName = 'add',
    color = colors.textOnPrimary,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[stylesComponents.fabButton, style]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <Ionicons name={iconName} size={28} color={color} />
        </TouchableOpacity>
    );
};

export default FabButton;
