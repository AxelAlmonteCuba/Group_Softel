import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface MenuOptionRowProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    isLast?: boolean;
    textColor?: string;
    iconColor?: string;
    showChevron?: boolean;
}

const MenuOptionRow: React.FC<MenuOptionRowProps> = ({
    title,
    icon,
    onPress,
    isLast = false,
    textColor = colors.textPrimary,
    iconColor = '#4B5563', // Gris medio oscuro
    showChevron = true,
}) => {
    return (
        <>
            <TouchableOpacity 
                style={stylesComponents.menuOptionRowContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Ionicons name={icon} size={22} color={iconColor} style={stylesComponents.menuOptionIcon} />
                <Text style={[stylesTexts.menuOptionText, { color: textColor }]}>
                    {title}
                </Text>
                {showChevron && (
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                )}
            </TouchableOpacity>
            {!isLast && (
                <View style={stylesComponents.menuOptionDivider} />
            )}
        </>
    );
};

export default MenuOptionRow;
