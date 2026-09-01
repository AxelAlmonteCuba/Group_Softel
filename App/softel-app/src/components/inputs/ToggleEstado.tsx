import React from 'react';
import { View, Text, Switch } from 'react-native';
import { stylesTexts } from '@/theme/styles';
import { colors } from '@/theme/colors';

interface Props {
    label?: string;
    value: boolean;
    onChange: (value: boolean) => void;
    labelActivo?: string;
    labelInactivo?: string;
    disabled?: boolean;
}

const ToggleEstado = ({
    label = 'Estado',
    value,
    onChange,
    labelActivo = 'Activo',
    labelInactivo = 'Inactivo',
    disabled = false,
}: Props) => {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginBottom: 15,
            }}
        >
            <View>
                <Text style={stylesTexts.toggleLabel}>{label}</Text>
                <Text style={stylesTexts.toggleValue}>
                    {value ? labelActivo : labelInactivo}
                </Text>
            </View>

            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                    false: colors.border,
                    true: colors.primary,
                }}
                thumbColor={colors.surface}
                ios_backgroundColor={colors.border}
                disabled={disabled}
            />
        </View>
    );
};

export default ToggleEstado;
