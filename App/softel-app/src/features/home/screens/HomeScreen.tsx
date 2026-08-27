import React, { useState } from 'react';
import { View } from 'react-native';
import HomeAdminScreen from './HomeAdminScreen';
import HomeOperatorScreen from './HomeOperatorScreen';
import UserTopBar from '@/components/layout/UserTopBar';
import { stylesComponents } from '@/theme/styles';

const HomeScreen = () => {
  // TODO: Esto vendrá del Store global de Zustand en el futuro
  const [userRole, setUserRole] = useState<'ADMINISTRADOR' | 'TRABAJADOR'>('ADMINISTRADOR');

  return (
    <View style={{ flex: 1, backgroundColor: stylesComponents.containerLogin.backgroundColor }}>
      {/* Componente común: Barra superior igual para todos */}
      <UserTopBar />

      {/* Condicional: Cambia SOLO el cuerpo de la pantalla */}
      {userRole === 'ADMINISTRADOR' ? (
        <HomeAdminScreen />
      ) : (
        <HomeOperatorScreen />
      )}
    </View>
  );
}

export default HomeScreen;
