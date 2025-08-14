import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useBetsCount = () => {
  const [betsCount, setBetsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBetsCount = async () => {
    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setBetsCount(count || 0);
    } catch (err) {
      console.error('Error fetching bets count:', err);
      setBetsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBetsCount();
  }, []);

  return { betsCount, loading };
};
