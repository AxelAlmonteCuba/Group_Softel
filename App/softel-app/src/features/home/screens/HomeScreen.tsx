import React from 'react';
import { View } from 'react-native';
import HomeAdminScreen from './HomeAdminScreen';
import HomeOperatorScreen from './HomeOperatorScreen';
import UserTopBar from '@/components/layout/UserTopBar';
import { stylesComponents } from '@/theme/styles';
import { useAuthStore } from '@/store/authStore';

const HomeScreen = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const userRole = usuario?.rol ?? 'TRABAJADOR';

  return (
    <View style={{ flex: 1, backgroundColor: stylesComponents.containerLogin.backgroundColor }}>
      <UserTopBar />
      {userRole === 'ADMINISTRADOR' ? (
        <HomeAdminScreen />
      ) : (
        <HomeOperatorScreen />
      )}
    </View>
  );
}

export default HomeScreen;
