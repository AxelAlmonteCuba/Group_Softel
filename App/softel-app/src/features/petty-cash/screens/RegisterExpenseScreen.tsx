import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '@/components/layout/HeaderBar';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import SelectInput, { SelectOption } from '@/components/inputs/SelectInput';
import AmountInput from '@/components/inputs/AmountInput';
import JustificationInput from '@/components/inputs/JustificationInput';

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
 * Pantalla para Registrar Gasto de Caja Chica (operador / supervisor / trabajador).
 * Integra los componentes modulares paso a paso:
 * 1. SelectInput con las categorías de BD y sus íconos representativos.
 * 2. AmountInput con el importe monetario y lápiz de edición.
 */
const RegisterExpenseScreen: React.FC = () => {
    const navigation = useNavigation();
    const [categoriaId, setCategoriaId] = useState<string>('');
    const [monto, setMonto] = useState<number>(0);
    const [motivo, setMotivo] = useState<string>('');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar
                title="Registrar Gasto"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 24,
                    paddingBottom: 32,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Tarjeta contenedora */}
                <View style={stylesComponents.containerForms}>
                    {/* 1. Selector de Categorías de Gasto */}
                    <SelectInput
                        label="CATEGORÍA DEL GASTO"
                        options={CATEGORIAS_GASTOS}
                        value={categoriaId}
                        onChange={setCategoriaId}
                        placeholder="Seleccionar..."
                    />

                    {/* 2. Recuadro de Importe Total Rendido */}
                    <AmountInput
                        label="IMPORTE TOTAL RENDIDO"
                        rightLabel="Moneda: PEN"
                        value={monto}
                        onChange={setMonto}
                    />

                    {/* 3. Motivo / Justificación del Gasto */}
                    <JustificationInput
                        label="MOTIVO / JUSTIFICACIÓN DEL GASTO"
                        placeholder="Compra de conectores de cobre y cinta aislante para empalme"
                        value={motivo}
                        onChangeText={setMotivo}
                        maxLength={200}
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RegisterExpenseScreen;
