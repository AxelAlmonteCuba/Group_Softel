import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';

import HeaderBar from '@/components/layout/HeaderBar';
import CardEmptyPettyCash from '@/components/cards/CardEmptyPettyCash';
import CardActivePettyCash from '@/components/cards/CardActivePettyCash';
import CardHistoryPettyCash, { HistoryPettyCashItem } from '@/components/cards/CardHistoryPettyCash';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

interface Props {
    onBack?: () => void;
    onHistoryPress?: () => void;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla para "Mi Caja Chica" (Supervisor y Trabajador).
 * Conectada al backend: verifica si el usuario tiene caja abierta y muestra condicionalmente
 * la tarjeta de solicitud o el aviso de caja abierta.
 * El historial solo se visualiza si el usuario tiene cajas anteriores registradas.
 */
const OperatorPettyCashScreen: React.FC<Props> = ({ onBack, onHistoryPress }) => {
    const navigation = useNavigation<NavigationProp>();
    const usuario = useAuthStore((state) => state.usuario);
    const [loading, setLoading] = useState(true);
    const [cajaEnProceso, setCajaEnProceso] = useState<PettyCashResponse | null>(null);
    const [historyCajas, setHistoryCajas] = useState<HistoryPettyCashItem[]>([]);

    const fetchCajas = useCallback(async () => {
        if (!usuario?.id) return;
        try {
            setLoading(true);
            const data = await pettyCashService.getByUser(usuario.id);

            // 1. Verificar si existe alguna caja en proceso (cualquier estado menos CERRADA, LIQUIDADA o RECHAZADA)
            // Estados activos/en proceso: SOLICITADA, APROBADA, ABIERTA, EN_REVISION
            const enProceso = data.find(
                (c) => c.status !== 'CERRADA' && c.status !== 'LIQUIDADA' && c.status !== 'RECHAZADA'
            ) ?? null;
            setCajaEnProceso(enProceso);

            // 2. Filtrar solo cajas finalizadas o históricas para la sección de historial
            // Cajas finalizadas/pasadas: CERRADA, LIQUIDADA, RECHAZADA
            const cerradas = data.filter(
                (c) => c.status === 'CERRADA' || c.status === 'LIQUIDADA' || c.status === 'RECHAZADA'
            );

            // Transformar al formato HistoryPettyCashItem
            const transformedHistory: HistoryPettyCashItem[] = cerradas.map((c) => {
                const fondo = Number(c.assignedAmount) || 0;
                const saldoActual = Number(c.currentBalance) || 0;
                const gastadoCalculado = Math.max(0, fondo - saldoActual);
                const devueltoCalculado = Math.max(0, saldoActual);

                const fechaAperturaFmt = c.openingDate
                    ? new Date(c.openingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                    : new Date(c.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
                const fechaCierreFmt = c.closingDate
                    ? new Date(c.closingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'En curso';

                return {
                    id: c.id,
                    codigo: `HCC-${c.id.substring(0, 4).toUpperCase()}`,
                    obraOProyecto: 'Obra Telecomunicaciones Norte',
                    fechaInicio: fechaAperturaFmt,
                    fechaFin: fechaCierreFmt,
                    estado: c.status,
                    fondoBase: fondo,
                    gastado: gastadoCalculado,
                    devuelto: devueltoCalculado,
                    comprobantesCount: 0,
                };
            });

            setHistoryCajas(transformedHistory);
        } catch (error) {
            console.log('Error al consultar cajas chicas del usuario:', error);
            setHistoryCajas([]);
        } finally {
            setLoading(false);
        }
    }, [usuario?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchCajas();
        }, [fetchCajas])
    );

    const handleSolicitarApertura = () => {
        navigation.navigate('RequestPettyCash');
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
                {/* 1. Validación de Caja en Proceso */}
                {loading ? (
                    <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : cajaEnProceso ? (
                    <View style={{ marginTop: 4, marginBottom: 12 }}>
                        <CardActivePettyCash caja={cajaEnProceso} />
                    </View>
                ) : (
                    <View style={{ marginTop: 4, marginBottom: 24 }}>
                        <CardEmptyPettyCash onPressRequest={handleSolicitarApertura} />
                    </View>
                )}

                {/* 2. Cabecera y Lista de Historial: SOLO se muestran si existen cajas pasadas */}
                {historyCajas.length > 0 && (
                    <>
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
                                        {historyCajas.length}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[stylesTexts.cardProfileRole, { fontSize: 15, marginBottom: 0 }]}>
                                2026
                            </Text>
                        </View>

                        {/* Lista de Tarjetas de Historial */}
                        {historyCajas.map((caja) => (
                            <CardHistoryPettyCash
                                key={caja.id}
                                data={caja}
                                onPressDetail={handlePressDetail}
                            />
                        ))}
                    </>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

export default OperatorPettyCashScreen;

