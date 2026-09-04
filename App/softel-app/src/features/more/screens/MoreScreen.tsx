import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import HeaderBar from '@/components/layout/HeaderBar';
import ButtonLogout from '@/components/buttons/ButtonLogout';

interface Props {
    onBack?: () => void;
}

/**
 * Pantalla "Más" del BottomNavBar.
 *
 * Muestra el perfil del usuario activo y acciones de cuenta,
 * incluyendo el botón de Cerrar Sesión conectado 100% al backend.
 */
const MoreScreen: React.FC<Props> = ({ onBack }) => {
    const usuario = useAuthStore((state) => state.usuario);
    const clearSession = useAuthStore((state) => state.clearSession);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const nombreCompleto = usuario
        ? `${usuario.nombres} ${usuario.apellidos}`
        : 'Usuario';
    const correo = usuario?.correo ?? 'Sin correo';
    const cargo = usuario?.cargo ?? 'Sin cargo';
    const rol = usuario?.rol ?? 'TRABAJADOR';

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que deseas salir de tu cuenta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoggingOut(true);
                            // 1. Llamar al backend para invalidar/notificar logout
                            await authService.logout();
                        } catch (error) {
                            console.log('Aviso: logout notificado con advertencia de red', error);
                        } finally {
                            // 2. Limpiar la sesión local en Zustand
                            // Esto cambia isAuthenticated a false y RootNavigator redirige inmediatamente al Login
                            clearSession();
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera limpia estándar sin UserTopBar */}
            <HeaderBar
                title="Más Opciones"
                onBack={onBack}
                showBackButton={false}
            />

            <ScrollView style={stylesComponents.containerApp}>
                {/* Sección: Información del Usuario */}
                <Text style={[stylesTexts.litleTitle, { marginBottom: 12 }]}>
                    PERFIL DE USUARIO
                </Text>

                <View style={[stylesComponents.cardProfileContainer, { marginBottom: 24 }]}>
                    <View style={stylesComponents.cardProfileContent}>
                        {/* Avatar */}
                        <View style={stylesComponents.cardProfileAvatar}>
                            <Ionicons name="person" size={28} color={colors.primary} />
                        </View>

                        {/* Datos del usuario */}
                        <View style={stylesComponents.cardProfileInfoContainer}>
                            <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                                {nombreCompleto}
                            </Text>
                            <Text style={stylesTexts.cardProfileRole}>
                                {rol} • {cargo}
                            </Text>
                            <Text style={stylesTexts.cardProfileEmail} numberOfLines={1}>
                                {correo}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sección: Cuenta y Sesión */}
                <Text style={[stylesTexts.litleTitle, { marginBottom: 12 }]}>
                    CUENTA
                </Text>

                {/* Componente Cerrar Sesión */}
                <ButtonLogout onPress={handleLogout} isLoading={isLoggingOut} />
            </ScrollView>
        </View>
    );
};

export default MoreScreen;
