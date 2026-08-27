import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import HomeAdminScreen from './HomeAdminScreen';
import HomeOperatorScreen from './HomeOperatorScreen';
import UserTopBar from '@/components/layout/UserTopBar';
import { stylesComponents } from '@/theme/styles';
import GestionUsuariosScreen from '@/features/usuarios/screens/GestionUsusariosScreen';

const HomeScreen = () => {
  // TODO: Esto vendrá del Store global de Zustand en el futuro
  const [userRole, setUserRole] = useState<'ADMINISTRADOR' | 'TRABAJADOR'>('ADMINISTRADOR');

  // Estado local para simular navegación hasta implementar React Navigation
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');

  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'HOME') {
        setCurrentScreen('HOME');
        return true; // Evita que la app se cierre
      }
      return false; // Permite que la app se cierre si está en HOME
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  return (
    <View style={{ flex: 1, backgroundColor: stylesComponents.containerLogin.backgroundColor }}>
      {/* Condicional: Cambia la pantalla entera */}
      {currentScreen === 'GESTION_USUARIOS' ? (
        <GestionUsuariosScreen onBack={() => setCurrentScreen('HOME')} />
      ) : (
        <>
          <UserTopBar />
          {userRole === 'ADMINISTRADOR' ? (
            <HomeAdminScreen onNavigate={setCurrentScreen} />
          ) : (
            <HomeOperatorScreen />
          )}
        </>
      )}
    </View>
  );
}

export default HomeScreen;
