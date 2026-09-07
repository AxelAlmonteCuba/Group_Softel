import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import StatusBadge from '@/components/common/StatusBadge';

export interface HistoryPettyCashItem {
    id: string;
    codigo: string;
    obraOProyecto: string;
    fechaInicio: string;
    fechaFin: string;
    estado: 'LIQUIDADA' | 'EN_REVISION' | 'RECHAZADA' | 'CERRADA' | 'ABIERTA' | 'SOLICITADA' | 'APROBADA' | string;
    fondoBase: number;
    gastado: number;
    devuelto: number;
    comprobantesCount: number;
}

interface CardHistoryPettyCashProps {
    data: HistoryPettyCashItem;
    onPressDetail?: (item: HistoryPettyCashItem) => void;
}



/**
 * Formatea un valor numérico a moneda peruana (S/ 1,500.00).
 */
const formatMoney = (amount: number): string => {
    return `S/ ${amount.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Tarjeta de Historial de Cajas Asignadas (Cajas Liquidadas / Cerradas).
 *
 * Utiliza tipografías y estilos preexistentes:
 * - Títulos / Subtítulos: `stylesTexts.textCardOptionTitle`, `stylesTexts.cardProfileRole`.
 * - Etiquetas métricas: `stylesTexts.litleTitle`.
 * - Enlace acción: `stylesTexts.textButtonOptionTer`.
 */
const CardHistoryPettyCash: React.FC<CardHistoryPettyCashProps> = ({
    data,
    onPressDetail,
}) => {

    return (
        <View style={stylesComponents.cardHistoryContainer}>
            {/* Fila 1: Código a la izquierda y Badge de Estado a la derecha */}
            <View style={stylesComponents.cardHistoryHeader}>
                <Text style={[stylesTexts.textCardOptionTitle, { fontSize: 17, marginBottom: 0 }]}>
                    {data.codigo}
                </Text>

                {/* Badge de Estado Dinámico reutilizable */}
                <StatusBadge status={data.estado} variant="tag" />
            </View>

            {/* Fila 2: Nombre de Obra / Proyecto abajo del código con espacio */}
            <View style={{ marginTop: 4, marginBottom: 8 }}>
                <Text
                    style={[stylesTexts.cardProfileRole, { fontSize: 14, color: colors.textSecondary, marginBottom: 0 }]}
                    numberOfLines={1}
                >
                    • {data.obraOProyecto}
                </Text>
            </View>

            {/* Fila 3: Rango de Fechas con icono de calendario con buena separación */}
            <View style={[stylesComponents.cardHistoryDateRow, { marginBottom: 16 }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[stylesTexts.cardProfileRole, { fontSize: 13, marginBottom: 0 }]}>
                    {data.fechaInicio} - {data.fechaFin}
                </Text>
            </View>

            {/* Fila 4: Caja de Métricas (3 Columnas con divisor) */}
            <View style={stylesComponents.cardHistoryMetricsBox}>
                {/* Columna: Fondo Base */}
                <View style={stylesComponents.cardHistoryMetricCol}>
                    <Text style={[stylesTexts.litleTitle, { fontSize: 10, textAlign: 'center', marginBottom: 2 }]}>
                        FONDO BASE
                    </Text>
                    <Text style={[stylesTexts.textCardOptionTitle, { fontSize: 14, textAlign: 'center', marginBottom: 0 }]}>
                        {formatMoney(data.fondoBase)}
                    </Text>
                </View>

                <View style={stylesComponents.cardHistoryMetricDivider} />

                {/* Columna: Gastado (Rojo Softel) */}
                <View style={stylesComponents.cardHistoryMetricCol}>
                    <Text style={[stylesTexts.litleTitle, { fontSize: 10, textAlign: 'center', marginBottom: 2 }]}>
                        GASTADO
                    </Text>
                    <Text
                        style={[
                            stylesTexts.textCardOptionTitle,
                            { fontSize: 14, textAlign: 'center', color: colors.primary, fontWeight: '700', marginBottom: 0 },
                        ]}
                    >
                        {formatMoney(data.gastado)}
                    </Text>
                </View>

                <View style={stylesComponents.cardHistoryMetricDivider} />

                {/* Columna: Devuelto */}
                <View style={stylesComponents.cardHistoryMetricCol}>
                    <Text style={[stylesTexts.litleTitle, { fontSize: 10, textAlign: 'center', marginBottom: 2 }]}>
                        DEVUELTO
                    </Text>
                    <Text style={[stylesTexts.textCardOptionTitle, { fontSize: 14, textAlign: 'center', marginBottom: 0 }]}>
                        {formatMoney(data.devuelto)}
                    </Text>
                </View>
            </View>

            {/* Fila 5: Footer en 2 líneas sin superposición */}
            <View style={stylesComponents.cardHistoryFooter}>
                {/* Lado izquierdo en 2 líneas */}
                <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[stylesTexts.cardProfileRole, { fontSize: 13, lineHeight: 18, marginBottom: 0 }]}>
                        {data.comprobantesCount} Comprobantes{'\n'}aprobados
                    </Text>
                </View>

                {/* Lado derecho en 2 líneas + Chevron */}
                <TouchableOpacity
                    onPress={() => onPressDetail?.(data)}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                    <Text
                        style={[
                            stylesTexts.textButtonOptionTer,
                            { fontSize: 13, textAlign: 'right', lineHeight: 18, marginBottom: 0 },
                        ]}
                    >
                        Ver detalle de{'\n'}comprobantes
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CardHistoryPettyCash;
