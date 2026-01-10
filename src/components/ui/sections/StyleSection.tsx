'use client';

import { Section, Switch, Select } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['style']>;

const TONE_OPTIONS: ArcheZON['style']['tone'][] = [
  'neutral',
  'soft',
  'emotional',
  'warm',
  'aggressive',
  'cold',
];

const LENGTH_OPTIONS: ArcheZON['style']['length'][] = [
  'short',
  'medium',
  'long',
];

export default function StyleSection({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Section>Styl</Section>

      <Switch
        label="Emoji"
        checked={value.emoji}
        onChange={v => onChange({ ...value, emoji: v })}
      />

      <Select
        label="Ton"
        value={value.tone}
        options={TONE_OPTIONS}
        onChange={v =>
          onChange({ ...value, tone: v as ArcheZON['style']['tone'] })
        }
      />

      <Select
        label="Długość"
        value={value.length}
        options={LENGTH_OPTIONS}
        onChange={v =>
          onChange({ ...value, length: v as ArcheZON['style']['length'] })
        }
      />
    </div>
  );
}
