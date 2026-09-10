import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import OperatorPettyCashScreen from './OperatorPettyCashScreen';
import AdminPettyCashScreen from './AdminPettyCashScreen';

interface Props {
    onBack?: () => void;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla principal de Caja Chica (Router por Rol).
 *
 * Se encarga de:
 * 1. Ocultar el UserTopBar del Home.
 * 2. Determinar si el usuario es Administrador/Contador o Supervisor/Trabajador.
 * 3. Renderizar la pantalla correspondiente manteniendo la navegación limpia.
 */
const PettyCashScreen: React.FC<Props> = ({ onBack }) => {
    const navigation = useNavigation<NavigationProp>();
    const usuario = useAuthStore((state) => state.usuario);
    const userRole = usuario?.rol ?? 'TRABAJADOR';

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {userRole === 'ADMINISTRADOR' || userRole === 'CONTADOR' ? (
                <AdminPettyCashScreen onBack={handleBack} />
            ) : (
                <OperatorPettyCashScreen onBack={handleBack} />
            )}
        </View>
    );
};

export default PettyCashScreen;
