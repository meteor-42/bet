/*
  # Создание таблицы матчей для системы прогнозов

  1. Новые таблицы
    - `matches`
      - `id` (uuid, primary key)
      - `home_team` (text, название домашней команды)
      - `away_team` (text, название гостевой команды)
      - `match_date` (text, дата матча)
      - `match_time` (text, время матча)
      - `league` (text, лига/турнир)
      - `stage` (text, этап турнира)
      - `status` (text, статус матча: upcoming, live, finished)
      - `home_score` (integer, голы домашней команды, nullable)
      - `away_score` (integer, голы гостевой команды, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Безопасность
    - Включить RLS для таблицы `matches`
    - Добавить политики для чтения всем пользователям
    - Добавить политики для записи только аутентифицированным пользователям
*/

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date text NOT NULL,
  match_time text NOT NULL,
  league text DEFAULT '',
  stage text DEFAULT '',
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  home_score integer DEFAULT NULL,
  away_score integer DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Политика для чтения - все пользователи могут читать матчи
CREATE POLICY "Matches are viewable by everyone"
  ON matches
  FOR SELECT
  USING (true);

-- Политика для вставки - только аутентифицированные пользователи
CREATE POLICY "Authenticated users can insert matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Политика для обновления - только аутентифицированные пользователи
CREATE POLICY "Authenticated users can update matches"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Политика для удаления - только аутентифицированные пользователи
CREATE POLICY "Authenticated users can delete matches"
  ON matches
  FOR DELETE
  TO authenticated
  USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();