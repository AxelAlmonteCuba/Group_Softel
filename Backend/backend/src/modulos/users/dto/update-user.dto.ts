import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

/**
 * DTO para actualización parcial de usuario.
 * Todos los campos son opcionales — solo se actualizan los que se envíen.
 * Se usa @IsOptional() para permitir campos ausentes sin error de validación.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  documento_identidad?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 120)
  correo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  clave?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  cargo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR'])
  rol?: string;

  // Permite activar o inactivar manualmente desde el panel admin
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}
