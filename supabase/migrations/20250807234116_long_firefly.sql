/*
  # Создание таблицы лидеров

  1. Новые таблицы
    - `players`
      - `id` (uuid, primary key)
      - `name` (text, уникальное имя игрока)
      - `email` (text, опционально)
      - `avatar_url` (text, опционально)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `player_stats`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key to players)
      - `points` (integer, общие очки)
      - `correct_predictions` (integer, количество верных прогнозов)
      - `total_predictions` (integer, общее количество прогнозов)
      - `current_streak` (integer, текущая серия)
      - `best_streak` (integer, лучшая серия)
      - `rank_position` (integer, позиция в рейтинге)
      - `updated_at` (timestamp)

  2. Безопасность
    - Включить RLS для обеих таблиц
    - Политики для публичного чтения
    - Политики для обновления статистики

  3. Индексы
    - Индекс по очкам для быстрой сортировки
    - Индекс по позиции в рейтинге
*/

-- Создание таблицы игроков
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы статистики игроков
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  total_predictions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  rank_position integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id)
);

-- Включение RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы игроков
CREATE POLICY "Публичное чтение игроков"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Публичное создание игроков"
  ON players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Публичное обновление игроков"
  ON players
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Политики для статистики игроков
CREATE POLICY "Публичное чтение статистики"
  ON player_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Публичное создание статистики"
  ON player_stats
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Публичное обновление статистики"
  ON player_stats
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Триггер для обновления updated_at в таблице игроков
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();

-- Триггер для обновления updated_at в статистике
CREATE OR REPLACE FUNCTION update_player_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats_updated_at();

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_player_stats_points ON player_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_rank ON player_stats(rank_position ASC);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);

-- Функция для пересчета рейтинга
CREATE OR REPLACE FUNCTION recalculate_rankings()
RETURNS void AS $$
BEGIN
  WITH ranked_players AS (
    SELECT 
      player_id,
      ROW_NUMBER() OVER (ORDER BY points DESC, correct_predictions DESC, best_streak DESC) as new_rank
    FROM player_stats
    WHERE total_predictions > 0
  )
  UPDATE player_stats 
  SET rank_position = ranked_players.new_rank
  FROM ranked_players 
  WHERE player_stats.player_id = ranked_players.player_id;
END;
$$ LANGUAGE plpgsql;

-- Вставка тестовых данных
INSERT INTO players (name, email) VALUES 
  ('Alex Chen', 'alex.chen@example.com'),
  ('Maria Lopez', 'maria.lopez@example.com'),
  ('John Smith', 'john.smith@example.com'),
  ('Emma Wilson', 'emma.wilson@example.com'),
  ('David Brown', 'david.brown@example.com'),
  ('Sarah Johnson', 'sarah.johnson@example.com'),
  ('Michael Davis', 'michael.davis@example.com'),
  ('Lisa Anderson', 'lisa.anderson@example.com'),
  ('Robert Taylor', 'robert.taylor@example.com'),
  ('Jennifer White', 'jennifer.white@example.com')
ON CONFLICT (name) DO NOTHING;

-- Вставка статистики для тестовых игроков
INSERT INTO player_stats (player_id, points, correct_predictions, total_predictions, current_streak, best_streak)
SELECT 
  p.id,
  CASE 
    WHEN p.name = 'Alex Chen' THEN 2456
    WHEN p.name = 'Maria Lopez' THEN 2234
    WHEN p.name = 'John Smith' THEN 2156
    WHEN p.name = 'Emma Wilson' THEN 1998
    WHEN p.name = 'David Brown' THEN 1887
    WHEN p.name = 'Sarah Johnson' THEN 1756
    WHEN p.name = 'Michael Davis' THEN 1634
    WHEN p.name = 'Lisa Anderson' THEN 1523
    WHEN p.name = 'Robert Taylor' THEN 1412
    WHEN p.name = 'Jennifer White' THEN 1301
  END as points,
  CASE 
    WHEN p.name = 'Alex Chen' THEN 45
    WHEN p.name = 'Maria Lopez' THEN 42
    WHEN p.name = 'John Smith' THEN 40
    WHEN p.name = 'Emma Wilson' THEN 38
    WHEN p.name = 'David Brown' THEN 36
    WHEN p.name = 'Sarah Johnson' THEN 34
    WHEN p.name = 'Michael Davis' THEN 32
    WHEN p.name = 'Lisa Anderson' THEN 30
    WHEN p.name = 'Robert Taylor' THEN 28
    WHEN p.name = 'Jennifer White' THEN 26
  END as correct_predictions,
  CASE 
    WHEN p.name = 'Alex Chen' THEN 60
    WHEN p.name = 'Maria Lopez' THEN 58
    WHEN p.name = 'John Smith' THEN 56
    WHEN p.name = 'Emma Wilson' THEN 55
    WHEN p.name = 'David Brown' THEN 53
    WHEN p.name = 'Sarah Johnson' THEN 52
    WHEN p.name = 'Michael Davis' THEN 50
    WHEN p.name = 'Lisa Anderson' THEN 48
    WHEN p.name = 'Robert Taylor' THEN 46
    WHEN p.name = 'Jennifer White' THEN 44
  END as total_predictions,
  CASE 
    WHEN p.name = 'Alex Chen' THEN 8
    WHEN p.name = 'Maria Lopez' THEN 5
    WHEN p.name = 'John Smith' THEN 3
    WHEN p.name = 'Emma Wilson' THEN 7
    WHEN p.name = 'David Brown' THEN 2
    WHEN p.name = 'Sarah Johnson' THEN 4
    WHEN p.name = 'Michael Davis' THEN 6
    WHEN p.name = 'Lisa Anderson' THEN 1
    WHEN p.name = 'Robert Taylor' THEN 3
    WHEN p.name = 'Jennifer White' THEN 2
  END as current_streak,
  CASE 
    WHEN p.name = 'Alex Chen' THEN 12
    WHEN p.name = 'Maria Lopez' THEN 9
    WHEN p.name = 'John Smith' THEN 8
    WHEN p.name = 'Emma Wilson' THEN 11
    WHEN p.name = 'David Brown' THEN 7
    WHEN p.name = 'Sarah Johnson' THEN 10
    WHEN p.name = 'Michael Davis' THEN 8
    WHEN p.name = 'Lisa Anderson' THEN 6
    WHEN p.name = 'Robert Taylor' THEN 7
    WHEN p.name = 'Jennifer White' THEN 5
  END as best_streak
FROM players p
ON CONFLICT (player_id) DO NOTHING;

-- Пересчет рейтинга после вставки данных
SELECT recalculate_rankings();