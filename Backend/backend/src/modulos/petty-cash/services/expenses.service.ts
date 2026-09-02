import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { PettyCash } from '../entities/petty-cash.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra un gasto en estado PENDIENTE vinculado a una caja chica ABIERTA.
   * La url del comprobante es la ruta relativa del WebP ya procesado por StorageService.
   */
  async registerExpense(
    expenseUserId: string,
    categoryId: number,
    amount: number,
    reason: string,
    receiptUrl: string,
    expenseDate: Date,
    pettyCashId?: string,
  ): Promise<Expense> {
    // Si se asocia a una caja chica, validar que esté ABIERTA
    if (pettyCashId) {
      const pettyCash = await this.pettyCashRepository.findOne({
        where: { id: pettyCashId },
      });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'ABIERTA') {
        throw new BadRequestException(
          'Solo se pueden registrar gastos en una caja chica con estado ABIERTA.',
        );
      }
    }

    const newExpense = this.expenseRepository.create({
      expenseUserId,
      categoryId,
      amount,
      reason,
      receiptUrl,
      expenseDate,
      pettyCashId: pettyCashId ?? null,
      status: 'PENDIENTE',
    });

    return await this.expenseRepository.save(newExpense);
  }

  /**
   * Transaccional: Aprueba o rechaza un gasto.
   * Si es APROBADO, recalcula atómicamente currentBalance y finalBalance
   * en la caja chica vinculada según la Regla 03 (solo gastos APROBADOS).
   */
  async evaluateExpense(
    expenseId: string,
    approverUserId: string,
    decision: 'APROBADO' | 'RECHAZADO',
    rejectionReason?: string,
  ): Promise<Expense> {
    if (decision === 'RECHAZADO' && !rejectionReason) {
      throw new BadRequestException(
        'El motivo de rechazo es obligatorio al rechazar un gasto.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expense = await queryRunner.manager.findOne(Expense, {
        where: { id: expenseId },
      });

      if (!expense) {
        throw new NotFoundException('Gasto no encontrado.');
      }

      if (expense.status !== 'PENDIENTE') {
        throw new BadRequestException(
          'Solo se pueden evaluar gastos en estado PENDIENTE.',
        );
      }

      // Aplicar la decisión sobre el gasto
      expense.status = decision;
      expense.approverUserId = approverUserId;

      if (decision === 'RECHAZADO') {
        expense.rejectionReason = rejectionReason!;
      }

      await queryRunner.manager.save(expense);

      // Si el gasto fue APROBADO y tiene caja chica, recalcular saldos
      // Regla 03: saldo_actual = monto_asignado - SUM(gastos APROBADOS)
      if (decision === 'APROBADO' && expense.pettyCashId) {
        const result = await queryRunner.manager
          .createQueryBuilder()
          .select('COALESCE(SUM(gasto.monto), 0)', 'total_aprobado')
          .from('gastos', 'gasto')
          .where('gasto.caja_chica_id = :pettyCashId', {
            pettyCashId: expense.pettyCashId,
          })
          .andWhere("gasto.estado = 'APROBADO'")
          .getRawOne();

        const totalApproved = parseFloat(result.total_aprobado);

        // Actualización atómica del saldo de la caja chica (Regla 03)
        await queryRunner.manager
          .createQueryBuilder()
          .update(PettyCash)
          .set({
            currentBalance: () =>
              `monto_asignado - ${totalApproved}`,
            finalBalance: () =>
              `${totalApproved} - monto_asignado`,
          })
          .where('id = :pettyCashId', { pettyCashId: expense.pettyCashId })
          .execute();
      }

      await queryRunner.commitTransaction();
      return expense;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todos los gastos de una caja chica específica.
   */
  async getExpensesByPettyCash(pettyCashId: string): Promise<Expense[]> {
    return await this.expenseRepository.find({
      where: { pettyCashId },
      relations: {
        category: true,
        expenseUser: true,
        approverUser: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene todos los gastos pendientes de revisión (para el Administrador).
   */
  async getPendingExpenses(): Promise<Expense[]> {
    return await this.expenseRepository.find({
      where: { status: 'PENDIENTE' },
      relations: {
        category: true,
        expenseUser: true,
        pettyCash: true,
      },
      order: { createdAt: 'ASC' },
    });
  }
}
