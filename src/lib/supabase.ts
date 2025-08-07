import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для TypeScript
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  league: string;
  stage: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score?: number | null;
  away_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMatchData {
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  league?: string;
  stage?: string;
  status?: 'upcoming' | 'live' | 'finished';
  home_score?: number | null;
  away_score?: number | null;
}

export interface UpdateMatchData extends Partial<CreateMatchData> {
  id: string;
}