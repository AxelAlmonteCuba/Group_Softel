import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import ButtonPrimary from '../../../components/buttonPrimary';
import { styles } from '../../../theme/styles';
import PasswordInput from '../../../components/passwordInput';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.basicTitle}>Bienvenido</Text>
        <Text style={styles.subtitle}>Ingrese con las credenciales asignadas por administración</Text>
        <Text style={styles.litleTitle}>Correo o usuario</Text>
        <TextInput style={styles.textInput} placeholder="Ej. Administrador" />
        <Text style={styles.litleTitle}>Contraseña</Text>
        <PasswordInput value='' onChangeText={() => { }} placeholder='Contraseña' />
        <ButtonPrimary text="Iniciar Sesión" onPress={() => { }} />
      </View>
    </View>
  );
};


export default LoginScreen;