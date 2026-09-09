import React from 'react';
import { Modal, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { stylesComponents } from '@/theme/styles';

export interface PhotoPreviewModalProps {
    visible: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

/**
 * Modal para visualizar fotografías de comprobantes en pantalla completa.
 */
export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
    visible,
    imageUrl,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={stylesComponents.photoPreviewOverlay}>
                <TouchableOpacity
                    style={stylesComponents.photoPreviewCloseBtn}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <Ionicons name="close-circle" size={38} color="#FFFFFF" />
                </TouchableOpacity>

                {Boolean(imageUrl) && (
                    <Image
                        source={{ uri: imageUrl || undefined }}
                        style={stylesComponents.photoPreviewImage}
                        resizeMode="contain"
                    />
                )}
            </View>
        </Modal>
    );
};

export default PhotoPreviewModal;
