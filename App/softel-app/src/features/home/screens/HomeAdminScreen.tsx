import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import CardHome from '@/components/cards/CardHome';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import ButtonTertiary from '@/components/buttons/ButtonTertiary';
import CardOptions from '@/components/cards/CardOptions';
import { getUsers } from '@/features/users/services/userService';
import { pettyCashService } from '@/features/petty-cash/services/pettyCashService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [reviewBoxesCount, setReviewBoxesCount] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [users, cajas] = await Promise.all([
            getUsers().catch((error) => {
              console.log('Error fetching active users count', error);
              return [];
            }),
            pettyCashService.getAll().catch((error) => {
              console.log('Error fetching review boxes count', error);
              return [];
            }),
          ]);

          const activeCount = users.filter((u) => u.estado === 'ACTIVO').length;
          setActiveUsersCount(activeCount);

          const reviewCount = cajas.filter((c) => c.status === 'EN_REVISION').length;
          setReviewBoxesCount(reviewCount);
        } catch (error) {
          console.log('Error fetching home admin summary', error);
        }
      };

      fetchData();
    }, [])
  );

  return (
    <ScrollView style={stylesComponents.containerApp}>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen Administrativo</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome title="Usuarios Activos" value={activeUsersCount} iconName="people-outline" onPress={() => navigation.navigate('UserManagement', { initialFilter: 'ACTIVO' })} />
        <CardHome title="Reportes en borrador" value={10} iconName="document-text-outline" />
        <CardHome title="Cajas en revisión" value={reviewBoxesCount} iconName="wallet-outline" onPress={() => navigation.navigate('PettyCash')} />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      <ButtonPrimary
        text="Gestionar Usuarios"
        onPress={() => navigation.navigate('UserManagement')}
        iconName='people-outline'
      />
      <ButtonSecondary text="Ver Reportes Globales" onPress={() => { }} iconName="stats-chart" />

      {/* BOTON TERCIARIO DESCOMENTAR SI SE QUIERE USAR <ButtonTertiary text="Revisar Cajas Chicas" onPress={() => navigation.navigate('PettyCash')} iconName="wallet-outline" /> */}


      <Text style={[stylesTexts.titleHome, { paddingBottom: 15, marginTop: 15 }]}>Actividad Reciente</Text>

      <View style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 15, paddingBottom: 10 }}>
        <CardOptions
          title="Nuevo usuario registrado"
          subtitle="Hace 2 horas"
          type="NUEVO_USUARIO"
        />
        <CardOptions
          title="Reporte aprobado por supervisor"
          subtitle="Ayer, 14:30"
          type="REPORTE"
        />
        <CardOptions
          title="Caja chica rechazada - Falta comprobante"
          subtitle="Ayer, 10:15"
          type="RECHAZO"
        />
        <CardOptions
          title="Configuración de sistema actualizada"
          subtitle="Hace 2 días"
          type="CONFIGURACION"
        />
      </View>
    </ScrollView>
  );
};

export default HomeAdminScreen;