import { User } from '../../users/user.entity';
import { ExpenseCategory } from './expense-category.entity';
import { PettyCash } from './petty-cash.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('gastos')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PettyCash, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'caja_chica_id' })
  pettyCash!: PettyCash | null;

  @Column({ name: 'caja_chica_id', type: 'varchar', length: 36, nullable: true })
  pettyCashId!: string | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_gasto_id' })
  expenseUser!: User;

  @Column({ name: 'usuario_gasto_id' })
  expenseUserId!: string;

  @ManyToOne(() => ExpenseCategory, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoria_id' })
  category!: ExpenseCategory;

  @Column({ name: 'categoria_id' })
  categoryId!: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_evaluador_id' })
  evaluatorUser!: User | null;

  @Column({ name: 'usuario_evaluador_id', type: 'varchar', length: 36, nullable: true })
  evaluatorUserId!: string | null;

  @Column({ name: 'monto', type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'motivo', length: 255 })
  reason!: string;

  @Column({ name: 'url_comprobante', type: 'text' })
  receiptUrl!: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'OBSERVADO'],
    default: 'PENDIENTE',
  })
  status!: string;

  @Column({ name: 'comentarios_auditoria', type: 'varchar', length: 255, nullable: true })
  evaluationComment!: string | null;

  @Column({ name: 'fecha_gasto', type: 'date' })
  expenseDate!: Date;

  @Column({ name: 'reembolsado', type: 'boolean', default: false })
  isReimbursed!: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
