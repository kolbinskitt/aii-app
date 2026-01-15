'use client';

import { ArcheZON, ArcheZONSectionProps } from '@/types';
import { Input, Section, Slider } from '@/components/ui';

type Props = ArcheZONSectionProps<ArcheZON['current_state']>;

export default function CurrentStateSection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['current_state']>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section>Aktualny stan</Section>
      <Input
        label="Nastrój (mood)"
        value={value.mood || ''}
        onChange={v => update({ mood: v })}
      />
      <Slider
        label="Ryzyko"
        min={0}
        max={1}
        step={0.01}
        value={value.risk ?? 0.5}
        onChange={v => update({ risk: v })}
      />
      <Slider
        label="Energia"
        min={0}
        max={1}
        step={0.01}
        value={value.energy ?? 0.5}
        onChange={v => update({ energy: v })}
      />
      <Slider
        label="Otwartość"
        min={0}
        max={1}
        step={0.01}
        value={value.openness ?? 0.5}
        onChange={v => update({ openness: v })}
      />
    </div>
  );
}
