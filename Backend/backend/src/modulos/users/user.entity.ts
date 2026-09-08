import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 20, unique: true })
  documento_identidad!: string;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidos!: string;

  @Column({ length: 120, unique: true })
  correo!: string;

  @Exclude()
  @Column({ length: 255, select: false })
  clave_hash!: string;

  @Column({ length: 100 })
  cargo!: string;

  @Column({
    type: 'enum',
    enum: ['ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR'],
  })
  rol!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVO', 'INACTIVO'],
    default: 'ACTIVO',
  })
  estado!: string;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  creado_en!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  actualizado_en!: Date;
}
