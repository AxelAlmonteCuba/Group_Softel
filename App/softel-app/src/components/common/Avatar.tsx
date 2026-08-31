import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface AvatarProps {
  imageUrl?: string | null;
  size?: number;
  iconSize?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}

const Avatar = ({
  imageUrl,
  size = 90,
  iconSize,
  containerStyle,
  imageStyle,
}: AvatarProps) => {
  const calculatedIconSize = iconSize ?? size * 0.42;
  const borderRadius = size / 2;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
        },
        containerStyle,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: borderRadius,
            },
            imageStyle,
          ]}
        />
      ) : (
        <Ionicons
          name="person-outline"
          size={calculatedIconSize}
          color="#8E8E93"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E5EA', // Color de fondo neutro suave
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});

export default Avatar;
