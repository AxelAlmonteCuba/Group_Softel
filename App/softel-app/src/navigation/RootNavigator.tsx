import React from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

/**
 * Navegador Raíz.
 *
 * Lee `isAuthenticated` del store de Zustand y decide qué stack mostrar:
 *   - false → AuthStack  (LoginScreen)
 *   - true  → MainStack  (Home, UserManagement, AddEditUser)
 *
 * Cuando el login es exitoso y setSession() cambia isAuthenticated a true,
 * React re-renderiza este componente y automáticamente muestra el MainStack
 * sin necesidad de llamar a navigation.navigate().
 */
const RootNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default RootNavigator;
