import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(333, { session });

      if (session) {
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Ładowanie...</div>;

  if (!isAuthenticated) {
    // Ważne: redirect w osobnym efekcie, nie w renderze
    useEffect(() => {
      navigate('/login', { replace: true }); // to wystarczy
    }, [navigate]);

    return null;
  }

  return <>{children}</>;
}
