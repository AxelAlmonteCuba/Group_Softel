import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import HomeScreen from './src/features/home/screens/HomeScreen';
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {/* <HomeScreen /> */}
        <LoginScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
