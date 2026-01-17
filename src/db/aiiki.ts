import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Aiik } from '@/types';

export default function useGlobalAiiki(): Aiik[] {
  const [aiiki, setAiiki] = useState<Aiik[]>([]);

  useEffect(() => {
    supabase
      .from('aiiki')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setAiiki(data);
      });
  }, []);

  return aiiki;
}
