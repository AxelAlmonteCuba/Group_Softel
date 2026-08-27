import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { stylesComponents } from '@/theme/styles';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
}

const PasswordInput = ({ value, onChangeText, placeholder }: Props) => {
    const [mostrarClave, setMostrarClave] = useState(false);

    return (
        <View style={stylesComponents.inputWrapper}>
            <TextInput
                style={[stylesComponents.textInput, { marginBottom: 0 }]}
                placeholder={placeholder}
                secureTextEntry={!mostrarClave}
                value={value}
                onChangeText={onChangeText}
            />
            <TouchableOpacity
                style={stylesComponents.iconOjo}
                onPress={() => setMostrarClave(v => !v)}
            >
                <Ionicons
                    name={mostrarClave ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textDisabled}
                />
            </TouchableOpacity>
        </View>
    )
}

export default PasswordInput