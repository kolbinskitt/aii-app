import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserMenu } from './UserMenu';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const user = useUser();

  useEffect(() => {
    const ensureUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Wywołujemy backend, aby utworzyć aiiki jeśli trzeba
      await fetch('http://localhost:1234/auth/ensure-user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    };

    ensureUser();
  }, []);

  return (
    <>
      <header className="p-4 flex justify-between">
        {user && <UserMenu user={user} />}
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
