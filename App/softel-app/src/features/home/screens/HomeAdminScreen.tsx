import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import CardHome from '@/components/cards/CardHome';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import ButtonTertiary from '@/components/buttons/ButtonTertiary';
import CardOptions from '@/components/cards/CardOptions';

const HomeAdminScreen = () => {
  return (
    <ScrollView style={stylesComponents.containerApp}>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen Administrativo</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome title="Usuarios Activos" value={45} iconName="people-outline" />
        <CardHome title="Reportes en borrador" value={10} iconName="document-text-outline" />
        <CardHome title="Cajas en revisión" value={5} iconName="wallet-outline" />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      <ButtonPrimary text="Gestionar Usuarios" onPress={() => { }} iconName='people-outline' />
      <ButtonSecondary text="Ver Reportes Globales" onPress={() => { }} iconName="stats-chart" />
      <ButtonTertiary text="Revisar Cajas Chicas" onPress={() => { }} iconName="wallet-outline" />
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15, marginTop: 15 }]}>Actividad Reciente</Text>
      
      <View style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 15, paddingBottom: 10 }}>
        <CardOptions 
          title="Nuevo usuario registrado" 
          subtitle="Hace 2 horas" 
          iconName="person-add-outline" 
          iconColor={colors.primary}
          iconBgColor={colors.errorSoft}
        />
        <CardOptions 
          title="Reporte aprobado por supervisor" 
          subtitle="Ayer, 14:30" 
          iconName="clipboard-outline" 
        />
        <CardOptions 
          title="Caja chica rechazada - Falta comprobante" 
          subtitle="Ayer, 10:15" 
          iconName="warning-outline" 
        />
        <CardOptions 
          title="Configuración de sistema actualizada" 
          subtitle="Hace 2 días" 
          iconName="settings-outline" 
        />
      </View>
    </ScrollView>
  );
};

export default HomeAdminScreen;

const styles2 = StyleSheet.create({

})