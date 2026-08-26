import { View, Text } from 'react-native';
import { styles } from '@/theme/styles';

const HomeOperatorScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.basicTitle}>Panel Operativo</Text>
      <Text style={styles.subtitle}>Aquí irán las opciones para registrar gastos, tomar fotos, etc.</Text>
    </View>
  );
};

export default HomeOperatorScreen;
