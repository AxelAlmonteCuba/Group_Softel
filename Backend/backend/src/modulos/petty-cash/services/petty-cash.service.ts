import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PettyCash } from '../entities/petty-cash.entity';
import { Expense } from '../entities/expense.entity';
import { CreatePettyCashDto } from '../dtos/create-petty-cash.dto';

@Injectable()
export class PettyCashService {
  constructor(
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Crea una caja chica en estado SOLICITADA. (Fase 2.2 - A)
   */
  async requestPettyCash(dto: CreatePettyCashDto, managerUserId: string): Promise<PettyCash> {
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
        throw new BadRequestException('El usuario ya tiene una caja chica activa o en proceso.');
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
  async approvePettyCash(pettyCashId: string, evaluatorUserId: string): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pettyCash = await queryRunner.manager.findOne(PettyCash, { where: { id: pettyCashId } });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'SOLICITADA') {
        throw new BadRequestException('Solo se pueden aprobar cajas en estado SOLICITADA.');
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
  async rejectPettyCash(pettyCashId: string, evaluatorUserId: string): Promise<PettyCash> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pettyCash = await queryRunner.manager.findOne(PettyCash, { where: { id: pettyCashId } });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'SOLICITADA') {
        throw new BadRequestException('Solo se pueden rechazar cajas en estado SOLICITADA.');
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
    const pettyCash = await this.pettyCashRepository.findOne({ where: { id: pettyCashId } });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'APROBADA') {
      throw new BadRequestException('Solo se pueden abrir cajas en estado APROBADA.');
    }

    pettyCash.status = 'ABIERTA';
    pettyCash.openingDate = new Date();

    return await this.pettyCashRepository.save(pettyCash);
  }

  /**
   * Pasa la caja de ABIERTA a EN_REVISION (Supervisor terminó de rendir).
   */
  async reviewPettyCash(pettyCashId: string): Promise<PettyCash> {
    const pettyCash = await this.pettyCashRepository.findOne({ where: { id: pettyCashId } });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'ABIERTA') {
      throw new BadRequestException('Solo se pueden poner en revisión cajas en estado ABIERTA.');
    }

    pettyCash.status = 'EN_REVISION';

    return await this.pettyCashRepository.save(pettyCash);
  }

  /**
   * Pasa la caja de EN_REVISION a CERRADA (Administrador finaliza auditoría y congela saldos).
   */
  async closePettyCash(pettyCashId: string): Promise<PettyCash> {
    const pettyCash = await this.pettyCashRepository.findOne({ where: { id: pettyCashId } });

    if (!pettyCash) {
      throw new NotFoundException('Caja chica no encontrada.');
    }

    if (pettyCash.status !== 'EN_REVISION' && pettyCash.status !== 'ABIERTA') {
      throw new BadRequestException('Solo se pueden cerrar cajas en estado ABIERTA o EN_REVISION.');
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
      const pettyCash = await queryRunner.manager.findOne(PettyCash, { where: { id: pettyCashId } });

      if (!pettyCash) {
        throw new NotFoundException('Caja chica no encontrada.');
      }

      if (pettyCash.status !== 'CERRADA') {
        throw new BadRequestException('Solo se pueden liquidar cajas en estado CERRADA.');
      }

      // Consulta de recálculo estricto de la regla 03 (solo APROBADOS)
      // Se utiliza el nombre de la columna física de la base de datos en las query en crudo
      const result = await queryRunner.manager.createQueryBuilder()
        .select('COALESCE(SUM(gasto.monto), 0)', 'total_aprobado')
        .from('gastos', 'gasto')
        .where('gasto.caja_chica_id = :cajaId', { cajaId: pettyCashId })
        .andWhere("gasto.estado = 'APROBADO'")
        .getRawOne();

      const totalApproved = parseFloat(result.total_aprobado);

      // Aplicar reglas matemáticas (con variables TS)
      pettyCash.currentBalance = Number(pettyCash.assignedAmount) - totalApproved;
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
  private async getExpenseSumsForPettyCashIds(
    pettyCashIds: string[],
  ): Promise<Map<string, { pendingAmount: number; approvedAmount: number; approvedCount: number; totalCount: number }>> {
    const map = new Map<string, { pendingAmount: number; approvedAmount: number; approvedCount: number; totalCount: number }>();
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
      .addSelect(
        "COUNT(gasto.id)",
        'totalCount',
      )
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
      const sums = sumsMap.get(pc.id) || { pendingAmount: 0, approvedAmount: 0, approvedCount: 0, totalCount: 0 };
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
      const sums = sumsMap.get(pc.id) || { pendingAmount: 0, approvedAmount: 0, approvedCount: 0, totalCount: 0 };
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
    const sums = sumsMap.get(id) || { pendingAmount: 0, approvedAmount: 0, approvedCount: 0, totalCount: 0 };
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
}

