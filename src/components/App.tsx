import { PropsWithChildren, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../lib/i18n';
import { supabase } from '../lib/supabase';
import useUser from '../hooks/useUser';

export default function App({ children }: PropsWithChildren) {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // zabezpieczenie przed wielokrotnym logoutem (race condition)
  const isLoggingOut = useRef(false);

  const safeSignOut = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  // 1️⃣ Reakcja na zmiany auth (logout / session expired)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        safeSignOut();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 2️⃣ Reakcja na backendowe 401 (auth:expired)
  useEffect(() => {
    const handler = () => {
      safeSignOut();
    };

    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, []);

  // 3️⃣ Keep-alive / token refresh co 10 min
  useEffect(() => {
    const interval = setInterval(async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        safeSignOut();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // UI guardy
  if (loading) return <div>Ładowanie...</div>;
  if (!user) return null; // redirect już się wydarzy

  return <>{children}</>;
}
