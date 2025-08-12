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
  tour: number;
  status: 'upcoming' | 'live' | 'finished';
  home_score?: number | null;
  away_score?: number | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMatchData {
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  league?: string;
  tour?: number;
  status?: 'upcoming' | 'live' | 'finished';
  home_score?: number | null;
  away_score?: number | null;
  is_visible?: boolean;
}

export interface UpdateMatchData extends Partial<CreateMatchData> {
  id: string;
}

// Типы для игроков и лидерборда (объединенная таблица)
export interface Player {
  id: string;
  name: string;
  email?: string | null;
  password: string;
  role: 'admin' | 'player';
  points: number;
  correct_predictions: number;
  total_predictions: number;
  rank_position: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  player: Player;
  accuracy: number;
}

export interface CreatePlayerData {
  name: string;
  email?: string;
  password: string;
  role?: 'admin' | 'player';
  points?: number;
  correct_predictions?: number;
  total_predictions?: number;
  rank_position?: number;
}

export interface UpdatePlayerData {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'player';
  points?: number;
  correct_predictions?: number;
  total_predictions?: number;
}

// Типы для аутентификации
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  role: 'admin' | 'player';
  points: number;
  correct_predictions: number;
  total_predictions: number;
  rank_position: number;
}

// Типы для ставок
export interface Bet {
  id: string;
  player_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned?: number | null;
  is_calculated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBetData {
  player_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface BetWithMatch extends Bet {
  match: Match;
}

export interface BetWithPlayer extends Bet {
  player: Player;
}
