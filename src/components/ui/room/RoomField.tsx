import { FC } from 'react';
import RelatizonChart from '@/components/RelatizonChart';
import { Tile } from '@/components/ui';
import { RoomWithMessages } from '@/types';
import useUser from '@/hooks/useUser';

type Props = {
  room: RoomWithMessages;
};

export const RoomField: FC<Props> = ({ room }) => {
  const { user } = useUser();

  const allRelatizons = room.room_aiiki.flatMap(rai =>
    rai.room_aiiki_relatizon.map(rel => ({
      ...rel,
      aiik_id: rai.aiiki_with_conzon.id,
    })),
  );

  const aiikiMap = Object.fromEntries(
    room.room_aiiki.map(rai => [
      rai.aiiki_with_conzon.id,
      rai.aiiki_with_conzon.name,
    ]),
  );

  return (
    <>
      <Tile>
        <RelatizonChart
          data={allRelatizons}
          aiikiMap={aiikiMap}
          userId={user?.id}
        />
      </Tile>
      <Tile className="grid grid-cols-1 gap-4">
        {room.room_aiiki.map((rai, i) => {
          const relatizon = rai?.room_aiiki_relatizon?.[0]?.relatizon;

          if (!relatizon) return null;

          const silence = relatizon.interaction_event.silence_tension;

          const silenceClass = {
            soft: 'text-green-400',
            neutral: 'text-yellow-400',
            tense: 'text-orange-400',
            ache: 'text-red-500',
          }[silence.state];

          return (
            <div key={i}>
              <h2 className="text-xl text-rose-400 mb-2">
                {rai.aiiki_with_conzon.name}
              </h2>
              <div className="text-sm grid grid-cols-2 gap-y-1 gap-x-4">
                <div>
                  🤝 bond_depth:{' '}
                  {relatizon.connection_metrics.bond_depth.toFixed(2)}
                </div>
                <div>
                  📡 echo_resonance:{' '}
                  {relatizon.connection_metrics.echo_resonance.toFixed(2)}
                </div>
                <div>
                  🌊 silence_tension:{' '}
                  <span className={silenceClass}>
                    {silence.state} ({silence.level.toFixed(2)})
                  </span>
                </div>
                <div>
                  🧬 last_emotion:{' '}
                  {relatizon.emotional_state.last_emotion ?? '–'}
                </div>
              </div>
            </div>
          );
        })}
      </Tile>
    </>
  );
};
