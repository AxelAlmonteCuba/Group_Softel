import React, { useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardPolicyPettyCash from '@/components/cards/CardPolicyPettyCash';
import CardRequestAmount from '@/components/cards/CardRequestAmount';
import TextInput from '@/components/inputs/TextInput';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import { pettyCashService } from '../services/pettyCashService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla para la Solicitud de Apertura de Caja Chica.
 * Incluye cabecera estándar HeaderBar, tarjeta de normativa de apertura,
 * tarjeta de selección de monto, justificación operativa, soporte de scroll con teclado y botón fijo inferior.
 */
const RequestPettyCashScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [monto, setMonto] = useState<number>(1500);
    const [justificacion, setJustificacion] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        if (loading) return;

        if (!monto || monto <= 0) {
            Alert.alert('Monto inválido', 'Por favor ingresa un monto válido mayor a 0.');
            return;
        }

        const trimmed = justificacion.trim();
        if (!trimmed) {
            Alert.alert('Campo requerido', 'Por favor ingresa la justificación operativa del fondo solicitado.');
            return;
        }

        try {
            setLoading(true);
            await pettyCashService.requestPettyCash({
                assignedAmount: monto,
                justification: trimmed,
            });

            Alert.alert(
                'Solicitud Enviada',
                'Tu solicitud de caja chica ha sido enviada a Administración para su evaluación.',
                [
                    {
                        text: 'Entendido',
                        onPress: () => navigation.goBack(),
                    },
                ],
            );
        } catch (error: any) {
            const dataBackend = error?.response?.data;
            let errorMsg = 'Error al enviar la solicitud.';
            if (dataBackend) {
                if (dataBackend.errores && dataBackend.errores.length > 0) {
                    errorMsg = dataBackend.errores[0];
                } else if (dataBackend.mensaje) {
                    errorMsg = dataBackend.mensaje;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera estándar de navegación */}
            <HeaderBar
                title="Solicitar Caja Chica"
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                {/* Contenedor del formulario con scroll libre */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 14,
                        paddingTop: 14,
                        paddingBottom: 24,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Tarjeta informativa de normativa de apertura */}
                    <CardPolicyPettyCash />

                    {/* 2. Tarjeta de selección de monto */}
                    <CardRequestAmount
                        value={monto}
                        onChange={setMonto}
                    />

                    {/* 3. Tarjeta con Input de Justificación Operativa */}
                    <View style={stylesComponents.cardHistoryContainer}>
                        <TextInput
                            label="JUSTIFICACIÓN OPERATIVA DEL GASTO"
                            placeholder="Fondo para movilidad de cuadrilla, combustible de camioneta y compras imprevistas de ferretería en obra..."
                            value={justificacion}
                            onChangeText={setJustificacion}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={255}
                            style={{
                                minHeight: 90,
                                marginBottom: 0,
                                backgroundColor: colors.surface,
                            }}
                        />
                    </View>
                </ScrollView>

                {/* 4. Botón inferior fijo en la parte inferior */}
                <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                    <ButtonPrimary
                        text={loading ? 'Enviando Solicitud...' : 'Enviar Solicitud a Administración'}
                        iconName="paper-plane-outline"
                        onPress={handleSubmit}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RequestPettyCashScreen;


