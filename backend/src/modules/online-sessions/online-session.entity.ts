import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from '../members/member.entity';

@Entity('online_sessions')
export class OnlineSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  date!: string;

  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'main_chairman_id' })
  main_chairman!: Member | null;

  @Column({ type: 'uuid', nullable: true })
  main_chairman_id!: string | null;

  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sub_chairman_id' })
  sub_chairman!: Member | null;

  @Column({ type: 'uuid', nullable: true })
  sub_chairman_id!: string | null;

  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'speaker1_id' })
  speaker1!: Member | null;

  @Column({ type: 'uuid', nullable: true })
  speaker1_id!: string | null;

  @ManyToOne(() => Member, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'speaker2_id' })
  speaker2!: Member | null;

  @Column({ type: 'uuid', nullable: true })
  speaker2_id!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  is_cancelled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
