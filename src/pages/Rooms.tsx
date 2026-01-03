import { useEffect, useState } from 'react';
import { getAllRooms } from '../db/rooms';
import { Room } from '../types';
import { Link } from 'react-router-dom';
import CreateRoomModal from '../components/CreateRoomModal';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  return (
    <div>
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

        <div className="p-4 space-y-4">
          {rooms.length === 0 ? (
            <p className="text-muted-foreground">
              🌱 Jeszcze żaden pokój nie zakwitł.
            </p>
          ) : (
            <ul className="space-y-2">
              {rooms.map(room => (
                <li key={room.id}>
                  <Link
                    to={`/room/${room.id}`}
                    className="block p-3 border border-muted rounded-2xl hover:bg-muted transition"
                  >
                    <div className="text-lg font-medium">
                      {room.name || '🌀 Bezimienny pokój'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(room.created_at).toLocaleString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      {open && <CreateRoomModal onClose={() => setOpen(false)} />}
    </div>
  );
}
