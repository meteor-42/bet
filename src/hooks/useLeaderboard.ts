import { useState, useEffect } from 'react';
import { supabase, type Player, type PlayerStats, type LeaderboardEntry, type CreatePlayerData, type UpdatePlayerStatsData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка лидерборда
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_stats')
        .select(`
          *,
          player:players(*)
        `)
        .order('rank_position', { ascending: true });

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = (data || []).map(item => ({
        player: item.player,
        stats: {
          id: item.id,
          player_id: item.player_id,
          points: item.points,
          correct_predictions: item.correct_predictions,
          total_predictions: item.total_predictions,
          current_streak: item.current_streak,
          best_streak: item.best_streak,
          rank_position: item.rank_position,
          updated_at: item.updated_at
        },
        accuracy: item.total_predictions > 0 ? Math.round((item.correct_predictions / item.total_predictions) * 100) : 0
      }));

      setLeaderboard(formattedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки лидерборда';
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

  // Создание нового игрока
  const createPlayer = async (playerData: CreatePlayerData): Promise<Player | null> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;

      // Создаем начальную статистику для игрока
      await supabase
        .from('player_stats')
        .insert([{
          player_id: data.id,
          points: 0,
          correct_predictions: 0,
          total_predictions: 0,
          current_streak: 0,
          best_streak: 0,
          rank_position: 0
        }]);

      toast({
        title: "Игрок создан",
        description: `Игрок ${playerData.name} успешно добавлен`
      });

      await fetchLeaderboard();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания игрока';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  // Обновление статистики игрока
  const updatePlayerStats = async (statsData: UpdatePlayerStatsData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('player_stats')
        .update(statsData)
        .eq('player_id', statsData.player_id);

      if (error) throw error;

      // Пересчитываем рейтинг
      await supabase.rpc('recalculate_rankings');

      toast({
        title: "Статистика обновлена",
        description: "Данные игрока успешно обновлены"
      });

      await fetchLeaderboard();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления статистики';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Удаление игрока
  const deletePlayer = async (playerId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      // Пересчитываем рейтинг после удаления
      await supabase.rpc('recalculate_rankings');

      toast({
        title: "Игрок удален",
        description: "Игрок был удален из системы"
      });

      await fetchLeaderboard();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления игрока';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Получение статистики конкретного игрока
  const getPlayerStats = async (playerId: string): Promise<LeaderboardEntry | null> => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select(`
          *,
          player:players(*)
        `)
        .eq('player_id', playerId)
        .single();

      if (error) throw error;

      return {
        player: data.player,
        stats: {
          id: data.id,
          player_id: data.player_id,
          points: data.points,
          correct_predictions: data.correct_predictions,
          total_predictions: data.total_predictions,
          current_streak: data.current_streak,
          best_streak: data.best_streak,
          rank_position: data.rank_position,
          updated_at: data.updated_at
        },
        accuracy: data.total_predictions > 0 ? Math.round((data.correct_predictions / data.total_predictions) * 100) : 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения статистики игрока';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    error,
    createPlayer,
    updatePlayerStats,
    deletePlayer,
    getPlayerStats,
    refetch: fetchLeaderboard
  };
};