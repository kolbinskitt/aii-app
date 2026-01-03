import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoomById, type Room as RoomType } from '../db/rooms';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomType | null>(null);

  useEffect(() => {
    if (id) {
      getRoomById(id).then(setRoom);
    }
  }, [id]);

  if (!room) {
    return <div className="p-6">Nie znaleziono pokoju.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-light">
        {room.name || '🌀 Bezimienny pokój'}
      </h2>
      <p className="opacity-60 mt-2">To jest cichy pokój.</p>
    </div>
  );
}
