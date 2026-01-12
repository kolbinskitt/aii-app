'use client';

import { useEffect, useState } from 'react';
import { Section, Switch, Slider } from '@/components/ui';
import InputList from '@/components/ui/InputList';
import InputListWithMeta from '@/components/ui/InputListWithMeta';
import { ArcheZON, ArcheZONSectionProps, ItemWithMeta } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['cognition']>;

export default function CognitionSection({ value, onChange }: Props) {
  const [protections, setProtections] = useState<ItemWithMeta[]>([]);
  const [triggers, setTriggers] = useState<ItemWithMeta[]>([]);
  const [breakdowns, setBreakdowns] = useState<ItemWithMeta[]>([]);

  // zachowujemy pełne obiekty (z description i importance)
  useEffect(() => {
    setProtections(value.protections || []);
    setTriggers(value.triggers || []);
    setBreakdowns(value.key_moments?.breakdowns || []);
  }, [value]);

  const update = (patch: Partial<ArcheZON['cognition']>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <Section>Poznanie</Section>

      <Switch
        label="Stream self"
        checked={value.stream_self || false}
        onChange={v => update({ stream_self: v })}
      />

      <Slider
        label="Memory fragments"
        min={1}
        max={20}
        value={value.memory_fragments || 7}
        onChange={v => update({ memory_fragments: v })}
      />

      <InputList
        title="Rules"
        items={value.rules || []}
        onChange={items => update({ rules: items })}
      />

      <InputListWithMeta
        title="Protections"
        label="Protection"
        items={protections}
        onChange={items => {
          setProtections(items);
          update({ protections: items });
        }}
      />

      <InputListWithMeta
        title="Triggers"
        label="Trigger"
        items={triggers}
        onChange={items => {
          setTriggers(items);
          update({ triggers: items });
        }}
      />

      <InputListWithMeta
        title="Breakdowns"
        label="Breakdown"
        items={breakdowns}
        onChange={items => {
          setBreakdowns(items);
          update({
            key_moments: {
              ...value.key_moments,
              breakdowns: items,
            },
          });
        }}
      />
    </>
  );
}
