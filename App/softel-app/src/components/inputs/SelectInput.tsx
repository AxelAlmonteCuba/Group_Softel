import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    LayoutAnimation,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { colors } from '@/theme/colors';

export interface SelectOption {
    label: string;
    value: string;
}

interface Props {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const SelectInput = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    disabled = false,
}: Props) => {
    const [open, setOpen] = useState(false);

    const selected = options.find(o => o.value === value);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(prev => !prev);
    };

    const handleSelect = (option: SelectOption) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onChange(option.value);
        setOpen(false);
    };

    return (
        <View style={{ width: '100%', marginBottom: 15 }}>
            {label && <Text style={stylesTexts.litleTitle}>{label}</Text>}

            {/* Trigger */}
            <TouchableOpacity
                style={[
                    stylesComponents.textInput,
                    { marginBottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                    open && { borderColor: colors.borderFocus },
                ]}
                onPress={toggle}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <Text
                    style={{
                        fontSize: 15,
                        color: selected ? colors.textPrimary : colors.textDisabled,
                        flex: 1,
                    }}
                >
                    {selected ? selected.label : placeholder}
                </Text>
                <Feather
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {/* Dropdown */}
            {open && (
                <View style={stylesComponents.selectDropdown}>
                    {options.map((option, index) => {
                        const isActive = option.value === value;
                        const isLast = index === options.length - 1;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    isLast
                                        ? stylesComponents.selectItemLast
                                        : stylesComponents.selectItem,
                                    isActive && stylesComponents.selectItemActive,
                                ]}
                                onPress={() => handleSelect(option)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: isActive ? colors.primary : colors.textPrimary,
                                        fontWeight: isActive ? '600' : '400',
                                    }}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default SelectInput;
