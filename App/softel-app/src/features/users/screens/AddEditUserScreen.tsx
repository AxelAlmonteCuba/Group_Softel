import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/navigation/types';
import Avatar from '@/components/common/Avatar';
import TextInput from '@/components/inputs/TextInput';
import PasswordGenInput from '@/components/inputs/PasswordGenInput';
import SelectInput, { SelectOption } from '@/components/inputs/SelectInput';
import ToggleEstado from '@/components/inputs/ToggleEstado';
import { stylesComponents } from '@/theme/styles';
import ButtonPrimary from '@/components/buttons/ButtonPrimary';
import ButtonTertiary from '@/components/buttons/ButtonTertiary';
import { createUser, CreateUser, updateUser, UpdateUser } from '@/services/userService';

const ROL_OPTIONS: SelectOption[] = [
    { label: 'Administrador', value: 'ADMINISTRADOR' },
    { label: 'Contador', value: 'CONTADOR' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
    { label: 'Trabajador', value: 'TRABAJADOR' },
];

type ScreenRouteProp = RouteProp<MainStackParamList, 'AddEditUser'>;
type ScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'AddEditUser'>;

const AddEditUserScreen = () => {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation<ScreenNavigationProp>();

    const { mode, user } = route.params;

    const [nombres, setNombres] = useState(user?.nombres ?? '');
    const [apellidos, setApellidos] = useState(user?.apellidos ?? '');
    const [documentoIdentidad, setDocumentoIdentidad] = useState('');
    const [correo, setCorreo] = useState(user?.correo ?? '');
    const [clave, setClave] = useState('');
    const [rol, setRol] = useState(user?.rol ?? 'TRABAJADOR');
    const [cargo, setCargo] = useState(user?.cargo ?? '');
    const [estado, setEstado] = useState(user?.estado ?? 'ACTIVO');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [resetearClave, setResetearClave] = useState(false);

    const handleGuardarCambios = async () => {
        try {
            if (mode === 'create') {
                const formData: CreateUser = {
                    nombres,
                    apellidos,
                    documento_identidad: documentoIdentidad,
                    correo,
                    clave,
                    rol,
                    cargo,
                };
                await createUser(formData);
            } else if (mode === 'edit') {
                // Solo enviar los campos con valor — el backend valida @Length y rechaza strings vacíos
                const updateData: UpdateUser = {};
                if (nombres) updateData.nombres = nombres;
                if (apellidos) updateData.apellidos = apellidos;
                if (documentoIdentidad) updateData.documento_identidad = documentoIdentidad;
                if (correo) updateData.correo = correo;
                if (cargo) updateData.cargo = cargo;
                if (rol) updateData.rol = rol;
                if (estado) updateData.estado = estado;
                if (resetearClave && clave) updateData.clave = clave;

                await updateUser(user!.id, updateData);
            }
            navigation.goBack();
        } catch (error: any) {
            console.log(error);
            const dataBackend = error?.response?.data;
            let errorMsg = 'Error al guardar los cambios';
            if (dataBackend) {
                if (dataBackend.errores && dataBackend.errores.length > 0) {
                    errorMsg = dataBackend.errores[0];
                } else if (dataBackend.mensaje) {
                    errorMsg = dataBackend.mensaje;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            Alert.alert('Error', errorMsg);
        }
    };

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
                        editable={mode != "view"}
                    />

                    <TextInput
                        label="Apellidos"
                        placeholder="Ej. García"
                        value={apellidos}
                        onChangeText={setApellidos}
                        editable={mode != "view"}
                    />

                    <TextInput
                        label="Documento de Identidad"
                        placeholder="Ej. 12345678"
                        value={documentoIdentidad}
                        onChangeText={setDocumentoIdentidad}
                        keyboardType="numeric"
                        editable={mode != "view"}
                    />

                    <TextInput
                        label="Correo Electrónico"
                        placeholder="correo@g-softel.com"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={mode != "view"}
                    />
                    {mode === 'create' && (
                        <PasswordGenInput
                            label="Contraseña Autogenerada"
                            value={clave}
                            onChange={setClave}
                        />
                    )}

                    {mode === 'edit' && (
                        <>
                            {!resetearClave ? (
                                <View style={{ marginBottom: 15, alignItems: 'flex-start' }}>
                                    <ButtonTertiary
                                        text="Resetear Contraseña"
                                        iconName="lock-closed-outline"
                                        onPress={() => setResetearClave(true)}
                                    />
                                </View>
                            ) : (
                                <PasswordGenInput
                                    label="Nueva Contraseña"
                                    value={clave}
                                    onChange={setClave}
                                />
                            )}
                        </>
                    )}


                    <SelectInput
                        label="Rol del Sistema"
                        options={ROL_OPTIONS}
                        value={rol}
                        onChange={(value) => setRol(value as CreateUser['rol'])}
                        placeholder="Seleccionar rol..."
                        disabled={mode === "view"}
                    />

                    <TextInput
                        label="Cargo"
                        placeholder="Ej. Jefe de Cuadrilla"
                        value={cargo}
                        onChangeText={setCargo}
                        editable={mode != "view"}
                    />

                    <ToggleEstado
                        value={estado === 'ACTIVO'}
                        onChange={(value: boolean) => setEstado(value ? 'ACTIVO' : 'INACTIVO')}
                        disabled={mode === "view"}
                    />

                </View>
            </ScrollView>
            <View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
                {mode !== 'view' && (
                    <ButtonPrimary
                        text="Guardar Cambios"
                        onPress={handleGuardarCambios}
                    />
                )}
            </View>
        </View>
    );
};

export default AddEditUserScreen;

