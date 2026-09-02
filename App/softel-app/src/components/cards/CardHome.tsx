import { colors } from '@/theme'
import { stylesTexts, stylesComponents } from '@/theme/styles'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
    title: string
    value: number
    iconName: keyof typeof Ionicons.glyphMap
    onPress?: () => void
}

const CardHome = ({ title, value, iconName, onPress }: Props) => {
    return (
        <TouchableOpacity style={stylesComponents.cardHomeContainer} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
            <Ionicons name={iconName} size={25} color={colors.primary} />
            <Text style={stylesTexts.cardHomeValue}>{value}</Text>
            <Text style={[stylesTexts.litleTitle, { textAlign: 'center', marginBottom: 4, marginEnd: 2 }]}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CardHome