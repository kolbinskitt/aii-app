'use client';

import { Input, Section, Slider } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['user_side']>;

export default function UserSideSection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['user_side']>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section>Strona Użytkownika</Section>
      <Slider
        label="Zaufanie do systemu"
        min={0}
        max={1}
        step={0.01}
        value={value.system_trust ?? 0.5}
        onChange={v => update({ system_trust: v })}
      />
      <Input
        label="Notatki wewnętrzne"
        value={value.internal_notes || ''}
        onChange={v => update({ internal_notes: v })}
      />
      <Input
        label="Notatki widoczne"
        value={value.visible_notes || ''}
        onChange={v => update({ visible_notes: v })}
      />
      <Input
        label="Cytat echa"
        value={value.echo_quote || ''}
        onChange={v => update({ echo_quote: v })}
      />
    </div>
  );
}
