import { User } from '@/features/users/services/userService';
import { ExpenseItemResponse } from '@/features/petty-cash/services/pettyCashService';

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
 * - RegisterExpense: Formulario de gasto (create / edit).
 */
export type MainStackParamList = {
    Home: undefined;
    UserManagement: { initialFilter?: string } | undefined;
    AddEditUser: {
        mode: 'create' | 'edit' | 'view';
        user?: User;
    };
    PettyCash: undefined;
    RequestPettyCash: undefined;
    PettyCashDetail: { id?: string } | undefined;
    RegisterExpense: {
        mode?: 'create' | 'edit';
        cajaId?: string;
        expense?: ExpenseItemResponse;
    } | undefined;
    AuditExpenses: { cajaId?: string; cajaStatus?: string } | undefined;
};
