import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import LoginScreen from '@/features/auth/screens/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Stack de Autenticación.
 * Se muestra cuando el usuario NO ha iniciado sesión (isAuthenticated === false).
 * Contiene únicamente la pantalla de Login.
 * El header está oculto porque LoginScreen tiene su propio diseño.
 */
const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
