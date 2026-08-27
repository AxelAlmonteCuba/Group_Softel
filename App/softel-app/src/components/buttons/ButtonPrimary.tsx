import { TouchableOpacity, Text } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface props {
    text: string;
    onPress: () => void;
    iconName?: keyof typeof Ionicons.glyphMap;
}

const ButtonPrimary = ({ text, onPress, iconName }: props) => {
    return (
        <TouchableOpacity onPress={onPress} style={stylesComponents.buttonPrimary}>
            {iconName && (
                <Ionicons name={iconName} size={20} color={colors.textOnPrimary} />
            )}
            <Text style={stylesTexts.textButtonPrimary}>{text}</Text>
        </TouchableOpacity>
    )
}

export default ButtonPrimary;
