import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsInt({ message: 'La categoría debe ser un número entero.' })
  @IsPositive({ message: 'La categoría debe ser un ID válido.' })
  categoryId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser un número.' })
  @IsPositive({ message: 'El monto debe ser mayor a 0.' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'El motivo debe ser texto.' })
  @MaxLength(255, { message: 'El motivo no puede exceder 255 caracteres.' })
  reason?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato ISO válido (YYYY-MM-DD).' })
  expenseDate?: string;
}
