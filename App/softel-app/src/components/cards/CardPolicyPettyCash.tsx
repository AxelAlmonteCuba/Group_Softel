import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface CardPolicyPettyCashProps {
    title?: string;
    description?: string;
}

/**
 * Tarjeta informativa de normativa y política para la apertura de Caja Chica.
 * Cuenta con acento vertical rojo corporativo a la izquierda, icono de billetera en squircle suave
 * y textos informativos claros sobre la transferencia y comprobantes digitales.
 */
const CardPolicyPettyCash: React.FC<CardPolicyPettyCashProps> = ({
    title = 'NORMATIVA DE APERTURA •',
    description = 'El fondo solicitado será transferido tras aprobación administrativa. Cada gasto requerirá comprobante digital (boleta o factura).',
}) => {
    return (
        <View style={stylesComponents.cardPolicyContainer}>
            {/* Barra lateral roja izquierda */}
            <View style={stylesComponents.cardPolicyLeftBar} />

            {/* Contenido de la tarjeta */}
            <View style={stylesComponents.cardPolicyContent}>
                {/* Contenedor de icono squircle suave */}
                <View style={stylesComponents.cardPolicyIconContainer}>
                    <Ionicons name="wallet-outline" size={22} color={colors.primary} />
                </View>

                {/* Textos informativos con estilos estándar globales */}
                <View style={{ flex: 1 }}>
                    <Text style={[stylesTexts.litleTitle, { color: colors.primary }]}>
                        {title}
                    </Text>
                    <Text style={[stylesTexts.subtitle, { textAlign: 'left', marginBottom: 0 }]}>
                        {description}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default CardPolicyPettyCash;
