import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HeaderBar from '@/components/layout/HeaderBar';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import CardAuditExpense, { AuditExpenseData } from '@/components/cards/CardAuditExpense';

// Datos de demostración idénticos a la maqueta para visualización inmediata
const demoExpense: AuditExpenseData = {
    id: 'exp-001',
    motivo: 'Compra urgente de cinta vulcanizante y conectores',
    monto: 180.00,
    categoriaNombre: 'Materiales e Insumos',
    comprobanteNumero: 'B002-004921',
    metodoPago: 'Efectivo',
    tipoComprobante: 'Boleta Digital',
    nombreArchivo: 'Boleta_Ferreteria_Norte.jpg',
    pesoArchivo: '1.4 MB',
    ruc: '20549281921',
    estado: 'PENDIENTE',
};

const AuditExpensesScreen: React.FC = () => {
    const navigation = useNavigation();
    const usuario = useAuthStore((state) => state.usuario);
    const isAdmin = usuario?.rol === 'ADMINISTRADOR';

    const handleAprobar = (id: string) => {
        Alert.alert('Aprobar Gasto', `Acción de aprobación para el gasto ${id}`);
    };

    const handleObservar = (id: string) => {
        Alert.alert('Observar Gasto', `Acción de observación para el gasto ${id}`);
    };

    const handleRechazar = (id: string) => {
        Alert.alert('Rechazar Gasto', `Acción de rechazo para el gasto ${id}`);
    };

    const handleVerFoto = (url?: string) => {
        Alert.alert('Visualizar Comprobante', 'Abriendo fotografía o evidencia del comprobante');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar
                title="Auditoría de Gastos"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={stylesComponents.containerApp}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <CardAuditExpense
                    gasto={demoExpense}
                    esAdmin={isAdmin}
                    onAprobar={handleAprobar}
                    onObservar={handleObservar}
                    onRechazar={handleRechazar}
                    onVerFoto={handleVerFoto}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default AuditExpensesScreen;
