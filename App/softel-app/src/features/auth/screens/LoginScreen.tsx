import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import ButtonPrimary from '@/components/buttonPrimary';
import { styles } from '@/theme/styles';
import PasswordInput from '@/components/passwordInput';

const LoginScreen = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Image source={require('@assets/images/logo_login.jpg')} style={{ width: 200, height: 200, alignSelf: 'center' }} />
            <Text style={styles.basicTitle}>Bienvenido</Text>
            <Text style={styles.subtitle}>Ingrese con las credenciales asignadas por administración</Text>
            <Text style={styles.litleTitle}>Correo o usuario</Text>
            <TextInput style={styles.textInput} placeholder="Ej. Administrador" />
            <Text style={styles.litleTitle}>Contraseña</Text>
            <PasswordInput value='' onChangeText={() => { }} placeholder='Contraseña' />
            <ButtonPrimary text="Iniciar Sesión" onPress={() => { }} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;