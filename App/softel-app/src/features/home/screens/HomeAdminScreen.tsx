import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
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
import { dashboardService } from '../services/dashboardService';
import { pettyCashService } from '../../petty-cash/services/pettyCashService';
import { useAuthStore } from '@/store/authStore';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

const HomeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const usuario = useAuthStore(state => state.usuario);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [reviewBoxesCount, setReviewBoxesCount] = useState<number>(0);
  const [draftReportsCount, setDraftReportsCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSummary = useCallback(async (force = false) => {
    try {
      const data = await dashboardService.getAdminSummary(force);
      setActiveUsersCount(data.activeUsersCount);
      setReviewBoxesCount(data.reviewBoxesCount);
      setDraftReportsCount(data.draftReportsCount);
    } catch (error) {
      console.log('Error loading admin summary', error);
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

  const handleRegisterExpense = async () => {
    if (usuario?.id) {
      // 1. Intentamos con la caché específica de cajas (por si navegó a la sección)
      const boxes = pettyCashService.getCachedUserBoxes(usuario.id);
      const activeBox = boxes?.find(b => b.status === 'ABIERTA');
      if (activeBox) {
        navigation.navigate('RegisterExpense', { cajaId: activeBox.id });
        return;
      }
    }
    
    // 2. Fallback: aseguramos que el resumen del dashboard esté cargado
    try {
      const summary = await dashboardService.getAdminSummary(false);
      if (summary?.activePettyCashId) {
        navigation.navigate('RegisterExpense', { cajaId: summary.activePettyCashId });
        return;
      }
    } catch (error) {
      console.log('Error obteniendo resumen para registro:', error);
    }

    // 3. Si definitivamente no hay caja abierta, manda sin cajaId (reembolso directo)
    navigation.navigate('RegisterExpense');
  };

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
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Resumen Administrativo</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 15 }}>
        <CardHome title="Usuarios Activos" value={activeUsersCount} iconName="people-outline" onPress={() => navigation.navigate('UserManagement', { initialFilter: 'ACTIVO' })} />
        <CardHome title="Reportes en borrador" value={draftReportsCount || 10} iconName="document-text-outline" />
        <CardHome title="Cajas en revisión" value={reviewBoxesCount} iconName="wallet-outline" onPress={() => navigation.navigate('PettyCash')} />
      </View>
      <Text style={[stylesTexts.titleHome, { paddingBottom: 15 }]}>Acciones Rápidas</Text>
      {/* <ButtonPrimary
        text="Mi Caja Chica"
        onPress={() => navigation.navigate('PettyCash', { mode: 'personal' })}
        iconName="wallet-outline"
      /> */}
      <ButtonPrimary
        text="Gestionar Usuarios"
        onPress={() => navigation.navigate('UserManagement')}
        iconName="people-outline"
      />

      <ButtonSecondary
        text="Registrar gasto"
        onPress={handleRegisterExpense}
        iconName="receipt-outline"
      />
      <View style={{ height: 10 }} />

      {/* <ButtonSecondary text="Ver Reportes Globales" onPress={() => { }} iconName="stats-chart" /> */}

      <ButtonTertiary onPress={() => navigation.navigate('PettyCash', { mode: 'admin' })}
        iconName="wallet-outline"
        text="Revisar Cajas Chicas" />


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