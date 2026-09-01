import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import CardHome from '@/components/cards/CardHome';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import ButtonTertiary from '@/components/buttons/ButtonTertiary';
import CardOptions from '@/components/cards/CardOptions';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={stylesComponents.containerApp}>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen Administrativo</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome title="Usuarios Activos" value={45} iconName="people-outline" />
        <CardHome title="Reportes en borrador" value={10} iconName="document-text-outline" />
        <CardHome title="Cajas en revisión" value={5} iconName="wallet-outline" />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      <ButtonPrimary 
        text="Gestionar Usuarios" 
        onPress={() => navigation.navigate('UserManagement')} 
        iconName='people-outline' 
      />
      <ButtonSecondary text="Ver Reportes Globales" onPress={() => { }} iconName="stats-chart" />
      <ButtonTertiary text="Revisar Cajas Chicas" onPress={() => { }} iconName="wallet-outline" />
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