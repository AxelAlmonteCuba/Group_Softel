import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';
import { styles } from '@/theme/styles';

const HomeAdminScreen = () => {
  return (
    <View style={styles2.containerHome}>
      <Text style={[styles.titleHome, { padding: 10, }]}>Resumen Administrativo</Text>
    </View>
  );
};

export default HomeAdminScreen;

const styles2 = StyleSheet.create({
  containerHome: {
    flex: 1,
    backgroundColor: colors.background,
  },
})