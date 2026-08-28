import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface SearchBarProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar = ({
  placeholder = 'Buscar...',
  value,
  onChangeText,
  ...rest
}: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color={colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12, // Borde redondeado suave, consistente con el resto de la app
    paddingHorizontal: 12,
    height: 48, 
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    height: '100%',
  },
});

export default SearchBar;
