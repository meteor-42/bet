/*
  # Исправляем конфликт имен в функции recalculate_match_bets

  Проблема: column reference "points_earned" is ambiguous
  Причина: переменная points_earned конфликтует с колонкой points_earned в таблице bets

  Решение: переименовываем переменную и явно указываем имена таблиц/колонок
*/

-- Пересоздаем функцию с исправленными именами переменных
CREATE OR REPLACE FUNCTION recalculate_match_bets(match_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  match_record record;
  bet_record record;
  calculated_points integer;
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
    calculated_points := calculate_bet_points(
      bet_record.predicted_home_score,
      bet_record.predicted_away_score,
      match_record.home_score,
      match_record.away_score
    );

    -- Обновляем ставку
    UPDATE bets
    SET
      points_earned = calculated_points,
      is_calculated = true
    WHERE id = bet_record.id;

    -- Обновляем статистику игрока
    UPDATE players
    SET
      points = players.points + calculated_points,
      total_predictions = players.total_predictions + 1,
      correct_predictions = players.correct_predictions + CASE WHEN calculated_points > 0 THEN 1 ELSE 0 END
    WHERE id = bet_record.player_id;
  END LOOP;

  -- Пересчитываем рейтинги после обновления очков
  PERFORM recalculate_rankings();
END;
$$;
