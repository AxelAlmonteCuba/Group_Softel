import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';

import HeaderBar from '@/components/layout/HeaderBar';
import CardEmptyPettyCash from '@/components/cards/CardEmptyPettyCash';
import CardHistoryPettyCash, { HistoryPettyCashItem } from '@/components/cards/CardHistoryPettyCash';
import { pettyCashService, PettyCashResponse } from '../services/pettyCashService';

interface Props {
    onBack?: () => void;
    onHistoryPress?: () => void;
}

/**
 * Pantalla para "Mi Caja Chica" (Supervisor y Trabajador).
 * Conectada al backend: verifica si el usuario tiene caja abierta y muestra condicionalmente
 * la tarjeta de solicitud o el aviso de caja abierta.
 * El historial solo se visualiza si el usuario tiene cajas anteriores registradas.
 */
const OperatorPettyCashScreen: React.FC<Props> = ({ onBack, onHistoryPress }) => {
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

            // 2. Las cajas finalizadas (CERRADA, LIQUIDADA, RECHAZADA) pasan al historial
            const pasadas = data.filter(
                (c) => c.status === 'CERRADA' || c.status === 'LIQUIDADA' || c.status === 'RECHAZADA'
            );
            if (pasadas.length > 0) {
                const mapeadas: HistoryPettyCashItem[] = pasadas.map((c, idx) => ({
                    id: c.id,
                    codigo: `HCC-${new Date(c.createdAt).getFullYear()}-${String(pasadas.length - idx).padStart(3, '0')}`,
                    obraOProyecto: 'Fondo Asignado',
                    fechaInicio: c.openingDate ? new Date(c.openingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha',
                    fechaFin: c.closingDate ? new Date(c.closingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Liquidada',
                    estado: c.status,
                    fondoBase: Number(c.assignedAmount) || 0,
                    gastado: Math.max(0, (Number(c.assignedAmount) || 0) - (Number(c.currentBalance) || 0)),
                    devuelto: Math.max(0, Number(c.finalBalance) || 0),
                    comprobantesCount: 0,
                }));
                setHistoryCajas(mapeadas);
            } else {
                setHistoryCajas([]);
            }
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
                {/* 1. Validación de Caja en Proceso */}
                {loading ? (
                    <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : cajaEnProceso ? (
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            paddingVertical: 20,
                            paddingHorizontal: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 4,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Text style={[stylesTexts.basicTitle, { fontSize: 18, marginBottom: 4 }]}>
                            {cajaEnProceso.status === 'ABIERTA'
                                ? 'caja chica abierta'
                                : cajaEnProceso.status === 'SOLICITADA'
                                ? 'caja chica solicitada'
                                : cajaEnProceso.status === 'APROBADA'
                                ? 'caja chica aprobada'
                                : 'caja chica en revisión'}
                        </Text>
                        <Text style={[stylesTexts.subtitle, { marginBottom: 0 }]}>
                            Fondo: S/ {Number(cajaEnProceso.assignedAmount).toFixed(2)} • Estado: {cajaEnProceso.status}
                        </Text>
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

