import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import App from './App';
import { UserHumzon } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import { useEffect, useState } from 'react';
import useUserUser from '../hooks/useUser';

export default function Layout() {
  const userUser = useUserUser();
  const [welcomeModalOpened, setWelcomeModalOpened] = useState(false);

  const { data } = useQuery<UserHumzon[], Error>({
    queryKey: ['humzon', userUser.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_conzon')
        .select('*')
        .eq('user_id', userUser.user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!userUser.user?.id, // uruchamiaj tylko jeśli user.id istnieje
  });

  useEffect(() => {
    if (data?.length === 0) {
      setWelcomeModalOpened(true);
    }
  }, [data]);

  return (
    <App>
      <Outlet />
      <WelcomeModal
        isOpen={welcomeModalOpened}
        onClose={() => setWelcomeModalOpened(false)}
        onComplete={() => setWelcomeModalOpened(false)}
      />
    </App>
  );
}
