import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import SegmentedDualButton, { DualOption } from '@/components/buttons/SegmentedDualButton';

export type ExpenseSourceType = 'caja_chica' | 'reembolso';

export interface ExpenseSourceSelectorProps {
    selectedSource: ExpenseSourceType;
    onSourceChange: (source: ExpenseSourceType) => void;
    hasActivePettyCash?: boolean;
    pettyCashName?: string;
    directRefundLabel?: string;
    variant?: 'capsule' | 'buttons';
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Selector de origen de gasto:
 * Especialización de SegmentedDualButton para el flujo de registro de gastos.
 * Si no hay caja chica activa, bloquea la opción y marca Reembolso Directo.
 */
const ExpenseSourceSelector: React.FC<ExpenseSourceSelectorProps> = ({
    selectedSource,
    onSourceChange,
    hasActivePettyCash = true,
    pettyCashName = 'Caja Chica Activa',
    directRefundLabel = 'Reembolso Directo',
    variant = 'buttons',
    containerStyle,
}) => {
    const options: [DualOption<ExpenseSourceType>, DualOption<ExpenseSourceType>] = [
        {
            value: 'caja_chica',
            label: pettyCashName,
            iconName: 'wallet-outline',
            disabled: !hasActivePettyCash,
        },
        {
            value: 'reembolso',
            label: directRefundLabel,
            iconName: 'sync-outline',
        },
    ];

    return (
        <SegmentedDualButton<ExpenseSourceType>
            options={options}
            selectedValue={selectedSource}
            onSelect={(source) => {
                if (source === 'caja_chica' && !hasActivePettyCash) return;
                onSourceChange(source);
            }}
            variant={variant}
            containerStyle={containerStyle}
        />
    );
};

export default ExpenseSourceSelector;
export { SegmentedDualButton, DualOption };
