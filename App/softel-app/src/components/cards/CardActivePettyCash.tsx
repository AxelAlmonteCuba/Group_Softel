import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';

export interface CardActivePettyCashProps {
    caja: PettyCashResponse;
    obra?: string;
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
 * Obtiene la configuración visual del badge de estado superior.
 */
const getStatusBadgeConfig = (status: string) => {
    switch (status) {
        case 'ABIERTA':
            return {
                label: 'ABIERTA',
                dotColor: colors.success, // #16803C
            };
        case 'SOLICITADA':
            return {
                label: 'SOLICITADA',
                dotColor: colors.warning, // #B7791F
            };
        case 'APROBADA':
            return {
                label: 'APROBADA',
                dotColor: colors.success,
            };
        case 'EN_REVISION':
            return {
                label: 'EN REVISIÓN',
                dotColor: colors.warning,
            };
        default:
            return {
                label: status,
                dotColor: colors.info,
            };
    }
};

/**
 * Tarjeta de Caja Chica Activa / En Operación (Hero Card Financiera).
 * Muestra custodio, estado, métricas de fondo, gasto, saldo disponible
 * y barra de progreso de ejecución del fondo.
 */
const CardActivePettyCash: React.FC<CardActivePettyCashProps> = ({
    caja,
    obra = 'Obra Norte',
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

    const custodioNombre = caja.managerUser
        ? `${caja.managerUser.nombres} ${caja.managerUser.apellidos}`.trim()
        : 'Responsable';

    const statusConfig = getStatusBadgeConfig(caja.status);

    return (
        <View style={{ marginBottom: 12 }}>
            {/* 1. Sub-Header Exterior: Custodio y Badge de Estado */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    paddingHorizontal: 2,
                }}
            >
                {/* Custodio y Obra */}
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Custodio:{' '}
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                        {custodioNombre}
                    </Text>
                    {obra ? ` • ${obra}` : ''}
                </Text>

                {/* Badge de Estado con punto indicador */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        gap: 5,
                    }}
                >
                    <View
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: statusConfig.dotColor,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: colors.info,
                            letterSpacing: 0.3,
                        }}
                    >
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* 2. Hero Card Principal */}
            <View style={stylesComponents.cardHistoryContainer}>
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

                    {/* Badge Disponible en Rojo Suave */}
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
                            S/ {formatMoney(saldoDisponible)}
                        </Text>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: '700',
                                color: colors.primary,
                                lineHeight: 14,
                            }}
                        >
                            Disponible
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
                    <View
                        style={{
                            height: 5,
                            backgroundColor: colors.border,
                            borderRadius: 3,
                            overflow: 'hidden',
                            width: '100%',
                        }}
                    >
                        <View
                            style={{
                                height: '100%',
                                backgroundColor: colors.primary,
                                borderRadius: 3,
                                width: `${Math.min(100, Math.max(0, porcentajeConsumido))}%`,
                            }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default CardActivePettyCash;
