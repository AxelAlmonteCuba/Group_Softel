import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface UserBalance {
    userId: string;
    userNames: string;
    document: string;
    role: string;
    cajaBalance: number;
    directBalance: number;
    netBalance: number;
}

interface CardUserBalanceProps {
    data: UserBalance;
    onPress?: () => void;
}

const formatMoney = (val: number): string => {
    return Math.abs(val).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getInitials = (nombres: string): string => {
    const parts = (nombres || '').trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return nombres ? nombres.charAt(0).toUpperCase() : 'U';
};

const CardUserBalance: React.FC<CardUserBalanceProps> = ({ data, onPress }) => {
    const isDebt = data.netBalance < 0;
    const isPositive = data.netBalance > 0;
    
    // Configuración de colores
    const mainColor = isDebt ? colors.primary : (isPositive ? colors.textPrimary : colors.textSecondary);
    const badgeBg = isDebt ? '#FEE4E2' : '#F4F4F5';
    const badgeText = isDebt ? colors.primary : colors.textPrimary;
    const badgeLabel = isDebt ? 'Con Saldo' : (isPositive ? 'Reembolso' : 'Saldado');
    
    // Icono y texto inferior
    const iconName = isDebt ? 'arrow-down' : (isPositive ? 'arrow-up' : 'checkmark');
    const statusText = isDebt ? 'Deuda a empresa' : (isPositive ? 'Reembolso pendiente' : 'Saldado');

    return (
        <TouchableOpacity
            style={[
                stylesComponents.cardHistoryContainer, 
                stylesComponents.cardUserBalanceContainer,
                { borderLeftColor: mainColor }
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {/* 1. Cabecera */}
            <View style={[stylesComponents.rowBetween, stylesComponents.cardUserBalanceHeader]}>
                <View style={stylesComponents.cardInfoCol}>
                    <View style={[
                        stylesComponents.cardAvatarInitials, 
                        { backgroundColor: isDebt ? '#FEE4E2' : '#F4F4F5' }
                    ]}>
                        <Ionicons 
                            name="person" 
                            size={16} 
                            color={mainColor} 
                        />
                    </View>
                    <View style={stylesComponents.cardUserBalanceInfo}>
                        <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                            {data.userNames}
                        </Text>
                        <Text style={[stylesTexts.cardProfileRole, stylesTexts.cardUserBalanceRole]} numberOfLines={1}>
                            {data.role} • DNI {data.document}
                        </Text>
                    </View>
                </View>

                {/* Badge Superior */}
                <View style={[
                    stylesComponents.cardUserBalanceBadge,
                    { backgroundColor: badgeBg }
                ]}>
                    <Text style={[
                        stylesTexts.cardUserBalanceBadgeText,
                        { color: badgeText }
                    ]}>
                        {badgeLabel}
                    </Text>
                </View>
            </View>

            {/* Divisor */}
            <View style={stylesComponents.cardUserBalanceDivider} />

            {/* 2. Cuerpo Inferior */}
            <View style={[stylesComponents.rowBetween, stylesComponents.cardUserBalanceBody]}>
                {/* Desglose Izquierdo */}
                <View style={stylesComponents.cardUserBalanceLeftCol}>
                    <Text style={[stylesTexts.cardProfileRole, stylesTexts.cardUserBalanceRoleMargin]} numberOfLines={1}>
                        <Text style={stylesTexts.cardUserBalanceBullet}>•</Text> Cajas cerradas: S/ {data.cajaBalance.toFixed(2)}
                    </Text>
                    <Text style={[stylesTexts.cardProfileRole, stylesTexts.cardUserBalanceRole]} numberOfLines={1}>
                        <Text style={stylesTexts.cardUserBalanceBullet}>•</Text> Reembolsos: S/ {data.directBalance.toFixed(2)}
                    </Text>
                </View>

                {/* Saldo Neto Derecho */}
                <View style={stylesComponents.cardUserBalanceRightCol}>
                    <Text style={[
                        stylesTexts.basicTitle, 
                        stylesTexts.cardUserBalanceNetTitle,
                        { color: mainColor }
                    ]}>
                        S/ {data.netBalance < 0 ? '-' : ''}{formatMoney(data.netBalance)}
                    </Text>
                    <View style={stylesComponents.cardUserBalanceStatusRow}>
                        {data.netBalance !== 0 && (
                            <Ionicons name={iconName} size={14} color={mainColor} />
                        )}
                        <Text style={[stylesTexts.cardUserBalanceStatusText, { color: mainColor }]}>
                            {statusText}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CardUserBalance;
