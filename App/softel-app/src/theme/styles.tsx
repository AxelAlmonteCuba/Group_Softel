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
    },
    // Estilos de texto para CardProfile
    cardProfileRole: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: 4,
        lineHeight: typography.size.sm * typography.lineHeight.normal,
    },
    cardProfileEmail: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
    },
    cardProfilePlaceholderText: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
    },
    badgeText: {
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
    },
    badgeTextActive: {
        color: colors.success,
    },
    badgeTextInactive: {
        color: colors.error,
    },
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
    // Estilos de componentes para CardProfile
    cardProfileContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardProfileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardProfileImageContainer: {
        marginRight: 16,
    },
    cardProfileImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.border,
    },
    cardProfilePlaceholderImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardProfileInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    cardProfileRightContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 56,
        marginLeft: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 'auto',
    },
    badgeActive: {
        backgroundColor: colors.successSoft,
    },
    badgeInactive: {
        backgroundColor: colors.errorSoft,
    },
    cardProfileChevron: {
        marginTop: 'auto',
    },
});