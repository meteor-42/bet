/*
  # Создание таблицы ставок и системы пересчета очков

  1. Новая таблица `bets`
    - `id` (uuid, primary key)
    - `player_id` (uuid, foreign key to players)
    - `match_id` (uuid, foreign key to matches)
    - `predicted_home_score` (integer, прогноз голов хозяев)
    - `predicted_away_score` (integer, прогноз голов гостей)
    - `points_earned` (integer, заработанные очки, nullable)
    - `is_calculated` (boolean, рассчитаны ли очки)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

  2. Ограничения
    - Уникальная ставка на матч для каждого игрока
    - Нельзя ставить на завершенные матчи

  3. Функции пересчета
    - Функция расчета очков за ставку
    - Функция пересчета всех ставок по матчу
    - Триггер на обновление счета матча

  4. Политики безопасности
    - Игроки могут создавать/изменять только свои ставки
    - Все могут читать ставки
*/

-- Создание таблицы ставок
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

  -- Уникальная ставка на матч для каждого игрока
  UNIQUE(player_id, match_id)
);

-- Включение RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Все могут читать ставки"
  ON bets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Игроки могут создавать свои ставки"
  ON bets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Игроки могут обновлять свои ставки"
  ON bets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Игроки могут удалять свои ставки"
  ON bets
  FOR DELETE
  TO public
  USING (true);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_bets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bets_updated_at
  BEFORE UPDATE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_bets_updated_at();

-- Функция расчета очков за ставку
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
  -- Если точный счет
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 3;
  END IF;

  -- Если угадал исход (победа/ничья/поражение)
  IF (predicted_home > predicted_away AND actual_home > actual_away) OR
     (predicted_home < predicted_away AND actual_home < actual_away) OR
     (predicted_home = predicted_away AND actual_home = actual_away) THEN
    RETURN 1;
  END IF;

  -- Иначе 0 очков
  RETURN 0;
END;
$$;

-- Функция пересчета всех ставок по матчу
CREATE OR REPLACE FUNCTION recalculate_match_bets(match_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  match_record record;
  bet_record record;
  points_earned integer;
BEGIN
  -- Получаем информацию о матче
  SELECT home_score, away_score, status INTO match_record
  FROM matches
  WHERE id = match_uuid;

  -- Проверяем, что матч завершен и есть счет
  IF match_record.status != 'finished' OR
     match_record.home_score IS NULL OR
     match_record.away_score IS NULL THEN
    RETURN;
  END IF;

  -- Пересчитываем очки для всех ставок на этот матч
  FOR bet_record IN
    SELECT id, player_id, predicted_home_score, predicted_away_score
    FROM bets
    WHERE match_id = match_uuid
  LOOP
    -- Рассчитываем очки
    points_earned := calculate_bet_points(
      bet_record.predicted_home_score,
      bet_record.predicted_away_score,
      match_record.home_score,
      match_record.away_score
    );

    -- Обновляем ставку
    UPDATE bets
    SET
      points_earned = points_earned,
      is_calculated = true
    WHERE id = bet_record.id;

    -- Обновляем статистику игрока
    UPDATE players
    SET
      points = points + points_earned,
      total_predictions = total_predictions + 1,
      correct_predictions = correct_predictions + CASE WHEN points_earned > 0 THEN 1 ELSE 0 END
    WHERE id = bet_record.player_id;
  END LOOP;

  -- Пересчитываем рейтинги после обновления очков
  PERFORM recalculate_rankings();
END;
$$;

-- Триггер на обновление счета матча
CREATE OR REPLACE FUNCTION trigger_recalculate_bets()
RETURNS TRIGGER AS $$
BEGIN
  -- Если изменился статус на 'finished' или обновился счет
  IF (NEW.status = 'finished' AND OLD.status != 'finished') OR
     (NEW.home_score IS DISTINCT FROM OLD.home_score) OR
     (NEW.away_score IS DISTINCT FROM OLD.away_score) THEN

    -- Запускаем пересчет ставок для этого матча
    PERFORM recalculate_match_bets(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_score_update_trigger
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_bets();

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_bets_player_id ON bets(player_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_is_calculated ON bets(is_calculated);

-- Функция для создания или обновления ставки
CREATE OR REPLACE FUNCTION upsert_bet(
  p_player_id uuid,
  p_match_id uuid,
  p_predicted_home integer,
  p_predicted_away integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  bet_id uuid;
  match_status text;
BEGIN
  -- Проверяем статус матча
  SELECT status INTO match_status
  FROM matches
  WHERE id = p_match_id;

  -- Нельзя ставить на завершенные или текущие матчи
  IF match_status != 'upcoming' THEN
    RAISE EXCEPTION 'Нельзя делать ставки на матчи со статусом %', match_status;
  END IF;

  -- Создаем или обновляем ставку
  INSERT INTO bets (player_id, match_id, predicted_home_score, predicted_away_score)
  VALUES (p_player_id, p_match_id, p_predicted_home, p_predicted_away)
  ON CONFLICT (player_id, match_id)
  DO UPDATE SET
    predicted_home_score = EXCLUDED.predicted_home_score,
    predicted_away_score = EXCLUDED.predicted_away_score,
    points_earned = NULL,
    is_calculated = false,
    updated_at = now()
  RETURNING id INTO bet_id;

  RETURN bet_id;
END;
$$;
