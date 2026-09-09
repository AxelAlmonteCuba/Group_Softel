import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

import StatusBadge from '@/components/common/StatusBadge';

export interface CardAuditExpenseHeaderProps {
    motivo: string;
    categoriaNombre?: string;
    comprobanteNumero?: string;
    estado?: string;
}

/**
 * Resuelve el icono según la categoría del gasto.
 */
const getCategoryIcon = (categoria?: string): keyof typeof Ionicons.glyphMap => {
    if (!categoria) return 'receipt-outline';
    const cat = categoria.toLowerCase();
    if (cat.includes('material') || cat.includes('herramienta') || cat.includes('cinta') || cat.includes('conector')) {
        return 'construct-outline';
    }
    if (cat.includes('movil') || cat.includes('pasaje') || cat.includes('transporte')) {
        return 'bus-outline';
    }
    if (cat.includes('combus') || cat.includes('gasolina') || cat.includes('petroleo')) {
        return 'speedometer-outline';
    }
    if (cat.includes('viático') || cat.includes('viatico') || cat.includes('alimento')) {
        return 'restaurant-outline';
    }
    return 'receipt-outline';
};

/**
 * Parte 1: Cabecera de la Tarjeta de Auditoría de Gasto.
 * Reutiliza los estilos centralizados de stylesComponents y stylesTexts.
 */
export const CardAuditExpenseHeader: React.FC<CardAuditExpenseHeaderProps> = ({
    motivo,
    categoriaNombre = 'Materiales e Insumos',
    comprobanteNumero,
    estado,
}) => {
    const iconName = getCategoryIcon(categoriaNombre);

    return (
        <View style={stylesComponents.cardAuditHeaderContainer}>
            {/* 1. Fila Superior: Motivo del gasto a la izquierda y StatusBadge en la parte superior derecha */}
            <View style={stylesComponents.cardAuditHeaderTopRow}>
                <Text style={[stylesTexts.textCardOptionTitle, stylesComponents.cardAuditMotivo]}>
                    {motivo}
                </Text>
                {Boolean(estado) && (
                    <StatusBadge status={estado} />
                )}
            </View>

            {/* 2. Fila de Tags: Categoría con icono + Nro de Comprobante */}
            <View style={stylesComponents.cardAuditTagsRow}>
                {/* Pastilla de Categoría */}
                <View style={stylesComponents.cardAuditCategoryPill}>
                    <Ionicons name={iconName} size={15} color={colors.textSecondary} />
                    <Text style={[stylesTexts.badgeText, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {categoriaNombre}
                    </Text>
                </View>

                {/* Código / Serie de Comprobante (opcional) */}
                {Boolean(comprobanteNumero) && (
                    <Text style={[stylesTexts.cardProfileRole, { marginBottom: 0, letterSpacing: 0.5 }]}>
                        {comprobanteNumero}
                    </Text>
                )}
            </View>
        </View>
    );
};

export default CardAuditExpenseHeader;
