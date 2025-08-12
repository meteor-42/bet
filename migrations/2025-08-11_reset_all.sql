-- DANGER: Drops all app tables and related objects in public schema
-- Run only if you want a clean reset

-- Drop triggers first (if exist)
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
DROP TRIGGER IF EXISTS update_bets_updated_at ON bets;
DROP TRIGGER IF EXISTS match_score_update_trigger ON matches;

-- Drop functions if exist
DROP FUNCTION IF EXISTS trigger_recalculate_bets() CASCADE;
DROP FUNCTION IF EXISTS recalculate_match_bets(uuid) CASCADE;
DROP FUNCTION IF EXISTS calculate_bet_points(integer, integer, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS recalculate_rankings() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (cascade to constraints, indexes, policies)
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
