import React from 'react';
import {
    View,
    Text,
    TextInput as RNTextInput,
    TextInputProps,
    StyleSheet,
} from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { colors } from '@/theme/colors';

export interface Props extends TextInputProps {
    label?: string;
}

const TextInput = ({ label, style, ...rest }: Props) => {
    return (
        <View style={styles.container}>
            {label && <Text style={stylesTexts.litleTitle}>{label}</Text>}
            <RNTextInput
                style={[stylesComponents.textInput, style]}
                placeholderTextColor={colors.textDisabled}
                selectionColor={colors.primary}
                {...rest}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

export default TextInput;
