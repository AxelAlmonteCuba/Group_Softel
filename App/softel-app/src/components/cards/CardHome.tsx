import { colors } from '@/theme'
import { stylesTexts } from '@/theme/styles'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
    title: string
    value: number
    iconName: keyof typeof Ionicons.glyphMap
}

const CardHome = ({ title, value, iconName }: Props) => {
    return (
        <View style={styles2.cardHome}>
            <Ionicons name={iconName} size={25} color={colors.primary} />
            <Text style={styles2.value}>{value}</Text>
            <Text style={[stylesTexts.litleTitle, { textAlign: 'center', marginBottom: 4, marginEnd: 2 }]}>{title}</Text>
        </View>
    )
}

export default CardHome

const styles2 = StyleSheet.create({
    cardHome: {
        flex: 1,
        height: 108,
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    value: {
        fontSize: 25,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
        textAlign: 'center'
    }
})