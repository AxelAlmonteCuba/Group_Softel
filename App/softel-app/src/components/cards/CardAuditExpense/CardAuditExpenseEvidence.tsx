import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface CardAuditExpenseEvidenceProps {
    nombreArchivo?: string;
    pesoArchivo?: string;
    ruc?: string;
    tipoComprobante?: string;
    urlComprobante?: string;
    onPressVerFoto?: (url?: string) => void;
}

/**
 * Extrae un nombre de archivo limpio de una URL o genera uno por defecto.
 */
const getCleanFilename = (url?: string, defaultName = 'Boleta_Comprobante.jpg'): string => {
    if (!url) return defaultName;
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    return last && last.includes('.') ? last : defaultName;
};

/**
 * Parte 3: Recuadro de Evidencia Fotográfica / Comprobante de la Tarjeta de Auditoría.
 * Reutiliza los estilos centralizados de stylesComponents y stylesTexts.
 */
export const CardAuditExpenseEvidence: React.FC<CardAuditExpenseEvidenceProps> = ({
    nombreArchivo,
    pesoArchivo = '1.4 MB',
    ruc,
    tipoComprobante = 'BOLETA',
    urlComprobante,
    onPressVerFoto,
}) => {
    const filename = nombreArchivo || getCleanFilename(urlComprobante, 'Boleta_Comprobante.jpg');
    const metadataText = ruc ? `${pesoArchivo} • RUC: ${ruc}` : pesoArchivo;

    return (
        <View style={stylesComponents.cardAuditEvidenceBox}>
            {/* 1. Miniatura Oscura con Icono y Tipo */}
            <View style={stylesComponents.cardAuditEvidenceThumb}>
                <Ionicons name="receipt-outline" size={20} color={colors.textOnPrimary} />
                <Text style={[stylesTexts.badgeText, { color: colors.textOnPrimary, fontSize: 8, fontWeight: '800', letterSpacing: 0.6, marginTop: 2 }]}>
                    {tipoComprobante.toUpperCase()}
                </Text>
            </View>

            {/* 2. Información del Archivo (Nombre y Metadatos) */}
            <View style={stylesComponents.flex1}>
                <Text numberOfLines={1} style={[stylesTexts.textCardOptionTitle, { marginBottom: 0 }]}>
                    {filename}
                </Text>
                <Text numberOfLines={1} style={[stylesTexts.cardProfileRole, { marginBottom: 0, marginTop: 3 }]}>
                    {metadataText}
                </Text>
            </View>

            {/* 3. Botón de Acción "Ver foto" con Ojo */}
            <TouchableOpacity
                onPress={() => onPressVerFoto?.(urlComprobante)}
                activeOpacity={0.7}
                style={stylesComponents.cardAuditEvidenceAction}
            >
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[stylesTexts.photoEvidenceChangeBtnText, { fontSize: 12, lineHeight: 14, textAlign: 'right' }]}>
                        {'Ver\nfoto'}
                    </Text>
                </View>
                <Ionicons name="eye-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

export default CardAuditExpenseEvidence;
