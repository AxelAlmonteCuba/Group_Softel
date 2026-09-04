import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

import HeaderBar from '@/components/layout/HeaderBar';
import CardEmptyPettyCash from '@/components/cards/CardEmptyPettyCash';
import CardHistoryPettyCash, { HistoryPettyCashItem } from '@/components/cards/CardHistoryPettyCash';

interface Props {
    onBack?: () => void;
    onHistoryPress?: () => void;
}

// Datos de demostración de cajas asignadas en diferentes estados
const MOCK_HISTORY_CAJAS: HistoryPettyCashItem[] = [
    {
        id: 'hcc-004',
        codigo: 'HCC-2026-004',
        obraOProyecto: 'Obra Telecomunicaciones Norte',
        fechaInicio: '01 Sep 2026',
        fechaFin: '15 Sep 2026',
        estado: 'LIQUIDADA',
        fondoBase: 1500.0,
        gastado: 1250.0,
        devuelto: 250.0,
        comprobantesCount: 4,
    },
    {
        id: 'hcc-003',
        codigo: 'HCC-2026-003',
        obraOProyecto: 'Mantenimiento Red Sur',
        fechaInicio: '15 Ago 2026',
        fechaFin: '31 Ago 2026',
        estado: 'EN_REVISION',
        fondoBase: 1200.0,
        gastado: 950.0,
        devuelto: 250.0,
        comprobantesCount: 5,
    },
    {
        id: 'hcc-002',
        codigo: 'HCC-2026-002',
        obraOProyecto: 'Instalación Nodos Fibra Este',
        fechaInicio: '01 Ago 2026',
        fechaFin: '14 Ago 2026',
        estado: 'RECHAZADA',
        fondoBase: 800.0,
        gastado: 0.0,
        devuelto: 800.0,
        comprobantesCount: 0,
    },
    {
        id: 'hcc-001',
        codigo: 'HCC-2026-001',
        obraOProyecto: 'Torre Central Lima',
        fechaInicio: '15 Jul 2026',
        fechaFin: '31 Jul 2026',
        estado: 'CERRADA',
        fondoBase: 2000.0,
        gastado: 1800.0,
        devuelto: 200.0,
        comprobantesCount: 8,
    },
];

/**
 * Pantalla para "Mi Caja Chica" (Supervisor y Trabajador).
 * Escenario: Sin caja chica activa / solicitar fondo + Historial de cajas asignadas.
 */
const OperatorPettyCashScreen: React.FC<Props> = ({ onBack, onHistoryPress }) => {
    const handleSolicitarApertura = () => {
        // Acción al presionar solicitar apertura
    };

    const handlePressDetail = (item: HistoryPettyCashItem) => {
        console.log('Ver detalle de caja:', item.codigo);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera limpia estándar reutilizable */}
            <HeaderBar
                title="Mi Caja Chica"
                onBack={onBack}
                rightIcon="time-outline"
                onRightPress={onHistoryPress}
            />

            {/* Contenido de la pantalla */}
            <ScrollView style={stylesComponents.containerApp} showsVerticalScrollIndicator={false}>
                {/* 1. Tarjeta de Solicitud de Fondo (Sin Caja Activa) */}
                <View style={{ marginTop: 4, marginBottom: 24 }}>
                    <CardEmptyPettyCash onPressRequest={handleSolicitarApertura} />
                </View>

                {/* 2. Cabecera de Sección: Historial de Cajas Asignadas */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                        paddingHorizontal: 2,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[stylesTexts.textCardOptionTitle, { fontSize: 17, marginBottom: 0 }]}>
                            Historial de Cajas Asignadas
                        </Text>
                        <View
                            style={{
                                backgroundColor: colors.border,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={[stylesTexts.litleTitle, { fontSize: 11, marginBottom: 0, color: colors.textPrimary }]}>
                                {MOCK_HISTORY_CAJAS.length}
                            </Text>
                        </View>
                    </View>

                    <Text style={[stylesTexts.cardProfileRole, { fontSize: 15, marginBottom: 0 }]}>
                        2026
                    </Text>
                </View>

                {/* 3. Lista de Tarjetas de Historial */}
                {MOCK_HISTORY_CAJAS.map((caja) => (
                    <CardHistoryPettyCash
                        key={caja.id}
                        data={caja}
                        onPressDetail={handlePressDetail}
                    />
                ))}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

export default OperatorPettyCashScreen;
