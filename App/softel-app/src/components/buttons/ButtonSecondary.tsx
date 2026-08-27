import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
}

const ButtonSecondary = ({ text, onPress, iconName }: props) => {
    return (
        <TouchableOpacity onPress={onPress} style={stylesComponents.buttonSecondary}>
            {iconName && (
                <Ionicons name={iconName} size={20} color={colors.textSecondary} />
            )}
            <Text style={stylesTexts.textButtonOptionSec}>{text}</Text>
        </TouchableOpacity>
    )
}

export default ButtonSecondary