import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Main from './Main';
import { LoaderFullScreen } from './ui';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
      } else {
        navigate('/login', { replace: true });
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading)
    return (
      <Main>
        <LoaderFullScreen />
      </Main>
    );
  if (!isAuthenticated) return null;

  return <Main logged>{children}</Main>;
}
