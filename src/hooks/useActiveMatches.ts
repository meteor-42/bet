import { useState, useEffect } from 'react';
import { supabase, type Match } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useActiveMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка только видимых матчей для ставок
  const fetchActiveMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки активных матчей';
      setError(errorMessage);
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    refetch: fetchActiveMatches
  };
};
