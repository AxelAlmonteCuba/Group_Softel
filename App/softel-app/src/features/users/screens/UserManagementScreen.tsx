import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import CardProfile from '@/components/cards/CardProfile';
import SearchBar from '@/components/bars/SearchBar';
import { colors } from '@/theme/colors';
import { getUsers, User } from '@/services/userService';
import { stylesComponents, stylesTexts } from '@/theme/styles';

interface Props {
    onBack?: () => void;
}

const UserManagementScreen = ({ onBack }: Props) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err: any) {
                console.error(err);
                setError('Error al cargar los usuarios. Verifica tu conexión o permisos.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

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
                                onPress={() => console.log('Perfil click', user.id)}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default UserManagementScreen;
