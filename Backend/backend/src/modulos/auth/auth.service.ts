import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Autentica un usuario y emite un token JWT.
   *
   * Flujo:
   * 1. Busca al usuario por correo (incluye clave_hash para comparar).
   * 2. Verifica que exista → 401 si no (mensaje genérico para no revelar si el correo existe).
   * 3. Verifica que esté ACTIVO → 401 con mensaje específico.
   * 4. Compara la clave ingresada contra el clave_hash usando bcrypt.compare().
   * 5. Si todo pasa, firma un JWT con sub (id), correo y rol.
   * 6. Devuelve el token y datos básicos del usuario (sin clave_hash).
   *
   * ¿Por qué bcrypt.compare() y no comparar strings directamente?
   * Porque clave_hash es irreversible — solo bcrypt sabe cómo verificarlo.
   */
  async login(dto: LoginDto): Promise<{
    access_token: string;
    usuario: Omit<User, 'clave_hash'>;
  }> {
    // Buscar incluyendo clave_hash (select explícito porque normalmente lo excluimos)
    const usuario = await this.userRepository.findOne({
      where: { correo: dto.correo },
      select: {
        id: true,
        clave_hash: true,
        estado: true,
        nombres: true,
        apellidos: true,
        correo: true,
        rol: true,
        cargo: true,
        documento_identidad: true,
        creado_en: true,
        actualizado_en: true,
      },
    });

    // Mensaje genérico para no revelar si el correo existe o no (seguridad)
    if (!usuario) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }

    if (usuario.estado === 'INACTIVO') {
      throw new UnauthorizedException(
        'Su cuenta está inactiva. Contacte al administrador',
      );
    }

    const claveValida = await bcrypt.compare(dto.clave, usuario.clave_hash);
    if (!claveValida) {
      throw new UnauthorizedException('Correo o clave incorrectos');
    }

    // Payload del token: datos mínimos para identificar al usuario en cada request
    const payload = {
      sub: usuario.id,       // 'sub' es el claim estándar JWT para el ID del sujeto
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const access_token = this.jwtService.sign(payload);

    // Quitar clave_hash antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clave_hash: _, ...usuarioSinClave } = usuario;

    return {
      access_token,
      usuario: usuarioSinClave as Omit<User, 'clave_hash'>,
    };
  }
}
