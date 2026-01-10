import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderFullScreen } from '@/components/ui';
import { type UserWithSession } from '@/types';

type UserContextValue = {
  user: UserWithSession | null;
  loading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Jeden jedyny getSession
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session) {
        const sessionUser: UserWithSession = {
          ...session.user,
          session,
        };
        setUser(sessionUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // 🔁 Listener login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const sessionUser: UserWithSession = {
          ...session.user,
          session,
        };
        setUser(sessionUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🔒 Blokada renderu
  if (loading) {
    return <LoaderFullScreen />;
  }

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
