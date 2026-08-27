import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { typography } from "./typography";

export const stylesTexts = StyleSheet.create({
    textButtonPrimary: {
        color: colors.textOnPrimary,
        fontSize: 16,
    },
    basicTitle: {
        fontSize: 24,
        fontWeight: 'bold',
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
    titleHome: {
        fontSize: 20,
        fontWeight: 'semibold',
        color: colors.textPrimary,
        textAlign: 'left',
    },
    textButtonOptionSec: {
        fontSize: 16,
        fontWeight: 'semibold',
        color: colors.textSecondary,
    },
    textButtonOptionTer: {
        fontSize: 16,
        fontWeight: 'semibold',
        color: colors.primary,
    },
    textCardOptionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: 2,
    }
});

export const stylesComponents = StyleSheet.create({
    buttonPrimary: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10
    },
    containerLogin: {
        backgroundColor: colors.background,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerApp: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 14,
    },
    containerForms: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 15,
        width: '90%',
        borderWidth: 1,
        borderColor: colors.border
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
    },
    topBar: {
        backgroundColor: colors.surface,
        width: '100%',
        height: 90,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'space-between',
        paddingBottom: 5,
        paddingHorizontal: 20,
        flexDirection: 'row'
    },
    imageProfile: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: colors.border,
    },
    buttonSecondary: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        gap: 8,
        marginBottom: 10
    },
    cardOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    cardOptionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardOptionTextContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 8,
    },
});