import { useState, useEffect, useCallback } from 'react';
import { supabase, type BetWithMatch } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useBets = (playerId?: string) => {
  const [bets, setBets] = useState<BetWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка ставок пользователя
  const fetchBets = useCallback(async () => {
    if (!playerId) {
      setBets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          match:matches(*)
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки ставок';
      setError(errorMessage);
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [playerId, toast]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  return {
    bets,
    isLoading,
    error,
    refetch: fetchBets
  };
};
