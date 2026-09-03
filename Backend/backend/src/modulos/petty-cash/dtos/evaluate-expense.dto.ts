import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ExpenseDecision {
  APPROVED = 'APROBADO',
  REJECTED = 'RECHAZADO',
  OBSERVED = 'OBSERVADO',
}

export class EvaluateExpenseDto {
  @IsNotEmpty({ message: 'La decisión es obligatoria.' })
  @IsEnum(ExpenseDecision, {
    message: 'La decisión debe ser APROBADO, RECHAZADO u OBSERVADO.',
  })
  decision!: ExpenseDecision;

  @IsOptional()
  @IsString({ message: 'El comentario de auditoría debe ser texto.' })
  @MaxLength(255, { message: 'El comentario no puede exceder 255 caracteres.' })
  evaluationComment?: string;
}
