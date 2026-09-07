import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput as RNTextInput,
    ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { stylesTexts } from '@/theme/styles';

export interface JustificationInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    maxLength?: number;
    showCounter?: boolean;
    numberOfLines?: number;
    disabled?: boolean;
    containerStyle?: ViewStyle;
}

/**
 * Componente modular para el área de texto de Justificación / Motivo.
 * Incluye cabecera en mayúsculas, soporte multilínea y contador de caracteres.
 */
const JustificationInput: React.FC<JustificationInputProps> = ({
    label = 'MOTIVO / JUSTIFICACIÓN DEL GASTO',
    placeholder = 'Describe el motivo o justificación...',
    value,
    onChangeText,
    maxLength = 200,
    showCounter = true,
    numberOfLines = 3,
    disabled = false,
    containerStyle,
}) => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    return (
        <View style={[{ width: '100%', marginBottom: 15 }, containerStyle]}>
            {/* Cabecera / Label */}
            {label ? (
                <Text
                    style={[
                        stylesTexts.litleTitle,
                        {
                            fontSize: 11,
                            letterSpacing: 0.5,
                            marginBottom: 8,
                            fontWeight: '700',
                        },
                    ]}
                >
                    {label}
                </Text>
            ) : null}

            {/* Recuadro Multilínea con contador */}
            <View
                style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: isFocused ? colors.borderFocus : colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingTop: 14,
                    paddingBottom: 12,
                    minHeight: 105,
                    justifyContent: 'space-between',
                }}
            >
                <RNTextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textDisabled}
                    selectionColor={colors.primary}
                    multiline
                    numberOfLines={numberOfLines}
                    textAlignVertical="top"
                    maxLength={maxLength}
                    editable={!disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        fontSize: 14,
                        color: colors.textPrimary,
                        padding: 0,
                        paddingTop: 2,
                        minHeight: 65,
                    }}
                />

                {/* Contador de caracteres inferior derecho */}
                {showCounter ? (
                    <Text
                        style={{
                            alignSelf: 'flex-end',
                            fontSize: 12,
                            color: colors.textSecondary,
                            marginTop: 4,
                        }}
                    >
                        {value.length} / {maxLength} car.
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

export default JustificationInput;
