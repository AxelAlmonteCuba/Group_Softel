import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Número de rondas de salt para bcrypt.
// 10 rondas es el mínimo recomendado (Regla 04 §1).
const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario.
   * - Verifica que el correo y el documento de identidad no estén duplicados.
   * - Convierte la `clave` en texto plano a `clave_hash` usando bcrypt (10 rondas).
   * - El estado inicial siempre es ACTIVO (definido en la entidad).
   */
  async createUser(dto: CreateUserDto): Promise<Omit<User, 'clave_hash'>> {
    // Verificar correo duplicado
    const correoExistente = await this.userRepository.findOne({
      where: { correo: dto.correo },
    });
    if (correoExistente) {
      throw new ConflictException('El correo ya está registrado en el sistema');
    }

    // Verificar documento de identidad duplicado
    const documentoExistente = await this.userRepository.findOne({
      where: { documento_identidad: dto.documento_identidad },
    });
    if (documentoExistente) {
      throw new ConflictException(
        'El documento de identidad ya está registrado en el sistema',
      );
    }

    // Hashear la contraseña antes de persistir — NUNCA almacenar texto plano
    const clave_hash = await bcrypt.hash(dto.clave, SALT_ROUNDS);

    const nuevoUsuario = this.userRepository.create({
      documento_identidad: dto.documento_identidad,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      correo: dto.correo,
      clave_hash,           // se guarda el hash, no la clave original
      cargo: dto.cargo,
      rol: dto.rol,
      // estado por defecto: ACTIVO (definido en la entidad con default)
    });

    const usuarioGuardado = await this.userRepository.save(nuevoUsuario);

    // Eliminar clave_hash de la respuesta antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clave_hash: _, ...usuarioSinClave } = usuarioGuardado;
    return usuarioSinClave;
  }

  /**
   * Retorna todos los usuarios activos.
   * La clave_hash se excluye para no exponerla en la API.
   */
  getUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        documento_identidad: true,
        nombres: true,
        apellidos: true,
        correo: true,
        cargo: true,
        rol: true,
        estado: true,
        creado_en: true,
        actualizado_en: true,
      },
    });
  }

  /**
   * Retorna un usuario por su ID.
   * Lanza NotFoundException si no existe (throw, no return).
   */
  async getUser(id: string): Promise<User> {
    const usuarioEncontrado = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        documento_identidad: true,
        nombres: true,
        apellidos: true,
        correo: true,
        cargo: true,
        rol: true,
        estado: true,
        creado_en: true,
        actualizado_en: true,
      },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(`Usuario con id '${id}' no encontrado`);
    }
    return usuarioEncontrado;
  }

  /**
   * INACTIVACIÓN LÓGICA — nunca borrado físico.
   * Cambia el estado del usuario a INACTIVO preservando todo el historial.
   * Regla: "Prohibido eliminar usuarios con historial contable u operativo" (Regla 05 §1).
   */
  async deleteUser(id: string): Promise<{ mensaje: string }> {
    const usuarioEncontrado = await this.userRepository.findOne({
      where: { id },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(`Usuario con id '${id}' no encontrado`);
    }

    if (usuarioEncontrado.estado === 'INACTIVO') {
      throw new ConflictException('El usuario ya se encuentra inactivo');
    }

    await this.userRepository.update(id, { estado: 'INACTIVO' });
    return { mensaje: `Usuario '${id}' inactivado correctamente` };
  }

  /**
   * Actualiza datos de un usuario.
   * - Si se envía una nueva `clave`, se vuelve a hashear antes de persistir.
   * - Nunca actualiza `clave_hash` directamente desde el DTO.
   */
  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'clave_hash'>> {
    const usuarioEncontrado = await this.userRepository.findOne({
      where: { id },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException(`Usuario con id '${id}' no encontrado`);
    }

    // Si llega una nueva clave, hashearla antes de guardar
    let clave_hash: string | undefined;
    if (dto.clave) {
      clave_hash = await bcrypt.hash(dto.clave, SALT_ROUNDS);
    }

    // Construir objeto de actualización sin exponer clave_hash en el DTO público
    const datosActualizados: Partial<User> = {
      ...(dto.documento_identidad && { documento_identidad: dto.documento_identidad }),
      ...(dto.nombres && { nombres: dto.nombres }),
      ...(dto.apellidos && { apellidos: dto.apellidos }),
      ...(dto.correo && { correo: dto.correo }),
      ...(dto.cargo && { cargo: dto.cargo }),
      ...(dto.rol && { rol: dto.rol }),
      ...(dto.estado && { estado: dto.estado }),
      ...(clave_hash && { clave_hash }),
    };

    await this.userRepository.update(id, datosActualizados);
    const usuarioActualizado = await this.userRepository.findOne({ where: { id } });

    // Retornar sin clave_hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clave_hash: _, ...usuarioSinClave } = usuarioActualizado!;
    return usuarioSinClave;
  }
}
