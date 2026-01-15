'use client';

import { Input, Section } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['meta']>;

export default function MetaSection({ value, onChange }: Props) {
  const safeValue = {
    ...value,
    version: value?.version ?? '',
    created_at: value?.created_at ?? '',
    last_updated: value?.last_updated ?? '',
  };

  return (
    <div className="space-y-4">
      <Section>Meta</Section>
      <Input
        label="Version"
        value={safeValue.version}
        onChange={v => onChange({ ...safeValue, version: v })}
      />
      <Input
        label="Created At"
        value={safeValue.created_at}
        onChange={v => onChange({ ...safeValue, created_at: v })}
      />
      <Input
        label="Last Updated"
        value={safeValue.last_updated}
        onChange={v => onChange({ ...safeValue, last_updated: v })}
      />
    </div>
  );
}
