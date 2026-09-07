import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';
import StatusBadge from '@/components/common/StatusBadge';

export interface CardCustodianStatusProps {
    caja: PettyCashResponse;
    justification?: string;
    containerStyle?: ViewStyle;
}



/**
 * Sub-Header de Custodio, Justificación/Movilidad y Badge de Estado.
 * Muestra el responsable de la caja chica, su justificación operativa y estado actual.
 */
const CardCustodianStatus: React.FC<CardCustodianStatusProps> = ({
    caja,
    justification,
    containerStyle,
}) => {
    const custodioNombre = caja.managerUser
        ? `${caja.managerUser.nombres} ${caja.managerUser.apellidos}`.trim()
        : 'Responsable';

    const textoJustificacion = justification || caja.justification;

    return (
        <View
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    paddingHorizontal: 2,
                },
                containerStyle,
            ]}
        >
            {/* Columna Izquierda: Custodio en línea 1 y Justificación en línea 2 */}
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
                    Custodio:{' '}
                    <Text style={{ fontWeight: '700', color: colors.textPrimary }}>
                        {custodioNombre}
                    </Text>
                </Text>

                {textoJustificacion ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                        <Ionicons name="document-text-outline" size={13} color={colors.textSecondary} />
                        <Text
                            style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}
                            numberOfLines={1}
                        >
                            {textoJustificacion}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Badge de Estado reutilizable con los colores oficiales del sistema */}
            <StatusBadge status={caja.status} />
        </View>
    );
};

export default CardCustodianStatus;
