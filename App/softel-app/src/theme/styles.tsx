import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { typography } from "./typography";

export const styles = StyleSheet.create({
    buttonPrimary: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',

    },
    textButtonPrimary: {
        color: colors.textOnPrimary,
        fontSize: 16,
    },
    container: {
        backgroundColor: colors.background,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    formContainer: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 15,
        width: '90%',

        borderWidth: 1,
        borderColor: colors.border
    },
    basicTitle: {
        fontSize: 24,
        fontWeight: 'semibold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 9,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'regular',
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
    },

    litleTitle: {
        fontSize: 12,
        fontWeight: 'semibold',
        color: colors.textSecondary,
        textAlign: 'left',
        marginBottom: 9,
    },
    textInput: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
        marginBottom: 15,
    },
    iconOjo: {
        position: 'absolute',
        right: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }

})