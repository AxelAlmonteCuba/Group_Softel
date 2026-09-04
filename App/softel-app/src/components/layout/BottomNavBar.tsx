import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { stylesComponents, stylesTexts } from '@/theme/styles';

export type BottomTabKey = 'inicio' | 'reportes' | 'caja-chica' | 'mas';

export interface TabItem {
    key: BottomTabKey;
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
    {
        key: 'inicio',
        label: 'Inicio',
        iconActive: 'home',
        iconInactive: 'home-outline',
    },
    {
        key: 'reportes',
        label: 'Reportes',
        iconActive: 'clipboard',
        iconInactive: 'clipboard-outline',
    },
    {
        key: 'caja-chica',
        label: 'Caja Chica',
        iconActive: 'cash',
        iconInactive: 'cash-outline',
    },
    {
        key: 'mas',
        label: 'Más',
        iconActive: 'menu',
        iconInactive: 'menu-outline',
    },
];

interface BottomNavBarProps {
    activeTab?: BottomTabKey;
    onTabPress?: (tab: BottomTabKey) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
    activeTab: externalActiveTab,
    onTabPress,
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState<BottomTabKey>('inicio');
    const currentTab = externalActiveTab ?? internalActiveTab;

    const handlePress = (tabKey: BottomTabKey) => {
        if (!externalActiveTab) {
            setInternalActiveTab(tabKey);
        }
        onTabPress?.(tabKey);
    };

    return (
        <View style={stylesComponents.bottomBar}>
            {TABS.map((tab) => {
                const isActive = currentTab === tab.key;
                const iconName = isActive ? tab.iconActive : tab.iconInactive;
                const iconColor = isActive ? colors.primary : colors.textSecondary;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={stylesComponents.bottomBarItem}
                        onPress={() => handlePress(tab.key)}
                        activeOpacity={0.7}
                    >
                        {/* Contenedor tipo píldora para el ícono */}
                        <View
                            style={[
                                stylesComponents.bottomBarIconContainer,
                                isActive && stylesComponents.bottomBarIconActive,
                            ]}
                        >
                            <Ionicons name={iconName} size={22} color={iconColor} />
                        </View>

                        {/* Texto del Tab */}
                        <Text
                            style={[
                                stylesTexts.litleTitle,
                                { textAlign: 'center', marginBottom: 0 },
                                isActive && { color: colors.primary },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default BottomNavBar;
