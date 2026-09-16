import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager, IsNull } from 'typeorm';
import { PettyCash } from '../entities/petty-cash.entity';
import { Expense } from '../entities/expense.entity';
import { User } from '../../users/user.entity';
import { CreatePettyCashDto } from '../dtos/create-petty-cash.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PettyCashService {
  constructor(
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Crea una caja chica en estado SOLICITADA. (Fase 2.2 - A)
   */
  async requestPettyCash(
    dto: CreatePettyCashDto,
    managerUserId: string,
  ): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar si el usuario ya tiene una caja en proceso o abierta
      const activePettyCash = await queryRunner.manager.findOne(PettyCash, {
        where: [
          { managerUserId: managerUserId, status: 'SOLICITADA' },
          { managerUserId: managerUserId, status: 'APROBADA' },
          { managerUserId: managerUserId, status: 'ABIERTA' },
          { managerUserId: managerUserId, status: 'EN_REVISION' },
        ],
      });

      if (activePettyCash) {
        throw new BadRequestException(
          'El usuario ya tiene una caja chica activa o en proceso.',
        );
      }

      const newPettyCash = queryRunner.manager.create(PettyCash, {
        managerUserId: managerUserId,
        assignedAmount: dto.assignedAmount,
        currentBalance: dto.assignedAmount,
        finalBalance: 0.0,
        status: 'SOLICITADA',
        justification: dto.justification,
        projectId: dto.projectId ?? null,
      });

      const saved = await queryRunner.manager.save(newPettyCash);

      const user = await queryRunner.manager.findOne(User, {
        where: { id: managerUserId },
      });
      if (user) {
        this.eventEmitter.emit('pettycash.requested', {
          encargadoName: `${user.nombres} ${user.apellidos}`,
          amount: dto.assignedAmount,
        });
      }

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
   * Transaccional: Pasa la caja de SOLICITADA a APROBADA y registra al aprobador.
   */
  async approvePettyCash(
    pettyCashId: string,
    evaluatorUserId: string,
  ): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pettyCash = await queryRunner.manager.findOne(PettyCash, {
        where: { id: pettyCashId },
      });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'SOLICITADA') {
        throw new BadRequestException(
          'Solo se pueden aprobar cajas en estado SOLICITADA.',
        );
      }

      pettyCash.status = 'APROBADA';
      pettyCash.evaluatorUserId = evaluatorUserId;

      const savedPettyCash = await queryRunner.manager.save(pettyCash);

      await queryRunner.commitTransaction();
      return savedPettyCash;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Pasa la caja de SOLICITADA a RECHAZADA.
   */
  async rejectPettyCash(
    pettyCashId: string,
    evaluatorUserId: string,
  ): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pettyCash = await queryRunner.manager.findOne(PettyCash, {
        where: { id: pettyCashId },
      });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'SOLICITADA') {
        throw new BadRequestException(
          'Solo se pueden rechazar cajas en estado SOLICITADA.',
        );
      }

      pettyCash.status = 'RECHAZADA';
      pettyCash.evaluatorUserId = evaluatorUserId;

      const rejected = await queryRunner.manager.save(pettyCash);
      await queryRunner.commitTransaction();
      return rejected;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Pasa la caja de APROBADA a ABIERTA y registra la fecha de apertura.
   */
  async openPettyCash(pettyCashId: string): Promise<PettyCash> {
    const pettyCash = await this.pettyCashRepository.findOne({
      where: { id: pettyCashId },
    });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'APROBADA') {
      throw new BadRequestException(
        'Solo se pueden abrir cajas en estado APROBADA.',
      );
    }

    pettyCash.status = 'ABIERTA';
    pettyCash.openingDate = new Date();

    return await this.pettyCashRepository.save(pettyCash);
  }

  /**
   * Pasa la caja de ABIERTA a EN_REVISION (Supervisor terminó de rendir).
   */
  async reviewPettyCash(pettyCashId: string): Promise<PettyCash> {
    const pettyCash = await this.pettyCashRepository.findOne({
      where: { id: pettyCashId },
      relations: { managerUser: true },
    });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'ABIERTA') {
      throw new BadRequestException(
        'Solo se pueden poner en revisión cajas en estado ABIERTA.',
      );
    }

    pettyCash.status = 'EN_REVISION';

    const saved = await this.pettyCashRepository.save(pettyCash);

    if (pettyCash.managerUser) {
      this.eventEmitter.emit('pettycash.review_pending', {
        managerName: `${pettyCash.managerUser.nombres} ${pettyCash.managerUser.apellidos}`,
      });
    }

    return saved;
  }

  /**
   * Pasa la caja de EN_REVISION a CERRADA (Administrador finaliza auditoría y congela saldos).
   */
  async closePettyCash(pettyCashId: string): Promise<PettyCash> {
    const pettyCash = await this.pettyCashRepository.findOne({
      where: { id: pettyCashId },
    });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'EN_REVISION' && pettyCash.status !== 'ABIERTA') {
      throw new BadRequestException(
        'Solo se pueden cerrar cajas en estado ABIERTA o EN_REVISION.',
      );
    }

    pettyCash.status = 'CERRADA';

    return await this.pettyCashRepository.save(pettyCash);
  }

  /**
   * Pasa la caja a LIQUIDADA y congela los saldos matemáticamente.
   */
  async liquidatePettyCash(pettyCashId: string): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pettyCash = await queryRunner.manager.findOne(PettyCash, {
        where: { id: pettyCashId },
      });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'CERRADA') {
        throw new BadRequestException(
          'Solo se pueden liquidar cajas en estado CERRADA.',
        );
      }

      // Consulta de recálculo estricto de la regla 03 (solo APROBADOS)
      // Se utiliza el nombre de la columna física de la base de datos en las query en crudo
      const result = await queryRunner.manager
        .createQueryBuilder()
        .select('COALESCE(SUM(gasto.monto), 0)', 'total_aprobado')
        .from('gastos', 'gasto')
        .where('gasto.caja_chica_id = :cajaId', { cajaId: pettyCashId })
        .andWhere("gasto.estado = 'APROBADO'")
        .getRawOne();

      const totalApproved = parseFloat(result.total_aprobado);

      // Aplicar reglas matemáticas (con variables TS)
      pettyCash.currentBalance =
        Number(pettyCash.assignedAmount) - totalApproved;
      pettyCash.finalBalance = totalApproved - Number(pettyCash.assignedAmount);

      pettyCash.status = 'LIQUIDADA';
      pettyCash.closingDate = new Date();

      const liquidatedPettyCash = await queryRunner.manager.save(pettyCash);

      await queryRunner.commitTransaction();
      return liquidatedPettyCash;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene la suma de gastos PENDIENTE y APROBADO para una lista de IDs de cajas chicas.
   * Evita consultas N+1 agrupando en una sola consulta SQL agregada.
   */
  private async getExpenseSumsForPettyCashIds(pettyCashIds: string[]): Promise<
    Map<
      string,
      {
        pendingAmount: number;
        approvedAmount: number;
        approvedCount: number;
        totalCount: number;
      }
    >
  > {
    const map = new Map<
      string,
      {
        pendingAmount: number;
        approvedAmount: number;
        approvedCount: number;
        totalCount: number;
      }
    >();
    if (!pettyCashIds || pettyCashIds.length === 0) {
      return map;
    }

    const raw = await this.expenseRepository
      .createQueryBuilder('gasto')
      .select('gasto.pettyCashId', 'pettyCashId')
      .addSelect(
        "COALESCE(SUM(CASE WHEN gasto.status = 'PENDIENTE' THEN gasto.amount ELSE 0 END), 0)",
        'pending',
      )
      .addSelect(
        "COALESCE(SUM(CASE WHEN gasto.status = 'APROBADO' THEN gasto.amount ELSE 0 END), 0)",
        'approved',
      )
      .addSelect(
        "COALESCE(COUNT(CASE WHEN gasto.status = 'APROBADO' THEN 1 ELSE NULL END), 0)",
        'approvedCount',
      )
      .addSelect('COUNT(gasto.id)', 'totalCount')
      .where('gasto.pettyCashId IN (:...pettyCashIds)', { pettyCashIds })
      .groupBy('gasto.pettyCashId')
      .getRawMany();

    for (const r of raw) {
      map.set(r.pettyCashId, {
        pendingAmount: Number(r.pending || 0),
        approvedAmount: Number(r.approved || 0),
        approvedCount: Number(r.approvedCount || 0),
        totalCount: Number(r.totalCount || 0),
      });
    }

    return map;
  }

  /**
   * Obtiene todas las cajas chicas (Para Administrador y Contador) con montos calculados.
   */
  async findAll(): Promise<any[]> {
    const list = await this.pettyCashRepository.find({
      relations: {
        managerUser: true,
        evaluatorUser: true,
      },
      order: { createdAt: 'DESC' },
    });

    const ids = list.map((pc) => pc.id);
    const sumsMap = await this.getExpenseSumsForPettyCashIds(ids);

    return list.map((pc) => {
      const sums = sumsMap.get(pc.id) || {
        pendingAmount: 0,
        approvedAmount: 0,
        approvedCount: 0,
        totalCount: 0,
      };
      const currentBalance = Number(pc.currentBalance);
      const effectiveBalance = currentBalance - sums.pendingAmount;

      return {
        id: pc.id,
        assignedAmount: Number(pc.assignedAmount),
        currentBalance: currentBalance,
        finalBalance: Number(pc.finalBalance),
        approvedAmount: sums.approvedAmount,
        pendingAmount: sums.pendingAmount,
        effectiveBalance: effectiveBalance,
        approvedExpensesCount: sums.approvedCount,
        totalExpensesCount: sums.totalCount,
        status: pc.status,
        justification: pc.justification,
        projectId: pc.projectId,
        openingDate: pc.openingDate,
        closingDate: pc.closingDate,
        createdAt: pc.createdAt,
        managerUser: {
          id: pc.managerUser.id,
          nombres: pc.managerUser.nombres,
          apellidos: pc.managerUser.apellidos,
          documento_identidad: pc.managerUser.documento_identidad,
          cargo: pc.managerUser.cargo,
          rol: pc.managerUser.rol,
        },
        evaluatorUser: pc.evaluatorUser
          ? {
              id: pc.evaluatorUser.id,
              nombres: pc.evaluatorUser.nombres,
              apellidos: pc.evaluatorUser.apellidos,
              cargo: pc.evaluatorUser.cargo,
            }
          : null,
      };
    });
  }

  /**
   * Obtiene las cajas chicas asignadas a un usuario específico con montos calculados.
   */
  async findByUser(userId: string): Promise<any[]> {
    const list = await this.pettyCashRepository.find({
      where: { managerUserId: userId },
      relations: {
        managerUser: true,
        evaluatorUser: true,
      },
      order: { createdAt: 'DESC' },
    });

    const ids = list.map((pc) => pc.id);
    const sumsMap = await this.getExpenseSumsForPettyCashIds(ids);

    return list.map((pc) => {
      const sums = sumsMap.get(pc.id) || {
        pendingAmount: 0,
        approvedAmount: 0,
        approvedCount: 0,
        totalCount: 0,
      };
      const currentBalance = Number(pc.currentBalance);
      const effectiveBalance = currentBalance - sums.pendingAmount;

      return {
        id: pc.id,
        assignedAmount: Number(pc.assignedAmount),
        currentBalance: currentBalance,
        finalBalance: Number(pc.finalBalance),
        approvedAmount: sums.approvedAmount,
        pendingAmount: sums.pendingAmount,
        effectiveBalance: effectiveBalance,
        approvedExpensesCount: sums.approvedCount,
        totalExpensesCount: sums.totalCount,
        status: pc.status,
        justification: pc.justification,
        projectId: pc.projectId,
        openingDate: pc.openingDate,
        closingDate: pc.closingDate,
        createdAt: pc.createdAt,
        managerUser: {
          id: pc.managerUser.id,
          nombres: pc.managerUser.nombres,
          apellidos: pc.managerUser.apellidos,
          documento_identidad: pc.managerUser.documento_identidad,
          cargo: pc.managerUser.cargo,
          rol: pc.managerUser.rol,
        },
        evaluatorUser: pc.evaluatorUser
          ? {
              id: pc.evaluatorUser.id,
              nombres: pc.evaluatorUser.nombres,
              apellidos: pc.evaluatorUser.apellidos,
              cargo: pc.evaluatorUser.cargo,
            }
          : null,
      };
    });
  }

  /**
   * Obtiene una caja chica por su ID con sus relaciones de usuario y montos calculados.
   */
  async findById(id: string): Promise<any> {
    const pc = await this.pettyCashRepository.findOne({
      where: { id },
      relations: {
        managerUser: true,
        evaluatorUser: true,
      },
    });

    if (!pc) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    const sumsMap = await this.getExpenseSumsForPettyCashIds([id]);
    const sums = sumsMap.get(id) || {
      pendingAmount: 0,
      approvedAmount: 0,
      approvedCount: 0,
      totalCount: 0,
    };
    const currentBalance = Number(pc.currentBalance);
    const effectiveBalance = currentBalance - sums.pendingAmount;

    return {
      id: pc.id,
      assignedAmount: Number(pc.assignedAmount),
      currentBalance: currentBalance,
      finalBalance: Number(pc.finalBalance),
      approvedAmount: sums.approvedAmount,
      pendingAmount: sums.pendingAmount,
      effectiveBalance: effectiveBalance,
      approvedExpensesCount: sums.approvedCount,
      totalExpensesCount: sums.totalCount,
      status: pc.status,
      justification: pc.justification,
      projectId: pc.projectId,
      openingDate: pc.openingDate,
      closingDate: pc.closingDate,
      createdAt: pc.createdAt,
      managerUser: {
        id: pc.managerUser.id,
        nombres: pc.managerUser.nombres,
        apellidos: pc.managerUser.apellidos,
        documento_identidad: pc.managerUser.documento_identidad,
        cargo: pc.managerUser.cargo,
        rol: pc.managerUser.rol,
      },
      evaluatorUser: pc.evaluatorUser
        ? {
            id: pc.evaluatorUser.id,
            nombres: pc.evaluatorUser.nombres,
            apellidos: pc.evaluatorUser.apellidos,
            cargo: pc.evaluatorUser.cargo,
          }
        : null,
    };
  }

  /**
   * Obtiene los saldos netos por usuario (Ticket 2).
   * Suma el saldo_final de cajas CERRADAS y los gastos directos APROBADOS no reembolsados.
   */
  async getUserBalances(): Promise<any[]> {
    // 1. Obtener todos los usuarios activos
    const users = await this.dataSource.manager.find(User, {
      where: { estado: 'ACTIVO' },
    });

    // 2. Suma de saldo_final en cajas chicas CERRADAS
    const pettyCashRaw = await this.pettyCashRepository
      .createQueryBuilder('caja')
      .select('caja.usuario_encargado_id', 'userId')
      .addSelect('COALESCE(SUM(caja.saldo_final), 0)', 'totalCaja')
      .where("caja.estado = 'CERRADA'")
      .groupBy('caja.usuario_encargado_id')
      .getRawMany();

    // 3. Suma de montos de gastos directos APROBADOS y no reembolsados
    const directExpensesRaw = await this.expenseRepository
      .createQueryBuilder('gasto')
      .select('gasto.usuario_gasto_id', 'userId')
      .addSelect('COALESCE(SUM(gasto.monto), 0)', 'totalDirect')
      .where('gasto.caja_chica_id IS NULL')
      .andWhere("gasto.estado = 'APROBADO'")
      .andWhere('gasto.reembolsado = false')
      .groupBy('gasto.usuario_gasto_id')
      .getRawMany();

    const pettyCashMap = new Map<string, number>();
    pettyCashRaw.forEach((row) =>
      pettyCashMap.set(row.userId, Number(row.totalCaja)),
    );

    const directExpensesMap = new Map<string, number>();
    directExpensesRaw.forEach((row) =>
      directExpensesMap.set(row.userId, Number(row.totalDirect)),
    );

    const balances = users.map((user) => {
      const cajaBalance = pettyCashMap.get(user.id) || 0;
      const directBalance = directExpensesMap.get(user.id) || 0;
      const netBalance = cajaBalance + directBalance;

      return {
        userId: user.id,
        userNames: `${user.nombres} ${user.apellidos}`,
        document: user.documento_identidad,
        role: user.rol,
        cajaBalance,
        directBalance,
        netBalance,
      };
    });

    // Solo retornamos usuarios con saldo neto distinto de 0 y ordenamos de mayor deuda de la empresa a mayor deuda del empleado
    return balances
      .filter((b) => b.netBalance !== 0)
      .sort((a, b) => b.netBalance - a.netBalance);
  }

  /**
   * Calcula el balance pendiente de liquidación para un usuario específico.
   * Método privado reutilizado por getUserBalances() y liquidateByUser().
   *
   * @param userId       ID del usuario a consultar
   * @param manager      EntityManager (de queryRunner para transacciones, o this.dataSource.manager)
   */
  private async computeUserPendingBalance(
    userId: string,
    manager: EntityManager,
  ): Promise<{ cajaBalance: number; directBalance: number; netBalance: number }> {
    // saldo_final de cajas CERRADAS (ya precalculado en cada aprobación de gasto)
    const cajaRaw = await manager
      .createQueryBuilder(PettyCash, 'caja')
      .select('COALESCE(SUM(caja.saldo_final), 0)', 'total')
      .where("caja.estado = 'CERRADA'")
      .andWhere('caja.usuario_encargado_id = :userId', { userId })
      .getRawOne();

    const cajaBalance = Number(cajaRaw?.total ?? 0);

    // Suma de gastos directos APROBADOS y aún no reembolsados
    const directRaw = await manager
      .createQueryBuilder(Expense, 'gasto')
      .select('COALESCE(SUM(gasto.monto), 0)', 'total')
      .where('gasto.caja_chica_id IS NULL')
      .andWhere("gasto.estado = 'APROBADO'")
      .andWhere('gasto.reembolsado = false')
      .andWhere('gasto.usuario_gasto_id = :userId', { userId })
      .getRawOne();

    const directBalance = Number(directRaw?.total ?? 0);

    return {
      cajaBalance,
      directBalance,
      netBalance: cajaBalance + directBalance,
    };
  }

  /**
   * TICKET 5 — Liquidación Consolidada por Usuario.
   * 1. Lee el saldo pendiente del usuario vía computeUserPendingBalance().
   * 2. Cambia todas sus cajas CERRADAS a LIQUIDADA (NO recalcula, usa saldo_final existente).
   * 3. Marca todos sus reembolsos directos pendientes como reembolsado=true.
   * 4. Emite el evento asíncrono de notificación Push.
   */
  async liquidateByUser(userId: string): Promise<{
    cajasLiquidadas: number;
    reembolsosLiquidados: number;
    cajaBalance: number;
    directBalance: number;
    netBalance: number;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Calcular balance ANTES de liquidar (usando el método privado compartido)
      const { cajaBalance, directBalance, netBalance } =
        await this.computeUserPendingBalance(userId, queryRunner.manager);

      if (cajaBalance === 0 && directBalance === 0) {
        throw new BadRequestException(
          'Este usuario no tiene cajas CERRADAS ni reembolsos directos pendientes de liquidar.',
        );
      }

      // 2. Buscar cajas CERRADAS y cambiar estado a LIQUIDADA + registrar fecha
      const closedCajas = await queryRunner.manager.find(PettyCash, {
        where: { managerUserId: userId, status: 'CERRADA' },
      });

      for (const caja of closedCajas) {
        caja.status = 'LIQUIDADA';
        caja.closingDate = new Date();
        await queryRunner.manager.save(caja);
      }

      // 3. Marcar todos los reembolsos directos pendientes como pagados
      const pendingReimbursements = await queryRunner.manager.find(Expense, {
        where: {
          expenseUserId: userId,
          pettyCashId: IsNull(),
          status: 'APROBADO',
          isReimbursed: false,
        },
      });

      for (const expense of pendingReimbursements) {
        expense.isReimbursed = true;
        await queryRunner.manager.save(expense);
      }

      await queryRunner.commitTransaction();

      // 4. Emitir evento asíncrono DESPUÉS del commit
      this.eventEmitter.emit('pettycash.user_liquidated', {
        userId,
        cajasLiquidadas: closedCajas.length,
        reembolsosLiquidados: pendingReimbursements.length,
        cajaBalance,
        directBalance,
        netBalance,
      });

      return {
        cajasLiquidadas: closedCajas.length,
        reembolsosLiquidados: pendingReimbursements.length,
        cajaBalance,
        directBalance,
        netBalance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
