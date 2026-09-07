import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardDetailPettyCash from '@/components/cards/CardDetailPettyCash';
import CardAmountsPettyCash from '@/components/cards/CardAmountsPettyCash';
import PettyCashActionButton from '@/components/buttons/PettyCashActionButton';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'PettyCashDetail'>;

// Objeto por defecto para previsualización / fallback cuando no hay datos
const defaultCaja: PettyCashResponse = {
    id: '2026-004',
    assignedAmount: 1500,
    currentBalance: 850,
    finalBalance: 0,
    status: 'ABIERTA',
    justification: 'Obra Norte',
    projectId: null,
    openingDate: '2026-09-01T08:00:00.000Z',
    closingDate: null,
    createdAt: '2026-09-01T08:00:00.000Z',
    managerUser: {
        id: 'user-1',
        nombres: 'Juan',
        apellidos: 'Pérez',
        documento_identidad: '71234567',
        cargo: 'Supervisor',
        rol: 'SUPERVISOR',
    },
    evaluatorUser: {
        id: 'admin-1',
        nombres: 'Admin',
        apellidos: 'Softel',
        cargo: 'Administrador General',
    },
};

/**
 * Pantalla de Detalle de Caja Chica (compartida para todos los roles).
 * Capa pura de presentación: cabecera informativa, tarjeta de montos
 * y botón de acción dinámica con lógica encapsulada.
 */
const PettyCashDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const cajaId = route.params?.id;

    const [caja, setCaja] = useState<PettyCashResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(!!cajaId);

    useEffect(() => {
        if (!cajaId) return;

        let isMounted = true;
        setLoading(true);

        pettyCashService
            .getById(cajaId)
            .then((data) => {
                if (isMounted) setCaja(data);
            })
            .catch((error) => {
                console.log('Error al cargar detalle de caja:', error);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [cajaId]);

    const cajaActiva = caja || defaultCaja;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera de navegación */}
            <HeaderBar
                title="Detalle de Caja Chica"
                onBack={() => navigation.goBack()}
            />

            {/* Contenido visual de la pantalla */}
            <ScrollView
                style={stylesComponents.containerApp}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : (
                    <View style={{ marginTop: 4 }}>
                        {/* 1. Tarjeta informativa de cabecera */}
                        <CardDetailPettyCash caja={cajaActiva} />

                        {/* 2. Tarjeta con datos de montos y barra de progreso */}
                        <CardAmountsPettyCash caja={cajaActiva} />

                        {/* 3. Botón de Acción según el ciclo de vida (Lógica aislada) */}
                        <PettyCashActionButton
                            caja={cajaActiva}
                            onStatusUpdated={(updated) => setCaja(updated)}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PettyCashDetailScreen;
