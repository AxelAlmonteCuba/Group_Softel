import { User } from '../../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cajas_chicas')
export class PettyCash {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_encargado_id' })
  managerUser!: User;

  @Column({ name: 'usuario_encargado_id' })
  managerUserId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_aprobador_id' })
  approverUser!: User | null;

  @Column({ name: 'usuario_aprobador_id', nullable: true })
  approverUserId!: string | null;

  @Column({ name: 'monto_asignado', type: 'decimal', precision: 10, scale: 2 })
  assignedAmount!: number;

  @Column({ name: 'saldo_actual', type: 'decimal', precision: 10, scale: 2 })
  currentBalance!: number;

  @Column({ name: 'saldo_final', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  finalBalance!: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: [
      'SOLICITADA',
      'APROBADA',
      'RECHAZADA',
      'ABIERTA',
      'EN_REVISION',
      'CERRADA',
      'LIQUIDADA',
    ],
    default: 'SOLICITADA',
  })
  status!: string;

  @Column({ name: 'fecha_apertura', type: 'timestamp', nullable: true })
  openingDate!: Date | null;

  @Column({ name: 'fecha_cierre', type: 'timestamp', nullable: true })
  closingDate!: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
