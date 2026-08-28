import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import CardProfile from '../../../components/cards/CardProfile';
import SearchBar from '../../../components/bars/SearchBar';
import { colors } from '../../../theme/colors';
import { getUsers, User } from '../../../services/userService';
import { typography } from '../../../theme/typography';

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
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchBar 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar usuario..."
                />
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {filteredUsers.length === 0 ? (
                    <Text style={styles.emptyText}>
                        {users.length === 0 ? 'No hay usuarios registrados.' : 'No se encontraron resultados.'}
                    </Text>
                ) : (
                    filteredUsers.map(user => (
                        <View key={user.id} style={styles.cardWrapper}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    cardWrapper: {
        marginBottom: 12,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.md,
        textAlign: 'center',
        padding: 20,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
        marginTop: 40,
    }
});

export default UserManagementScreen;
