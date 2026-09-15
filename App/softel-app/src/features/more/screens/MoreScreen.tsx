import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/authService';
import HeaderBar from '@/components/layout/HeaderBar';
import MenuOptionRow from '@/components/buttons/MenuOptionRow';

interface Props {
    onBack?: () => void;
}

const MoreScreen: React.FC<Props> = ({ onBack }) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
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
                            await authService.logout();
                        } catch (error) {
                            console.log('Aviso: logout notificado con advertencia de red', error);
                        } finally {
                            clearSession();
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const handleUnavailable = (feature: string) => {
        Alert.alert('Próximamente', `El módulo de ${feature} estará disponible en futuras actualizaciones.`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F4F5' }}>
            <HeaderBar
                title="Más Opciones"
                onBack={onBack}
                showBackButton={false}
            />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                
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


                {/* Main Menu Card */}
                <Text style={[stylesTexts.litleTitle, { marginBottom: 12 }]}>
                    OPCIONES
                </Text>
                <View style={styles.cardContainer}>
                    <MenuOptionRow 
                        title="Motores Electrógenos" 
                        icon="flash-outline" 
                        onPress={() => handleUnavailable('Motores')} 
                    />
                    
                    <MenuOptionRow 
                        title="Gestión de EPP" 
                        icon="shield-checkmark-outline" 
                        onPress={() => handleUnavailable('EPP')} 
                    />

                    {(rol === 'ADMINISTRADOR') && (
                        <MenuOptionRow 
                            title="Gestión de Usuarios" 
                            icon="people-outline" 
                            onPress={() => navigation.navigate('UserManagement')} 
                        />
                    )}

                    {(rol === 'ADMINISTRADOR' || rol === 'CONTADOR') && (
                        <MenuOptionRow 
                            title="Saldos por Usuario" 
                            icon="bar-chart-outline" 
                            onPress={() => navigation.navigate('UserBalances')} 
                        />
                    )}

                    <MenuOptionRow 
                        title="Configuración" 
                        icon="settings-outline" 
                        onPress={() => handleUnavailable('Configuración')} 
                    />

                    <MenuOptionRow 
                        title="Ayuda y soporte" 
                        icon="help-circle-outline" 
                        onPress={() => handleUnavailable('Soporte')} 
                        isLast={true}
                    />
                </View>

                {/* Logout Card */}
                <View style={[styles.cardContainer, { marginTop: 16 }]}>
                    <MenuOptionRow 
                        title={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"} 
                        icon="log-out-outline" 
                        onPress={handleLogout} 
                        textColor={colors.primary}
                        iconColor={colors.primary}
                        showChevron={false}
                        isLast={true}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E4E4E7',
    }
});

export default MoreScreen;
