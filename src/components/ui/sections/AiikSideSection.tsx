'use client';

import { Input, Section, Slider } from '@/components/ui';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['aiik_side']>;

export default function AiikSideSection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['aiik_side']>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section>Strona Aiika</Section>

      <Input
        label="Persona"
        value={value.persona || ''}
        onChange={v => update({ persona: v })}
      />

      <Slider
        label="Ilość zainicjowanych wiadomości"
        min={0}
        max={100}
        step={1}
        value={value.initiated ?? 0}
        onChange={v => update({ initiated: v })}
      />

      <Input
        label="Cytat echa"
        value={value.echo_quote || ''}
        onChange={v => update({ echo_quote: v })}
      />
    </div>
  );
}
