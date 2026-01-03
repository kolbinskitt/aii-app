import { useEffect, useState } from 'react';
import { getAllRooms, type Room } from '../db/rooms';
import { Link } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          window.innerWidth < 768
            ? 'url(/src/assets/background-mobile.png)'
            : 'url(/src/assets/background-desktop.png)',
      }}
    >
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-light">aii</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 border border-neutral-700 hover:bg-neutral-800 transition"
        >
          Utwórz nowy pokój
        </button>
      </div>

      {rooms.length > 0 && (
        <div className="mt-8 space-y-2 text-sm opacity-80">
          {rooms.map(room => (
            <Link
              key={room.id}
              to={`/room/${room.slug}`}
              className="block hover:underline"
            >
              {room.name || '🌀 Bezimienny pokój'}
            </Link>
          ))}
        </div>
      )}

      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </main>
  );
}
