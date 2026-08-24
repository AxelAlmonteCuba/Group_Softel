import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Controlador de autenticación.
 * Ruta base: /api/v1/auth
 *
 * Todos los endpoints de este controlador son @Public() porque
 * son los puntos de entrada al sistema (aún no hay token).
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Autentica al usuario y devuelve un JWT + datos básicos del perfil.
   *
   * Body: { correo: string, clave: string }
   * Respuesta: { access_token: string, usuario: { id, nombres, rol, ... } }
   */
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
