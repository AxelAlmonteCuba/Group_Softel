import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeAdminScreen from './HomeAdminScreen';
import HomeOperatorScreen from './HomeOperatorScreen';
import UserTopBar from '@/components/layout/UserTopBar';
import BottomNavBar, { BottomTabKey } from '@/components/layout/BottomNavBar';
import PettyCashScreen from '@/features/petty-cash/screens/PettyCashScreen';
import MoreScreen from '@/features/more/screens/MoreScreen';
import { stylesComponents } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';

const HomeScreen = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const [activeTab, setActiveTab] = useState<BottomTabKey>('inicio');

  // Filtro por rol: ADMINISTRADOR y CONTADOR ven HomeAdminScreen; SUPERVISOR y TRABAJADOR ven HomeOperatorScreen
  const isAdmin = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'CONTADOR';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: stylesComponents.containerLogin.backgroundColor }}>
      {/* El UserTopBar SOLO se muestra en Inicio */}
      {activeTab === 'inicio' && <UserTopBar />}

      <View style={{ flex: 1 }}>
        {activeTab === 'inicio' ? (
          isAdmin ? <HomeAdminScreen /> : <HomeOperatorScreen />
        ) : activeTab === 'caja-chica' ? (
          <PettyCashScreen onBack={() => setActiveTab('inicio')} />
        ) : activeTab === 'mas' ? (
          <MoreScreen onBack={() => setActiveTab('inicio')} />
        ) : (
          <View style={stylesComponents.containerApp} />
        )}
      </View>

      {/* La barra inferior se mantiene visible en todo momento */}
      <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
};

export default HomeScreen;
