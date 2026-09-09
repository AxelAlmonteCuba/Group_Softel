import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardDetailPettyCash from '@/components/cards/CardDetailPettyCash';
import CardAmountsPettyCash from '@/components/cards/CardAmountsPettyCash';
import CardRenderedExpenses from '@/components/cards/CardRenderedExpenses';
import PettyCashActionButton from '@/components/buttons/PettyCashActionButton';
import { pettyCashService, PettyCashResponse, ExpenseItemResponse } from '../services/pettyCashService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'PettyCashDetail'>;

// Gastos por defecto para previsualización cuando no hay datos remotos
const defaultExpenses: ExpenseItemResponse[] = [
    {
        id: 'mock-1',
        amount: 180.0,
        reason: 'Bobina de cable drop 50',
        receiptUrl: '',
        status: 'APROBADO',
        expenseDate: '2026-09-03',
        createdAt: '2026-09-03T10:00:00.000Z',
        category: { id: 2, name: 'Factura F001-4921' },
    },
    {
        id: 'mock-2',
        amount: 25.0,
        reason: 'Pasaje interurban',
        receiptUrl: '',
        status: 'PENDIENTE',
        expenseDate: '2026-09-03',
        createdAt: '2026-09-03T11:00:00.000Z',
        category: { id: 1, name: 'Boleto Viaje' },
    },
];

// Objeto por defecto para previsualización / fallback cuando no hay datos
const defaultCaja: PettyCashResponse = {
    id: '2026-004',
    assignedAmount: 1500,
    currentBalance: 1320,
    finalBalance: 0,
    approvedAmount: 180,
    pendingAmount: 25,
    effectiveBalance: 1295,
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
 * Capa pura de presentación: cabecera informativa, tarjeta de montos,
 * comprobantes rendidos y botón de acción dinámica con lógica encapsulada.
 */
const PettyCashDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const cajaId = route.params?.id;

    const [caja, setCaja] = useState<PettyCashResponse | null>(null);
    const [expenses, setExpenses] = useState<ExpenseItemResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(!!cajaId);

    const loadData = useCallback(() => {
        if (!cajaId) return;

        let isMounted = true;

        Promise.all([
            pettyCashService.getById(cajaId).catch((error) => {
                console.log('Error al cargar detalle de caja:', error);
                return null;
            }),
            pettyCashService.getExpensesByPettyCash(cajaId).catch((error) => {
                console.log('Error al cargar gastos de la caja:', error);
                return [] as ExpenseItemResponse[];
            }),
        ])
            .then(([cajaData, expensesData]) => {
                if (!isMounted) return;
                if (cajaData) setCaja(cajaData);
                if (expensesData) setExpenses(expensesData);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [cajaId]);

    useFocusEffect(loadData);

    const cajaActiva = caja || defaultCaja;
    const expensesList = cajaId ? expenses : defaultExpenses;

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

                        {/* 3. Bloque de Comprobantes Rendidos (HomeOperatorScreen) */}
                        <CardRenderedExpenses
                            expenses={expensesList}
                            totalCount={expensesList.length}
                            onPressSeeAll={() => {
                                navigation.navigate('AuditExpenses', {
                                    cajaId: cajaActiva.id,
                                    cajaStatus: cajaActiva.status,
                                });
                            }}
                        />

                        {/* 4. Botón de Acción según el ciclo de vida (Lógica aislada) */}
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
