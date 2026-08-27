import React from 'react'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import { colors } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { stylesComponents, stylesTexts } from '@/theme/styles'

interface props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
}

const ButtonTertiary = ({ text, onPress, iconName }: props) => {
    return (
        <TouchableOpacity onPress={onPress} style={stylesComponents.buttonSecondary}>
            {iconName && (
                <Ionicons name={iconName} size={20} color={colors.primary} />
            )}
            <Text style={stylesTexts.textButtonOptionTer}>{text}</Text>
        </TouchableOpacity>
    );

}

export default ButtonTertiary