'use client';
import { useState } from 'react';
import Input from './Input';
import Button from './Button';

type InputListProps = {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
};

export default function InputList({ label, items, onChange }: InputListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem('');
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
    <div className="space-y-2">
      {label && <div className="font-semibold">{label}</div>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 bg-muted p-2 rounded-xl"
          >
            <div className="flex-1">{item}</div>
            <div className="flex gap-1">
              <button onClick={() => moveItem(index, index - 1)}>⬆️</button>
              <button onClick={() => moveItem(index, index + 1)}>⬇️</button>
              <button onClick={() => removeItem(index)}>❌</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={setNewItem}
          className="flex-1 px-2 py-1 border rounded-xl"
          placeholder="Dodaj nową zasadę"
        />
        <Button
          onClick={addItem}
          className="bg-foreground text-background px-3 py-1 rounded-xl"
        >
          OK
        </Button>
      </div>
    </div>
  );
}
