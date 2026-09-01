import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Avatar from '@/components/common/Avatar';
import TextInput from '@/components/inputs/TextInput';
import PasswordGenInput from '@/components/inputs/PasswordGenInput';
import SelectInput, { SelectOption } from '@/components/inputs/SelectInput';
import ToggleEstado from '@/components/inputs/ToggleEstado';
import { stylesComponents } from '@/theme/styles';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';

export interface UserFormData {
    nombres: string;
    apellidos: string;
    documentoIdentidad: string;
    correo: string;
    clave: string;
    rol: string;
    cargo: string;
    activo: boolean;
    imageUrl?: string | null;
}

const ROL_OPTIONS: SelectOption[] = [
    { label: 'Administrador', value: 'ADMINISTRADOR' },
    { label: 'Contador', value: 'CONTADOR' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
    { label: 'Trabajador', value: 'TRABAJADOR' },
];

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
    const [clave, setClave] = useState(initialData?.clave ?? '');
    const [rol, setRol] = useState(initialData?.rol ?? '');
    const [cargo, setCargo] = useState(initialData?.cargo ?? '');
    const [activo, setActivo] = useState(initialData?.activo ?? true);
    const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);


    return (
        <View style={stylesComponents.containerApp}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Avatar
                    size={100}
                    imageUrl={imageUrl}
                    containerStyle={{ alignSelf: 'center', marginBottom: 20 }}
                />

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
                        placeholder="correo@g-softel.com"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <PasswordGenInput
                        label="Contraseña Autogenerada"
                        value={clave}
                        onChange={setClave}
                    />

                    <SelectInput
                        label="Rol del Sistema"
                        options={ROL_OPTIONS}
                        value={rol}
                        onChange={setRol}
                        placeholder="Seleccionar rol..."
                    />

                    <TextInput
                        label="Cargo"
                        placeholder="Ej. Jefe de Cuadrilla"
                        value={cargo}
                        onChangeText={setCargo}
                    />

                    <ToggleEstado
                        value={activo}
                        onChange={setActivo}
                    />

                </View>
            </ScrollView>
            <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                <ButtonPrimary
                    text="Guardar Cambios"
                    onPress={() => { }}
                />
            </View>
        </View>
    );
};

export default AddEditUserScreen;
