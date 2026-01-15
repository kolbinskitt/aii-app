'use client';

import { Section } from '@/components/ui';
import InputListWithMeta from '@/components/ui/InputListWithMeta';
import { ArcheZON, ArcheZONSectionProps, ItemWithMeta } from '@/types';
import Slider from '@/components/ui/Slider';

type Props = ArcheZONSectionProps<ArcheZON['meta_self']>;

export default function MetaSelfSection({ value, onChange }: Props) {
  const update = (patch: Partial<ArcheZON['meta_self']>) =>
    onChange({ ...value, ...patch });

  const updateSelfAwareness = (index: number) =>
    update({
      self_awareness: {
        ...value.self_awareness,
        index,
      },
    });

  const updateBeliefList = (
    key: keyof ArcheZON['meta_self']['belief_index'],
    items: ItemWithMeta[],
  ) =>
    update({
      belief_index: {
        ...value.belief_index,
        [key]: items,
      },
    });

  return (
    <div className="space-y-6">
      <Section>Meta Jaźni</Section>
      <Slider
        label="Self Awareness Index"
        min={0}
        max={4}
        step={0.1}
        value={value.self_awareness?.index ?? 1}
        onChange={updateSelfAwareness}
      />
      <InputListWithMeta
        title="Wiara (Faith)"
        label="Faith"
        items={value.belief_index.faith || []}
        onChange={items => updateBeliefList('faith', items)}
      />
      <InputListWithMeta
        title="Nadzieja (Hope)"
        label="Hope"
        items={value.belief_index.hope || []}
        onChange={items => updateBeliefList('hope', items)}
      />
      <InputListWithMeta
        title="Miłość (Love)"
        label="Love"
        items={value.belief_index.love || []}
        onChange={items => updateBeliefList('love', items)}
      />
    </div>
  );
}
