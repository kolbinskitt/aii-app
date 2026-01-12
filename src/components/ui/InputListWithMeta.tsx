'use client';

import { useState } from 'react';
import {
  Input,
  Textarea,
  Slider,
  Button,
  Section,
  Icon,
  IconButton,
} from '@/components/ui';
import { ItemWithMeta, InputListWithMetaProps } from '@/types';

export default function InputListWithMeta({
  title,
  label,
  items,
  onChange,
}: InputListWithMetaProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<ItemWithMeta>({
    label: '',
    description: '',
    importance: 0.5,
  });

  const updateItem = (
    index: number,
    key: keyof ItemWithMeta,
    value: string | number,
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const addItem = () => {
    if (!newItem.label.trim()) return;
    onChange([...items, { ...newItem }]);
    setNewItem({ label: '', description: '', importance: 0.5 });
  };

  return (
    <div className="space-y-4">
      {title && <Section>{title}</Section>}

      {items.map((item, index) => {
        const isEditing = editingIndex === index;

        return (
          <div
            key={index}
            className="rounded-xl bg-muted p-4 space-y-3 border border-border"
          >
            {/* ===== VIEW MODE ===== */}
            {!isEditing && (
              <>
                {/* Header: label + actions */}
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {item.label || `Label #${index + 1}`}
                  </div>

                  <div className="flex shrink-0">
                    <IconButton
                      aria-label="Edit"
                      icon={<Icon name="PencilSimple" size="sm" />}
                      onClick={() => setEditingIndex(index)}
                    />
                    <IconButton
                      aria-label="Move up"
                      icon={<Icon name="CaretUp" size="sm" />}
                      onClick={() => moveItem(index, index - 1)}
                    />
                    <IconButton
                      aria-label="Move down"
                      icon={<Icon name="CaretDown" size="sm" />}
                      onClick={() => moveItem(index, index + 1)}
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<Icon name="X" size="sm" />}
                      onClick={() => removeItem(index)}
                    />
                  </div>
                </div>

                {/* Description: full width */}
                {item.description && (
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                )}

                <Slider
                  label={`Waga (${Math.round(
                    (item.importance ?? 0.5) * 100,
                  )}%)`}
                  value={item.importance ?? 0.5}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={() => {}}
                  disabled
                />
              </>
            )}

            {/* ===== EDIT MODE ===== */}
            {isEditing && (
              <>
                <Input
                  label={`${label} #${index + 1}`}
                  value={item.label}
                  onChange={val => updateItem(index, 'label', val)}
                />

                <Textarea
                  label="Opis / kontekst"
                  value={item.description || ''}
                  onChange={val => updateItem(index, 'description', val)}
                />

                <Slider
                  label="Waga"
                  value={item.importance ?? 0.5}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={val => updateItem(index, 'importance', val)}
                />

                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditingIndex(null)}>Gotowe</Button>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* ===== ADD NEW ===== */}
      {!isAdding && (
        <Button
          kind="ghost"
          icon={<Icon name="Plus" size="sm" />}
          onClick={() => setIsAdding(true)}
          className="w-full justify-center"
        >
          Dodaj nowy wpis
        </Button>
      )}

      {isAdding && (
        <>
          <Section>Dodaj nowy wpis</Section>

          <Input
            label="Label"
            value={newItem.label}
            onChange={val => setNewItem({ ...newItem, label: val })}
            autoFocus
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

          <div className="flex justify-end gap-2">
            <Button
              kind="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewItem({
                  label: '',
                  description: '',
                  importance: 0.5,
                });
              }}
            >
              Anuluj
            </Button>

            <Button
              kind="primary"
              onClick={() => {
                addItem();
                setIsAdding(false);
              }}
            >
              Dodaj
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
