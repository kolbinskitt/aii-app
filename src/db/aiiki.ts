import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useUser from '../hooks/useUser';
import { Aiik } from '../types';

export default function useUserAiiki(): Aiik[] {
  const { user } = useUser();
  const [aiiki, setAiiki] = useState<Aiik[]>([]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('aiiki')
      .select('*')
      .eq('user_id', user.id.toString()) // ✅ tylko aiiki danego usera
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setAiiki(data);
      });
  }, [user]);

  return aiiki;
}
