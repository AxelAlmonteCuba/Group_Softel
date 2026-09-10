import React from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import HeaderBar from '@/components/layout/HeaderBar';
import EmptyState from '@/components/common/EmptyState';
import CardAdminPettyCash from '@/components/cards/CardAdminPettyCash';
import CardAuditExpense from '@/components/cards/CardAuditExpense';
import PhotoPreviewModal from '@/components/modals/PhotoPreviewModal';
import AuditDecisionModal from '@/components/modals/AuditDecisionModal';
import SegmentedDualButton from '@/components/buttons/SegmentedDualButton';
import FilterChips from '@/components/inputs/FilterChips';
import { useAdminPettyCash, AdminTrayTab } from '../hooks/useAdminPettyCash';

interface Props {
    onBack?: () => void;
    onFilterPress?: () => void;
}

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

/**
 * Pantalla de Control de Fondos y Cajas Chicas para el Administrador y Contador.
 * Toda la lógica de estado, filtros, carga y auditoría se delega al hook useAdminPettyCash.
 */
const AdminPettyCashScreen: React.FC<Props> = ({ onBack, onFilterPress }) => {
    const navigation = useNavigation<NavigationProp>();
    const {
        isAdmin,
        selectedTab,
        setSelectedTab,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedExpenseFilter,
        setSelectedExpenseFilter,
        totalCajas,
        totalReembolsos,
        filterOptionsCajas,
        filterOptionsReembolsos,
        filteredCajas,
        filteredReembolsos,
        isLoading,
        isRefreshing,
        handleRefresh,
        directAudit,
    } = useAdminPettyCash();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Cabecera limpia */}
            <HeaderBar
                title="Control de Fondos"
                onBack={onBack}
                rightIcon="filter-outline"
                onRightPress={onFilterPress}
            />

            {/* Selector dual superior */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                <SegmentedDualButton<AdminTrayTab>
                    options={[
                        {
                            value: 'cajas',
                            label: 'Cajas Chicas',
                            iconName: 'wallet-outline',
                            count: totalCajas,
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

            {/* Chips de filtrado estandarizados */}
            <View style={{ marginBottom: 6 }}>
                {selectedTab === 'cajas' ? (
                    <FilterChips
                        options={filterOptionsCajas}
                        selectedValue={selectedStatusFilter}
                        onSelect={setSelectedStatusFilter}
                    />
                ) : (
                    <FilterChips
                        options={filterOptionsReembolsos}
                        selectedValue={selectedExpenseFilter}
                        onSelect={setSelectedExpenseFilter}
                    />
                )}
            </View>

            {/* Listado de elementos según la opción seleccionada */}
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16 }}
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
                {isLoading ? (
                    <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                ) : selectedTab === 'cajas' ? (
                    filteredCajas.length === 0 ? (
                        <EmptyState
                            iconName="folder-open-outline"
                            title="No hay cajas chicas en este estado"
                            description="Selecciona otro filtro para ver las cajas chicas en operación o auditoría."
                        />
                    ) : (
                        <View style={{ marginTop: 2 }}>
                            {filteredCajas.map((caja) => (
                                <CardAdminPettyCash
                                    key={caja.id}
                                    caja={caja}
                                    onPress={() => {
                                        navigation.navigate('PettyCashDetail', { id: caja.id });
                                    }}
                                />
                            ))}
                        </View>
                    )
                ) : filteredReembolsos.length === 0 ? (
                    <EmptyState
                        iconName="folder-open-outline"
                        title="No hay reembolsos en este estado"
                        description={
                            totalReembolsos === 0
                                ? 'No hay comprobantes de reembolso directo registrados en el sistema.'
                                : 'Selecciona otro filtro para ver los comprobantes directos.'
                        }
                    />
                ) : (
                    <View style={{ marginTop: 2 }}>
                        {filteredReembolsos.map((gasto) => (
                            <CardAuditExpense
                                key={gasto.id}
                                gasto={gasto}
                                esAdmin={isAdmin}
                                bloqueado={false}
                                loading={directAudit.actionLoadingId === gasto.id}
                                onAprobar={directAudit.handleAprobar}
                                onObservar={directAudit.handleObservar}
                                onRechazar={directAudit.handleRechazar}
                                onLiquidar={directAudit.handleLiquidar}
                                onVerFoto={directAudit.handleVerFoto}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modal de Previsualización de Foto */}
            <PhotoPreviewModal
                visible={!!directAudit.previewImage}
                imageUrl={directAudit.previewImage}
                onClose={directAudit.closePreview}
            />

            {/* Modal de Justificación para Observar o Rechazar */}
            <AuditDecisionModal
                visible={directAudit.auditModalVisible}
                decision={directAudit.auditDecision}
                comment={directAudit.auditComment}
                onChangeComment={directAudit.setAuditComment}
                onCancel={directAudit.closeAuditModal}
                onConfirm={directAudit.submitAuditDecision}
                loading={directAudit.submittingAudit}
            />
        </View>
    );
};

export default AdminPettyCashScreen;
