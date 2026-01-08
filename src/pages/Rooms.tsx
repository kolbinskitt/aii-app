import { useEffect, useState } from 'react';
import { getAllRooms } from '../db/rooms';
import { Room } from '../types';
import { Link } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '../components/ui';

export default function Rooms() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  const roomsList =
    rooms.length === 0 ? (
      <p className="text-center text-muted-foreground">
        {t('campfires.no_campfires')}
      </p>
    ) : (
      <ul className="space-y-2">
        {rooms.map(room => (
          <li key={room.id}>
            <Link to={`/room/${room.id}`}>
              <Tile
                className="bg-white/70 text-md font-echo text-lg truncate"
                hoverable
                title={room.name || '🌀'}
              >
                {room.name || '🌀'}
              </Tile>
            </Link>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="space-y-2">
      <Button
        onClick={() => setOpen(true)}
        className="px-6 py-3 border border-neutral-700 
        hover:bg-neutral-800 transition w-full rounded-2xl
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
        className="text-center text-xl text-gray-600 uppercase tracking-wider mt-4 mb-2 font-echo"
        style={{ marginTop: 16 }}
      >
        {t('campfires.your_campfires')}{' '}
      </h3>
      <div
        className="text-center animate-glow-fire"
        style={{
          fontSize: 24,
          marginTop: 0,
        }}
      >
        🔥🔥🔥
      </div>
      {roomsList}
      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </div>
  );
}
