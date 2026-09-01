import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AddEditUserScreen from './src/features/users/screens/AddEditUserScreen';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="light" />
        <AddEditUserScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
