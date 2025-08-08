/*
  # Update players schema

  1. Changes to players table
    - Remove `avatar_url` column
    - Add `password` column (required)

  2. Changes to player_stats table  
    - Remove `current_streak` column
    - Remove `best_streak` column

  3. Update function
    - Update ranking calculation function to remove streak handling
    - Sort only by points and correct predictions

  4. Update test data
    - Remove avatar_url and streak data
    - Add passwords for existing players
*/

-- Remove avatar_url from players table
ALTER TABLE players DROP COLUMN IF EXISTS avatar_url;

-- Add password column to players table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'password'
  ) THEN
    ALTER TABLE players ADD COLUMN password text NOT NULL DEFAULT 'password123';
  END IF;
END $$;

-- Remove streak columns from player_stats table
ALTER TABLE player_stats DROP COLUMN IF EXISTS current_streak;
ALTER TABLE player_stats DROP COLUMN IF EXISTS best_streak;

-- Update the ranking calculation function
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
    FROM player_stats
  )
  UPDATE player_stats 
  SET rank_position = ranked_players.new_rank
  FROM ranked_players 
  WHERE player_stats.id = ranked_players.id;
END;
$$;

-- Update existing test data to remove streaks and add passwords
UPDATE players SET password = 'password123' WHERE password IS NULL OR password = '';

-- Recalculate rankings after removing streak columns
SELECT recalculate_rankings();