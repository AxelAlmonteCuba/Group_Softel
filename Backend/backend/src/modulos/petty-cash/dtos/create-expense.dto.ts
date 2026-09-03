import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsOptional()
  @IsUUID('4', { message: 'El ID de caja chica debe ser un UUID válido.' })
  pettyCashId?: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @IsInt({ message: 'La categoría debe ser un número entero.' })
  @IsPositive({ message: 'La categoría debe ser un ID válido.' })
  categoryId!: number;

  @IsNotEmpty({ message: 'El monto es obligatorio.' })
  @IsNumber({}, { message: 'El monto debe ser un número.' })
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  amount!: number;

  @IsNotEmpty({ message: 'El motivo es obligatorio.' })
  @IsString({ message: 'El motivo debe ser texto.' })
  @MaxLength(255, { message: 'El motivo no puede exceder 255 caracteres.' })
  reason!: string;

  @IsNotEmpty({ message: 'La fecha del gasto es obligatoria.' })
  @IsDateString({}, { message: 'La fecha debe tener formato ISO válido (YYYY-MM-DD).' })
  expenseDate!: string;
}
