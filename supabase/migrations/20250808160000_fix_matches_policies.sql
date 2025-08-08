/*
  # Исправляем политики доступа для таблицы matches

  Проблема: операции с матчами были доступны только для authenticated пользователей,
  но приложение использует анонимный доступ.

  Решение: разрешаем операции всем пользователям (TO public)
*/

-- Удаляем старые политики
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON matches;

-- Создаем новые политики для всех пользователей
CREATE POLICY "Anyone can insert matches"
  ON matches
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update matches"
  ON matches
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete matches"
  ON matches
  FOR DELETE
  TO public
  USING (true);
