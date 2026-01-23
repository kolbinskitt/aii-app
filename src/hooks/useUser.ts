import { useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

let userPromise: Promise<User | null> | null = null; // 🔁 singleton
let cachedUser: User | null = null;

async function ensureUserOnce(): Promise<User | null> {
  if (cachedUser) return cachedUser;
  if (userPromise) return userPromise;

  userPromise = (async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const res = await api('auth/ensure-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Błąd odpowiedzi z /auth/ensure-user: ${err}`);
    }

    const user: User = await res.json();
    cachedUser = user; // 💾 zapisujemy do pamięci
    return user;
  })();

  return userPromise;
}

export default function useUser() {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    if (!cachedUser) {
      ensureUserOnce()
        .then(setUser)
        .catch(err => {
          console.error('❌ ensureUserOnce error:', err);
          setUser(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // 🧩 SUBSKRYPCJA na `users` (update tylko własnego usera)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        payload => {
          const updated = payload.new as User;
          setUser(updated);
          cachedUser = updated; // aktualizuj cache
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { user, loading };
}
