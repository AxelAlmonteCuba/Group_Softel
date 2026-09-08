import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import { stylesComponents } from '@/theme/styles';

export type ExpenseSourceType = 'caja_chica' | 'reembolso';

export interface ExpenseSourceSelectorProps {
    selectedSource: ExpenseSourceType;
    onSourceChange: (source: ExpenseSourceType) => void;
    hasActivePettyCash?: boolean;
    pettyCashName?: string;
    directRefundLabel?: string;
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Selector de origen de gasto:
 * Reutiliza directamente ButtonPrimary y ButtonSecondary con variante 'small'.
 * Si no hay caja chica activa, bloquea la opción y marca Reembolso Directo.
 */
const ExpenseSourceSelector: React.FC<ExpenseSourceSelectorProps> = ({
    selectedSource,
    onSourceChange,
    hasActivePettyCash = true,
    pettyCashName = 'Caja Chica Activa',
    directRefundLabel = 'Reembolso Directo',
    containerStyle,
}) => {
    const isPettyCash = hasActivePettyCash && selectedSource === 'caja_chica';

    return (
        <View style={[stylesComponents.expenseSourceRow, containerStyle]}>
            {/* Opción 1: Caja Chica Activa */}
            <View style={stylesComponents.flex1}>
                {isPettyCash ? (
                    <ButtonPrimary
                        text={pettyCashName}
                        iconName="wallet-outline"
                        size="small"
                        numberOfLines={1}
                        onPress={() => onSourceChange('caja_chica')}
                    />
                ) : (
                    <ButtonSecondary
                        text={pettyCashName}
                        iconName="wallet-outline"
                        size="small"
                        numberOfLines={1}
                        disabled={!hasActivePettyCash}
                        onPress={() => {
                            if (hasActivePettyCash) {
                                onSourceChange('caja_chica');
                            }
                        }}
                    />
                )}
            </View>

            {/* Opción 2: Reembolso Directo */}
            <View style={stylesComponents.flex1}>
                {!isPettyCash ? (
                    <ButtonPrimary
                        text={directRefundLabel}
                        iconName="sync-outline"
                        size="small"
                        numberOfLines={1}
                        disabled={!hasActivePettyCash}
                        onPress={() => onSourceChange('reembolso')}
                    />
                ) : (
                    <ButtonSecondary
                        text={directRefundLabel}
                        iconName="sync-outline"
                        size="small"
                        numberOfLines={1}
                        onPress={() => onSourceChange('reembolso')}
                    />
                )}
            </View>
        </View>
    );
};

export default ExpenseSourceSelector;

