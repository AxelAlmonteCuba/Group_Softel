import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import ButtonPrimary from './ButtonPrimary';
import ButtonSecondary from './ButtonSecondary';

export interface DualOption<T = string> {
    value: T;
    label: string;
    iconName?: keyof typeof Ionicons.glyphMap;
    count?: number;
    countOnNewLine?: boolean;
    disabled?: boolean;
}

export interface SegmentedDualButtonProps<T = string> {
    options: [DualOption<T>, DualOption<T>];
    selectedValue: T;
    onSelect: (value: T) => void;
    variant?: 'capsule' | 'buttons';
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Componente Genérico de Selector Dual Segmentado.
 * Permite alternar entre dos estados u opciones (ej: Cajas Chicas vs Reembolsos Directos).
 * Soporta dos variantes visuales:
 * - 'capsule': Contenedor redondeado tipo píldora con fondo suave y pestaña activa destacada (diseño bandeja).
 * - 'buttons': Dos botones ButtonPrimary / ButtonSecondary independientes con tamaño small.
 */
function SegmentedDualButton<T = string>({
    options,
    selectedValue,
    onSelect,
    variant = 'capsule',
    containerStyle,
}: SegmentedDualButtonProps<T>) {
    const [firstOption, secondOption] = options;

    if (variant === 'buttons') {
        const isFirstSelected = selectedValue === firstOption.value;

        const formatButtonLabel = (opt: DualOption<T>) =>
            opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label;

        return (
            <View style={[stylesComponents.expenseSourceRow, containerStyle]}>
                {/* Opción 1 */}
                <View style={stylesComponents.flex1}>
                    {isFirstSelected ? (
                        <ButtonPrimary
                            text={formatButtonLabel(firstOption)}
                            iconName={firstOption.iconName}
                            size="small"
                            numberOfLines={1}
                            disabled={firstOption.disabled}
                            onPress={() => onSelect(firstOption.value)}
                        />
                    ) : (
                        <ButtonSecondary
                            text={formatButtonLabel(firstOption)}
                            iconName={firstOption.iconName}
                            size="small"
                            numberOfLines={1}
                            disabled={firstOption.disabled}
                            onPress={() => {
                                if (!firstOption.disabled) {
                                    onSelect(firstOption.value);
                                }
                            }}
                        />
                    )}
                </View>

                {/* Opción 2 */}
                <View style={stylesComponents.flex1}>
                    {!isFirstSelected ? (
                        <ButtonPrimary
                            text={formatButtonLabel(secondOption)}
                            iconName={secondOption.iconName}
                            size="small"
                            numberOfLines={1}
                            disabled={secondOption.disabled}
                            onPress={() => onSelect(secondOption.value)}
                        />
                    ) : (
                        <ButtonSecondary
                            text={formatButtonLabel(secondOption)}
                            iconName={secondOption.iconName}
                            size="small"
                            numberOfLines={1}
                            disabled={secondOption.disabled}
                            onPress={() => {
                                if (!secondOption.disabled) {
                                    onSelect(secondOption.value);
                                }
                            }}
                        />
                    )}
                </View>
            </View>
        );
    }

    // Variante 'capsule' (Maqueta oficial de la Bandeja)
    return (
        <View style={[stylesComponents.segmentedCapsuleContainer, containerStyle]}>
            {options.map((option) => {
                const isSelected = selectedValue === option.value;
                const displayText =
                    option.count !== undefined
                        ? option.countOnNewLine
                            ? `${option.label}\n(${option.count})`
                            : `${option.label} (${option.count})`
                        : option.label;

                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        style={[
                            stylesComponents.segmentedCapsuleItem,
                            isSelected
                                ? stylesComponents.segmentedCapsuleItemActive
                                : stylesComponents.segmentedCapsuleItemInactive,
                            option.disabled && stylesComponents.buttonDisabled,
                        ]}
                        onPress={() => {
                            if (!option.disabled) {
                                onSelect(option.value);
                            }
                        }}
                        activeOpacity={0.8}
                        disabled={option.disabled}
                    >
                        {option.iconName && (
                            <Ionicons
                                name={option.iconName}
                                size={18}
                                color={
                                    isSelected
                                        ? colors.textOnPrimary
                                        : colors.textSecondary
                                }
                            />
                        )}
                        <Text
                            style={[
                                isSelected
                                    ? stylesTexts.textButtonPrimary
                                    : stylesTexts.textButtonOptionSec,
                                stylesTexts.textButtonSmall,
                                { textAlign: 'center', lineHeight: 16 },
                            ]}
                            numberOfLines={2}
                        >
                            {displayText}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default SegmentedDualButton;
