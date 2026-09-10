import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleProp, ViewStyle } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface FilterOption<T = string> {
    label: string;
    value: T;
    count?: number;
    dotColor?: string;
}

export interface FilterChipsProps<T = string> {
    options: FilterOption<T>[];
    selectedValue: T;
    onSelect: (value: T) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Componente Genérico y Estandarizado de Chips de Filtro Horizontal.
 * Reutilizable en cualquier pantalla (ej: Gestión de Usuarios, Control de Fondos, Auditoría).
 * Soporta etiquetas simples, conteos automáticos y punto de estado semántico.
 */
function FilterChips<T extends string = string>({
    options,
    selectedValue,
    onSelect,
    containerStyle,
}: FilterChipsProps<T>) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[stylesComponents.filterChipContainer, containerStyle]}
        >
            {options.map((option) => {
                const isSelected = option.value === selectedValue;
                const displayText =
                    option.count !== undefined
                        ? `${option.label} (${option.count})`
                        : option.label;

                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            stylesComponents.filterChip,
                            isSelected && stylesComponents.filterChipSelected,
                        ]}
                        onPress={() => onSelect(option.value)}
                        activeOpacity={0.7}
                    >
                        {option.dotColor && (
                            <View
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: option.dotColor,
                                    marginRight: 6,
                                }}
                            />
                        )}
                        <Text
                            style={[
                                stylesTexts.filterChipText,
                                isSelected && stylesTexts.filterChipTextSelected,
                            ]}
                        >
                            {displayText}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

export default FilterChips;
