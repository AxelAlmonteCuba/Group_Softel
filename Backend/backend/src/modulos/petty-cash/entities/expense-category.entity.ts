import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias_gastos')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'nombre', length: 50, unique: true })
  name!: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  isActive!: boolean;
}
