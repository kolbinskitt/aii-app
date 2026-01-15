'use client';

import { useEffect, useState } from 'react';
import { Section, Switch } from '@/components/ui';
import InputListWithMeta from '@/components/ui/InputListWithMeta';
import { ArcheZON, ArcheZONSectionProps, ItemWithMeta } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['cognition']>;

export default function CognitionSection({ value, onChange }: Props) {
  const [rules, setRules] = useState<ItemWithMeta[]>([]);
  const [protections, setProtections] = useState<ItemWithMeta[]>([]);
  const [triggers, setTriggers] = useState<ItemWithMeta[]>([]);

  useEffect(() => {
    setRules(value.rules || []);
    setProtections(value.protections || []);
    setTriggers(value.triggers || []);
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
      <InputListWithMeta
        title="Rules"
        label="Rule"
        items={rules}
        onChange={items => {
          setRules(items);
          update({ rules: items });
        }}
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
    </>
  );
}
