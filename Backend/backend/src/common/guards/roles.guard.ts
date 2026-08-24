import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de autorización por roles (RBAC).
 *
 * Flujo:
 * 1. Lee los roles declarados en @Roles(...) del endpoint actual.
 * 2. Si no hay roles declarados, permite el acceso (cualquier usuario autenticado puede).
 * 3. Obtiene el usuario del request (lo pone JwtAuthGuard después de validar el token).
 * 4. Verifica que el rol del usuario esté dentro de los roles permitidos.
 * 5. Si no tiene el rol → 403 Forbidden con mensaje descriptivo.
 *
 * IMPORTANTE (Regla 04 §1):
 * Este guard es la validación de autorización en el BACKEND.
 * Ocultar botones en el frontend NO reemplaza esta verificación.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no declara @Roles(), cualquier usuario autenticado puede acceder
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // El usuario ya fue validado y adjuntado al request por JwtAuthGuard
    const { user } = context.switchToHttp().getRequest<{ user: { rol: string } }>();

    const tieneRol = rolesRequeridos.includes(user?.rol);

    if (!tieneRol) {
      throw new ForbiddenException(
        `Acceso denegado. Su rol '${user?.rol}' no tiene permiso. ` +
          `Se requiere uno de: [${rolesRequeridos.join(', ')}]`,
      );
    }

    return true;
  }
}
