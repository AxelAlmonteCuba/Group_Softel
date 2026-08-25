import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { typography } from "./typography";

export const styles = StyleSheet.create({
    buttonPrimary: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    textButtonPrimary: {
        color: colors.textOnPrimary,
        fontSize: 16,
    }
})