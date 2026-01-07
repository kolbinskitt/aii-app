import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

type User = any;

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

    // ✅ Jeden jedyny getSession
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('📦 getSession data', data);
      console.log('❌ getSession error', error);
      console.log(1, { mounted });
      if (!mounted) return;

      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // 🔁 Listener login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(2, { mounted });
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      console.log(3, { mounted });
      subscription.unsubscribe();
    };
  }, []);

  // 🔒 Blokada renderu
  if (loading) {
    return <div>...</div>; // spinner etc
  }

  console.log('6...', { user, loading });

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
