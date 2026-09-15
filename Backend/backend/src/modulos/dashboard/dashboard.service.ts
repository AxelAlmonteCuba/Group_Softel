import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PettyCash } from '../petty-cash/entities/petty-cash.entity';
import { Expense } from '../petty-cash/entities/expense.entity';

export interface AdminSummaryResponse {
  activeUsersCount: number;
  reviewBoxesCount: number;
  draftReportsCount: number;
  activePettyCashId?: string | null;
}

export interface OperatorSummaryResponse {
  draftReportsCount: number;
  pendingExpensesCount: number;
  approvedExpensesCount: number;
  activePettyCashId?: string | null;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  /**
   * Consulta ultraligera de conteos para el resumen administrativo del Home.
   * Ejecuta dos COUNT(*) directos sin transferir colecciones completas de datos.
   */
  async getAdminSummary(userId: string): Promise<AdminSummaryResponse> {
    const [activeUsersCount, reviewBoxesCount, activeBox] = await Promise.all([
      this.userRepository.count({ where: { estado: 'ACTIVO' } }),
      this.pettyCashRepository.count({ where: { status: 'EN_REVISION' } }),
      this.pettyCashRepository.findOne({
        where: { managerUserId: userId, status: 'ABIERTA' },
        select: { id: true },
      }),
    ]);

    return {
      activeUsersCount,
      reviewBoxesCount,
      draftReportsCount: 0,
      activePettyCashId: activeBox ? activeBox.id : null,
    };
  }

  /**
   * Consulta ultraligera de conteos para el resumen operativo del Home (Supervisor y Trabajador).
   * Obtiene en una única consulta SQL los gastos pendientes y aprobados vinculados al usuario.
   */
  async getOperatorSummary(userId: string): Promise<OperatorSummaryResponse> {
    const raw = await this.expenseRepository
      .createQueryBuilder('gasto')
      .leftJoin('gasto.pettyCash', 'caja')
      .select([
        "COALESCE(SUM(CASE WHEN gasto.estado = 'PENDIENTE' THEN 1 ELSE 0 END), 0) AS pendingExpensesCount",
        "COALESCE(SUM(CASE WHEN gasto.estado = 'APROBADO' THEN 1 ELSE 0 END), 0) AS approvedExpensesCount",
      ])
      .where('gasto.usuario_gasto_id = :userId OR caja.usuario_encargado_id = :userId', { userId })
      .getRawOne();

    const activeBox = await this.pettyCashRepository.findOne({
      where: { managerUserId: userId, status: 'ABIERTA' },
      select: { id: true },
    });

    return {
      draftReportsCount: 0,
      pendingExpensesCount: Number(raw?.pendingExpensesCount ?? 0),
      approvedExpensesCount: Number(raw?.approvedExpensesCount ?? 0),
      activePettyCashId: activeBox ? activeBox.id : null,
    };
  }
}
