import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PettyCashAction {
  APPROVE = 'APROBAR',
  REJECT = 'RECHAZAR',
  OPEN = 'ABRIR',
  REVIEW = 'REVISAR',
  CLOSE = 'CERRAR',
  LIQUIDATE = 'LIQUIDAR',
}

export class UpdatePettyCashStatusDto {
  @IsNotEmpty({ message: 'La acción es obligatoria.' })
  @IsEnum(PettyCashAction, {
    message: `La acción debe ser una de: ${Object.values(PettyCashAction).join(', ')}`,
  })
  action!: PettyCashAction;
}
