/*
  # Добавляем поле видимости матчей на слайдере
  
  Добавляем колонку is_visible для управления отображением матчей
  на главной странице через админку.
*/

-- Добавляем колонку видимости
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_matches_is_visible ON matches(is_visible);

-- Обновляем существующие матчи - делаем их видимыми по умолчанию
UPDATE matches SET is_visible = true WHERE is_visible IS NULL;
