import React, { useCallback, useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import CardProfile from '@/components/cards/CardProfile';
import SearchBar from '@/components/bars/SearchBar';
import { colors } from '@/theme/colors';
import { getUsers, User } from '@/services/userService';
import { stylesComponents, stylesTexts } from '@/theme/styles';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'UserManagement'>;

const UserManagementScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Recarga la lista cada vez que la pantalla vuelve a estar enfocada
    // (así refleja usuarios recién creados o editados)
    useFocusEffect(
        useCallback(() => {
            let isCancelled = false;

            const fetchUsers = async () => {
                try {
                    setLoading(true);
                    const data = await getUsers();
                    if (!isCancelled) {
                        setUsers(data);
                        setError(null);
                    }
                } catch (err: any) {
                    console.error(err);
                    if (!isCancelled) {
                        setError('Error al cargar los usuarios. Verifica tu conexión o permisos.');
                    }
                } finally {
                    if (!isCancelled) {
                        setLoading(false);
                    }
                }
            };

            fetchUsers();

            return () => {
                isCancelled = true;
            };
        }, [])
    );

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user => 
            user.nombres.toLowerCase().includes(query) ||
            user.apellidos.toLowerCase().includes(query) ||
            user.correo.toLowerCase().includes(query) ||
            user.cargo.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    if (loading) {
        return (
            <View style={stylesComponents.containerLogin}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={stylesComponents.containerLogin}>
                <Text style={stylesTexts.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={stylesComponents.containerApp}>
            <View style={stylesComponents.searchBarContainer}>
                <SearchBar 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar usuario..."
                />
            </View>
            <ScrollView contentContainerStyle={stylesComponents.scrollListContent}>
                {filteredUsers.length === 0 ? (
                    <Text style={stylesTexts.emptyListText}>
                        {users.length === 0 ? 'No hay usuarios registrados.' : 'No se encontraron resultados.'}
                    </Text>
                ) : (
                    filteredUsers.map(user => (
                        <View key={user.id} style={stylesComponents.cardListWrapper}>
                            <CardProfile 
                                name={`${user.nombres} ${user.apellidos}`}
                                role={user.cargo}
                                email={user.correo}
                                status={user.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                onPress={() => navigation.navigate('AddEditUser', { mode: 'edit', user })}
                            />
                        </View>
                    ))
                )}
            </ScrollView>

            {/* FAB — Crear nuevo usuario */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddEditUser', { mode: 'create' })}
            >
                <Ionicons name="add" size={28} color={colors.textOnPrimary} />
            </TouchableOpacity>
        </View>
    );
};

export default UserManagementScreen;

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
