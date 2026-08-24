import { SetMetadata } from '@nestjs/common';

/**
 * Decorador que define qué roles del sistema pueden acceder a un endpoint.
 * Uso: @Roles('ADMINISTRADOR', 'CONTADOR') sobre el método o la clase.
 *
 * El RolesGuard lee esta metadata y la compara contra el rol
 * del usuario que viene en el token JWT (payload.rol).
 *
 * Roles válidos del sistema (Regla 01):
 *   ADMINISTRADOR | CONTADOR | SUPERVISOR | TRABAJADOR
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
