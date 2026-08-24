import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO para el endpoint POST /api/v1/auth/login.
 * El cliente envía correo + clave en texto plano sobre HTTPS.
 * El servicio verifica la clave contra el clave_hash almacenado con bcrypt.
 */
export class LoginDto {
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @Length(6, 100, { message: 'La clave debe tener entre 6 y 100 caracteres' })
  clave!: string;
}
