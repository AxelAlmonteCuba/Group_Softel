import { View, Text } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';

const HomeOperatorScreen = () => {
  return (
    <View style={stylesComponents.containerApp}>
      <Text style={stylesTexts.basicTitle}>Panel Operativo</Text>
      <Text style={stylesTexts.subtitle}>Aquí irán las opciones para registrar gastos, tomar fotos, etc.</Text>
    </View>
  );
};

export default HomeOperatorScreen;
