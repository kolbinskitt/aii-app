import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

type User = any; // możesz później podmienić na typ z Supabase

type UserContextValue = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      console.log('📦 getSession data', data);
      console.log('❌ getSession error', error);
    });

    // 1️⃣ Odczyt sesji lokalnej (z localStorage)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 2️⃣ Listener zmian auth (login / logout / refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🔒 Blokada renderu TYLKO do momentu inicjalizacji
  if (loading) {
    return <div>...</div>; // albo <Spinner />
  }

  console.log('2!!!', { user, loading });

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within <UserProvider>');
  }
  return ctx;
}
