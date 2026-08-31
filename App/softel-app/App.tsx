import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AddEditUserScreen from './src/features/users/screens/AddEditUserScreen';
import { stylesComponents } from './src/theme/styles';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={stylesComponents.containerLogin}>
          <AddEditUserScreen />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
