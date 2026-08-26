import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../theme/styles';

interface props {
    text: string;
    onPress: () => void;
}

const buttonPrimary = ({ text, onPress }: props) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.buttonPrimary}>
            <Text style={styles.textButtonPrimary}>{text}</Text>
        </TouchableOpacity>
    )
}

export default buttonPrimary;
