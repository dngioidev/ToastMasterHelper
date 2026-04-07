import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MemberStatus {
  ACTIVE = 'Active',
  LEAVE = 'Leave',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status!: MemberStatus;

  @Column({ type: 'int', default: 0 })
  project_level!: number;

  @Column({ type: 'jsonb', default: {} })
  role_counts!: Record<string, number>;

  @Column({ type: 'boolean', default: true })
  online_as_chairman!: boolean;

  @Column({ type: 'boolean', default: true })
  online_as_speaker!: boolean;

  @Column({ type: 'boolean', default: true })
  attends_offline!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
