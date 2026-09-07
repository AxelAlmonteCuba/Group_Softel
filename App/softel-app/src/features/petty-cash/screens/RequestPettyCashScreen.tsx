import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardRequestAmount from '@/components/cards/CardRequestAmount';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla para la Solicitud de Apertura de Caja Chica.
 * Incluye cabecera estándar HeaderBar y la tarjeta de selección de monto requerida.
 */
const RequestPettyCashScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [monto, setMonto] = useState<number>(1500);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera estándar de navegación */}
            <HeaderBar
                title="Solicitar Caja Chica"
                onBack={() => navigation.goBack()}
            />

            {/* Contenedor del formulario con la tarjeta de monto */}
            <ScrollView
                style={stylesComponents.containerApp}
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
            >
                <CardRequestAmount
                    value={monto}
                    onChange={setMonto}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default RequestPettyCashScreen;
