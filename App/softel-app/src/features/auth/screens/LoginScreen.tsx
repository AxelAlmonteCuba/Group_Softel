import React, { useState } from 'react';
import {
  View, Text, Image,
  KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, Alert,
  ActivityIndicator,
} from 'react-native';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import PasswordInput from '@/components/inputs/PasswordInput';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import TextInput from '@/components/inputs/TextInput';

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

      // Manejo de errores del backend (Regla 04 - Formato de Respuestas)
      const dataBackend = err?.response?.data;

      let errorA_Mostrar = 'Error de conexión con el servidor';
      if (dataBackend) {
        // Si hay errores de validación específicos (ej. 400 Bad Request), mostramos el primero
        if (dataBackend.errores && dataBackend.errores.length > 0) {
          errorA_Mostrar = dataBackend.errores[0];
        }
        // Si hay un mensaje general (ej. 401 Unauthorized)
        else if (dataBackend.mensaje) {
          errorA_Mostrar = dataBackend.mensaje;
        }
      } else if (err.message) {
        errorA_Mostrar = err.message;
      }

      setError(errorA_Mostrar);
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
        <View style={stylesComponents.containerLogin}>
          <View style={stylesComponents.containerLoginForms}>
            <Image source={require('@assets/images/logo_login_final_2.jpg')} style={{ width: 200, height: 200, alignSelf: 'center' }} />
            <Text style={stylesTexts.basicTitle}>Bienvenido</Text>
            <Text style={stylesTexts.subtitle}>Ingrese con las credenciales asignadas por administración</Text>

            <TextInput
              label="Correo o usuario"
              placeholder="Ej. admin@softel.com"
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <Text style={stylesTexts.litleTitle}>Contraseña</Text>
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