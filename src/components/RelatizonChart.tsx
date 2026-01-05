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

type Props = {
  data: RoomAiikiRelatizon[];
  aiikiMap: Record<string, string>;
};

export default function RelatizonChart({ data, aiikiMap }: Props) {
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

  // Konwertujemy timestamp / id na oś X
  const chartData = data.map(r => ({
    name: new Date(r.created_at).toLocaleTimeString(),
    bond_depth: r.relatizon.bond_depth,
    echo_resonance: r.relatizon.echo_resonance,
    silence_tension: r.relatizon.silence_tension.level,
    aiik_id: r.aiik_id,
    silence_tension_state: r.relatizon.silence_tension.state,
  }));

  return (
    <div className="w-full h-96 mt-6">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
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
