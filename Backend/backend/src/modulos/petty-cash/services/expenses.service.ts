import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { PettyCash } from '../entities/petty-cash.entity';
import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { EvaluateExpenseDto, ExpenseDecision } from '../dtos/evaluate-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';

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
   * Transaccional para evitar race condition entre validación y escritura.
   */
  async registerExpense(
    dto: CreateExpenseDto,
    expenseUserId: string,
    receiptUrl: string,
  ): Promise<Expense> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si se asocia a una caja chica, validar que esté ABIERTA
      if (dto.pettyCashId) {
        const pettyCash = await queryRunner.manager.findOne(PettyCash, {
          where: { id: dto.pettyCashId },
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

      const newExpense = queryRunner.manager.create(Expense, {
        expenseUserId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        reason: dto.reason,
        receiptUrl,
        expenseDate: new Date(dto.expenseDate),
        pettyCashId: dto.pettyCashId ?? null,
        status: 'PENDIENTE',
      });

      const saved = await queryRunner.manager.save(newExpense);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Transaccional: Aprueba o rechaza un gasto.
   * Si es APROBADO, recalcula atómicamente currentBalance y finalBalance
   * en la caja chica vinculada según la Regla 03 (solo gastos APROBADOS).
   */
  async evaluateExpense(
    expenseId: string,
    dto: EvaluateExpenseDto,
    evaluatorUserId: string,
  ): Promise<Expense> {
    if ((dto.decision === ExpenseDecision.REJECTED || dto.decision === ExpenseDecision.OBSERVED) && !dto.evaluationComment) {
      throw new BadRequestException(
        'El motivo es obligatorio al rechazar u observar un gasto.',
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
      expense.status = dto.decision;
      expense.evaluatorUserId = evaluatorUserId;

      if (dto.decision === ExpenseDecision.REJECTED || dto.decision === ExpenseDecision.OBSERVED) {
        expense.evaluationComment = dto.evaluationComment!;
      }

      await queryRunner.manager.save(expense);

      // Si el gasto fue APROBADO y tiene caja chica, recalcular saldos
      // Regla 03: saldo_actual = monto_asignado - SUM(gastos APROBADOS)
      if (dto.decision === 'APROBADO' && expense.pettyCashId) {
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

        // Validar que el parseFloat no devolvió NaN
        if (isNaN(totalApproved)) {
          throw new BadRequestException(
            'Error al calcular el total de gastos aprobados.',
          );
        }

        // Actualización atómica del saldo de la caja chica (Regla 03)
        // Se usa query cruda parametrizada para evitar SQL injection
        await queryRunner.query(
          `UPDATE cajas_chicas 
           SET saldo_actual = monto_asignado - ?, 
               saldo_final = ? - monto_asignado 
           WHERE id = ?`,
          [totalApproved, totalApproved, expense.pettyCashId],
        );
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
        evaluatorUser: true,
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

  /**
   * Permite al creador del gasto subsanar las observaciones (estado OBSERVADO).
   * Al guardar, el gasto regresa al estado PENDIENTE.
   */
  async updateExpense(
    expenseId: string,
    dto: UpdateExpenseDto,
    userId: string,
    newReceiptUrl?: string,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado.');
    }

    // Validar que el usuario sea el creador
    if (expense.expenseUserId !== userId) {
      throw new BadRequestException('Solo el creador del gasto puede editarlo.');
    }

    // Solo se puede editar si está OBSERVADO
    if (expense.status !== 'OBSERVADO') {
      throw new BadRequestException('Solo se pueden editar gastos en estado OBSERVADO.');
    }

    // Actualizar campos
    if (dto.categoryId !== undefined) expense.categoryId = dto.categoryId;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.reason !== undefined) expense.reason = dto.reason;
    if (dto.expenseDate !== undefined) expense.expenseDate = new Date(dto.expenseDate);
    if (newReceiptUrl !== undefined) expense.receiptUrl = newReceiptUrl;

    // Regresar a pendiente y limpiar la observación
    expense.status = 'PENDIENTE';
    expense.evaluationComment = null;
    expense.evaluatorUserId = null; // Se limpia el evaluador previo

    return await this.expenseRepository.save(expense);
  }
}
