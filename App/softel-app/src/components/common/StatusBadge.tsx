import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export type PettyCashStatus =
    | 'SOLICITADA'
    | 'APROBADA'
    | 'RECHAZADA'
    | 'ABIERTA'
    | 'EN_REVISION'
    | 'CERRADA'
    | 'LIQUIDADA'
    | string;

export type StatusBadgeVariant = 'pill' | 'tag';

interface StatusBadgeConfig {
    label: string;
    bgColor: string;
    dotColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// ─────────────────────────────────────────────────────────────────────────────
// Config centralizada de estados — única fuente de verdad en el proyecto
// ─────────────────────────────────────────────────────────────────────────────

export const getStatusBadgeConfig = (status?: PettyCashStatus): StatusBadgeConfig => {
    const raw = (status || '').trim().toUpperCase();
    const cleanStatus = raw.includes('APROB')
        ? 'APROBADO'
        : raw.includes('RECHAZ')
        ? 'RECHAZADO'
        : raw.includes('OBSERV')
        ? 'OBSERVADO'
        : raw.includes('PEND')
        ? 'PENDIENTE'
        : raw;

    switch (cleanStatus) {
        case 'SOLICITADA':
            return {
                label: 'SOLICITADA',
                bgColor: colors.warningSoft,
                dotColor: colors.warning,
                textColor: colors.warning,
                borderColor: '#FDE68A',
                icon: 'hourglass-outline',
            };
        case 'APROBADA':
            return {
                label: 'APROBADA',
                bgColor: colors.successSoft,
                dotColor: colors.success,
                textColor: colors.success,
                borderColor: '#BBF7D0',
                icon: 'checkmark-outline',
            };
        case 'ABIERTA':
            return {
                label: 'ABIERTA',
                bgColor: colors.successSoft,
                dotColor: colors.success,
                textColor: colors.success,
                borderColor: '#BBF7D0',
                icon: 'radio-button-on',
            };
        case 'EN_REVISION':
            return {
                label: 'EN REVISIÓN',
                bgColor: colors.warningSoft,
                dotColor: colors.warning,
                textColor: colors.warning,
                borderColor: '#FDE68A',
                icon: 'time-outline',
            };
        case 'CERRADA':
            return {
                label: 'CERRADA',
                bgColor: colors.infoSoft,
                dotColor: colors.info,
                textColor: colors.info,
                borderColor: colors.border,
                icon: 'lock-closed-outline',
            };
        case 'LIQUIDADA':
            return {
                label: 'LIQUIDADA',
                bgColor: colors.liquidatedSoft,
                dotColor: colors.liquidated,
                textColor: colors.liquidated,
                borderColor: '#BAE6FD',
                icon: 'checkmark-circle-outline',
            };
        case 'RECHAZADA':
        case 'RECHAZADO':
            return {
                label: status === 'RECHAZADA' ? 'RECHAZADA' : 'RECHAZADO',
                bgColor: colors.errorSoft,
                dotColor: colors.error,
                textColor: colors.error,
                borderColor: '#FECACA',
                icon: 'close-circle-outline',
            };
        case 'PENDIENTE':
            return {
                label: 'PENDIENTE',
                bgColor: colors.warningSoft,
                dotColor: colors.warning,
                textColor: colors.warning,
                borderColor: '#FDE68A',
                icon: 'hourglass-outline',
            };
        case 'APROBADO':
            return {
                label: 'APROBADO',
                bgColor: colors.successSoft,
                dotColor: colors.success,
                textColor: colors.success,
                borderColor: '#BBF7D0',
                icon: 'checkmark-outline',
            };
        case 'OBSERVADO':
            return {
                label: 'OBSERVADO',
                bgColor: '#FEF9C3',
                dotColor: '#CA8A04',
                textColor: '#A16207',
                borderColor: '#FDE68A',
                icon: 'alert-circle-outline',
            };
        default:
            return {
                label: status || 'DESCONOCIDO',
                bgColor: colors.background,
                dotColor: colors.textSecondary,
                textColor: colors.textSecondary,
                borderColor: colors.border,
                icon: 'information-circle-outline',
            };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Props del componente
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
    /** Estado de negocio de la caja chica */
    status?: PettyCashStatus;
    /**
     * `pill`  → dot + texto sobre fondo de color (usado en cabeceras de tarjeta)
     * `tag`   → ícono + texto con borde (usado en historial)
     */
    variant?: StatusBadgeVariant;
    style?: ViewStyle;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Badge de estado reutilizable para cajas chicas.
 *
 * - `variant="pill"` (default): fondo coloreado + dot circular + texto.
 * - `variant="tag"`:  borde + ícono vectorial + texto (estilo historial).
 *
 * @example
 * // Variante pill (cabecera de tarjeta)
 * <StatusBadge status={caja.status} />
 *
 * @example
 * // Variante tag (fila de historial)
 * <StatusBadge status={item.estado} variant="tag" />
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'pill',
    style,
}) => {
    const cfg = getStatusBadgeConfig(status);

    if (variant === 'tag') {
        return (
            <View
                style={[
                    stylesComponents.cardHistoryBadge,
                    {
                        backgroundColor: cfg.bgColor,
                        borderColor: cfg.borderColor,
                    },
                    style,
                ]}
            >
                <Ionicons name={cfg.icon} size={14} color={cfg.textColor} />
                <Text
                    style={[
                        stylesTexts.litleTitle,
                        {
                            fontSize: 10,
                            marginBottom: 0,
                            color: cfg.textColor,
                            fontWeight: '700',
                        },
                    ]}
                >
                    {cfg.label}
                </Text>
            </View>
        );
    }

    // variant === 'pill' (default)
    return (
        <View
            style={[
                stylesComponents.badgePill,
                { backgroundColor: cfg.bgColor },
                style,
            ]}
        >
            <View
                style={[
                    stylesComponents.badgeDot,
                    { backgroundColor: cfg.dotColor },
                ]}
            />
            <Text
                style={[
                    stylesTexts.badgeText,
                    {
                        color: cfg.textColor,
                        fontWeight: '700',
                        letterSpacing: 0.3,
                    },
                ]}
            >
                {cfg.label}
            </Text>
        </View>
    );
};

export default StatusBadge;
