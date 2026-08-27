import React, { useState } from 'react';
import {
  View, Text, TextInput, Image,
  KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, Alert,
  ActivityIndicator,
} from 'react-native';
import ButtonPrimary from '@/components/buttonPrimary';
import { styles } from '@/theme/styles';
import PasswordInput from '@/components/passwordInput';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';

const LoginScreen = () => {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async () => {
    // 1. Limpiar error anterior
    setError(null);

    // 2. Validar con Zod antes de llamar al backend
    const result = loginSchema.safeParse({ correo, clave });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    // 3. Llamar al backend
    try {
      setIsLoading(true);
      const response = await authService.login({ correo, clave });

      // 4. Guardar sesión en el store
      setSession(response.access_token, response.usuario);

      // La navegación al Home ocurre automáticamente desde App.tsx
      // porque isAuthenticated cambia a true

    } catch (err: any) {
      console.log('\n❌ --- ERROR DE AXIOS ---');
      console.log('Mensaje:', err.message);
      console.log('URL intentada:', err.config?.url);
      console.log('Data backend:', err.response?.data);
      console.log('-------------------------\n');

      // Manejo de errores del backend
      const mensajeBackend = err?.response?.data?.mensaje;
      setError(mensajeBackend ?? `Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            <TextInput
              style={styles.textInput}
              placeholder="Ej. admin@softel.com"
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <Text style={styles.litleTitle}>Contraseña</Text>
            <PasswordInput
              value={clave}
              onChangeText={setClave}
              placeholder="Contraseña"
            />

            {/* Mensaje de error visible */}
            {error && (
              <Text style={{ color: colors.error, fontSize: 13, marginBottom: 10, textAlign: 'center' }}>
                {error}
              </Text>
            )}

            {/* Botón con indicador de carga */}
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 10 }} />
            ) : (
              <ButtonPrimary text="Iniciar Sesión" onPress={handleLogin} />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;