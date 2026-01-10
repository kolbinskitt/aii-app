'use client';
import { useState } from 'react';
import { Input, Textarea, Slider, Button, Section } from '@/components/ui';
import { ItemWithMeta, InputListWithMetaProps } from '@/types';

export default function InputListWithMeta({
  label,
  items,
  onChange,
}: InputListWithMetaProps) {
  const [newItem, setNewItem] = useState<ItemWithMeta>({
    label: '',
    description: '',
    importance: 0.5,
  });

  const handleChange = (index: number, key: keyof ItemWithMeta, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const addItem = () => {
    if (!newItem.label.trim()) return;
    onChange([...items, { ...newItem }]);
    setNewItem({ label: '', description: '', importance: 0.5 });
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {label && <Section>{label}</Section>}

      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl bg-muted p-4 space-y-3 border border-border"
        >
          <Input
            label={`Label #${index + 1}`}
            value={item.label}
            onChange={val => handleChange(index, 'label', val)}
          />

          <Textarea
            label="Opis / kontekst"
            value={item.description || ''}
            onChange={val => handleChange(index, 'description', val)}
          />

          <Slider
            label="Waga"
            value={item.importance ?? 0.5}
            min={0}
            max={1}
            step={0.01}
            onChange={val => handleChange(index, 'importance', val)}
          />

          <div className="flex justify-end gap-2">
            <Button onClick={() => moveItem(index, index - 1)}>⬆️</Button>
            <Button onClick={() => moveItem(index, index + 1)}>⬇️</Button>
            <Button kind="danger" onClick={() => removeItem(index)}>
              Usuń
            </Button>
          </div>
        </div>
      ))}

      <Section>Dodaj nowy wpis</Section>

      <Input
        label="Nowy label"
        value={newItem.label}
        onChange={val => setNewItem({ ...newItem, label: val })}
      />

      <Textarea
        label="Opis (opcjonalny)"
        value={newItem.description}
        onChange={val => setNewItem({ ...newItem, description: val })}
      />

      <Slider
        label="Waga"
        value={newItem.importance}
        min={0}
        max={1}
        step={0.01}
        onChange={val => setNewItem({ ...newItem, importance: val })}
      />

      <Button onClick={addItem} className="w-full">
        ➕ Dodaj
      </Button>
    </div>
  );
}
