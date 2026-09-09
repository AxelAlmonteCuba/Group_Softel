import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
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
  ) { }

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
        relations: { pettyCash: true },
      });

      if (!expense) {
        throw new NotFoundException('Gasto no encontrado.');
      }

      // Regla 01 y 04: Cajas LIQUIDADA o CERRADA tienen saldos y registros congelados
      if (
        expense.pettyCash &&
        (expense.pettyCash.status === 'LIQUIDADA' || expense.pettyCash.status === 'CERRADA')
      ) {
        throw new BadRequestException(
          `La caja chica vinculada se encuentra en estado ${expense.pettyCash.status}. Sus gastos y saldos están congelados y no pueden ser modificados por ningún usuario.`,
        );
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
   * Obtiene todos los gastos de una caja chica específica formateados limpiamente.
   */
  async getExpensesByPettyCash(pettyCashId: string): Promise<any[]> {
    const expenses = await this.expenseRepository.find({
      where: { pettyCashId },
      relations: {
        category: true,
        expenseUser: true,
        evaluatorUser: true,
      },
      order: { createdAt: 'DESC' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      reason: expense.reason,
      receiptUrl: expense.receiptUrl,
      status: expense.status,
      evaluationComment: expense.evaluationComment,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      category: {
        id: expense.category.id,
        name: expense.category.name,
      },
      expenseUser: {
        id: expense.expenseUser.id,
        nombres: expense.expenseUser.nombres,
        apellidos: expense.expenseUser.apellidos,
        documento_identidad: expense.expenseUser.documento_identidad,
        rol: expense.expenseUser.rol,
        cargo: expense.expenseUser.cargo,
      },
      evaluatorUser: expense.evaluatorUser
        ? {
          id: expense.evaluatorUser.id,
          nombres: expense.evaluatorUser.nombres,
          apellidos: expense.evaluatorUser.apellidos,
        }
        : null,
    }));
  }

  /**
   * Obtiene todos los gastos pendientes de revisión (para el Administrador).
   * Solo devuelve gastos directos o gastos asociados a cajas en estado ABIERTA o EN_REVISION.
   * Retorna únicamente los datos necesarios para el frontend.
   */
  async getPendingExpenses(): Promise<any[]> {
    const expenses = await this.expenseRepository.find({
      where: [
        { status: 'PENDIENTE', pettyCashId: IsNull() },
        { status: 'PENDIENTE', pettyCash: { status: 'ABIERTA' } },
        { status: 'PENDIENTE', pettyCash: { status: 'EN_REVISION' } },
      ],
      relations: {
        category: true,
        expenseUser: true,
        pettyCash: true,
      },
      order: { createdAt: 'ASC' },
    });

    return expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      reason: expense.reason,
      receiptUrl: expense.receiptUrl,
      status: expense.status,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      category: {
        id: expense.category.id,
        name: expense.category.name,
      },
      expenseUser: {
        id: expense.expenseUser.id,
        nombres: expense.expenseUser.nombres,
        apellidos: expense.expenseUser.apellidos,
        documento_identidad: expense.expenseUser.documento_identidad,
        rol: expense.expenseUser.rol,
        cargo: expense.expenseUser.cargo,
      },
      pettyCash: expense.pettyCash
        ? {
          id: expense.pettyCash.id,
          assignedAmount: expense.pettyCash.assignedAmount,
          currentBalance: expense.pettyCash.currentBalance,
          status: expense.pettyCash.status,
        }
        : null,
    }));
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
      relations: { pettyCash: true },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado.');
    }

    // Regla 01 y 04: Cajas LIQUIDADA o CERRADA tienen gastos congelados
    if (
      expense.pettyCash &&
      (expense.pettyCash.status === 'LIQUIDADA' || expense.pettyCash.status === 'CERRADA')
    ) {
      throw new BadRequestException(
        `La caja chica vinculada se encuentra en estado ${expense.pettyCash.status}. Sus gastos están congelados y no pueden ser modificados.`,
      );
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

  /**
   * Obtiene todos los reembolsos directos (sin caja chica) aprobados y no pagados de un usuario.
   */
  async getPendingDirectReimbursementsByUser(userId: string): Promise<{ expenses: any[], totalOwed: number }> {
    const expenses = await this.expenseRepository.find({
      where: {
        expenseUserId: userId,
        pettyCashId: IsNull(),
        status: 'APROBADO',
        isReimbursed: false,
      },
      relations: {
        category: true,
      },
      order: { expenseDate: 'ASC' },
    });

    const totalOwed = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const cleanExpenses = expenses.map((exp) => ({
      id: exp.id,
      amount: exp.amount,
      reason: exp.reason,
      receiptUrl: exp.receiptUrl,
      status: exp.status,
      expenseDate: exp.expenseDate,
      category: {
        id: exp.category.id,
        name: exp.category.name,
      },
    }));

    return { expenses: cleanExpenses, totalOwed };
  }

  /**
   * Obtiene un resumen de todos los usuarios que tienen reembolsos directos pendientes.
   */
  async getUsersWithPendingReimbursements(): Promise<any[]> {
    const qb = this.expenseRepository.createQueryBuilder('expense')
      .innerJoin('expense.expenseUser', 'user')
      .select([
        'user.id AS userId',
        'user.nombres AS nombres',
        'user.apellidos AS apellidos',
        'user.documento_identidad AS documento',
        'COALESCE(SUM(expense.monto), 0) AS totalOwed'
      ])
      .where('expense.caja_chica_id IS NULL')
      .andWhere("expense.estado = 'APROBADO'")
      .andWhere('expense.reembolsado = false')
      .groupBy('user.id')
      .addGroupBy('user.nombres')
      .addGroupBy('user.apellidos')
      .addGroupBy('user.documento_identidad');

    const rawResults = await qb.getRawMany();

    return rawResults.map(row => ({
      userId: row.userId,
      userNames: `${row.nombres} ${row.apellidos}`,
      document: row.documento,
      totalOwed: parseFloat(row.totalOwed)
    }));
  }

  /**
   * Marca un gasto directo como reembolsado (pagado).
   */
  async markAsReimbursed(expenseId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id: expenseId } });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado.');
    }

    if (expense.pettyCashId !== null) {
      throw new BadRequestException('Solo los reembolsos directos (sin caja chica) pueden ser marcados como pagados manualmente.');
    }

    if (expense.status !== 'APROBADO') {
      throw new BadRequestException('El gasto debe estar APROBADO para poder ser reembolsado.');
    }

    if (expense.isReimbursed) {
      throw new BadRequestException('El gasto ya ha sido marcado como reembolsado.');
    }

    expense.isReimbursed = true;
    return await this.expenseRepository.save(expense);
  }
}
