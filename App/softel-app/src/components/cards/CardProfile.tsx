import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { stylesComponents, stylesTexts } from '../../theme/styles';

interface CardProfileProps {
    name: string;
    role: string;
    email: string;
    status?: 'Activo' | 'Inactivo';
    imageUrl?: string;
    onPress?: () => void;
}

const CardProfile = ({
    name,
    role,
    email,
    status = 'Activo',
    imageUrl,
    onPress,
}: CardProfileProps) => {
    const isActivo = status === 'Activo';

    return (
        <TouchableOpacity
            style={stylesComponents.cardProfileContainer}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={stylesComponents.cardProfileContent}>
                <View style={stylesComponents.cardProfileImageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={stylesComponents.cardProfileImage} />
                    ) : (
                        <View style={stylesComponents.cardProfilePlaceholderImage}>
                            <Text style={stylesTexts.cardProfilePlaceholderText}>{name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <View style={stylesComponents.cardProfileInfoContainer}>
                    <Text style={stylesTexts.textCardOptionTitle} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={stylesTexts.cardProfileRole} numberOfLines={2}>
                        {role}
                    </Text>
                    <Text style={stylesTexts.cardProfileEmail} numberOfLines={1}>
                        {email}
                    </Text>
                </View>

                <View style={stylesComponents.cardProfileRightContainer}>
                    <View
                        style={[
                            stylesComponents.badge,
                            isActivo ? stylesComponents.badgeActive : stylesComponents.badgeInactive,
                        ]}
                    >
                        <Text
                            style={[
                                stylesTexts.badgeText,
                                isActivo ? stylesTexts.badgeTextActive : stylesTexts.badgeTextInactive,
                            ]}
                        >
                            {status}
                        </Text>
                    </View>
                    <Entypo name="chevron-right" size={20} color={colors.textSecondary} style={stylesComponents.cardProfileChevron} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CardProfile;