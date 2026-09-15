import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { stylesComponents } from '@/theme/styles';
import HeaderBar from '@/components/layout/HeaderBar';
import CardUserBalance, { UserBalance } from '@/components/cards/CardUserBalance';
import { pettyCashService } from '../services/pettyCashService';

export default function UserBalancesScreen({ navigation }: any) {
    const [balances, setBalances] = useState<UserBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const rawData = await pettyCashService.getUserBalances();
            
            const mappedData: UserBalance[] = rawData.map((item: any) => ({
                userId: item.userId,
                document: item.document,
                userNames: item.userNames,
                role: item.role,
                cajaBalance: Number(item.cajaBalance) || 0,
                directBalance: Number(item.directBalance) || 0,
                netBalance: Number(item.netBalance) || 0,
            }));
            
            setBalances(mappedData);
        } catch (error) {
            console.error('Error al cargar saldos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const renderItem = ({ item }: { item: UserBalance }) => (
        <View style={{ marginBottom: 12 }}>
            <CardUserBalance data={item} />
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <HeaderBar 
                title="Saldos por Usuario" 
                onBack={() => navigation.goBack()} 
            />

            <View style={[stylesComponents.containerApp, { paddingTop: 16 }]}>
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={balances}
                        keyExtractor={(item) => item.userId}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
