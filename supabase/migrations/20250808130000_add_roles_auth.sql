/*
  # Add authentication and role system

  1. Changes to players table
    - Add role column (admin/player)
    - Set default admin user

  2. Authentication support
    - Update existing test data with roles
    - Create default admin account
*/

-- Add role column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS role text DEFAULT 'player' CHECK (role IN ('admin', 'player'));

-- Update existing players to have player role by default
UPDATE players SET role = 'player' WHERE role IS NULL;

-- Create or update admin user
INSERT INTO players (name, email, password, role, points, correct_predictions, total_predictions, rank_position)
VALUES ('admin', 'admin@rpl.com', 'admin123', 'admin', 0, 0, 0, 0)
ON CONFLICT (name) DO UPDATE SET
  role = 'admin',
  email = 'admin@rpl.com';

-- Recalculate rankings after adding admin
SELECT recalculate_rankings();
