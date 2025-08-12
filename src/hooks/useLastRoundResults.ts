import { useState, useEffect } from 'react';
import { supabase, type Match } from '@/lib/supabase';

export const useLastRoundResults = () => {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLastRoundResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'finished')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .order('match_date', { ascending: false })
        .limit(10); // Последние 10 завершенных матчей

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки результатов';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLastRoundResults();

    // Обновляем результаты каждые 30 секунд
    const interval = setInterval(fetchLastRoundResults, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    results,
    loading,
    error,
    refetch: fetchLastRoundResults
  };
};
