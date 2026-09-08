import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export interface CardPhotoEvidenceProps {
    imageUri?: string | null;
    onImagePicked?: (uri: string) => void;
    onRemoveImage?: () => void;
    title?: string;
    badgeStatus?: string;
    helperText?: string;
    buttonText?: string;
    containerStyle?: ViewStyle;
}

/**
 * Componente modular para la Evidencia Fotográfica / Comprobante.
 * Estilos desacoplados y centralizados en theme/styles (components.ts y texts.ts).
 */
const CardPhotoEvidence: React.FC<CardPhotoEvidenceProps> = ({
    imageUri,
    onImagePicked,
    onRemoveImage,
    title = 'EVIDENCIA FOTOGRÁFICA',
    badgeStatus,
    helperText = 'Formatos admitidos: JPG, PNG o PDF digitalizado (máx. 10MB).',
    buttonText,
    containerStyle,
}) => {
    // Abrir selector de fuente (Cámara o Galería)
    const handlePickOption = () => {
        Alert.alert(
            'Adjuntar Evidencia',
            'Selecciona el origen de la fotografía:',
            [
                {
                    text: 'Cámara',
                    onPress: handleCamera,
                },
                {
                    text: 'Galería de Fotos',
                    onPress: handleGallery,
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso Requerido',
                    'Se necesita acceso a la cámara para tomar la fotografía del comprobante.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onImagePicked?.(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la cámara.');
        }
    };

    const handleGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso Requerido',
                    'Se necesita acceso a la galería para seleccionar la fotografía del comprobante.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onImagePicked?.(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la galería.');
        }
    };

    const handleConfirmRemove = () => {
        Alert.alert(
            'Eliminar Fotografía',
            '¿Estás seguro de que deseas eliminar la foto de evidencia?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => onRemoveImage?.(),
                },
            ]
        );
    };

    return (
        <View style={[stylesComponents.photoEvidenceCard, containerStyle]}>
            {/* 1. Cabecera con Ícono, Título y Badge de estado */}
            <View style={stylesComponents.photoEvidenceHeader}>
                <View style={stylesComponents.photoEvidenceTitleContainer}>
                    <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                    <Text style={stylesTexts.photoEvidenceTitle}>
                        {title}
                    </Text>
                </View>

                {badgeStatus ? (
                    <View style={stylesComponents.photoEvidenceBadge}>
                        <Text style={stylesTexts.photoEvidenceBadgeText}>
                            {badgeStatus}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* 2. Recuadro Oscuro de Visualización y Acciones */}
            <View style={stylesComponents.photoEvidenceBox}>
                {/* Imagen previsualizada o Placeholder morado */}
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={stylesComponents.photoEvidencePlaceholder}>
                        <Ionicons name="image-outline" size={30} color="#8B5CF6" />
                    </View>
                )}

                {/* Botones flotantes inferiores derechos */}
                <View style={stylesComponents.photoEvidenceActionsBar}>
                    {/* Botón Cambiar / Subir Foto */}
                    <TouchableOpacity
                        onPress={handlePickOption}
                        activeOpacity={0.8}
                        style={stylesComponents.photoEvidenceChangeBtn}
                    >
                        <Ionicons name="camera-outline" size={16} color={colors.primary} />
                        <Text style={stylesTexts.photoEvidenceChangeBtnText}>
                            {buttonText || (imageUri ? 'Cambiar Foto' : 'Adjuntar Foto')}
                        </Text>
                    </TouchableOpacity>

                    {/* Botón Papelera para eliminar (solo si hay imagen cargada) */}
                    {imageUri ? (
                        <TouchableOpacity
                            onPress={handleConfirmRemove}
                            activeOpacity={0.8}
                            style={stylesComponents.photoEvidenceTrashBtn}
                        >
                            <Ionicons name="trash-outline" size={17} color={colors.error} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* 3. Pie Informativo de formatos y peso máximo */}
            {helperText ? (
                <View style={stylesComponents.photoEvidenceFooter}>
                    <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={colors.textSecondary}
                        style={stylesComponents.photoEvidenceFooterIcon}
                    />
                    <Text style={stylesTexts.photoEvidenceFooterText}>
                        {helperText}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

export default CardPhotoEvidence;
