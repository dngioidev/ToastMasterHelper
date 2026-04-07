import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Member } from '../members/member.entity';
import { OfflineSession } from './offline-session.entity';

export enum OfflineRole {
  TOAST_MASTER = 'toast_master',
  TABLE_TONIC = 'table_tonic',
  SPEAKER = 'speaker',
  EVALUATOR = 'evaluator',
  TOPIC_MASTER = 'topic_master',
  UH_AH_COUNTER = 'uh_ah_counter',
  TIMER = 'timer',
  GENERAL_EVALUATOR = 'general_evaluator',
  BACKUP_SPEAKER = 'backup_speaker',
}

@Entity('offline_session_assignments')
export class OfflineSessionAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OfflineSession, (s) => s.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: OfflineSession;

  @Column({ type: 'uuid' })
  session_id!: string;

  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'member_id' })
  member!: Member | null;

  @Column({ type: 'uuid', nullable: true })
  member_id!: string | null;

  @Column({ type: 'enum', enum: OfflineRole })
  role!: OfflineRole;

  /** Position index for roles with multiple slots (speaker 1, speaker 2, etc.) */
  @Column({ type: 'int', default: 0 })
  slot_index!: number;

  /** For speakers: whether they passed this speech */
  @Column({ type: 'boolean', default: false })
  passed!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
