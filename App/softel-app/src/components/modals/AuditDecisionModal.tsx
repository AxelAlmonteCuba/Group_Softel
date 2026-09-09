import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface AuditDecisionModalProps {
    visible: boolean;
    decision: 'OBSERVADO' | 'RECHAZADO';
    comment: string;
    loading?: boolean;
    onChangeComment: (text: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Modal para ingresar la justificación obligatoria al Observar o Rechazar un comprobante.
 */
export const AuditDecisionModal: React.FC<AuditDecisionModalProps> = ({
    visible,
    decision,
    comment,
    loading = false,
    onChangeComment,
    onConfirm,
    onCancel,
}) => {
    const isObservado = decision === 'OBSERVADO';
    const accentColor = isObservado ? '#CA8A04' : colors.error;
    const title = isObservado ? 'Observar Comprobante' : 'Rechazar Gasto';
    const iconName = isObservado ? 'warning-outline' : 'close-circle-outline';
    const subtitle = isObservado
        ? 'Indica el motivo de observación (ej: comprobante borroso, monto discordante) para que el trabajador lo subsane.'
        : 'Indica el motivo de rechazo definitivo del gasto.';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => {
                if (!loading) onCancel();
            }}
        >
            <View style={stylesComponents.modalOverlay}>
                <View style={stylesComponents.modalCard}>
                    {/* Cabecera del Modal */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                        <Ionicons name={iconName} size={22} color={accentColor} />
                        <Text style={[stylesTexts.textCardOptionTitle, { marginBottom: 0, fontWeight: '700' }]}>
                            {title}
                        </Text>
                    </View>

                    <Text style={[stylesTexts.cardProfileRole, { marginBottom: 10 }]}>
                        {subtitle}
                    </Text>

                    {/* Campo de Texto para la Justificación */}
                    <TextInput
                        style={stylesComponents.modalInput}
                        placeholder="Escribe el comentario de auditoría aquí..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        maxLength={250}
                        value={comment}
                        onChangeText={onChangeComment}
                        editable={!loading}
                    />

                    {/* Fila de Botones de Confirmación */}
                    <View style={stylesComponents.modalActionsRow}>
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={loading}
                            activeOpacity={0.7}
                            style={{ paddingVertical: 10, paddingHorizontal: 14 }}
                        >
                            <Text style={[stylesTexts.badgeText, { color: colors.textSecondary, fontWeight: '700' }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={{
                                backgroundColor: accentColor,
                                borderRadius: 10,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.textOnPrimary} />
                            ) : (
                                <Text style={[stylesTexts.textButtonPrimary, { fontSize: 13, fontWeight: '700' }]}>
                                    Confirmar {isObservado ? 'Observación' : 'Rechazo'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AuditDecisionModal;
