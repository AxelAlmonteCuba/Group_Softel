import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import HomeScreen from '@/features/home/screens/HomeScreen';
import UserManagementScreen from '@/features/users/screens/UserManagementScreen';
import AddEditUserScreen from '@/features/users/screens/AddEditUserScreen';
import PettyCashScreen from '@/features/petty-cash/screens/PettyCashScreen';
import RequestPettyCashScreen from '@/features/petty-cash/screens/RequestPettyCashScreen';
import PettyCashDetailScreen from '@/features/petty-cash/screens/PettyCashDetailScreen';
import RegisterExpenseScreen from '@/features/petty-cash/screens/RegisterExpenseScreen';
import AuditExpensesScreen from '@/features/petty-cash/screens/AuditExpensesScreen';
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
 *   4. PettyCash        → Router de Caja Chica (header oculto para usar HeaderBar).
 *   5. RequestPettyCash → Formulario para solicitar apertura de fondo.
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

            {/* PettyCash: Router de Caja Chica (header oculto para usar su propio header estándar) */}
            <Stack.Screen
                name="PettyCash"
                component={PettyCashScreen}
                options={{ headerShown: false }}
            />

            {/* RequestPettyCash: Formulario de solicitud de apertura */}
            <Stack.Screen
                name="RequestPettyCash"
                component={RequestPettyCashScreen}
                options={{ headerShown: false }}
            />

            {/* PettyCashDetail: Detalle de Caja Chica */}
            <Stack.Screen
                name="PettyCashDetail"
                component={PettyCashDetailScreen}
                options={{ headerShown: false }}
            />

            {/* RegisterExpense: Formulario / Pantalla de Registro de Gasto */}
            <Stack.Screen
                name="RegisterExpense"
                component={RegisterExpenseScreen}
                options={{ headerShown: false }}
            />

            {/* AuditExpenses: Auditoría y Lista completa de gastos de la caja */}
            <Stack.Screen
                name="AuditExpenses"
                component={AuditExpensesScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default MainStack;
