import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';
import StatusBadge from '@/components/common/StatusBadge';

export interface CardDetailPettyCashProps {
    caja?: PettyCashResponse | null;
    codigo?: string;
    nombreCompleto?: string;
    subtitulo?: string;
    fechaApertura?: string;
    auditor?: string;
    iniciales?: string;
}

/**
 * Formatea una fecha ISO a formato abreviado legible (ej: 01 Sep 2026).
 */
const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '01 Sep 2026';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    } catch {
        return dateString;
    }
};

/**
 * Extrae las iniciales del nombre (ej: "Juan Pérez" -> "JP").
 */
const getInitials = (nombres?: string, apellidos?: string): string => {
    const n = (nombres || '').trim().charAt(0).toUpperCase();
    const a = (apellidos || '').trim().charAt(0).toUpperCase();
    return `${n}${a}` || 'JP';
};



/**
 * Tarjeta de Cabecera / Información de la Caja Chica en la pantalla de detalle.
 * Muestra avatar de custodio, nombre, cargo, chip de estado con color, fecha de apertura y auditor asignado.
 */
const CardDetailPettyCash: React.FC<CardDetailPettyCashProps> = ({
    caja,
    codigo,
    nombreCompleto,
    subtitulo,
    fechaApertura,
    auditor,
    iniciales,
}) => {
    // Datos derivados de la entidad o valores por defecto
    const managerNombres = caja?.managerUser?.nombres || '';
    const managerApellidos = caja?.managerUser?.apellidos || '';
    const derivedNombre = `${managerNombres} ${managerApellidos}`.trim() || 'Juan Pérez';
    const finalNombre = nombreCompleto || derivedNombre;

    const derivedInitials = getInitials(managerNombres, managerApellidos);
    const finalInitials = iniciales || derivedInitials;

    const cargo = caja?.managerUser?.cargo || 'Supervisor';
    const obra = caja?.justification || 'Obra Norte';
    const finalCodigo = codigo || (caja?.id ? `HCC-${caja.id.substring(0, 8).toUpperCase()}` : 'HCC-2026-004');
    const finalSubtitulo = subtitulo || `${cargo} de ${obra} • ${finalCodigo}`;

    const finalFechaApertura = fechaApertura || formatDate(caja?.openingDate || caja?.createdAt);

    const evaluatorNombre = caja?.evaluatorUser
        ? `${caja.evaluatorUser.nombres} ${caja.evaluatorUser.apellidos}`.trim()
        : 'Admin Softel';
    const finalAuditor = auditor || evaluatorNombre;

    return (
        <View style={stylesComponents.cardHistoryContainer}>
            {/* 1. Cabecera: Avatar, Nombre/Cargo y Chip de Estado */}
            <View style={stylesComponents.rowBetween}>
                <View style={stylesComponents.cardInfoCol}>
                    {/* Avatar Circular con iniciales en color primario */}
                    <View style={stylesComponents.cardAvatarInitials}>
                        <Text style={[stylesTexts.textButtonPrimary, { fontWeight: '700' }]}>
                            {finalInitials}
                        </Text>
                    </View>

                    {/* Nombre y Cargo con Código */}
                    <View style={{ flex: 1 }}>
                        <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                            {finalNombre}
                        </Text>
                        <Text style={[stylesTexts.cardProfileRole, { marginBottom: 0 }]} numberOfLines={1}>
                            {finalSubtitulo}
                        </Text>
                    </View>
                </View>

                {/* Chip / Badge de Estado reutilizable */}
                <StatusBadge status={caja?.status} />
            </View>

            {/* 2. Divisor punteado / discontinuo */}
            <View style={stylesComponents.dividerDashed} />

            {/* 3. Pie: Fecha de Apertura y Auditor Asignado */}
            <View style={stylesComponents.rowBetween}>
                {/* Fecha de Apertura */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
                    <Text style={[stylesTexts.cardProfileRole, { fontSize: 12, marginBottom: 0 }]}>
                        Apertura:{' '}
                        <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>
                            {finalFechaApertura}
                        </Text>
                    </Text>
                </View>

                {/* Separador punto */}
                <Text style={{ color: colors.border, fontSize: 14 }}>•</Text>

                {/* Auditor */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="shield-checkmark-outline" size={15} color={colors.textSecondary} />
                    <Text style={[stylesTexts.cardProfileRole, { fontSize: 12, marginBottom: 0 }]}>
                        Auditor:{' '}
                        <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>
                            {finalAuditor}
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default CardDetailPettyCash;
