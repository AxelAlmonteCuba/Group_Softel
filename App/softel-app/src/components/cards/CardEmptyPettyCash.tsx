import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';

interface CardEmptyPettyCashProps {
    title?: string;
    description?: string;
    buttonText?: string;
    onPressRequest?: () => void;
}

/**
 * Tarjeta de estado vacío para Caja Chica ("Sin Fondo Activo").
 *
 * Utiliza:
 * - Textos: estilos preexistentes `stylesTexts.basicTitle` y `stylesTexts.subtitle`.
 * - Botón: componente preexistente `ButtonPrimary`.
 * - Tarjeta e Icono: estilos `stylesComponents.cardEmptyPettyCash` y `stylesComponents.cardEmptyIconContainer`.
 */
const CardEmptyPettyCash: React.FC<CardEmptyPettyCashProps> = ({
    title = 'No tienes una caja chica activa',
    description = 'Solicita un nuevo fondo operativo a Administración para cubrir los gastos de transporte, insumos menores y viáticos en campo.',
    buttonText = 'Solicitar Apertura de Caja Chica',
    onPressRequest = () => {},
}) => {
    return (
        <View style={stylesComponents.cardEmptyPettyCash}>
            {/* Acento superior rojo corporativo */}
            <View style={stylesComponents.cardEmptyTopBar} />

            {/* Contenido de la tarjeta */}
            <View style={stylesComponents.cardEmptyContent}>
                {/* Contenedor de Icono Squircle Rojo Suave */}
                <View style={stylesComponents.cardEmptyIconContainer}>
                    <Ionicons name="wallet" size={32} color={colors.primary} />
                </View>

                {/* Título usando estilo ya creado */}
                <Text style={stylesTexts.basicTitle}>
                    {title}
                </Text>

                {/* Subtítulo descriptivo usando estilo ya creado */}
                <Text style={stylesTexts.subtitle}>
                    {description}
                </Text>

                {/* Botón de acción usando ButtonPrimary ya creado */}
                <View style={stylesComponents.cardEmptyButtonWrapper}>
                    <ButtonPrimary
                        text={buttonText}
                        iconName="add-circle-outline"
                        onPress={onPressRequest}
                    />
                </View>
            </View>
        </View>
    );
};

export default CardEmptyPettyCash;
