import { useState, useEffect } from 'react';
import { supabase, type Player, type LeaderboardEntry, type CreatePlayerData, type UpdatePlayerData } from '@/lib/supabase';
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
        .from('players')
        .select('*')
        .order('rank_position', { ascending: true });

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = (data || []).map(player => ({
        player,
        accuracy: player.total_predictions > 0 ? Math.round((player.correct_predictions / player.total_predictions) * 100) : 0
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
      // Создаем игрока с полными данными включая статистику
      const newPlayer = {
        name: playerData.name,
        email: playerData.email || null,
        password: playerData.password,
        points: playerData.points || 0,
        correct_predictions: playerData.correct_predictions || 0,
        total_predictions: playerData.total_predictions || 0,
        rank_position: playerData.rank_position || 0
      };

      const { data, error } = await supabase
        .from('players')
        .insert([newPlayer])
        .select()
        .single();

      if (error) throw error;

      // Пересчитываем рейтинг после создания
      await supabase.rpc('recalculate_rankings');

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

  // Обновление данных игрока (все поля)
  const updatePlayer = async (playerData: UpdatePlayerData): Promise<boolean> => {
    try {
      const { id, ...updateData } = playerData;

      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Пересчитываем рейтинг если обновлялись очки или статистика
      if ('points' in updateData || 'correct_predictions' in updateData) {
        await supabase.rpc('recalculate_rankings');
      }

      toast({
        title: "Игрок обновлен",
        description: "Данные игрока успешно обновлены"
      });

      await fetchLeaderboard();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления игрока';
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

  // Получение данных конкретного игрока
  const getPlayer = async (playerId: string): Promise<LeaderboardEntry | null> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;

      return {
        player: data,
        accuracy: data.total_predictions > 0 ? Math.round((data.correct_predictions / data.total_predictions) * 100) : 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка получения данных игрока';
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
    updatePlayer,
    deletePlayer,
    getPlayer,
    refetch: fetchLeaderboard
  };
};
