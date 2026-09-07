import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';

export interface CardAmountsPettyCashProps {
    caja: PettyCashResponse;
    onPress?: () => void;
}

/**
 * Formatea un número a formato monetario (ej: 1,500.00).
 */
const formatMoney = (val: number): string => {
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Tarjeta de Métricas y Montos Financieros de la Caja Chica.
 * Muestra el fondo asignado, saldo disponible, desglose en 3 cajas métricas
 * (fondo base, gastado, saldo disp.) y barra de progreso de ejecución del fondo.
 */
const CardAmountsPettyCash: React.FC<CardAmountsPettyCashProps> = ({
    caja,
    onPress,
}) => {
    const fondoBase = Number(caja.assignedAmount) || 0;
    const saldoDisponible = Number(caja.currentBalance) || 0;
    const gastado = Math.max(0, fondoBase - saldoDisponible);
    const porcentajeConsumido = fondoBase > 0
        ? Math.min(100, Math.max(0, (gastado / fondoBase) * 100))
        : 0;

    const formattedPercent = porcentajeConsumido % 1 === 0
        ? porcentajeConsumido.toFixed(0)
        : porcentajeConsumido.toFixed(1);

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            style={stylesComponents.cardHistoryContainer}
            {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}
        >
            {/* Fila Superior: Fondo Asignado y Badge de Saldo Disponible */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                }}
            >
                {/* Icono de billetera y Monto Asignado */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name="wallet-outline" size={24} color={colors.textPrimary} />
                    <View>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '700',
                                color: colors.textSecondary,
                                letterSpacing: 0.4,
                            }}
                        >
                            FONDO ASIGNADO: S/
                        </Text>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                color: colors.textPrimary,
                            }}
                        >
                            {formatMoney(fondoBase)}
                        </Text>
                    </View>
                </View>

                {/* Badge de Porcentaje Ejecutado en Rojo Softel (coherente con el gasto) */}
                <View
                    style={{
                        backgroundColor: colors.primarySoft,
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: colors.primary,
                            lineHeight: 16,
                        }}
                    >
                        {formattedPercent}%
                    </Text>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: colors.primary,
                            lineHeight: 14,
                        }}
                    >
                        Ejecutado
                    </Text>
                </View>
            </View>

            {/* Fila Intermedia: Métricas en 3 cajas */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                {/* Caja 1: Fondo Base */}
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: colors.textSecondary,
                            marginBottom: 4,
                        }}
                    >
                        FONDO BASE
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: colors.textPrimary,
                        }}
                    >
                        S/ {formatMoney(fondoBase)}
                    </Text>
                </View>

                {/* Caja 2: Gastado (Rojo Softel) */}
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.primarySoft,
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: colors.primary,
                            marginBottom: 4,
                        }}
                    >
                        GASTADO
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: colors.primary,
                        }}
                    >
                        S/ {formatMoney(gastado)}
                    </Text>
                </View>

                {/* Caja 3: Saldo Disponible */}
                <View
                    style={{
                        flex: 1,
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: colors.textSecondary,
                            marginBottom: 4,
                        }}
                    >
                        SALDO DISP.
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: colors.textPrimary,
                        }}
                    >
                        S/ {formatMoney(saldoDisponible)}
                    </Text>
                </View>
            </View>

            {/* Fila Inferior: Barra de Progreso de Ejecución */}
            <View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                    }}
                >
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        Ejecución del fondo
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: colors.primary,
                        }}
                    >
                        {formattedPercent}% consumido
                    </Text>
                </View>

                {/* Barra de progreso */}
                <View style={stylesComponents.progressBarTrack}>
                    <View
                        style={[
                            stylesComponents.progressBarFill,
                            { width: `${Math.min(100, Math.max(0, porcentajeConsumido))}%` },
                        ]}
                    />
                </View>
            </View>
        </CardWrapper>
    );
};

export default CardAmountsPettyCash;
