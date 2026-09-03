import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePettyCashDto {
  @IsNotEmpty({ message: 'El monto asignado es obligatorio.' })
  @IsNumber({}, { message: 'El monto asignado debe ser un número.' })
  @IsPositive({ message: 'El monto asignado debe ser mayor a 0.' })
  assignedAmount!: number;
}
