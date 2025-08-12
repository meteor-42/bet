import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PlayerStats {
  points: number;
  correct_predictions: number;
  total_predictions: number;
  rank_position: number;
  accuracy: number;
  created_at: string;
}

export const usePlayerStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('players')
        .select('points, correct_predictions, total_predictions, rank_position, created_at')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        const accuracy = data.total_predictions > 0
          ? Math.round((data.correct_predictions / data.total_predictions) * 100)
          : 0;

        setStats({
          points: data.points,
          correct_predictions: data.correct_predictions,
          total_predictions: data.total_predictions,
          rank_position: data.rank_position,
          accuracy,
          created_at: data.created_at
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
      setError(errorMessage);
      console.error('Ошибка при загрузке статистики:', err);

      // Не показываем toast при каждой ошибке, только в консоль
    } finally {
      setLoading(false);
    }
  };

  // Обновляем статистику при смене пользователя
  useEffect(() => {
    fetchPlayerStats();
  }, [user?.id]);

  // Создаем функцию для принудительного обновления
  const refreshStats = () => {
    fetchPlayerStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
