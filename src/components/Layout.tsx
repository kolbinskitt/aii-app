import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import App from './App';
import { UserWithConZON } from '../types';
import WelcomeModal from '../components/WelcomeModal';
import { useEffect, useState } from 'react';
import useUserUser from '../hooks/useUser';

export default function Layout() {
  const userUser = useUserUser();
  const [welcomeModalOpened, setWelcomeModalOpened] = useState(false);

  const { data } = useQuery<UserWithConZON[], Error>({
    queryKey: ['userConZON', userUser.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_with_conzon')
        .select('*')
        .eq('id', userUser.user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!userUser.user?.id, // uruchamiaj tylko jeśli user.id istnieje
  });

  useEffect(() => {
    setWelcomeModalOpened(data === undefined ? false : !data?.[0].conzon);
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
