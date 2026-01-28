import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
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
              className="font-system mb-2 block"
              style={{ width: 285 }}
            >
              <div
                className={`truncate whitespace-nowrap block ${location.pathname.startsWith('/room/') && id === room.id ? 'font-semibold' : ''}`}
              >
                {room.name || '🌀'}
              </div>
              {room.description !== '' && (
                <div
                  className="text-gray-500 line-clamp-2 text-sm"
                  title={room.description}
                >
                  {room.description}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full mb-3"
        kind="submit"
      >
        {t(
          rooms.length === 0
            ? 'campfires.start_first_campfire'
            : 'campfires.start_new_campfire',
        )}
      </Button>
      {roomsList}
      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </>
  );
}
