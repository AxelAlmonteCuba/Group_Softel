import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts, stylesComponents } from '@/theme/styles';

interface Props {
    title: string;
    subtitle: string;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
    onPress?: () => void;
}

const CardOptions = ({
    title,
    subtitle,
    iconName,
    iconColor = colors.textSecondary,
    iconBgColor = colors.infoSoft,
    onPress
}: Props) => {
    return (
        <TouchableOpacity style={stylesComponents.cardOptionContainer} onPress={onPress}>
            <View style={[stylesComponents.cardOptionIconContainer, { backgroundColor: iconBgColor }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
            </View>

            <View style={stylesComponents.cardOptionTextContainer}>
                <Text style={stylesTexts.textCardOptionTitle} numberOfLines={2}>{title}</Text>
                <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]} numberOfLines={1}>{subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={colors.textDisabled} />
        </TouchableOpacity>
    );
};

export default CardOptions;
