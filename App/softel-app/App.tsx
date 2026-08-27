import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import HomeScreen from './src/features/home/screens/HomeScreen';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {/* Navega automáticamente según el estado de sesión */}
        {isAuthenticated ? <HomeScreen /> : <LoginScreen />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
