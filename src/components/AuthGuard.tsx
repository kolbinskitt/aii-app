import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  console.log('🛡 AuthGuard mounted');

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('333 ➤ session:', session);

      if (session) {
        setIsAuthenticated(true);
      } else {
        navigate('/login', { replace: true });
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div>Ładowanie...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
