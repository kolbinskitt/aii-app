'use client';

import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Icon from './Icon';
import IconButton from './IconButton';

type InputListProps = {
  title?: string;
  items: string[];
  onChange: (_items: string[]) => void;
};

export default function InputList({ title, items, onChange }: InputListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditedValue('');
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditedValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null || !editedValue.trim()) return;
    const updated = [...items];
    updated[editingIndex] = editedValue.trim();
    onChange(updated);
    setEditingIndex(null);
    setEditedValue('');
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-2">
      {title && <div className="font-semibold">{title}</div>}

      {/* ===== LIST ===== */}
      <div className="divide-y divide-border">
        {items.map((item, index) => {
          const isEditing = editingIndex === index;

          return (
            <div key={index} className="py-2">
              {/* ===== VIEW MODE ===== */}
              {!isEditing && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-sm">{item}</div>

                  <div className="flex shrink-0">
                    <IconButton
                      aria-label="Edit"
                      icon={<Icon name="PencilSimple" size="sm" />}
                      onClick={() => startEdit(index)}
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
              )}

              {/* ===== EDIT MODE ===== */}
              {isEditing && (
                <div className="space-y-2">
                  <Input
                    value={editedValue}
                    onChange={setEditedValue}
                    className="w-full"
                    autoFocus
                  />

                  <div className="flex justify-end gap-2">
                    <Button kind="ghost" onClick={() => setEditingIndex(null)}>
                      Anuluj
                    </Button>
                    <Button kind="primary" onClick={saveEdit}>
                      OK
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== ADD NEW ===== */}
      {!isAdding && (
        <Button
          className="w-full"
          kind="ghost"
          icon={<Icon name="Plus" size="sm" />}
          onClick={() => setIsAdding(true)}
        >
          Dodaj nową zasadę
        </Button>
      )}

      {isAdding && (
        <div className="space-y-2">
          <Input
            value={newItem}
            onChange={setNewItem}
            className="w-full"
            placeholder="Nowa zasada"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button kind="ghost" onClick={() => setIsAdding(false)}>
              Anuluj
            </Button>
            <Button kind="primary" onClick={addItem}>
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
