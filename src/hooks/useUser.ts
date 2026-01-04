import { useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const res = await fetch('http://localhost:1234/auth/ensure-user', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          const err = await res.text(); // <- dostaniesz np. błąd SQL z backendu
          throw new Error(`Błąd odpowiedzi z /auth/ensure-user: ${err}`);
        }

        const user: User = await res.json();
        setUser(user);
      } catch (err) {
        console.error('Błąd pobierania lub tworzenia usera:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading };
}
