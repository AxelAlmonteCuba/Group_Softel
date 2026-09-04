import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Controlador de autenticación.
 * Ruta base: /api/v1/auth
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Autentica al usuario y devuelve un JWT + datos básicos del perfil.
   * Endpoint público (aún no hay token).
   *
   * Body: { correo: string, clave: string }
   * Respuesta: { access_token: string, usuario: { id, nombres, rol, ... } }
   */
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/logout
   * Cierra la sesión del usuario actual.
   * Requiere token JWT activo (JwtAuthGuard global).
   *
   * Respuesta: { exito: true, mensaje: 'Sesión cerrada exitosamente' }
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') usuarioId: string) {
    return this.authService.logout(usuarioId);
  }
}
