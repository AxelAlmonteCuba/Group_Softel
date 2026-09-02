import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PettyCash } from '../entities/petty-cash.entity';

@Injectable()
export class PettyCashService {
  constructor(
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una caja chica en estado SOLICITADA. (Fase 2.2 - A)
   */
  async requestPettyCash(managerUserId: string, assignedAmount: number): Promise<PettyCash> {
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
        assignedAmount: assignedAmount,
        currentBalance: assignedAmount, // El saldo inicial es igual al monto asignado
        finalBalance: 0.0,
        status: 'SOLICITADA',
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
  async approvePettyCash(pettyCashId: string, approverUserId: string): Promise<PettyCash> {
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
      pettyCash.approverUserId = approverUserId;

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
  async rejectPettyCash(pettyCashId: string, approverUserId: string): Promise<PettyCash> {
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
      pettyCash.approverUserId = approverUserId;

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

    if (pettyCash.status !== 'EN_REVISION') {
      throw new BadRequestException('Solo se pueden cerrar cajas en estado EN_REVISION.');
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
}
