import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Aiik } from '@/types';

type CachedAiiki = {
  [id: string]: Aiik;
};

let cachedAiikiMap: CachedAiiki | null = null;
let cachedAiikiList: Aiik[] | null = null;

export function useAiiki() {
  const [aiiki, setAiiki] = useState<Aiik[]>(cachedAiikiList ?? []);
  const [loading, setLoading] = useState(!cachedAiikiList);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (cachedAiikiList && cachedAiikiMap) {
      return; // already cached
    }

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('aiiki_with_conzon')
        .select('*');

      if (error || !data) {
        console.error('❌ Błąd przy pobieraniu aiików:', error);
        setError('Błąd pobierania Aiików');
        setLoading(false);
        return;
      }

      const map: CachedAiiki = {};
      for (const a of data) {
        map[a.id] = a;
      }

      cachedAiikiMap = map;
      cachedAiikiList = data;
      setAiiki(data);
      setLoading(false);
    };

    fetch();
  }, []);

  function getAiikById(id: string): Aiik | undefined {
    return cachedAiikiMap?.[id];
  }

  return {
    aiiki,
    getAiikById,
    loading,
    error,
  };
}
