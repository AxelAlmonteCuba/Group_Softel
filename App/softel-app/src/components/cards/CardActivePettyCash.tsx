import React from 'react';
import { View } from 'react-native';
import { PettyCashResponse } from '@/features/petty-cash/services/pettyCashService';
import CardCustodianStatus from './CardCustodianStatus';
import CardAmountsPettyCash from './CardAmountsPettyCash';

export interface CardActivePettyCashProps {
    caja: PettyCashResponse;
    justification?: string;
    onPress?: () => void;
}

/**
 * Componente compuesto de Caja Chica Activa para la vista del Operador.
 * Agrupa el sub-header de custodio/estado y la tarjeta de montos financieros.
 */
const CardActivePettyCash: React.FC<CardActivePettyCashProps> = ({
    caja,
    justification,
    onPress,
}) => {
    return (
        <View style={{ marginBottom: 12 }}>
            {/* 1. Sub-Header Exterior: Custodio, Justificación/Movilidad y Estado */}
            <CardCustodianStatus caja={caja} justification={justification} />

            {/* 2. Tarjeta Hero con los datos de montos y barra de ejecución */}
            <CardAmountsPettyCash caja={caja} onPress={onPress} />
        </View>
    );
};

export default CardActivePettyCash;
