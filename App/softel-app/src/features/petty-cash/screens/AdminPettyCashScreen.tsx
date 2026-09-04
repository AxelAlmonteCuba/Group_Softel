import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

import HeaderBar from '@/components/layout/HeaderBar';

interface Props {
    onBack?: () => void;
    onFilterPress?: () => void;
}

/**
 * Pantalla en blanco / lienzo base para "Control de Fondos y Cajas Chicas" (Administrador y Contador).
 * Utiliza HeaderBar reutilizable: [ < ] [ Control de Fondos ] [ Icono Filtro ]
 */
const AdminPettyCashScreen: React.FC<Props> = ({ onBack, onFilterPress }) => {
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera limpia estándar reutilizable */}
            <HeaderBar
                title="Control de Fondos"
                onBack={onBack}
                rightIcon="filter-outline"
                onRightPress={onFilterPress}
            />

            {/* Contenido en blanco listo para diseñar */}
            <ScrollView style={stylesComponents.containerApp}>
                <View
                    style={{
                        padding: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 40,
                    }}
                >
                    <Ionicons name="layers-outline" size={48} color={colors.primary} style={{ marginBottom: 12 }} />
                    <Text style={[stylesTexts.basicTitle, { fontSize: 18 }]}>
                        Gestión Administrativa de Cajas y Reembolsos
                    </Text>
                    <Text style={[stylesTexts.subtitle, { marginTop: 4 }]}>
                        Aquí se implementará el control central de Cajas Chicas, Auditoría de saldos y Cuentas por Pagar.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default AdminPettyCashScreen;
