import type { Member } from '../members/member.types';

export interface OnlineSession {
  id: string;
  date: string;
  main_chairman: Member | null;
  main_chairman_id: string | null;
  sub_chairman: Member | null;
  sub_chairman_id: string | null;
  speaker1: Member | null;
  speaker1_id: string | null;
  speaker2: Member | null;
  speaker2_id: string | null;
  notes: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnlineSessionSuggestion {
  main_chairman: Member | null;
  sub_chairman: Member | null;
  speaker1: Member | null;
  speaker2: Member | null;
}

export interface CreateOnlineSessionPayload {
  date: string;
  main_chairman_id?: string;
  sub_chairman_id?: string;
  speaker1_id?: string;
  speaker2_id?: string;
  notes?: string;
  is_cancelled?: boolean;
}

export interface UpdateOnlineSessionPayload {
  date?: string;
  main_chairman_id?: string | null;
  sub_chairman_id?: string | null;
  speaker1_id?: string | null;
  speaker2_id?: string | null;
  notes?: string | null;
  is_cancelled?: boolean;
}
