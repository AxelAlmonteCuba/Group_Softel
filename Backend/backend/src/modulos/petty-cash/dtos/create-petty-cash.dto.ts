import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePettyCashDto {
  @IsNotEmpty({ message: 'El monto asignado es obligatorio.' })
  @IsNumber({}, { message: 'El monto asignado debe ser un número.' })
  @IsPositive({ message: 'El monto asignado debe ser mayor a 0.' })
  assignedAmount!: number;

  @IsNotEmpty({ message: 'La justificación del fondo es obligatoria.' })
  @IsString({ message: 'La justificación debe ser texto.' })
  @MaxLength(255, { message: 'La justificación no puede exceder los 255 caracteres.' })
  justification!: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del proyecto debe ser un UUID v4 válido.' })
  projectId?: string;
}

