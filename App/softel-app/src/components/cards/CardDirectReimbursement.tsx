import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import { DirectReimbursementUser } from '@/features/petty-cash/services/pettyCashService';

interface Props {
    user: DirectReimbursementUser;
    onPress?: () => void;
}

const formatMoney = (val: number): string => {
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getInitials = (name?: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Tarjeta de Colaborador con Reembolsos Directos Pendientes (Deuda de la Empresa).
 * Se delega en este componente para mantener AdminPettyCashScreen desacoplado y limpio.
 */
const CardDirectReimbursement: React.FC<Props> = ({ user, onPress }) => {
    const initials = getInitials(user.userNames);

    return (
        <TouchableOpacity
            style={[stylesComponents.cardHistoryContainer, { marginBottom: 12 }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[stylesComponents.rowBetween, { marginBottom: 12 }]}>
                <View style={stylesComponents.cardInfoCol}>
                    <View style={stylesComponents.cardAvatarInitials}>
                        <Text style={[stylesTexts.textButtonPrimary, { fontWeight: '700' }]}>
                            {initials}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                            {user.userNames}
                        </Text>
                        <Text style={[stylesTexts.cardProfileRole, { marginBottom: 0 }]}>
                            DNI: {user.document} • Reembolso Directo
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[stylesComponents.rowBetween, { paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[stylesTexts.litleTitle, { marginBottom: 0 }]}>TOTAL A REEMBOLSAR</Text>
                <Text style={[stylesTexts.basicTitle, { fontSize: 18, color: colors.primary, marginBottom: 0 }]}>
                    S/ {formatMoney(user.totalOwed)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default CardDirectReimbursement;
