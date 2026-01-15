'use client';
import { Input, Textarea } from '@/components/ui';
import Section from '@/components/ui/Section';
import { ArcheZON, ArcheZONSectionProps } from '@/types';
import InputList from '@/components/ui/InputList';

type Props = ArcheZONSectionProps<ArcheZON['identity']>;

export default function IdentitySection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['identity']>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <Section>Identity</Section>
      <Input
        label="Name"
        value={value.name || ''}
        onChange={v => update({ name: v })}
      />
      <Input
        label="Language"
        value={value.language || ''}
        onChange={v => update({ language: v })}
      />
      <Textarea
        label="Self Sentence"
        value={value.self_sentence || ''}
        onChange={v => update({ self_sentence: v })}
      />
      <InputList
        title="Labels"
        items={value.labels || []}
        onChange={items => update({ labels: items })}
      />
    </div>
  );
}
