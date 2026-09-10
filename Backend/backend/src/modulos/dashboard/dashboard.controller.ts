import { Controller, Get } from '@nestjs/common';
import {
  DashboardService,
  AdminSummaryResponse,
  OperatorSummaryResponse,
} from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/v1/dashboard/resumen-admin
   * Retorna los conteos agregados para el dashboard del Administrador y Contador.
   */
  @Get('resumen-admin')
  @Roles('ADMINISTRADOR', 'CONTADOR')
  async getAdminSummary(): Promise<AdminSummaryResponse> {
    return await this.dashboardService.getAdminSummary();
  }

  /**
   * GET /api/v1/dashboard/resumen-operador
   * Retorna los conteos agregados para el dashboard del Supervisor y Trabajador.
   */
  @Get('resumen-operador')
  @Roles('SUPERVISOR', 'TRABAJADOR', 'ADMINISTRADOR')
  async getOperatorSummary(
    @GetUser('id') userId: string,
  ): Promise<OperatorSummaryResponse> {
    return await this.dashboardService.getOperatorSummary(userId);
  }
}
