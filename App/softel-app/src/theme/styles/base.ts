import { ViewStyle, TextStyle } from "react-native";
import { colors } from "../colors";
import { typography } from "../typography";

export const baseSurfaceBorder: ViewStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
};

export const baseButton: ViewStyle = {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
};

export const baseShadow: ViewStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
};

export const baseTextCenter: TextStyle = {
    textAlign: 'center',
};

export const baseTextButtonOption: TextStyle = {
    fontSize: 16,
    fontWeight: typography.weight.semiBold,
};

export const baseSelectItem: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 13,
};

export const baseAbsoluteIcon: ViewStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
};
