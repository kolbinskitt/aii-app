import { FC, useState } from 'react';
import { AutoComplete } from '@/components/ui';
import { Input } from 'antd';
import type { AutoCompleteProps } from 'antd';
import { supabase } from '@/lib/supabase';
import useUser from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';

type Props = {};

type RoomResult = {
  id: string;
  name: string;
  description: string | null;
};

export const SearchRooms: FC<Props> = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

  const renderItem = (
    key: string,
    id: string,
    name: string,
    description: string | null,
  ) => ({
    key: `${key}-${id}`,
    value: id,
    label: (
      <div className="font-system">
        <div>{name}</div>
        {description && (
          <div className="text-gray-500 line-clamp-2 text-xs">
            {description}
          </div>
        )}
      </div>
    ),
    kind: key,
  });

  const handleSearch = async (query: string) => {
    if (!user.user?.id) {
      setOptions([]);
      return;
    }

    const lowerQuery = `%${query.toLowerCase()}%`;

    // 1. Pobierz prywatne pokoje usera (name OR description)
    const { data: privateRooms, error: privateError } = await supabase
      .from('rooms')
      .select('id, name, description')
      .eq('user_id', user.user.id)
      .or(`name.ilike.${lowerQuery},description.ilike.${lowerQuery}`);

    if (privateError) {
      console.error('Błąd prywatnych pokoi:', privateError);
      setOptions([]);
      return;
    }

    // ID prywatnych pokoi, żeby je wykluczyć z publicznych
    const privateIds = new Set(privateRooms?.map(room => room.id));

    // 2. Pobierz publiczne pokoje, które nie są już Twoje
    const { data: publicRooms, error: publicError } = await supabase
      .from('rooms')
      .select('id, name, description')
      .eq('visibility', 'public')
      .or(`name.ilike.${lowerQuery},description.ilike.${lowerQuery}`);

    if (publicError) {
      console.error('Błąd publicznych pokoi:', publicError);
      setOptions([]);
      return;
    }

    const filteredPublicRooms = (publicRooms || []).filter(
      room => !privateIds.has(room.id),
    );

    // 3. Renderuj opcje
    const privateOptions = (privateRooms || []).map((room: RoomResult) =>
      renderItem('private', room.id, room.name, room.description),
    );

    const publicOptions = filteredPublicRooms.map((room: RoomResult) =>
      renderItem('public', room.id, room.name, room.description),
    );

    // 4. Złóż wynik
    const newOptions: AutoCompleteProps['options'] = [];

    if (privateOptions.length > 0) {
      newOptions.push({ label: 'Prywatne', options: privateOptions });
    }

    if (publicOptions.length > 0) {
      newOptions.push({ label: 'Publiczne', options: publicOptions });
    }

    setOptions(newOptions);
  };

  const handleSelect = async (value: string, kind: string) => {
    setValue('');
    setOptions([]);
    if (kind === 'public' && user.user?.id) {
      await supabase.from('rooms_users').upsert(
        {
          room_id: value,
          user_id: user.user.id,
        },
        { onConflict: 'room_id,user_id' },
      );
    }
    navigate(`/room/${value}`);
  };

  return (
    <AutoComplete
      options={options}
      onSelect={(value, { kind }) => {
        handleSelect(value as string, kind);
      }}
      wrapperClassName="mb-3"
      popupMatchSelectWidth={500}
      showSearch
      onSearch={handleSearch}
    >
      <Input.Search
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Wyszukaj ogniska..."
        allowClear
      />
    </AutoComplete>
  );
};
