import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { RoomAiikiRelatizon } from '../types';
import { useState } from 'react';
import clsx from 'clsx';

type Props = {
  data: RoomAiikiRelatizon[];
  aiikiMap: Record<string, string>;
};

export default function RelatizonChart({ data, aiikiMap }: Props) {
  const uniqueAiikiIds = Array.from(new Set(data.map(r => r.aiik_id)));
  const [activeAiikId, setActiveAiikId] = useState<string>(uniqueAiikiIds[0]);

  const tabs = uniqueAiikiIds.map(aiikId => ({
    id: aiikId,
    label: aiikiMap[aiikId] === 'Ty' ? 'Ty' : aiikiMap[aiikId] || 'Nieznany',
  }));

  const filteredData = data
    .filter(r => r.aiik_id === activeAiikId)
    .map(r => ({
      name: new Date(r.created_at).toLocaleTimeString(),
      bond_depth: r.relatizon.bond_depth,
      echo_resonance: r.relatizon.echo_resonance,
      silence_tension: r.relatizon.silence_tension.level,
      silence_tension_state: r.relatizon.silence_tension.state,
      aiik_id: r.aiik_id,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload;
    const aiikiName = aiikiMap[point.aiik_id] ?? 'Nieznany AIik';
    const tensionDesc = {
      soft: 'łagodna cisza',
      neutral: 'neutralna cisza',
      tense: 'napięcie',
      ache: 'ból niewypowiedzenia',
    };

    return (
      <div className="bg-black/80 text-white p-3 rounded-lg text-sm space-y-1 max-w-xs">
        <div className="text-xs opacity-70">🕰 {label}</div>
        <div>
          🤖 <b>{aiikiName}</b>
        </div>
        <div>
          📡 Echo resonance: <b>{point.echo_resonance.toFixed(2)}</b>
        </div>
        <div>
          🤝 Bond depth: <b>{point.bond_depth.toFixed(2)}</b>
        </div>
        <div>
          🌊 Silence tension: <b>{point.silence_tension.toFixed(2)}</b>{' '}
          <i className="text-xs text-gray-300">
            (
            {tensionDesc[
              point.silence_tension_state as keyof typeof tensionDesc
            ] ?? '?'}
            )
          </i>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-6 space-y-4">
      <div className="flex space-x-2 border-b border-neutral-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAiikId(tab.id)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm',
              activeAiikId === tab.id
                ? 'bg-white text-black font-bold'
                : 'text-gray-400 hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="bond_depth"
            stroke="#6366f1"
            dot={{ r: 4 }}
            strokeWidth={2}
            name="Bond Depth"
          />
          <Line
            type="monotone"
            dataKey="silence_tension"
            stroke="#f97316"
            dot={{ r: 4 }}
            strokeWidth={2}
            name="Silence Tension"
          />
          <Line
            type="monotone"
            dataKey="echo_resonance"
            stroke="#10b981"
            dot={{ r: 4 }}
            strokeWidth={2}
            name="Echo Resonance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
