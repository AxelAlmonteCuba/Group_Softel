import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import CardAuditExpenseHeader from './CardAuditExpenseHeader';
import CardAuditExpenseAmount from './CardAuditExpenseAmount';
import CardAuditExpenseEvidence from './CardAuditExpenseEvidence';
import CardAuditExpenseActions from './CardAuditExpenseActions';

export interface AuditExpenseData {
    id: string;
    motivo: string;
    monto: number;
    categoriaNombre?: string;
    comprobanteNumero?: string;
    metodoPago?: string;
    tipoComprobante?: string;
    nombreArchivo?: string;
    pesoArchivo?: string;
    ruc?: string;
    urlComprobante?: string;
    estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'OBSERVADO' | string;
    comentariosAuditoria?: string | null;
}

export interface CardAuditExpenseProps {
    gasto: AuditExpenseData;
    esAdmin?: boolean;
    bloqueado?: boolean;
    loading?: boolean;
    colorAcento?: string;
    onAprobar?: (id: string) => void;
    onObservar?: (id: string) => void;
    onRechazar?: (id: string) => void;
    onVerFoto?: (url?: string) => void;
}

/**
 * Componente Principal: CardAuditExpense
 * Ensambla de forma modular y desacoplada las 4 partes:
 *   1. CardAuditExpenseHeader   (Motivo y Tags)
 *   2. CardAuditExpenseAmount   (Importe Solicitado y Chips)
 *   3. CardAuditExpenseEvidence (Comprobante y Ver Foto)
 *   4. CardAuditExpenseActions  (Rechazar, Observar, Aprobar con RBAC)
 *
 * Reutiliza los estilos centralizados de stylesComponents.
 */
export const CardAuditExpense: React.FC<CardAuditExpenseProps> = ({
    gasto,
    esAdmin = true,
    bloqueado = false,
    loading = false,
    colorAcento,
    onAprobar,
    onObservar,
    onRechazar,
    onVerFoto,
}) => {
    const estadoNormalizado = (gasto.estado || '').trim().toUpperCase();
    const acentoFinal =
        colorAcento ||
        (estadoNormalizado.includes('APROB')
            ? '#16A34A'
            : estadoNormalizado.includes('RECHAZ')
            ? '#DC2626'
            : estadoNormalizado.includes('OBSERV')
            ? '#CA8A04'
            : estadoNormalizado.includes('PEND')
            ? '#F59E0B'
            : colors.primary);

    return (
        <View style={stylesComponents.cardAuditContainer}>
            {/* Barra de Acento Vertical Izquierda */}
            <View style={[stylesComponents.cardAuditAccentBar, { backgroundColor: acentoFinal }]} />

            {/* Parte 1: Motivo del gasto y Tags (Categoría + Nro + StatusBadge) */}
            <CardAuditExpenseHeader
                motivo={gasto.motivo}
                categoriaNombre={gasto.categoriaNombre}
                comprobanteNumero={gasto.comprobanteNumero}
                estado={gasto.estado}
            />

            {/* Parte 2: Recuadro de Importe Solicitado */}
            <CardAuditExpenseAmount
                monto={gasto.monto}
                metodoPago={gasto.metodoPago}
                tipoComprobante={gasto.tipoComprobante}
            />

            {/* Parte 3: Recuadro de Evidencia / Archivo y Ver foto */}
            <CardAuditExpenseEvidence
                nombreArchivo={gasto.nombreArchivo}
                pesoArchivo={gasto.pesoArchivo}
                ruc={gasto.ruc}
                tipoComprobante={gasto.tipoComprobante}
                urlComprobante={gasto.urlComprobante}
                onPressVerFoto={onVerFoto}
            />

            {/* Comentario de Auditoría (si fue observado o rechazado) */}
            {Boolean(gasto.comentariosAuditoria) && (
                <View
                    style={[
                        stylesComponents.cardAuditCommentBox,
                        gasto.estado === 'OBSERVADO' && {
                            backgroundColor: '#FEF9C3',
                            borderColor: '#FDE68A',
                        },
                    ]}
                >
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={16}
                        color={gasto.estado === 'OBSERVADO' ? '#CA8A04' : colors.error}
                    />
                    <Text
                        style={[
                            stylesTexts.cardProfileRole,
                            {
                                color: gasto.estado === 'OBSERVADO' ? '#A16207' : colors.error,
                                flex: 1,
                                marginBottom: 0,
                                fontWeight: '600',
                            },
                        ]}
                    >
                        Auditoría: {gasto.comentariosAuditoria}
                    </Text>
                </View>
            )}

            {/* Parte 4: Fila de Botones de Auditoría (Admin / Operador) */}
            <CardAuditExpenseActions
                esAdmin={esAdmin}
                bloqueado={bloqueado}
                estado={gasto.estado}
                loading={loading}
                onAprobar={() => onAprobar?.(gasto.id)}
                onObservar={() => onObservar?.(gasto.id)}
                onRechazar={() => onRechazar?.(gasto.id)}
            />
        </View>
    );
};

export default CardAuditExpense;

// Re-exportar subcomponentes individuales para máxima modularidad
export { CardAuditExpenseHeader } from './CardAuditExpenseHeader';
export { CardAuditExpenseAmount } from './CardAuditExpenseAmount';
export { CardAuditExpenseEvidence } from './CardAuditExpenseEvidence';
export { CardAuditExpenseActions } from './CardAuditExpenseActions';
