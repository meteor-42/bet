/*
  # Merge players and player_stats tables

  1. Changes
    - Backup existing data from both tables
    - Drop player_stats table
    - Add statistics columns to players table
    - Migrate data back to the unified players table
    - Update functions and policies

  2. New players table structure
    - id (uuid, primary key)
    - name (text, unique, required)
    - email (text, optional)
    - password (text, required)
    - points (integer, default 0)
    - correct_predictions (integer, default 0)
    - total_predictions (integer, default 0)
    - rank_position (integer, default 0)
    - created_at (timestamp)
    - updated_at (timestamp)
*/

-- Create temporary backup of existing data
CREATE TEMP TABLE temp_players_backup AS
SELECT
  p.id,
  p.name,
  p.email,
  p.password,
  p.created_at,
  p.updated_at,
  COALESCE(ps.points, 0) as points,
  COALESCE(ps.correct_predictions, 0) as correct_predictions,
  COALESCE(ps.total_predictions, 0) as total_predictions,
  COALESCE(ps.rank_position, 0) as rank_position
FROM players p
LEFT JOIN player_stats ps ON p.id = ps.player_id;

-- Drop the player_stats table and its policies
DROP POLICY IF EXISTS "Публичное чтение статистики" ON player_stats;
DROP POLICY IF EXISTS "Публичное создание статистики" ON player_stats;
DROP POLICY IF EXISTS "Публичное обновление статистики" ON player_stats;
DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
DROP FUNCTION IF EXISTS update_player_stats_updated_at();
DROP INDEX IF EXISTS idx_player_stats_points;
DROP INDEX IF EXISTS idx_player_stats_rank;
DROP INDEX IF EXISTS idx_player_stats_player_id;
DROP TABLE IF EXISTS player_stats;

-- Add statistics columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_predictions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_predictions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_position integer DEFAULT 0;

-- Clear existing players data to avoid conflicts
DELETE FROM players;

-- Restore data from backup
INSERT INTO players (id, name, email, password, points, correct_predictions, total_predictions, rank_position, created_at, updated_at)
SELECT
  id, name, email, password, points, correct_predictions, total_predictions, rank_position, created_at, updated_at
FROM temp_players_backup;

-- Update the ranking calculation function to work with unified table
CREATE OR REPLACE FUNCTION recalculate_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update rank positions based on points (descending), then correct predictions (descending)
  WITH ranked_players AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY points DESC, correct_predictions DESC, updated_at ASC
      ) as new_rank
    FROM players
  )
  UPDATE players
  SET rank_position = ranked_players.new_rank
  FROM ranked_players
  WHERE players.id = ranked_players.id;
END;
$$;

-- Create indexes for optimization
CREATE INDEX IF NOT EXISTS idx_players_points ON players(points DESC);
CREATE INDEX IF NOT EXISTS idx_players_rank ON players(rank_position ASC);

-- Recalculate rankings
SELECT recalculate_rankings();

-- Drop temporary backup table
DROP TABLE temp_players_backup;
