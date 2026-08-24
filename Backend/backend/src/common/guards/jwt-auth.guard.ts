import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard global de autenticación JWT.
 *
 * Flujo de verificación:
 * 1. Revisa si el endpoint tiene el decorador @Public() → si sí, deja pasar sin token.
 * 2. Si no es público, delega en passport-jwt para validar el Bearer token.
 *    - passport-jwt extrae el token del header Authorization: Bearer <token>
 *    - Verifica la firma con JWT_SECRET
 *    - Verifica que no haya expirado (JWT_EXPIRACION)
 *    - Llama a JwtStrategy.validate() para confirmar que el usuario sigue ACTIVO
 * 3. Si el token es inválido o falta → 401 Unauthorized automático.
 *
 * Se registra como APP_GUARD global en AppModule para proteger TODOS
 * los endpoints por defecto sin tener que poner @UseGuards() en cada uno.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Si el endpoint o controlador está marcado con @Public(), no se valida el token
    const esPublico = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (esPublico) return true;

    // Delegar la validación del token a passport-jwt (AuthGuard('jwt'))
    return super.canActivate(context);
  }
}
