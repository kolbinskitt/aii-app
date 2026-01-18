'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { RoomAiikiRelatizon, RechartsCustomTooltipProps } from '@/types';
import { useState, useMemo } from 'react';
import { Button } from './ui';

type Props = {
  data: RoomAiikiRelatizon[];
  aiikiMap: Record<string, string>;
  userId?: string;
};

export default function RelatizonChart({ data, aiikiMap, userId }: Props) {
  const aiikMeta = useMemo(() => {
    const tabs: { id: string; label: string; isUser: boolean }[] = [];
    const seenAiikIds = new Set<string>();

    const selfEntry = data.find(d => d.user_id === userId);
    const selfAiikId = selfEntry?.user_id;

    if (selfAiikId) {
      tabs.push({ id: selfAiikId, label: 'Ty', isUser: true });
      seenAiikIds.add(selfAiikId);
    }

    for (const d of data) {
      if (d.aiik_id === selfAiikId) continue;
      if (seenAiikIds.has(d.aiik_id)) continue;
      tabs.push({
        id: d.aiik_id,
        label: aiikiMap[d.aiik_id] || 'Nieznany',
        isUser: false,
      });
      seenAiikIds.add(d.aiik_id);
    }

    return tabs;
  }, [data, aiikiMap, userId]);

  const [activeTab, setActiveTab] = useState<{
    id: string;
    isUser: boolean;
  } | null>(aiikMeta[0] ?? null);

  const filteredData = data
    .filter(r => {
      if (!activeTab) return false;

      return activeTab.isUser
        ? r.user_id === activeTab.id
        : r.aiik_id === activeTab.id;
    })
    .map(r => ({
      name: new Date(r.created_at).toLocaleTimeString(),
      bond_depth: r.relatizon.connection_metrics.bond_depth,
      echo_resonance: r.relatizon.connection_metrics.echo_resonance,
      silence_tension: r.relatizon.interaction_event.silence_tension.level,
      silence_tension_state:
        r.relatizon.interaction_event.silence_tension.state,
      aiik_id: r.aiik_id,
      user_id: r.user_id,
    }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: RechartsCustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0].payload;

    const aiikiName = activeTab?.isUser
      ? 'Ty'
      : (aiikiMap[point.aiik_id] ?? 'Nieznany');

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
        {aiikMeta.map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            kind={activeTab?.id === tab.id ? 'primary' : 'default'}
          >
            {tab.label}
          </Button>
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
