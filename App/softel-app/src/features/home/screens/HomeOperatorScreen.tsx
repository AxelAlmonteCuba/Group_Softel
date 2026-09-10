import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonSecondary from '@/components/buttons/ButtonSecondary';
import CardHome from '@/components/cards/CardHome';
import CardOptions from '@/components/cards/CardOptions';
import { colors } from '@/theme';
import { dashboardService } from '../services/dashboardService';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeOperatorScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [draftReportsCount, setDraftReportsCount] = useState<number>(0);
  const [pendingExpensesCount, setPendingExpensesCount] = useState<number>(0);
  const [approvedExpensesCount, setApprovedExpensesCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSummary = useCallback(async (force = false) => {
    try {
      const data = await dashboardService.getOperatorSummary(force);
      setDraftReportsCount(data.draftReportsCount);
      setPendingExpensesCount(data.pendingExpensesCount);
      setApprovedExpensesCount(data.approvedExpensesCount);
    } catch (error) {
      console.log('Error loading operator summary', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reutiliza caché si se visitó hace menos de 60s (cambio de tab sin peticiones HTTP)
      loadSummary(false);
    }, [loadSummary])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSummary(true);
    setRefreshing(false);
  }, [loadSummary]);

  return (
    <ScrollView
      style={stylesComponents.containerApp}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen del Día</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome
          title="Reportes en borrador"
          value={draftReportsCount}
          iconName="document-text-outline"
        />
        <CardHome
          title="Gastos pendientes"
          value={pendingExpensesCount}
          iconName="receipt-outline"
          onPress={() => navigation.navigate('PettyCash')}
        />
        <CardHome
          title="Gastos aprobados"
          value={approvedExpensesCount}
          iconName="checkmark-circle-outline"
          onPress={() => navigation.navigate('PettyCash')}
        />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      <ButtonPrimary
        text="Nuevo registro fotografico"
        onPress={() => { }}
        iconName='camera-outline'
      />
      <ButtonSecondary
        text="Registrar gasto"
        onPress={() => navigation.navigate('RegisterExpense')}
        iconName="receipt-outline"
      />

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
