import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PettyCashService } from '../services/petty-cash.service';
import { CreatePettyCashDto } from '../dtos/create-petty-cash.dto';
import { UpdatePettyCashStatusDto, PettyCashAction } from '../dtos/update-petty-cash-status.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { ForbiddenException } from '@nestjs/common';

@Controller('cajas-chicas')
export class PettyCashController {
  constructor(private readonly pettyCashService: PettyCashService) { }

  @Post()
  @Roles('SUPERVISOR')
  async requestPettyCash(
    @Body() dto: CreatePettyCashDto,
    @GetUser('id') userId: string,
  ) {
    return await this.pettyCashService.requestPettyCash(dto, userId);
  }

  @Patch(':id/estado')
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePettyCashStatusDto,
    @GetUser('id') userId: string,
    @GetUser('rol') role: string,
  ) {
    switch (dto.action) {
      case PettyCashAction.APPROVE:
        if (role !== 'ADMINISTRADOR') throw new ForbiddenException('Solo el Administrador puede aprobar.');
        return await this.pettyCashService.approvePettyCash(id, userId);

      case PettyCashAction.REJECT:
        if (role !== 'ADMINISTRADOR') throw new ForbiddenException('Solo el Administrador puede rechazar.');
        return await this.pettyCashService.rejectPettyCash(id, userId);

      case PettyCashAction.OPEN:
        if (role !== 'ADMINISTRADOR') throw new ForbiddenException('Solo el Administrador puede abrir (entregar fondo).');
        return await this.pettyCashService.openPettyCash(id);

      case PettyCashAction.REVIEW:
        // Idealmente aquí se validaría que el usuario que manda a revisión es el dueño de la caja
        // pero por simplicidad de roles asumiremos que lo hace el SUPERVISOR.
        if (role !== 'SUPERVISOR') throw new ForbiddenException('Solo el Supervisor puede mandar a revisión.');
        return await this.pettyCashService.reviewPettyCash(id);

      case PettyCashAction.CLOSE:
        if (role !== 'ADMINISTRADOR') throw new ForbiddenException('Solo el Administrador puede cerrar.');
        return await this.pettyCashService.closePettyCash(id);

      case PettyCashAction.LIQUIDATE:
        if (role !== 'ADMINISTRADOR') throw new ForbiddenException('Solo el Administrador puede liquidar.');
        return await this.pettyCashService.liquidatePettyCash(id);

      default:
        throw new ForbiddenException('Acción no soportada.');
    }
  }

  @Get()
  @Roles('ADMINISTRADOR', 'CONTADOR')
  async getAllPettyCash() {
    return await this.pettyCashService.findAll();
  }

  @Get('usuario/:usuarioId')
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR')
  async getPettyCashByUser(@Param('usuarioId') usuarioId: string) {
    return await this.pettyCashService.findByUser(usuarioId);
  }
}
