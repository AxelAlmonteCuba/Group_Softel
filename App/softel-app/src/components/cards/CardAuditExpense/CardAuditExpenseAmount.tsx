import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface CardAuditExpenseAmountProps {
    monto: number;
    metodoPago?: string;
    tipoComprobante?: string;
    moneda?: string;
}

/**
 * Parte 2: Recuadro de Importe Solicitado de la Tarjeta de Auditoría.
 * Reutiliza los estilos centralizados de stylesComponents y stylesTexts.
 */
export const CardAuditExpenseAmount: React.FC<CardAuditExpenseAmountProps> = ({
    monto,
    metodoPago = 'Efectivo',
    tipoComprobante = 'Boleta Digital',
    moneda = 'S/',
}) => {
    const montoFormateado = Number(monto || 0).toFixed(2);
    const chipText = `${metodoPago} • ${tipoComprobante}`;

    return (
        <View style={stylesComponents.cardAuditAmountBox}>
            {/* Columna Izquierda: Etiqueta y Monto Grande */}
            <View>
                <Text style={[stylesTexts.litleTitle, { marginBottom: 4, letterSpacing: 0.6 }]}>
                    IMPORTE SOLICITADO
                </Text>
                <Text style={[stylesTexts.cardHomeValue, { color: colors.textPrimary, textAlign: 'left', marginBottom: 0 }]}>
                    {moneda} {montoFormateado}
                </Text>
            </View>

            {/* Pastilla Derecha: Método y Tipo de Comprobante */}
            <View style={stylesComponents.cardAuditAmountBadge}>
                <Text style={[stylesTexts.badgeText, { color: colors.textSecondary, fontWeight: '600' }]}>
                    {chipText}
                </Text>
            </View>
        </View>
    );
};

export default CardAuditExpenseAmount;
