import { useState, useEffect, useCallback } from 'react';
import { supabase, type BetWithMatch } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface BetWithMatchAndPlayer extends BetWithMatch {
  player: {
    id: string;
    name: string;
    email?: string | null;
  };
}

export const useAllBets = (playerId?: string) => {
  const [allBets, setAllBets] = useState<BetWithMatchAndPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка всех ставок или ставок конкретного игрока
  const fetchAllBets = useCallback(async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('bets')
        .select(`
          *,
          match:matches(*),
          player:players(id, name, email)
        `)
        .order('created_at', { ascending: false });

      // Если указан playerId, фильтруем по нему
      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAllBets(data || []);
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
    fetchAllBets();
  }, [fetchAllBets]);

  return {
    allBets,
    isLoading,
    error,
    refetch: fetchAllBets
  };
};
