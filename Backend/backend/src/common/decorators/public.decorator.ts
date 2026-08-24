import { SetMetadata } from '@nestjs/common';

/**
 * Marca una ruta como pública (sin autenticación JWT requerida).
 * Uso: @Public() sobre el método del controlador o sobre toda la clase.
 *
 * Ejemplo:
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
