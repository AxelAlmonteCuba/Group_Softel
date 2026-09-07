import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesTexts } from '@/theme/styles';

export interface AmountInputProps {
    value?: number;
    onChange?: (amount: number) => void;
    label?: string;
    rightLabel?: string;
    prefix?: string;
    disabled?: boolean;
    containerStyle?: ViewStyle;
}

/**
 * Formatea un número a formato monetario (ej: 1,500.00).
 */
const formatAmount = (val: number): string => {
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Componente modular para ingreso de montos monetarios.
 * Con prefijo S/, entrada numérica editable y el ícono de lápiz fijo.
 */
const AmountInput: React.FC<AmountInputProps> = ({
    value = 0,
    onChange,
    label,
    rightLabel,
    prefix = 'S/',
    disabled = false,
    containerStyle,
}) => {
    const [amount, setAmount] = useState<number>(value);
    const [inputText, setInputText] = useState<string>(value > 0 ? String(value) : '');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const inputRef = useRef<TextInput>(null);

    // Sincronizar si cambia el prop value externo
    useEffect(() => {
        if (value !== undefined && value !== amount) {
            setAmount(value);
            setInputText(value > 0 ? String(value) : '');
        }
    }, [value]);

    const handleTextChange = (text: string) => {
        const cleaned = text.replace(/[^0-9.]/g, '');
        setInputText(cleaned);

        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
            setAmount(parsed);
            onChange?.(parsed);
        } else {
            setAmount(0);
            onChange?.(0);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        const cleaned = inputText.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
            setAmount(parsed);
            setInputText(String(parsed));
            onChange?.(parsed);
        } else {
            setInputText(amount > 0 ? String(amount) : '');
        }
    };

    return (
        <View style={[{ width: '100%', marginBottom: 15 }, containerStyle]}>
            {/* Cabecera opcional de etiquetas (izq y der) */}
            {(label || rightLabel) && (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                    }}
                >
                    {label ? (
                        <Text
                            style={[
                                stylesTexts.litleTitle,
                                {
                                    fontSize: 11,
                                    letterSpacing: 0.5,
                                    marginBottom: 0,
                                    fontWeight: '700',
                                },
                            ]}
                        >
                            {label}
                        </Text>
                    ) : null}

                    {rightLabel ? (
                        <Text
                            style={{
                                fontSize: 12,
                                color: colors.textSecondary,
                                fontWeight: '500',
                            }}
                        >
                            {rightLabel}
                        </Text>
                    ) : null}
                </View>
            )}

            {/* Recuadro de Monto */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => !disabled && inputRef.current?.focus()}
                style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: isEditing ? colors.borderFocus : colors.border,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 26,
                            fontWeight: '700',
                            color: colors.primary,
                            marginRight: 6,
                        }}
                    >
                        {prefix}
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={{
                            fontSize: 26,
                            fontWeight: '700',
                            color: colors.textPrimary,
                            flex: 1,
                            padding: 0,
                        }}
                        value={isEditing ? inputText : amount > 0 ? formatAmount(amount) : ''}
                        placeholder={isEditing ? '' : '0.00'}
                        placeholderTextColor={colors.textDisabled}
                        onChangeText={handleTextChange}
                        onFocus={() => {
                            setIsEditing(true);
                            setInputText(amount > 0 ? String(amount) : '');
                        }}
                        onBlur={handleBlur}
                        keyboardType="decimal-pad"
                        editable={!disabled}
                        selectTextOnFocus
                    />
                </View>

                {/* Icono de lápiz editable fijo */}
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};

export default AmountInput;
