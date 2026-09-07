import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';
import StatusBadge from '@/components/common/StatusBadge';

export interface CardAdminPettyCashProps {
    caja: PettyCashResponse;
    obra?: string;
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
 * Extrae las iniciales del nombre completo (ej: "Juan Pérez" -> "JP").
 */
const getInitials = (nombres?: string, apellidos?: string): string => {
    const n = (nombres || '').trim().charAt(0).toUpperCase();
    const a = (apellidos || '').trim().charAt(0).toUpperCase();
    return `${n}${a}` || 'U';
};



/**
 * Tarjeta de Control de Fondos para Administrador y Contador.
 * Muestra avatar con iniciales, custodio, obra/código, badge de estado,
 * métricas de asignado y gastado, barra de progreso y saldo pendiente.
 */
const CardAdminPettyCash: React.FC<CardAdminPettyCashProps> = ({
    caja,
    obra,
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

    const nombres = caja.managerUser?.nombres || '';
    const apellidos = caja.managerUser?.apellidos || '';
    const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'Responsable';
    const iniciales = getInitials(nombres, apellidos);

    const cargo = caja.managerUser?.cargo || 'Supervisor';
    const detalleObra = obra || caja.justification || 'Obra Norte';
    const codigo = `HCC-${caja.id.substring(0, 4).toUpperCase()}`;
    const subtitulo = `${cargo} ${detalleObra} • ${codigo}`;

    // Etiqueta del saldo inferior según el estado
    let labelSaldo = 'Saldo por devolver: ';
    if (caja.status === 'ABIERTA') {
        labelSaldo = 'Saldo disponible: ';
    } else if (caja.status === 'SOLICITADA') {
        labelSaldo = 'Monto solicitado: ';
    } else if (caja.status === 'LIQUIDADA') {
        labelSaldo = 'Saldo final liquidado: ';
    }

    return (
        <TouchableOpacity
            style={stylesComponents.cardHistoryContainer}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {/* 1. Cabecera: Avatar con iniciales, Nombre, Subtítulo y Badge de Estado */}
            <View style={[stylesComponents.rowBetween, { marginBottom: 14 }]}>
                <View style={stylesComponents.cardInfoCol}>
                    {/* Avatar circular con fondo rojo e iniciales */}
                    <View style={stylesComponents.cardAvatarInitials}>
                        <Text style={[stylesTexts.textButtonPrimary, { fontWeight: '700' }]}>{iniciales}</Text>
                    </View>

                    {/* Nombre y Cargo/Obra */}
                    <View style={{ flex: 1 }}>
                        <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                            {nombreCompleto}
                        </Text>
                        <Text style={[stylesTexts.cardProfileRole, { marginBottom: 0 }]} numberOfLines={1}>
                            {subtitulo}
                        </Text>
                    </View>
                </View>

                {/* Badge de Estado Reutilizable unificado con el detalle */}
                <StatusBadge status={caja.status} />
            </View>

            {/* 2. Caja de Métricas Central (Gris suave) */}
            <View style={stylesComponents.cardMetricsBox}>
                <View style={[stylesComponents.rowBetween, { alignItems: 'flex-start' }]}>
                    {/* Monto Asignado */}
                    <View>
                        <Text
                            style={[
                                stylesTexts.litleTitle,
                                {
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    marginBottom: 4,
                                },
                            ]}
                        >
                            ASIGNADO
                        </Text>
                        <Text
                            style={[
                                stylesTexts.basicTitle,
                                {
                                    fontSize: 18,
                                    textAlign: 'left',
                                    marginBottom: 0,
                                },
                            ]}
                        >
                            S/ {formatMoney(fondoBase)}
                        </Text>
                    </View>

                    {/* Monto Gastado con Porcentaje */}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text
                            style={[
                                stylesTexts.litleTitle,
                                {
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    marginBottom: 4,
                                    textAlign: 'right',
                                },
                            ]}
                        >
                            GASTADO ({formattedPercent}%)
                        </Text>
                        <Text
                            style={[
                                stylesTexts.basicTitle,
                                {
                                    fontSize: 18,
                                    color: colors.primary,
                                    textAlign: 'right',
                                    marginBottom: 0,
                                },
                            ]}
                        >
                            S/ {formatMoney(gastado)}
                        </Text>
                    </View>
                </View>

                {/* Barra de Progreso de Gasto */}
                <View style={stylesComponents.progressBarTrack}>
                    <View
                        style={[
                            stylesComponents.progressBarFill,
                            { width: `${porcentajeConsumido}%` },
                        ]}
                    />
                </View>
            </View>

            {/* 3. Pie de Tarjeta: Saldo pendiente y Botón Chevron */}
            <View style={stylesComponents.rowBetween}>
                <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]}>
                    {labelSaldo}
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                        S/ {formatMoney(saldoDisponible)}
                    </Text>
                </Text>

                <View style={stylesComponents.chevronButton}>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CardAdminPettyCash;
