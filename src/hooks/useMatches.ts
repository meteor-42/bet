import { useState, useEffect } from 'react';
import { supabase, type Match, type CreateMatchData, type UpdateMatchData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Загрузка матчей
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки матчей';
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

  // Создание матча
  const createMatch = async (matchData: CreateMatchData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert([matchData]);

      if (error) throw error;

      toast({
        title: "Матч создан",
        description: "Новый матч успешно добавлен"
      });

      await fetchMatches(); // Перезагружаем список
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания матча';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Обновление матча
  const updateMatch = async (matchData: UpdateMatchData): Promise<boolean> => {
    try {
      const { id, ...updateData } = matchData;
      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Матч обновлен",
        description: "Изменения успешно сохранены"
      });

      await fetchMatches(); // Перезагружаем список
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления матча';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Удаление матча
  const deleteMatch = async (matchId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Матч удален",
        description: "Матч был удален из системы"
      });

      await fetchMatches(); // Перезагружаем список
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления матча';
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    createMatch,
    updateMatch,
    deleteMatch,
    refetch: fetchMatches
  };
};
