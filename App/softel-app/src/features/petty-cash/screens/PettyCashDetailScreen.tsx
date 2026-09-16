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
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonOutline from '@/components/buttons/ButtonOutline';
import FabButton from '@/components/buttons/FabButton';
import { usePettyCashActions } from '../hooks/usePettyCashActions';
import { pettyCashService, PettyCashResponse, ExpenseItemResponse } from '../services/pettyCashService';
import { useAuthStore } from '@/store/authStore';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'PettyCashDetail'>;

// Datos de mock eliminados. Todo es 100% dinámico desde la API.

/**
 * Pantalla de Detalle de Caja Chica (compartida para todos los roles).
 * Capa pura de presentación: cabecera informativa, tarjeta de montos,
 * comprobantes rendidos y botón de acción dinámica con lógica encapsulada.
 */
const PettyCashDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const cajaId = route.params?.id;
    const usuario = useAuthStore((state) => state.usuario);

    const [caja, setCaja] = useState<PettyCashResponse | null>(null);
    const [expenses, setExpenses] = useState<ExpenseItemResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

    const {
        actionConfig,
        secondaryActionConfig,
        actionLoading,
        executeAction,
    } = usePettyCashActions({
        caja: caja,
        onStatusUpdated: (updated) => setCaja(updated),
    });

    const isEncargado = usuario?.id === caja?.managerUser?.id;
    const isPersonalCampo = usuario?.rol === 'SUPERVISOR' || usuario?.rol === 'TRABAJADOR';
    const canRegisterExpense = caja?.status === 'ABIERTA' && (isEncargado || isPersonalCampo);

    const handleRegisterExpense = () => {
        if (!caja) return;
        navigation.navigate('RegisterExpense', {
            mode: 'create',
            cajaId: caja.id,
        });
    };

    if (loading || !caja) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <HeaderBar title="Detalle de Caja Chica" onBack={() => navigation.goBack()} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <View style={{ padding: 20 }}>
                            <ButtonPrimary text="Volver" onPress={() => navigation.goBack()} />
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

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
                <View style={{ marginTop: 4 }}>
                    {/* 1. Tarjeta informativa de cabecera */}
                    <CardDetailPettyCash caja={caja} />

                    {/* 2. Tarjeta con datos de montos y barra de progreso */}
                    <CardAmountsPettyCash caja={caja} />

                    {/* Botón Outline: Finalizar y Enviar a Revisión encima de Comprobantes Rendidos */}
                    {secondaryActionConfig && (
                        <View style={{ marginTop: 14, marginBottom: 4 }}>
                            <ButtonOutline
                                text={secondaryActionConfig.label}
                                iconName={secondaryActionConfig.icon}
                                onPress={() => executeAction(secondaryActionConfig)}
                                loading={actionLoading}
                            />
                        </View>
                    )}

                    {/* 3. Bloque de Comprobantes Rendidos (HomeOperatorScreen) */}
                    <CardRenderedExpenses
                        expenses={expenses}
                        totalCount={expenses.length}
                        onPressSeeAll={() => {
                            navigation.navigate('AuditExpenses', {
                                cajaId: caja.id,
                                cajaStatus: caja.status,
                                cajaJustification: caja.justification || undefined,
                            });
                        }}
                        onPressExpense={(expense) => {
                            if (
                                expense.status === 'OBSERVADO' &&
                                (usuario?.rol === 'SUPERVISOR' ||
                                    usuario?.rol === 'ADMINISTRADOR' ||
                                    usuario?.rol === 'TRABAJADOR')
                            ) {
                                if (caja.status === 'LIQUIDADA' || caja.status === 'CERRADA') {
                                    return;
                                }
                                navigation.navigate('RegisterExpense', {
                                    mode: 'edit',
                                    cajaId: caja.id,
                                    expense,
                                });
                            }
                        }}
                    />
                </View>
            </ScrollView>

            {/* 4. Botón Flotante '+' para registrar gastos en caja abierta */}
            {!loading && canRegisterExpense && (
                <FabButton
                    onPress={handleRegisterExpense}
                    style={actionConfig ? { bottom: 84 } : undefined}
                />
            )}

            {/* 5. Botón de Acción administrativa estático en la parte inferior */}
            {!loading && actionConfig && (
                <View
                    style={{
                        paddingHorizontal: 14,
                        paddingTop: 8,
                        paddingBottom: 12,
                        backgroundColor: colors.background,
                    }}
                >
                    <ButtonPrimary
                        text={actionConfig.label}
                        iconName={actionConfig.icon}
                        onPress={() => executeAction(actionConfig)}
                        loading={actionLoading}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

export default PettyCashDetailScreen;
