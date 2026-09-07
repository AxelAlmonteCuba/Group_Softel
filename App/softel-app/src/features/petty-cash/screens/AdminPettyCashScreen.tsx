import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardAdminPettyCash from '@/components/cards/CardAdminPettyCash';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

interface Props {
    onBack?: () => void;
    onFilterPress?: () => void;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla de Control de Fondos y Cajas Chicas para el Administrador y Contador.
 * Muestra el listado de cajas en operación, auditoría y rendición mediante CardAdminPettyCash.
 */
const AdminPettyCashScreen: React.FC<Props> = ({ onBack, onFilterPress }) => {
    const navigation = useNavigation<NavigationProp>();
    const [cajas, setCajas] = useState<PettyCashResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Cargar todas las cajas chicas desde el backend
    const cargarCajas = useCallback(async () => {
        try {
            const data = await pettyCashService.getAll();
            setCajas(data || []);
        } catch (error) {
            console.log('Error al cargar cajas chicas para el Administrador:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        cargarCajas();
    }, [cargarCajas]);

    const handleRefresh = () => {
        setRefreshing(true);
        cargarCajas();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera limpia estándar reutilizable */}
            <HeaderBar
                title="Control de Fondos"
                onBack={onBack}
                rightIcon="filter-outline"
                onRightPress={onFilterPress}
            />

            {/* Listado de tarjetas de fondos */}
            <ScrollView
                style={stylesComponents.containerApp}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {loading ? (
                    <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : cajas.length === 0 ? (
                    <View
                        style={{
                            padding: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 40,
                        }}
                    >
                        <Ionicons name="folder-open-outline" size={48} color={colors.textDisabled} style={{ marginBottom: 12 }} />
                        <Text style={[stylesTexts.textCardOptionTitle, { color: colors.textSecondary }]}>
                            No hay cajas chicas registradas
                        </Text>
                        <Text style={[stylesTexts.subtitle, { marginTop: 4, textAlign: 'center' }]}>
                            Las solicitudes de apertura y fondos rendidos aparecerán aquí para tu control y auditoría.
                        </Text>
                    </View>
                ) : (
                    <View style={{ marginTop: 4 }}>
                        {cajas.map((caja) => (
                            <CardAdminPettyCash
                                key={caja.id}
                                caja={caja}
                                onPress={() => {
                                    navigation.navigate('PettyCashDetail', { id: caja.id });
                                }}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default AdminPettyCashScreen;

