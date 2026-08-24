import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

/**
 * Estrategia JWT de Passport.
 *
 * Passport llama a esta estrategia automáticamente cada vez que
 * JwtAuthGuard intercepta una solicitud protegida.
 *
 * Flujo interno:
 * 1. ExtractJwt.fromAuthHeaderAsBearerToken() lee el header:
 *    Authorization: Bearer eyJhbGc...
 * 2. Verifica la firma del token usando JWT_SECRET del .env
 * 3. Verifica que el token no haya expirado
 * 4. Si pasa, llama a validate() con el payload decodificado
 * 5. validate() confirma en BD que el usuario sigue existiendo y ACTIVO
 * 6. El objeto retornado por validate() se adjunta al request como req.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Valida que el usuario del token siga activo en la BD.
   * El objeto retornado aquí será accesible como req.user en los controladores.
   */
  async validate(payload: {
    sub: string;
    correo: string;
    rol: string;
  }): Promise<{ id: string; correo: string; rol: string } | null> {
    const usuario = await this.userRepository.findOne({
      where: { id: payload.sub, estado: 'ACTIVO' },
    });

    // Si el usuario fue inactivado después de emitir el token, se rechaza
    if (!usuario) return null;

    return {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    };
  }
}
