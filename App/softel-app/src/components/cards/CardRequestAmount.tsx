import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface CardRequestAmountProps {
    value?: number;
    onChange?: (amount: number) => void;
    suggestedAmounts?: number[];
}

/**
 * Formatea un número a formato monetario sin símbolo (ej: 1,500.00).
 */
const formatAmount = (val: number): string => {
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Formatea un número entero para los chips sugeridos (ej: S/ 1,500).
 */
const formatChipLabel = (val: number): string => {
    return `S/ ${val.toLocaleString('en-US')}`;
};

/**
 * Tarjeta de selección de monto para solicitud de Caja Chica.
 * Reutiliza los tokens del sistema de diseño (colors, stylesTexts, stylesComponents)
 * sin duplicar ni crear estilos innecesarios.
 */
const CardRequestAmount: React.FC<CardRequestAmountProps> = ({
    value = 1500,
    onChange,
    suggestedAmounts = [500, 1000, 1500, 2000],
}) => {
    const [amount, setAmount] = useState<number>(value);
    const [inputText, setInputText] = useState<string>(String(value));
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const inputRef = useRef<TextInput>(null);

    // Sincronizar si cambia el prop externo
    useEffect(() => {
        if (value !== undefined && value !== amount) {
            setAmount(value);
            setInputText(String(value));
        }
    }, [value]);

    // Manejo de cambio de texto en el input
    const handleTextChange = (text: string) => {
        // Permitir solo dígitos y un punto
        const cleaned = text.replace(/[^0-9.]/g, '');
        setInputText(cleaned);

        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
            setAmount(parsed);
            onChange?.(parsed);
        }
    };

    // Al perder el foco, formatear el valor
    const handleBlur = () => {
        setIsEditing(false);
        const cleaned = inputText.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
            setAmount(parsed);
            setInputText(String(parsed));
            onChange?.(parsed);
        } else {
            setInputText(String(amount));
        }
    };

    // Selección rápida mediante chip
    const handleSelectChip = (chipValue: number) => {
        setAmount(chipValue);
        setInputText(String(chipValue));
        onChange?.(chipValue);
        Keyboard.dismiss();
    };

    return (
        <View style={stylesComponents.cardHistoryContainer}>
            {/* 1. Cabecera: Etiqueta en mayúsculas */}
            <View style={{ marginBottom: 2 }}>
                <Text
                    style={[
                        stylesTexts.litleTitle,
                        {
                            fontSize: 11,
                            letterSpacing: 0.5,
                            marginBottom: 0,
                        },
                    ]}
                >
                    MONTO REQUERIDO PARA OPERACIÓN
                </Text>
            </View>

            {/* 2. Recuadro Central del Monto con Prefijo S/ e Icono de Edición */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    marginBottom: 16,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: '700',
                            color: colors.primary,
                            marginRight: 6,
                        }}
                    >
                        S/
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={{
                            fontSize: 28,
                            fontWeight: '700',
                            color: colors.textPrimary,
                            flex: 1,
                            padding: 0,
                        }}
                        value={isEditing ? inputText : formatAmount(amount)}
                        onChangeText={handleTextChange}
                        onFocus={() => {
                            setIsEditing(true);
                            setInputText(amount > 0 ? String(amount) : '');
                        }}
                        onBlur={handleBlur}
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                    />
                </View>

                {/* Icono de lápiz editable */}
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* 3. Subtítulo de montos sugeridos */}
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
                Montos sugeridos habituales
            </Text>

            {/* 4. Fila de Chips de Selección Rápida */}
            <View style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
                {suggestedAmounts.map((chipVal) => {
                    const isSelected = amount === chipVal;

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

export default CardRequestAmount;
