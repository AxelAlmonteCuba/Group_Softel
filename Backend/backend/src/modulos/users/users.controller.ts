import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Controlador de usuarios.
 * Ruta base: /api/v1/users
 *
 * TODOS los endpoints requieren autenticación JWT (por defecto global).
 * Cada endpoint además restringe acceso por rol con @Roles().
 *
 * Matriz de permisos aplicada (Regla 01 §3):
 * - Crear usuario:    ADMINISTRADOR
 * - Listar usuarios:  ADMINISTRADOR, CONTADOR
 * - Ver un usuario:   ADMINISTRADOR, CONTADOR
 * - Inactivar:        ADMINISTRADOR
 * - Actualizar:       ADMINISTRADOR
 */
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  /**
   * POST /api/v1/users
   * Crea un nuevo usuario con clave hasheada.
   * Solo el ADMINISTRADOR puede dar de alta usuarios.
   */
  @Roles('ADMINISTRADOR')
  @Post()
  createUser(@Body() newUser: CreateUserDto) {
    return this.userService.createUser(newUser);
  }

  /**
   * GET /api/v1/users
   * Lista todos los usuarios con estado ACTIVO.
   * ADMINISTRADOR y CONTADOR pueden consultar el directorio de usuarios.
   */
  @Roles('ADMINISTRADOR', 'CONTADOR')
  @Get()
  getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  /**
   * GET /api/v1/users/:id
   * Retorna un usuario específico por su UUID.
   */
  @Roles('ADMINISTRADOR', 'CONTADOR')
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  /**
   * DELETE /api/v1/users/:id
   * INACTIVACIÓN LÓGICA — cambia estado a INACTIVO, no borra el registro.
   * Solo el ADMINISTRADOR puede inactivar cuentas.
   */
  @Roles('ADMINISTRADOR')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  /**
   * PATCH /api/v1/users/:id
   * Actualiza parcialmente un usuario (solo los campos enviados).
   * Solo el ADMINISTRADOR puede modificar datos de usuarios.
   */
  @Roles('ADMINISTRADOR')
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(id, user);
  }
}
