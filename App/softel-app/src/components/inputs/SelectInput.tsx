import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    LayoutAnimation,
    Image,
    ImageSourcePropType,
    ViewStyle,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { colors } from '@/theme/colors';

export interface SelectOption {
    label: string;
    value: string;
    image?: ImageSourcePropType | string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
}

interface Props {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    containerStyle?: ViewStyle;
}

const SelectInput = ({
    label,
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    disabled = false,
    containerStyle,
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
        <View style={[{ width: '100%', marginBottom: 15 }, containerStyle]}>
            {label && <Text style={stylesTexts.litleTitle}>{label}</Text>}

            {/* Trigger */}
            <TouchableOpacity
                style={[
                    stylesComponents.textInput,
                    {
                        marginBottom: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    },
                    open && { borderColor: colors.borderFocus },
                    disabled && { opacity: 0.6 },
                ]}
                onPress={toggle}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    {selected?.image ? (
                        <Image
                            source={typeof selected.image === 'string' ? { uri: selected.image } : selected.image}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                marginRight: 10,
                            }}
                            resizeMode="cover"
                        />
                    ) : selected?.icon ? (
                        selected.iconBgColor ? (
                            <View
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    backgroundColor: selected.iconBgColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                }}
                            >
                                <Ionicons
                                    name={selected.icon}
                                    size={16}
                                    color={selected.iconColor || colors.primary}
                                />
                            </View>
                        ) : (
                            <Ionicons
                                name={selected.icon}
                                size={18}
                                color={selected.iconColor || colors.primary}
                                style={{ marginRight: 10 }}
                            />
                        )
                    ) : null}

                    <Text
                        style={{
                            fontSize: 15,
                            color: selected ? colors.textPrimary : colors.textDisabled,
                            flex: 1,
                        }}
                        numberOfLines={1}
                    >
                        {selected ? selected.label : placeholder}
                    </Text>
                </View>

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
                                    {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    },
                                ]}
                                onPress={() => handleSelect(option)}
                                activeOpacity={0.7}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    {option.image ? (
                                        <Image
                                            source={typeof option.image === 'string' ? { uri: option.image } : option.image}
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 13,
                                                marginRight: 10,
                                            }}
                                            resizeMode="cover"
                                        />
                                    ) : option.icon ? (
                                        option.iconBgColor ? (
                                            <View
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 8,
                                                    backgroundColor: option.iconBgColor,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 10,
                                                }}
                                            >
                                                <Ionicons
                                                    name={option.icon}
                                                    size={16}
                                                    color={option.iconColor || (isActive ? colors.primary : colors.textSecondary)}
                                                />
                                            </View>
                                        ) : (
                                            <Ionicons
                                                name={option.icon}
                                                size={20}
                                                color={option.iconColor || (isActive ? colors.primary : colors.textSecondary)}
                                                style={{ marginRight: 10 }}
                                            />
                                        )
                                    ) : null}

                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: isActive ? colors.primary : colors.textPrimary,
                                            fontWeight: isActive ? '600' : '400',
                                            flex: 1,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {option.label}
                                    </Text>
                                </View>

                                {isActive && (
                                    <Feather
                                        name="check"
                                        size={16}
                                        color={colors.primary}
                                        style={{ marginLeft: 8 }}
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default SelectInput;
