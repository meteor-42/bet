import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePlayersCount = () => {
  const [playersCount, setPlayersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchPlayersCount = async () => {
    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setPlayersCount(count || 0);
    } catch (err) {
      console.error('Error fetching players count:', err);
      setPlayersCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersCount();
  }, []);

  return { playersCount, loading };
};
