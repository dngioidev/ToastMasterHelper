import type { Member } from '../members/member.types';

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

export const OFFLINE_ROLE_LABELS: Record<OfflineRole, string> = {
  [OfflineRole.TOAST_MASTER]: 'Toast Master',
  [OfflineRole.TABLE_TONIC]: 'Table Tonic',
  [OfflineRole.SPEAKER]: 'Speaker',
  [OfflineRole.EVALUATOR]: 'Evaluator',
  [OfflineRole.TOPIC_MASTER]: 'Topic Master',
  [OfflineRole.UH_AH_COUNTER]: 'Uh/Ah Counter',
  [OfflineRole.TIMER]: 'Timer',
  [OfflineRole.GENERAL_EVALUATOR]: 'General Evaluator',
  [OfflineRole.BACKUP_SPEAKER]: 'Backup Speaker',
};

export interface OfflineSessionAssignment {
  id: string;
  session_id: string;
  member: Member | null;
  member_id: string | null;
  role: OfflineRole;
  slot_index: number;
  passed: boolean;
  created_at: string;
}

export interface OfflineSession {
  id: string;
  date: string;
  num_speakers: number;
  num_backup_speakers: number;
  notes: string | null;
  is_cancelled: boolean;
  assignments: OfflineSessionAssignment[];
  created_at: string;
  updated_at: string;
}

export interface OfflineSuggestResult {
  toast_master: Member | null;
  table_tonic: Member | null;
  speakers: Member[];
  evaluators: (Member | null)[];
  topic_master: Member | null;
  uh_ah_counter: Member | null;
  timer: Member | null;
  general_evaluator: Member | null;
  backup_speakers: Member[];
}

export interface AssignmentPayload {
  member_id?: string;
  role: OfflineRole;
  slot_index?: number;
  passed?: boolean;
}

export interface CreateOfflineSessionPayload {
  date: string;
  num_speakers?: number;
  num_backup_speakers?: number;
  notes?: string;
  is_cancelled?: boolean;
  assignments?: AssignmentPayload[];
}

export type UpdateOfflineSessionPayload = Partial<CreateOfflineSessionPayload>;
