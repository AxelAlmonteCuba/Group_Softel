import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface FilterOption {
    label: string;
    value: string;
}

interface FilterChipsProps {
    options: FilterOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ options, selectedValue, onSelect }) => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={stylesComponents.filterChipContainer}
        >
            {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[stylesComponents.filterChip, isSelected && stylesComponents.filterChipSelected]}
                        onPress={() => onSelect(option.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[stylesTexts.filterChipText, isSelected && stylesTexts.filterChipTextSelected]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export default FilterChips;
