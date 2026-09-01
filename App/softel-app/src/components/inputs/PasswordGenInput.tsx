import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { colors } from '@/theme/colors';

const CHARS_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CHARS_LOWER = 'abcdefghjkmnpqrstuvwxyz';
const CHARS_DIGIT = '23456789';
const CHARS_SYMBOL = '!@#$&*';
const ALL_CHARS = CHARS_UPPER + CHARS_LOWER + CHARS_DIGIT + CHARS_SYMBOL;

function generatePassword(length = 10): string {
    const required = [
        CHARS_UPPER[Math.floor(Math.random() * CHARS_UPPER.length)],
        CHARS_LOWER[Math.floor(Math.random() * CHARS_LOWER.length)],
        CHARS_DIGIT[Math.floor(Math.random() * CHARS_DIGIT.length)],
        CHARS_SYMBOL[Math.floor(Math.random() * CHARS_SYMBOL.length)],
    ];
    const rest = Array.from({ length: length - required.length }, () =>
        ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)]
    );
    return [...required, ...rest]
        .sort(() => Math.random() - 0.5)
        .join('');
}

interface Props {
    label?: string;
    value?: string;
    onChange?: (password: string) => void;
}

const PasswordGenInput = ({ label = 'Contraseña Autogenerada', value, onChange }: Props) => {
    const [password, setPassword] = useState(value ?? generatePassword());
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        onChange?.(password);
    }, []);

    const handleRegenerate = useCallback(() => {
        const newPass = generatePassword();
        setPassword(newPass);
        onChange?.(newPass);
        setCopied(false);
    }, [onChange]);

    const handleCopy = useCallback(async () => {
        await Clipboard.setStringAsync(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [password]);

    return (
        <View style={{ width: '100%' }}>
            {label && <Text style={stylesTexts.litleTitle}>{label}</Text>}
            <View style={stylesComponents.inputWrapper}>
                <TextInput
                    style={[stylesComponents.textInput, { marginBottom: 0, paddingRight: 72 }]}
                    value={password}
                    editable={false}
                    selectTextOnFocus
                    placeholderTextColor={colors.textDisabled}
                />
                <View style={stylesComponents.inputIconActions}>
                    <TouchableOpacity
                        style={stylesComponents.inputIconBtn}
                        onPress={handleRegenerate}
                        accessibilityLabel="Regenerar contraseña"
                    >
                        <Feather
                            name="refresh-cw"
                            size={18}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={stylesComponents.inputIconBtn}
                        onPress={handleCopy}
                        accessibilityLabel="Copiar contraseña"
                    >
                        <Feather
                            name={copied ? 'check' : 'copy'}
                            size={18}
                            color={copied ? colors.success : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default PasswordGenInput;
