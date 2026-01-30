import { FC, useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import CreateCorZON, { CreateCorZONRef } from '@/components/CreateCorZON';
import { Flex, message } from 'antd';
import { ArcheZON } from '@/types';
import useUser from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

const Profile: FC = () => {
  const createRef = useRef<CreateCorZONRef>(null);
  const user = useUser();
  const [conzon, setConzon] = useState<ArcheZON>();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const loadUserCorZON = async () => {
      if (user.user?.id && !conzon) {
        const { data, error } = await supabase
          .from('user_with_conzon')
          .select('display_name, conzon')
          .eq('id', user.user?.id);

        if (error) throw error;
        setConzon(data[0].conzon);
        setDisplayName(data[0].display_name);
      }
    };
    loadUserCorZON();
  }, [user]);

  const handleSubmit = async () => {
    if (!createRef.current || !user.user?.id) return;

    const data = createRef.current.getForm();
    const now = new Date().toISOString();

    const conzon: ArcheZON = {
      ...data,
      meta: {
        version: '0.1',
        created_at: now,
        last_updated: now,
      },
    };

    try {
      // Zapis display_name usera
      const { error: errorUsers } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('auth_id', user.user.auth_id);

      if (errorUsers) throw errorUsers;

      // Zapis conzonu usera
      const { error } = await supabase.from('user_conzon').insert([
        {
          user_id: user.user.id,
          conzon,
          created_at: now,
        },
      ]);

      if (error) throw error;

      message.success('Zapisano dane');
    } catch (err) {
      console.error(err);
      message.error('Błąd zapisu danych');
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-system text-gray-800 leading-snug font-semibold truncate mb-0">
        Profil
      </h2>
      {conzon && (
        <CreateCorZON
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          conzon={conzon}
          ref={createRef}
        />
      )}
      <Flex justify="space-between">
        <div />
        <Button kind="submit" onClick={handleSubmit}>
          Zapisz
        </Button>
      </Flex>
    </Card>
  );
};

export default Profile;
