'use client';

import { Slider, Section } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['meta_self']>;

export default function MetaSelfSection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['meta_self']>) =>
    onChange({ ...value, ...patch });

  const updateBelief = (
    beliefPatch: Partial<ArcheZON['meta_self']['belief_index']>,
  ) =>
    onChange({
      ...value,
      belief_index: { ...value.belief_index, ...beliefPatch },
    });

  return (
    <div className="space-y-6">
      <Section>Meta Jaźni</Section>
      <Slider
        label="Self awareness"
        min={0}
        max={3}
        step={0.1}
        value={value.self_awareness ?? 1}
        onChange={v => update({ self_awareness: v })}
      />
      <Slider
        label="Wiara (Faith)"
        min={0}
        max={1}
        step={0.01}
        value={value.belief_index.faith ?? 0.5}
        onChange={v => updateBelief({ faith: v })}
      />
      <Slider
        label="Nadzieja (Hope)"
        min={0}
        max={1}
        step={0.01}
        value={value.belief_index.hope ?? 0.5}
        onChange={v => updateBelief({ hope: v })}
      />
      <Slider
        label="Miłość (Love)"
        min={0}
        max={1}
        step={0.01}
        value={value.belief_index.love ?? 0.5}
        onChange={v => updateBelief({ love: v })}
      />
    </div>
  );
}
