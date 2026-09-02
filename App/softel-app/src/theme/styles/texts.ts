import { StyleSheet } from "react-native";
import { colors } from "../colors";
import { typography } from "../typography";
import { baseTextCenter, baseTextButtonOption } from "./base";

export const stylesTexts = StyleSheet.create({
    textButtonPrimary: {
        color: colors.textOnPrimary,
        fontSize: 16,
    },
    basicTitle: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        ...baseTextCenter,
        marginBottom: 9,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: typography.weight.regular,
        color: colors.textSecondary,
        ...baseTextCenter,
        marginBottom: 20,
    },
    litleTitle: {
        fontSize: 12,
        fontWeight: typography.weight.bold,
        color: colors.textSecondary,
        textAlign: 'left',
        marginBottom: 9,
    },
    titleHome: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.semiBold,
        color: colors.textPrimary,
        textAlign: 'left',
    },
    textButtonOptionSec: {
        ...baseTextButtonOption,
        color: colors.textSecondary,
    },
    textButtonOptionTer: {
        ...baseTextButtonOption,
        color: colors.primary,
    },
    textCardOptionTitle: {
        fontSize: 16,
        fontWeight: typography.weight.medium,
        color: colors.textPrimary,
        marginBottom: 2,
    },
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
        ...baseTextCenter,
        padding: 20,
    },
    emptyListText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        ...baseTextCenter,
        marginTop: 40,
    },
    toggleLabel: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    toggleValue: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: typography.weight.semiBold,
        color: '#4B5563',
    },
    filterChipTextSelected: {
        color: colors.textOnPrimary,
    },
    cardHomeValue: {
        fontSize: 25,
        fontWeight: typography.weight.bold,
        color: colors.primary,
        marginBottom: 2,
        ...baseTextCenter,
    },
});
