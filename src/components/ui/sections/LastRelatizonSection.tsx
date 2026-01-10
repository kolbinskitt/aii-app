'use client';

import { Input, Section } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['last_relatizon']>;

export default function LastRelatizonSection({ value, onChange }: Props) {
  const room_id = value?.room_id ?? '';
  const snapshot = value?.snapshot ?? {};

  const handleSnapshotChange = (v: string) => {
    try {
      const parsed = JSON.parse(v);
      onChange({ room_id, snapshot: parsed });
    } catch (e) {
      // Niepoprawny JSON — ignorujemy zmianę
    }
  };

  return (
    <div className="space-y-4">
      <Section>Ostatni Relatizon</Section>

      <Input
        label="Room ID"
        value={room_id}
        onChange={v => onChange({ room_id: v, snapshot })}
      />

      <Input
        label="Snapshot (JSON)"
        value={JSON.stringify(snapshot, null, 2)}
        onChange={handleSnapshotChange}
      />
    </div>
  );
}
