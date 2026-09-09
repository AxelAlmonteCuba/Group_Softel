import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList } from '@/navigation/types';
import HeaderBar from '@/components/layout/HeaderBar';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import SelectInput, { SelectOption } from '@/components/inputs/SelectInput';
import AmountInput from '@/components/inputs/AmountInput';
import JustificationInput from '@/components/inputs/JustificationInput';
import CardPhotoEvidence from '@/components/cards/CardPhotoEvidence';
import ExpenseSourceSelector, { ExpenseSourceType } from '@/components/inputs/ExpenseSourceSelector';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import AlertBanner from '@/components/common/AlertBanner';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';
import { resolveImageUrl } from '../hooks/useAuditExpenses';

/**
 * Catálogo oficial de categorías de gastos sincronizado con la tabla `categorias_gastos`:
 * 1: Movilidad
 * 2: Materiales
 * 3: Viáticos
 * 4: Combustible
 * 5: Otros
 */
const CATEGORIAS_GASTOS: SelectOption[] = [
    {
        label: 'Movilidad',
        value: '1',
        icon: 'car-outline',
        iconColor: '#0284C7',
        iconBgColor: '#E0F2FE',
    },
    {
        label: 'Materiales',
        value: '2',
        icon: 'construct-outline',
        iconColor: '#DC2626',
        iconBgColor: '#FEE2E2',
    },
    {
        label: 'Viáticos',
        value: '3',
        icon: 'restaurant-outline',
        iconColor: '#D97706',
        iconBgColor: '#FEF3C7',
    },
    {
        label: 'Combustible',
        value: '4',
        icon: 'speedometer-outline',
        iconColor: '#7C3AED',
        iconBgColor: '#F3E8FF',
    },
    {
        label: 'Otros',
        value: '5',
        icon: 'ellipsis-horizontal-circle-outline',
        iconColor: '#4B5563',
        iconBgColor: '#F3F4F6',
    },
];

/**
 * Pantalla para Registrar o Editar un Gasto de Caja Chica o Reembolso Directo.
 * Soporta dos modos:
 * - mode: 'create' (registro regular)
 * - mode: 'edit' (subsanación de gasto OBSERVADO)
 */
const RegisterExpenseScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const route = useRoute<RouteProp<MainStackParamList, 'RegisterExpense'>>();

    const mode = route.params?.mode || 'create';
    const expense = route.params?.expense;
    const isEditMode = mode === 'edit';

    const cajaId = route.params?.cajaId || (expense as any)?.caja_chica_id || null;
    const hasActivePettyCash = Boolean(cajaId);

    const [categoriaId, setCategoriaId] = useState<string>(
        expense?.category?.id ? String(expense.category.id) : ''
    );
    const [monto, setMonto] = useState<number>(
        expense?.amount ? Number(expense.amount) : 0
    );
    const [motivo, setMotivo] = useState<string>(expense?.reason || '');
    const [imageUri, setImageUri] = useState<string | null>(
        expense?.receiptUrl ? resolveImageUrl(expense.receiptUrl) : null
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [source, setSource] = useState<ExpenseSourceType>(
        hasActivePettyCash ? 'caja_chica' : 'reembolso'
    );
    const [cajaInfo, setCajaInfo] = useState<PettyCashResponse | null>(null);

    useEffect(() => {
        if (!cajaId) return;
        pettyCashService
            .getById(cajaId)
            .then((data) => setCajaInfo(data))
            .catch((err) => console.log('Error al consultar saldo de caja:', err));
    }, [cajaId]);

    // Precargar campos si llega un gasto en modo edición
    useEffect(() => {
        if (expense && isEditMode) {
            if (expense.category?.id) setCategoriaId(String(expense.category.id));
            if (expense.amount !== undefined) setMonto(Number(expense.amount));
            if (expense.reason) setMotivo(expense.reason);
            if (expense.receiptUrl) setImageUri(resolveImageUrl(expense.receiptUrl));
        }
    }, [expense, isEditMode]);

    const effectiveBalance = cajaInfo?.effectiveBalance !== undefined
        ? Number(cajaInfo.effectiveBalance)
        : Number(cajaInfo?.currentBalance || 0);

    const isOverspent =
        source === 'caja_chica' &&
        Boolean(cajaId) &&
        monto > 0 &&
        effectiveBalance > 0 &&
        monto > effectiveBalance;

    const handleSubmit = async () => {
        if (!categoriaId) {
            Alert.alert('Categoría Requerida', 'Por favor, selecciona una categoría para el gasto.');
            return;
        }

        if (monto <= 0) {
            Alert.alert('Importe Requerido', 'Por favor, ingresa un importe mayor a S/ 0.00.');
            return;
        }

        if (!motivo.trim()) {
            Alert.alert('Motivo Requerido', 'Por favor, ingresa la justificación o concepto del gasto.');
            return;
        }

        if (!imageUri) {
            Alert.alert('Comprobante Requerido', 'Es obligatorio adjuntar una fotografía del comprobante de gasto.');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode && expense?.id) {
                // Modo Edición: Actualizar gasto observado
                await pettyCashService.updateExpense(expense.id, {
                    categoryId: parseInt(categoriaId, 10),
                    amount: monto,
                    reason: motivo.trim(),
                    imageUri,
                });

                Alert.alert(
                    'Gasto Actualizado',
                    'Las observaciones fueron corregidas. El gasto regresó a estado PENDIENTE para una nueva evaluación.',
                    [
                        {
                            text: 'Aceptar',
                            onPress: () => {
                                const routes = navigation.getState()?.routes;
                                const previousRoute =
                                    routes && routes.length >= 2 ? routes[routes.length - 2] : null;

                                if (previousRoute?.name === 'PettyCashDetail') {
                                    navigation.goBack();
                                } else if (cajaId) {
                                    navigation.replace('PettyCashDetail', { id: cajaId });
                                } else {
                                    navigation.goBack();
                                }
                            },
                        },
                    ]
                );
            } else {
                // Modo Creación: Registrar nuevo gasto
                const pettyCashId = source === 'caja_chica' && cajaId ? cajaId : null;
                const today = new Date().toISOString().split('T')[0];

                await pettyCashService.registerExpense({
                    pettyCashId,
                    categoryId: parseInt(categoriaId, 10),
                    amount: monto,
                    reason: motivo.trim(),
                    expenseDate: today,
                    imageUri,
                });

                Alert.alert(
                    'Gasto Registrado',
                    'El comprobante y los datos del gasto se registraron exitosamente.',
                    [
                        {
                            text: 'Aceptar',
                            onPress: () => {
                                const routes = navigation.getState()?.routes;
                                const previousRoute =
                                    routes && routes.length >= 2 ? routes[routes.length - 2] : null;

                                if (previousRoute?.name === 'PettyCashDetail') {
                                    navigation.goBack();
                                } else if (cajaId) {
                                    navigation.replace('PettyCashDetail', { id: cajaId });
                                } else {
                                    navigation.goBack();
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Error al procesar gasto:', error);
            const dataBackend = error?.response?.data;
            let errorMsg = isEditMode
                ? 'No se pudo actualizar el gasto. Intenta nuevamente.'
                : 'No se pudo registrar el gasto. Intenta nuevamente.';

            if (dataBackend) {
                if (dataBackend.errores && dataBackend.errores.length > 0) {
                    errorMsg = dataBackend.errores[0];
                } else if (dataBackend.mensaje) {
                    errorMsg = dataBackend.mensaje;
                }
            }
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar
                title={isEditMode ? 'Editar Gasto' : 'Registrar Gasto'}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 24,
                        paddingBottom: 24,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Tarjeta de Observación (solo en modo edición si existe observación previa) */}
                    {isEditMode && Boolean(expense?.evaluationComment) && (
                        <AlertBanner
                            type="warning"
                            title="Motivo de Observación (Auditoría):"
                            message={expense?.evaluationComment || ''}
                        />
                    )}

                    {/* 0. Selector de Origen del Pago (Caja Chica vs Reembolso) */}
                    {!isEditMode && (
                        <ExpenseSourceSelector
                            selectedSource={source}
                            onSourceChange={(newSource) => {
                                if (hasActivePettyCash) {
                                    setSource(newSource);
                                }
                            }}
                            hasActivePettyCash={hasActivePettyCash}
                            pettyCashName="Caja Chica Activa"
                        />
                    )}

                    {/* 1. Tarjeta de Datos del Gasto */}
                    <View style={stylesComponents.containerForms}>
                        {/* Selector de Categorías de Gasto */}
                        <SelectInput
                            label="CATEGORÍA DEL GASTO"
                            options={CATEGORIAS_GASTOS}
                            value={categoriaId}
                            onChange={setCategoriaId}
                            placeholder="Seleccionar..."
                        />

                        {/* Recuadro de Importe Total Rendido */}
                        <AmountInput
                            label="IMPORTE TOTAL RENDIDO"
                            rightLabel="Moneda: PEN"
                            value={monto}
                            onChange={setMonto}
                        />

                        {/* Indicador de saldo disponible real en mano */}
                        {source === 'caja_chica' && Boolean(cajaId) && effectiveBalance > 0 && (
                            <View style={{ marginTop: 6, marginBottom: 4 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                    Saldo disponible en mano:{' '}
                                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                                        S/ {effectiveBalance.toFixed(2)}
                                    </Text>
                                </Text>
                            </View>
                        )}

                        {/* Banner de advertencia preventiva flexible */}
                        {isOverspent && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#FEF9C3',
                                    borderWidth: 1,
                                    borderColor: '#FDE68A',
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    gap: 8,
                                    marginTop: 6,
                                    marginBottom: 8,
                                }}
                            >
                                <Ionicons name="alert-circle-outline" size={18} color="#A16207" />
                                <Text style={{ fontSize: 12, color: '#A16207', flex: 1, lineHeight: 16 }}>
                                    Este importe supera tu saldo en mano (S/ {effectiveBalance.toFixed(2)}). Se registrará para evaluación de la Administración.
                                </Text>
                            </View>
                        )}

                        {/* Motivo / Justificación del Gasto */}
                        <JustificationInput
                            label="MOTIVO / JUSTIFICACIÓN DEL GASTO"
                            placeholder="Compra de conectores de cobre y cinta aislante para empalme"
                            value={motivo}
                            onChangeText={setMotivo}
                            maxLength={200}
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </View>

                    {/* 2. Tarjeta de Evidencia Fotográfica (Estado Inicial) */}
                    <CardPhotoEvidence
                        imageUri={imageUri}
                        onImagePicked={setImageUri}
                        onRemoveImage={() => setImageUri(null)}
                    />
                </ScrollView>

                {/* 3. Botón inferior fijo de manera permanente */}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                    <ButtonPrimary
                        text={
                            loading
                                ? isEditMode
                                    ? 'Guardando Cambios...'
                                    : 'Subiendo Gasto...'
                                : isEditMode
                                ? 'Guardar Cambios'
                                : 'Subir Gasto'
                        }
                        iconName={isEditMode ? 'save-outline' : 'paper-plane-outline'}
                        onPress={handleSubmit}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterExpenseScreen;
