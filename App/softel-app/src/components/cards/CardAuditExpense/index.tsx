import React from 'react';
import { View } from 'react-native';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
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
}

export interface CardAuditExpenseProps {
    gasto: AuditExpenseData;
    esAdmin?: boolean;
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
    loading = false,
    colorAcento = colors.primary,
    onAprobar,
    onObservar,
    onRechazar,
    onVerFoto,
}) => {
    return (
        <View style={stylesComponents.cardAuditContainer}>
            {/* Barra de Acento Vertical Izquierda */}
            <View style={[stylesComponents.cardAuditAccentBar, { backgroundColor: colorAcento }]} />

            {/* Parte 1: Motivo del gasto y Tags (Categoría + Nro) */}
            <CardAuditExpenseHeader
                motivo={gasto.motivo}
                categoriaNombre={gasto.categoriaNombre}
                comprobanteNumero={gasto.comprobanteNumero}
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

            {/* Parte 4: Fila de Botones de Auditoría (Admin / Operador) */}
            <CardAuditExpenseActions
                esAdmin={esAdmin}
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
