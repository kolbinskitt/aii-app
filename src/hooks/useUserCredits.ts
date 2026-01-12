// src/hooks/useUserCredits.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useUser from './useUser';

export default function useUserCredits() {
  const { user, loading } = useUser();
  const [credits, setCredits] = useState<number | null>(user?.credits ?? null);

  useEffect(() => {
    if (!user) return;

    setCredits(user.credits ?? 0);

    const channel = supabase
      .channel(`user-credits-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        payload => {
          const newCredits = payload.new.credits;
          setCredits(newCredits);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { credits, loading };
}
