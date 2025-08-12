/*
  # Initial Database Setup (ISO formats)
  - Creates matches, players, bets
  - Uses ISO formats for match_date (YYYY-MM-DD) and match_time (HH:MM[:SS]) with CHECK constraints
  - Adds minimal RLS policies
  - Adds helper functions and triggers for updated_at and ranking/points
*/

-- =============================================
-- TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date text NOT NULL,
  match_time text NOT NULL,
  league text DEFAULT '',
  tour integer DEFAULT 1,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  home_score integer DEFAULT NULL,
  away_score integer DEFAULT NULL,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT matches_match_date_format_check CHECK (match_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  CONSTRAINT matches_match_time_format_check CHECK (match_time ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$')
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  email text,
  password text NOT NULL DEFAULT 'password123',
  role text DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  points integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  total_predictions integer DEFAULT 0,
  rank_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score integer NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score integer NOT NULL CHECK (predicted_away_score >= 0),
  points_earned integer DEFAULT NULL,
  is_calculated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, match_id)
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view matches" ON matches FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert matches" ON matches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON matches FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete matches" ON matches FOR DELETE TO public USING (true);

CREATE POLICY "Public read players" ON players FOR SELECT TO public USING (true);
CREATE POLICY "Public insert players" ON players FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update players" ON players FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public delete players" ON players FOR DELETE TO public USING (true);

CREATE POLICY "Public read bets" ON bets FOR SELECT TO public USING (true);
CREATE POLICY "Players insert bets" ON bets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Players update bets" ON bets FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Players delete bets" ON bets FOR DELETE TO public USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ranking and points
CREATE OR REPLACE FUNCTION recalculate_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  WITH ranked_players AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY points DESC, correct_predictions DESC, updated_at ASC) as new_rank
    FROM players
  )
  UPDATE players
  SET rank_position = ranked_players.new_rank
  FROM ranked_players
  WHERE players.id = ranked_players.id;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_bet_points(
  predicted_home integer,
  predicted_away integer,
  actual_home integer,
  actual_away integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 3;
  END IF;
  IF (predicted_home > predicted_away AND actual_home > actual_away) OR
     (predicted_home < predicted_away AND actual_home < actual_away) OR
     (predicted_home = predicted_away AND actual_home = actual_away) THEN
    RETURN 1;
  END IF;
  RETURN 0;
END;
$$;

CREATE OR REPLACE FUNCTION recalculate_match_bets(match_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  match_record record;
  bet_record record;
  calculated_points integer;
BEGIN
  SELECT home_score, away_score, status INTO match_record
  FROM matches WHERE id = match_uuid;

  IF match_record.status != 'finished' OR match_record.home_score IS NULL OR match_record.away_score IS NULL THEN
    RETURN;
  END IF;

  FOR bet_record IN
    SELECT id, player_id, predicted_home_score, predicted_away_score FROM bets WHERE match_id = match_uuid
  LOOP
    calculated_points := calculate_bet_points(
      bet_record.predicted_home_score,
      bet_record.predicted_away_score,
      match_record.home_score,
      match_record.away_score
    );

    UPDATE bets
    SET points_earned = calculated_points,
        is_calculated = true
    WHERE id = bet_record.id;

    UPDATE players
    SET points = players.points + calculated_points,
        total_predictions = players.total_predictions + 1,
        correct_predictions = players.correct_predictions + CASE WHEN calculated_points > 0 THEN 1 ELSE 0 END
    WHERE id = bet_record.player_id;
  END LOOP;

  PERFORM recalculate_rankings();
END;
$$;

CREATE OR REPLACE FUNCTION trigger_recalculate_bets()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'finished' AND OLD.status != 'finished') OR
     (NEW.home_score IS DISTINCT FROM OLD.home_score) OR
     (NEW.away_score IS DISTINCT FROM OLD.away_score) THEN
    PERFORM recalculate_match_bets(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_score_update_trigger
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_bets();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_is_visible ON matches(is_visible);
CREATE INDEX IF NOT EXISTS idx_players_points ON players(points DESC);
CREATE INDEX IF NOT EXISTS idx_players_rank ON players(rank_position ASC);
CREATE INDEX IF NOT EXISTS idx_bets_player_id ON bets(player_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_is_calculated ON bets(is_calculated);
