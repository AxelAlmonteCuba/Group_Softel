import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../theme/styles';

const buttonPrimary = () => {
    return (
        <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.textButtonPrimary}>Iniciar Sesion</Text>
        </TouchableOpacity>
    )
}

export default buttonPrimary;
