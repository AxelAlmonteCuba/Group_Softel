import { View, Text, ScrollView } from 'react-native';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import CardHome from '@/components/cards/CardHome';
import CardOptions from '@/components/cards/CardOptions';
import { colors } from '@/theme';

const HomeOperatorScreen = () => {
  return (
    <ScrollView style={stylesComponents.containerApp}>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen del Día</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome title="Reportes en borrador" value={0} iconName="document-text-outline" onPress={undefined} />
        <CardHome title="Gastos pendientes" value={0} iconName="receipt-outline" onPress={undefined} />
        <CardHome title="Gastos aprobados" value={0} iconName="checkmark-circle-outline" onPress={undefined} />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      <ButtonPrimary
        text="Nuevo registro fotografico"
        onPress={() => { }}
        iconName='camera-outline'
      />
      <ButtonSecondary text="Registrar gasto" onPress={() => { }} iconName="receipt-outline" />

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

export default HomeOperatorScreen;
