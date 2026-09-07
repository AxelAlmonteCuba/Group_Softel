import React from 'react';
import { View } from 'react-native';
import { stylesComponents } from '@/theme/styles';
import AmountInput from '../inputs/AmountInput';
import SuggestedAmountsChips from '../inputs/SuggestedAmountsChips';

interface CardRequestAmountProps {
    value?: number;
    onChange?: (amount: number) => void;
    suggestedAmounts?: number[];
}

/**
 * Tarjeta de selección de monto para solicitud de Caja Chica.
 * Compone los submódulos independientes:
 * 1. AmountInput (recuadro de ingreso del monto con prefijo S/ y lápiz de edición)
 * 2. SuggestedAmountsChips (chips de selección rápida)
 */
const CardRequestAmount: React.FC<CardRequestAmountProps> = ({
    value = 1500,
    onChange,
    suggestedAmounts = [500, 1000, 1500, 2000],
}) => {
    return (
        <View style={stylesComponents.cardHistoryContainer}>
            {/* 1. Recuadro de Ingreso de Monto */}
            <AmountInput
                label="MONTO REQUERIDO PARA OPERACIÓN"
                value={value}
                onChange={onChange}
                containerStyle={{ marginBottom: 16 }}
            />

            {/* 2. Fila de Chips de Selección Rápida */}
            <SuggestedAmountsChips
                amounts={suggestedAmounts}
                selectedAmount={value}
                onSelect={(selectedVal) => onChange?.(selectedVal)}
            />
        </View>
    );
};

export default CardRequestAmount;
