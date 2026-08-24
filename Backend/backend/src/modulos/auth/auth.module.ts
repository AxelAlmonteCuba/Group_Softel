import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

/**
 * Módulo de autenticación.
 *
 * Registra:
 * - PassportModule: marco de autenticación, declara 'jwt' como estrategia por defecto.
 * - JwtModule (async): configura la firma de tokens usando variables del .env.
 * - TypeOrmModule con User: necesario para que JwtStrategy y AuthService
 *   puedan consultar la BD y verificar que el usuario esté ACTIVO.
 * - JwtStrategy: proveedor que passport usa para validar tokens entrantes.
 *
 * Exporta JwtModule para que otros módulos que necesiten firmar tokens
 * puedan inyectar JwtService.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRACION') ?? '8h') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
