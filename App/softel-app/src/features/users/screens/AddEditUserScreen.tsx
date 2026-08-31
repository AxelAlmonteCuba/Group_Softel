import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Avatar from '@/components/common/Avatar';
import TextInput from '@/components/inputs/TextInput';
import { stylesComponents } from '@/theme/styles';

export interface UserFormData {
    nombres: string;
    apellidos: string;
    documentoIdentidad: string;
    correo: string;
    imageUrl?: string | null;
}

interface Props {
    initialData?: Partial<UserFormData>;
    onSubmit?: (data: UserFormData) => void;
    onBack?: () => void;
}

const AddEditUserScreen = ({ initialData, onSubmit, onBack }: Props) => {
    const [nombres, setNombres] = useState(initialData?.nombres ?? '');
    const [apellidos, setApellidos] = useState(initialData?.apellidos ?? '');
    const [documentoIdentidad, setDocumentoIdentidad] = useState(initialData?.documentoIdentidad ?? '');
    const [correo, setCorreo] = useState(initialData?.correo ?? '');
    const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Avatar Superior */}
            <View style={styles.avatarWrapper}>
                <Avatar size={100} imageUrl={imageUrl} />
            </View>

            {/* Contenedor del Formulario */}
            <View style={stylesComponents.containerForms}>
                <TextInput
                    label="Nombres"
                    placeholder="Ej. Ana"
                    value={nombres}
                    onChangeText={setNombres}
                />

                <TextInput
                    label="Apellidos"
                    placeholder="Ej. García"
                    value={apellidos}
                    onChangeText={setApellidos}
                />

                <TextInput
                    label="Documento de Identidad"
                    placeholder="Ej. 12345678"
                    value={documentoIdentidad}
                    onChangeText={setDocumentoIdentidad}
                    keyboardType="numeric"
                />

                <TextInput
                    label="Correo Electrónico"
                    placeholder="ana.g@empresa.com"
                    value={correo}
                    onChangeText={setCorreo}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    avatarWrapper: {
        marginBottom: 20,
    },
});

export default AddEditUserScreen;
