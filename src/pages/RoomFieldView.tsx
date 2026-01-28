import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoomById } from '@/helpers/getRoomById';
import { RoomWithMessages } from '../types';
import { Icon, Tile } from '../components/ui';
import { RoomField } from '@/components/ui/room/RoomField';

export default function RoomFieldView() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomWithMessages | null>(null);

  useEffect(() => {
    if (!id) return;
    getRoomById(id).then(data => setRoom(data as RoomWithMessages));
  }, [id]);

  if (!room) return <div className="p-6">Wczytywanie danych...</div>;

  return (
    <div className="relative w-full space-y-2">
      <Tile>
        <h1 className="text-2xl font-light font-system mb-0">
          <Link to={`/room/${id}`}>
            <Icon name="ArrowLeft" size="lg" className="mr-2" />
          </Link>
          Ustawienia ogniska{' '}
          <strong className="font-semibold">{room.name}</strong>
        </h1>
      </Tile>
      <RoomField room={room} />
    </div>
  );
}
