import { useEffect, useState } from 'react';
import { getAllRooms } from '@/helpers/getAllRooms';
import { Room } from '../types';
import { Link } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui';
import { supabase } from '@/lib/supabase';
import useUser from '@/hooks/useUser';

export default function Rooms() {
  const { t } = useTranslation();
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`rooms-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `user_id=eq.${user.user?.id}`,
        },
        () => {
          getAllRooms().then(setRooms);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const roomsList =
    rooms.length === 0 ? (
      <p className="text-muted-foreground">{t('campfires.no_campfires')}</p>
    ) : (
      <ul style={{ margin: 0 }}>
        {rooms.map(room => (
          <li key={room.id}>
            <Link
              to={`/room/${room.id}`}
              title={room.name || '🌀'}
              className="truncate whitespace-nowrap block"
              style={{ width: 285 }}
            >
              {room.name || '🌀'}
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="px-6 py-3 border border-neutral-700 
        transition w-full rounded-2xl
        bg-green-600 hover:bg-green-700 text-white"
        kind="submit"
      >
        {t(
          rooms.length === 0
            ? 'campfires.start_first_campfire'
            : 'campfires.start_new_campfire',
        )}
      </Button>
      <h3
        className="text-gray-500 tracking-wider mt-4"
        style={{ marginTop: 16 }}
      >
        {t('campfires.your_campfires')}{' '}
      </h3>
      {roomsList}
      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </>
  );
}
