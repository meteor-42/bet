-- Seed initial users: admin and user
-- Adjust emails/passwords as needed

INSERT INTO players (name, email, password, role, points, correct_predictions, total_predictions, rank_position)
VALUES
  ('admin', 'admin@example.com', 'admin123', 'admin', 0, 0, 0, 0)
ON CONFLICT (name) DO UPDATE SET role = 'admin', email = EXCLUDED.email;

INSERT INTO players (name, email, password, role, points, correct_predictions, total_predictions, rank_position)
VALUES
  ('user', 'user@example.com', 'user123', 'player', 0, 0, 0, 0)
ON CONFLICT (name) DO UPDATE SET role = 'player', email = EXCLUDED.email;
