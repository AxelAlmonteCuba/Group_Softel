import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import HomeScreen from '@/features/home/screens/HomeScreen';
import UserManagementScreen from '@/features/users/screens/UserManagementScreen';
import AddEditUserScreen from '@/features/users/screens/AddEditUserScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Stack Principal.
 * Se muestra cuando el usuario SÍ ha iniciado sesión (isAuthenticated === true).
 *
 * Pantallas:
 *   1. Home             → Panel principal con UserTopBar (header oculto).
 *   2. UserManagement   → Lista de usuarios con header estilizado.
 *   3. AddEditUser      → Formulario crear/editar/ver usuario con título dinámico.
 */
const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '600', fontSize: 18 },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            {/* Home: header oculto porque tiene su propia UserTopBar */}
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />

            {/* UserManagement: header con título fijo */}
            <Stack.Screen
                name="UserManagement"
                component={UserManagementScreen}
                options={{ title: 'Gestión de Usuarios' }}
            />

            {/* AddEditUser: título dinámico según el mode que viene en params */}
            <Stack.Screen
                name="AddEditUser"
                component={AddEditUserScreen}
                options={({ route }) => {
                    const mode = route.params?.mode;
                    const titles: Record<string, string> = {
                        create: 'Nuevo Usuario',
                        edit: 'Editar Usuario',
                        view: 'Ver Usuario',
                    };
                    return { title: titles[mode] ?? 'Usuario' };
                }}
            />
        </Stack.Navigator>
    );
};

export default MainStack;
