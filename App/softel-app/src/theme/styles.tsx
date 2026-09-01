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
        fontWeight: 'bold',
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
    errorText: {
        color: colors.error,
        fontSize: typography.size.md,
        textAlign: 'center',
        padding: 20,
    },
    emptyListText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
        marginTop: 40,
    },
    toggleLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    toggleValue: {
        fontSize: 13,
        color: colors.textSecondary,
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
        alignItems: 'center',
        width: '100%',
    },
    containerApp: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 14,
    },
    containerLoginForms: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 15,
        width: '90%',
        borderWidth: 1,
        borderColor: colors.border
    },
    containerForms: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        alignSelf: 'center',
    },
    textInput: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 14,
        paddingVertical: 12,
        width: '100%',
        fontSize: 15,
        color: colors.textPrimary,
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
    inputIconActions: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputIconBtn: {
        padding: 4,
    },
    selectDropdown: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        marginTop: 4,
        overflow: 'hidden',
    },
    selectItem: {
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectItemLast: {
        paddingHorizontal: 14,
        paddingVertical: 13,
    },
    selectItemActive: {
        backgroundColor: colors.primarySoft ?? colors.border,
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
    cardProfileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
    searchBarContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
    },
    scrollListContent: {
        padding: 16,
    },
    cardListWrapper: {
        marginBottom: 12,
    },
});