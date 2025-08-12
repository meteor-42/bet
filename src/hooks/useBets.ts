import { useState, useEffect, useCallback } from 'react';
import { supabase, type BetWithMatch, type CreateBetData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { parseMatchDateTime } from '@/lib/utils';

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

  // Получить ставку для конкретного матча
  const getBetForMatch = useCallback((matchId: string) => {
    return bets.find(bet => bet.match_id === matchId);
  }, [bets]);

  // Проверить, есть ли ставка на матч
  const hasBetForMatch = useCallback((matchId: string) => {
    return bets.some(bet => bet.match_id === matchId);
  }, [bets]);

  // Создать или обновить ставку
  const upsertBet = useCallback(async (betData: Omit<CreateBetData, 'player_id'>) => {
    if (!playerId) return false;

    try {
      const existingBet = getBetForMatch(betData.match_id);

      // Optional: prevent betting after match start if match is known in bets cache
      const match = bets.find(b => b.match_id === betData.match_id)?.match;
      if (match) {
        const dt = parseMatchDateTime(match.match_date, match.match_time);
        if (dt && Date.now() >= dt.getTime()) {
          throw new Error('Нельзя сохранить ставку: матч уже начался');
        }
      }

      if (existingBet) {
        // Обновляем существующую ставку
        const { error } = await supabase
          .from('bets')
          .update({
            predicted_home_score: betData.predicted_home_score,
            predicted_away_score: betData.predicted_away_score,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBet.id);

        if (error) throw error;

        toast({
          title: "Ставка обновлена",
          description: "Ваш прогноз успешно обновлен"
        });
      } else {
        // Создаем новую ставку
        const { error } = await supabase
          .from('bets')
          .insert([{
            ...betData,
            player_id: playerId
          }]);

        if (error) throw error;

        toast({
          title: "Ставка сохранена",
          description: "Ваш прогноз успешно сохранен"
        });
      }

      await fetchBets(); // Перезагружаем ставки
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка сохранения ставки';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  }, [playerId, getBetForMatch, fetchBets, toast, bets]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  return {
    bets,
    isLoading,
    error,
    refetch: fetchBets,
    getBetForMatch,
    hasBetForMatch,
    upsertBet
  };
};
