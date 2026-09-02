import { StyleSheet } from "react-native";
import { colors } from "../colors";
import { 
    baseButton, 
    baseSurfaceBorder, 
    baseAbsoluteIcon, 
    baseSelectItem, 
    baseShadow 
} from "./base";

export const stylesComponents = StyleSheet.create({
    buttonPrimary: {
        ...baseButton,
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        ...baseButton,
        ...baseSurfaceBorder,
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
        ...baseSurfaceBorder,
        borderRadius: 10,
        padding: 15,
        width: '90%',
    },
    containerForms: {
        ...baseSurfaceBorder,
        borderRadius: 16,
        padding: 20,
        width: '100%',
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
        ...baseAbsoluteIcon,
        right: 12,
        justifyContent: 'center',
    },
    inputIconActions: {
        ...baseAbsoluteIcon,
        right: 10,
        flexDirection: 'row',
        gap: 8,
    },
    inputIconBtn: {
        padding: 4,
    },
    selectDropdown: {
        ...baseSurfaceBorder,
        borderRadius: 10,
        marginTop: 4,
        overflow: 'hidden',
    },
    selectItem: {
        ...baseSelectItem,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectItemLast: {
        ...baseSelectItem,
    },
    selectItemActive: {
        backgroundColor: colors.primarySoft ?? colors.border,
    },
    topBar: {
        ...baseSurfaceBorder,
        width: '100%',
        height: 90,
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
    cardProfileContainer: {
        ...baseSurfaceBorder,
        ...baseShadow,
        borderRadius: 12,
        padding: 16,
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
    fabButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    filterChipContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 8,
    },
    filterChip: {
        ...baseSurfaceBorder,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    cardHomeContainer: {
        ...baseSurfaceBorder,
        flex: 1,
        height: 108,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
});
