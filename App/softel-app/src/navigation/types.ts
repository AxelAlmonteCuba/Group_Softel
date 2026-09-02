import { User } from '@/features/users/services/userService';

/**
 * Parámetros del Stack de Autenticación.
 * Solo contiene la pantalla de Login (sin parámetros).
 */
export type AuthStackParamList = {
    Login: undefined;
};

/**
 * Parámetros del Stack Principal (usuario autenticado).
 *
 * - Home:            Pantalla principal, sin parámetros.
 * - UserManagement:  Lista de usuarios, sin parámetros.
 * - AddEditUser:     Formulario de usuario.
 *     · mode 'create' → campos vacíos, sin user.
 *     · mode 'edit'   → campos precargados con user.
 *     · mode 'view'   → campos bloqueados, solo lectura.
 */
export type MainStackParamList = {
    Home: undefined;
    UserManagement: { initialFilter?: string } | undefined;
    AddEditUser: {
        mode: 'create' | 'edit' | 'view';
        user?: User;
    };
};
