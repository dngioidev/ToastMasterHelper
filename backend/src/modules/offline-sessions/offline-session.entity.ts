import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OfflineSessionAssignment } from './offline-session-assignment.entity';

@Entity('offline_sessions')
export class OfflineSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'int', default: 2 })
  num_speakers!: number;

  @Column({ type: 'int', default: 1 })
  num_backup_speakers!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  is_cancelled!: boolean;

  @OneToMany(() => OfflineSessionAssignment, (a) => a.session, {
    cascade: true,
    eager: true,
  })
  assignments!: OfflineSessionAssignment[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
