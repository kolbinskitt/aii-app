import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoomById } from '../db/rooms';
import { RoomWithMessages } from '../types';
import RelatizonChart from '../components/RelatizonChart';
import useUser from '../hooks/useUser';

export default function RoomFieldView() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomWithMessages | null>(null);

  useEffect(() => {
    if (!id) return;
    getRoomById(id).then(data => setRoom(data as RoomWithMessages));
  }, [id]);

  if (!room) return <div className="p-6">Wczytywanie pola pokoju...</div>;

  const allRelatizons = room.room_aiiki.flatMap(rai =>
    rai.room_aiiki_relatizon.map(rel => ({
      ...rel,
      aiik_id: rai.aiiki.id,
    })),
  );

  const aiikiMap = Object.fromEntries(
    room.room_aiiki.map(rai => [rai.aiiki.id, rai.aiiki.name]),
  );

  const { user } = useUser();
  const selfAiik = room.room_aiiki.find(rai => rai.aiiki.user_id === user?.id);
  const selfAiikId = selfAiik?.aiiki.id;

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-light">🌐 Pole pokoju: {room.name}</h1>
      <RelatizonChart data={allRelatizons} aiikiMap={aiikiMap} />
      <div className="grid grid-cols-1 gap-4">
        {room.room_aiiki.map((rai, i) => {
          const relatizon = rai?.room_aiiki_relatizon?.[0]?.relatizon;
          if (!relatizon) return null;

          const silenceClass = {
            soft: 'text-green-400',
            neutral: 'text-yellow-400',
            tense: 'text-orange-400',
            ache: 'text-red-500',
          }[relatizon.silence_tension.state];

          return (
            <div key={i} className="border rounded-xl p-4 bg-neutral-900/40">
              <h2 className="text-xl text-rose-400 mb-2">{rai.aiiki.name}</h2>
              <div className="text-sm grid grid-cols-2 gap-y-1 gap-x-4">
                <div>🤝 bond_depth: {relatizon.bond_depth.toFixed(2)}</div>
                <div>
                  📡 echo_resonance: {relatizon.echo_resonance.toFixed(2)}
                </div>
                <div>
                  🌊 silence_tension:{' '}
                  <span className={silenceClass}>
                    {relatizon.silence_tension.state} (
                    {relatizon.silence_tension.level.toFixed(2)})
                  </span>
                </div>
                <div>🧬 last_emotion: {relatizon.last_emotion ?? '–'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
