import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts } from '@/theme/styles';

export interface SuggestedAmountsChipsProps {
    amounts?: number[];
    selectedAmount?: number;
    onSelect: (amount: number) => void;
    title?: string;
    containerStyle?: ViewStyle;
}

/**
 * Formatea un número entero para los chips sugeridos (ej: S/ 1,500).
 */
const formatChipLabel = (val: number): string => {
    return `S/ ${val.toLocaleString('en-US')}`;
};

/**
 * Componente modular para mostrar la fila de chips de montos sugeridos.
 * Extraído de CardRequestAmount para ser reutilizable de forma independiente.
 */
const SuggestedAmountsChips: React.FC<SuggestedAmountsChipsProps> = ({
    amounts = [500, 1000, 1500, 2000],
    selectedAmount,
    onSelect,
    title = 'Montos sugeridos habituales',
    containerStyle,
}) => {
    const handleSelectChip = (val: number) => {
        onSelect(val);
        Keyboard.dismiss();
    };

    return (
        <View style={[{ width: '100%' }, containerStyle]}>
            {title ? (
                <Text
                    style={[
                        stylesTexts.subtitle,
                        {
                            textAlign: 'left',
                            fontSize: 13,
                            marginBottom: 10,
                            fontWeight: '500',
                        },
                    ]}
                >
                    {title}
                </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
                {amounts.map((chipVal) => {
                    const isSelected = selectedAmount === chipVal;

                    return (
                        <TouchableOpacity
                            key={chipVal}
                            onPress={() => handleSelectChip(chipVal)}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                paddingVertical: 8,
                                paddingHorizontal: 2,
                                borderRadius: 10,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: 3,
                                backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                                borderWidth: isSelected ? 1.5 : 1,
                                borderColor: isSelected ? colors.primary : colors.border,
                            }}
                        >
                            {isSelected && (
                                <Ionicons name="checkmark" size={13} color={colors.primary} />
                            )}
                            <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={{
                                    fontSize: 12,
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? colors.primary : colors.textPrimary,
                                }}
                            >
                                {formatChipLabel(chipVal)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default SuggestedAmountsChips;
