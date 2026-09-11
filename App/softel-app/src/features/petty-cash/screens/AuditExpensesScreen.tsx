import React from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '@/components/layout/HeaderBar';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import CardAuditExpense from '@/components/cards/CardAuditExpense';
import PhotoPreviewModal from '@/components/modals/PhotoPreviewModal';
import AuditDecisionModal from '@/components/modals/AuditDecisionModal';
import { useAuditExpenses } from '@/features/petty-cash/hooks/useAuditExpenses';
import { MainStackParamList } from '@/navigation/types';

type AuditExpensesRouteProp = RouteProp<MainStackParamList, 'AuditExpenses'>;

/**
 * Pantalla de Auditoría de Gastos (Refactorizada y Modular).
 * Capa pura de presentación que delega el estado y lógica al hook `useAuditExpenses`.
 * Si la caja está LIQUIDADA o CERRADA, congela todas las opciones de edición y auditoría.
 */
const AuditExpensesScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<AuditExpensesRouteProp>();
    const cajaId = route.params?.cajaId;
    const initialCajaStatus = route.params?.cajaStatus;
    const cajaJustification = route.params?.cajaJustification;

    const usuario = useAuthStore((state) => state.usuario);
    const isAdmin = usuario?.rol === 'ADMINISTRADOR';

    const {
        expenses,
        loading,
        refreshing,
        actionLoadingId,
        previewImage,
        auditModalVisible,
        auditDecision,
        auditComment,
        submittingAudit,
        isCajaCongelada,
        isCajaLiquidada,
        handleRefresh,
        handleAprobar,
        handleObservar,
        handleRechazar,
        submitAuditDecision,
        handleVerFoto,
        closePreview,
        closeAuditModal,
        setAuditComment,
    } = useAuditExpenses(cajaId, isAdmin, initialCajaStatus);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar
                title="Auditoría de Gastos"
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[stylesTexts.cardProfileRole, { marginTop: 12 }]}>
                        Cargando gastos de la caja chica...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={stylesComponents.containerApp}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 36 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Banner informativo de Caja Chica Congelada (LIQUIDADA o CERRADA) */}
                    {isCajaCongelada && (
                        <View style={stylesComponents.frozenBannerContainer}>
                            <Ionicons
                                name={isCajaLiquidada ? 'lock-closed' : 'time'}
                                size={22}
                                color={isCajaLiquidada ? colors.liquidated : colors.warning}
                            />
                            <View style={stylesComponents.flex1}>
                                <Text
                                    style={[
                                        stylesTexts.textCardOptionTitle,
                                        {
                                            color: isCajaLiquidada ? colors.liquidated : colors.warning,
                                            marginBottom: 2,
                                            fontWeight: '700',
                                        },
                                    ]}
                                >
                                    {isCajaLiquidada ? 'Caja Chica Liquidada' : 'Caja Chica Cerrada'}
                                </Text>
                                <Text
                                    style={[
                                        stylesTexts.cardProfileRole,
                                        { color: colors.textSecondary, marginBottom: 0, fontSize: 12, lineHeight: 16 },
                                    ]}
                                >
                                    {isCajaLiquidada
                                        ? 'Esta caja se encuentra liquidada definitivamente. Los comprobantes y saldos están congelados en modo solo lectura.'
                                        : 'Esta caja se encuentra cerrada para conciliación. Los gastos no admiten más modificaciones.'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Banner informativo de Justificación de la Caja Chica para auditoría */}
                    {cajaJustification ? (
                        <View
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderLeftWidth: 4,
                                borderLeftColor: colors.primary,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        color: colors.textSecondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    Motivo / Justificación de la Caja
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: colors.textPrimary,
                                    fontWeight: '500',
                                    lineHeight: 18,
                                }}
                            >
                                {cajaJustification}
                            </Text>
                        </View>
                    ) : null}

                    {expenses.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 24 }}>
                            <Ionicons
                                name="receipt-outline"
                                size={56}
                                color={colors.textSecondary}
                                style={{ opacity: 0.5, marginBottom: 12 }}
                            />
                            <Text style={stylesTexts.emptyListText}>
                                No se encontraron gastos registrados para esta caja chica.
                            </Text>
                        </View>
                    ) : (
                        expenses.map((gasto) => (
                            <CardAuditExpense
                                key={gasto.id}
                                gasto={gasto}
                                esAdmin={isAdmin}
                                bloqueado={isCajaCongelada}
                                loading={actionLoadingId === gasto.id}
                                onAprobar={handleAprobar}
                                onObservar={handleObservar}
                                onRechazar={handleRechazar}
                                onVerFoto={handleVerFoto}
                            />
                        ))
                    )}
                </ScrollView>
            )}

            {/* Modal: Visor de Fotografía */}
            <PhotoPreviewModal
                visible={Boolean(previewImage)}
                imageUrl={previewImage}
                onClose={closePreview}
            />

            {/* Modal: Decisión de Auditoría (Observar / Rechazar con Comentario) */}
            <AuditDecisionModal
                visible={auditModalVisible}
                decision={auditDecision}
                comment={auditComment}
                loading={submittingAudit}
                onChangeComment={setAuditComment}
                onConfirm={submitAuditDecision}
                onCancel={closeAuditModal}
            />
        </SafeAreaView>
    );
};

export default AuditExpensesScreen;
