import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

import HeaderBar from '@/components/layout/HeaderBar';
import EmptyState from '@/components/common/EmptyState';
import CardEmptyPettyCash from '@/components/cards/CardEmptyPettyCash';
import CardActivePettyCash from '@/components/cards/CardActivePettyCash';
import CardHistoryPettyCash, { HistoryPettyCashItem } from '@/components/cards/CardHistoryPettyCash';
import CardAuditExpense from '@/components/cards/CardAuditExpense';
import PhotoPreviewModal from '@/components/modals/PhotoPreviewModal';
import SegmentedDualButton from '@/components/buttons/SegmentedDualButton';
import FilterChips from '@/components/inputs/FilterChips';
import { useOperatorPettyCash, OperatorTab } from '../hooks/useOperatorPettyCash';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import { pettyCashService } from '../services/pettyCashService';

interface Props {
    onBack?: () => void;
    onHistoryPress?: () => void;
    targetUserId?: string;
    targetUserName?: string;
    netBalance?: number;
    isTabContext?: boolean;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla de Control de Fondos y Cajas Chicas para el Supervisor y Trabajador.
 * Lógica y estado delegados al hook useOperatorPettyCash.
 */
const OperatorPettyCashScreen: React.FC<Props> = ({ onBack, onHistoryPress, targetUserId, targetUserName, netBalance, isTabContext }) => {
    const navigation = useNavigation<NavigationProp>();
    const {
        selectedTab,
        setSelectedTab,
        selectedExpenseFilter,
        setSelectedExpenseFilter,
        loading,
        isRefreshing,
        cajaEnProceso,
        historyCajas,
        totalReembolsos,
        filterOptionsReembolsos,
        filteredReembolsos,
        directExpenses,
        handleRefresh,
    } = useOperatorPettyCash();

    const handleSolicitarApertura = () => {
        navigation.navigate('RequestPettyCash');
    };

    const handlePressDetail = (item: HistoryPettyCashItem) => {
        navigation.navigate('PettyCashDetail', { id: item.id, mode: 'registro' });
    };

    return (
        <SafeAreaView 
            style={{ flex: 1, backgroundColor: colors.background }}
            edges={isTabContext ? ['right', 'left'] : ['top', 'right', 'bottom', 'left']}
        >
            {/* Cabecera limpia estándar reutilizable */}
            <HeaderBar
                title={targetUserId
                    ? `Historial de ${targetUserName?.split(' ')[0]}`
                    : selectedTab === 'caja' ? 'Mi Caja Chica' : 'Mis Reembolsos Directos'
                }
                onBack={onBack}
                rightIcon={selectedTab === 'caja' ? 'time-outline' : undefined}
                onRightPress={selectedTab === 'caja' ? onHistoryPress : undefined}
            />

            {/* Selector dual superior */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
                <SegmentedDualButton<OperatorTab>
                    options={[
                        {
                            value: 'caja',
                            label: 'Caja Chica',
                            iconName: 'wallet-outline',
                            count: cajaEnProceso ? 1 : 0,
                        },
                        {
                            value: 'reembolsos',
                            label: 'Reembolsos Directos',
                            iconName: 'document-text-outline',
                            count: totalReembolsos,
                            countOnNewLine: true,
                        },
                    ]}
                    selectedValue={selectedTab}
                    onSelect={setSelectedTab}
                    variant="capsule"
                />
            </View>

            {/* Chips de filtrado estandarizados (solo en pestaña Reembolsos Directos) */}
            {selectedTab === 'reembolsos' && (
                <View style={{ marginBottom: 6 }}>
                    <FilterChips
                        options={filterOptionsReembolsos}
                        selectedValue={selectedExpenseFilter}
                        onSelect={setSelectedExpenseFilter}
                    />
                </View>
            )}

            {/* Contenido de la pantalla */}
            <ScrollView
                style={stylesComponents.containerApp}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {selectedTab === 'caja' ? (
                    <>
                        {/* 1. Validación de Caja en Proceso (Solo si no es modo Historial) */}
                        {!targetUserId && (
                            loading ? (
                                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : cajaEnProceso ? (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('PettyCashDetail', { id: cajaEnProceso.id, mode: 'registro' })}
                                    style={{ marginTop: 4, marginBottom: 12 }}
                                >
                                    <CardActivePettyCash caja={cajaEnProceso} />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ marginTop: 4, marginBottom: 24 }}>
                                    <CardEmptyPettyCash onPressRequest={handleSolicitarApertura} />
                                </View>
                            )
                        )}




                        {/* 2. Cabecera y Lista de Historial: SOLO se muestran si existen cajas pasadas */}
                        {historyCajas.length > 0 && (
                            <>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: 14,
                                        paddingHorizontal: 2,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={[stylesTexts.textCardOptionTitle, { fontSize: 17, marginBottom: 0 }]}>
                                            Historial de Cajas Asignadas
                                        </Text>
                                        <View
                                            style={{
                                                backgroundColor: colors.border,
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 12,
                                            }}
                                        >
                                            <Text style={[stylesTexts.litleTitle, { fontSize: 11, marginBottom: 0, color: colors.textPrimary }]}>
                                                {historyCajas.length}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={[stylesTexts.cardProfileRole, { fontSize: 15, marginBottom: 0 }]}>
                                        2026
                                    </Text>
                                </View>

                                {/* Lista de Tarjetas de Historial */}
                                {historyCajas.map((caja) => (
                                    <CardHistoryPettyCash
                                        key={caja.id}
                                        data={caja}
                                        onPressDetail={handlePressDetail}
                                    />
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    /* Pestaña: Mis Reembolsos Directos */
                    directExpenses.loading ? (
                        <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : filteredReembolsos.length === 0 ? (
                        <EmptyState
                            iconName="folder-open-outline"
                            title="No hay reembolsos en este estado"
                            description={
                                totalReembolsos === 0
                                    ? 'Los gastos que registres sin caja chica asignada aparecerán aquí para su seguimiento y liquidación.'
                                    : 'Selecciona otro filtro para ver tus comprobantes registrados.'
                            }
                        />
                    ) : (
                        <View style={{ marginTop: 2 }}>
                            {filteredReembolsos.map((gasto) => (
                                <CardAuditExpense
                                    key={gasto.id}
                                    gasto={gasto}
                                    esAdmin={false}
                                    bloqueado={false}
                                    loading={directExpenses.actionLoadingId === gasto.id}
                                    onVerFoto={directExpenses.handleVerFoto}
                                />
                            ))}
                        </View>
                    )
                )}

                <View style={{ height: 30 }} />
            </ScrollView>

            {targetUserId && (
                <View style={{ 
                    padding: 16, 
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: colors.border
                }}>
                    <ButtonPrimary
                        text={
                            (netBalance || 0) > 0
                                ? `Reembolsar al Usuario: S/ ${Math.abs(netBalance || 0).toFixed(2)}`
                                : (netBalance || 0) < 0
                                    ? `Devolución a Empresa: S/ ${Math.abs(netBalance || 0).toFixed(2)}`
                                    : `Liquidar (Saldos en 0)`
                        }
                        iconName="checkmark-done-outline"
                        onPress={() => {
                            const isPositive = (netBalance || 0) > 0;
                            const isNegative = (netBalance || 0) < 0;
                            const amount = Math.abs(netBalance || 0).toFixed(2);
                            
                            const confirmMessage = isPositive
                                ? `¿Confirmas que ya transferiste S/ ${amount} al colaborador para liquidar su deuda?`
                                : isNegative
                                    ? `¿Confirmas que el colaborador ya devolvió los S/ ${amount} sobrantes a la empresa?`
                                    : `¿Confirmas la liquidación consolidada sin saldos pendientes?`;

                            Alert.alert("Liquidar Saldos", confirmMessage, [
                                { text: "Cancelar", style: "cancel" },
                                {
                                    text: "Liquidar", onPress: async () => {
                                        try {
                                            await pettyCashService.liquidateUser(targetUserId)
                                            navigation.goBack()
                                        } catch (error) {
                                            Alert.alert("Error", "No se pudo liquidar al usuario")
                                        }
                                    }
                                }
                            ]);
                        }}
                    />
                </View>
            )}

            {/* Modal de Previsualización de Foto */}
            <PhotoPreviewModal
                visible={!!directExpenses.previewImage}
                imageUrl={directExpenses.previewImage}
                onClose={directExpenses.closePreview}
            />
        </SafeAreaView>
    );
};

export default OperatorPettyCashScreen;
