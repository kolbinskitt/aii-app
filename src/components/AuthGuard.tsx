import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Main from './Main';

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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-80"></div>
        </div>
      </Main>
    );
  if (!isAuthenticated) return null;

  return <Main logged>{children}</Main>;
}
