import { IsEmail, IsIn, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  documento_identidad!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  apellidos!: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(5, 120)
  correo!: string;

  // Se recibe la clave normal y el servicio la convierte en clave_hash.
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  clave!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  cargo!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR'])
  rol!: string;
}
