'use client';
import { Input, Textarea } from '@/components/ui';
import Section from '@/components/ui/Section';
import { ArcheZON, ArcheZONSectionProps } from '@/types';

type Props = ArcheZONSectionProps<ArcheZON['identity']>;

export default function IdentitySection({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Section>Identity</Section>

      <Input
        label="User Name"
        value={value.user_name || ''}
        onChange={v => onChange({ ...value, user_name: v })}
      />
      <Input
        label="AIik Persona"
        value={value.aiik_persona || ''}
        onChange={v => onChange({ ...value, aiik_persona: v })}
      />
      <Input
        label="Language"
        value={value.language || ''}
        onChange={v => onChange({ ...value, language: v })}
      />
      <Textarea
        label="Self Sentence"
        value={value.self_sentence || ''}
        onChange={v => onChange({ ...value, self_sentence: v })}
      />
    </div>
  );
}
