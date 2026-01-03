import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../db/rooms';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  async function handleCreate() {
    const slug = slugify(name);
    const id = crypto.randomUUID();

    await createRoom({ id, name, slug });
    navigate(`/room/${slug}`);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-neutral-900 p-6 space-y-4 w-80">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nazwa pokoju"
          className="w-full bg-neutral-800 p-2 outline-none"
        />
        <div className="flex justify-between">
          <button onClick={onClose}>Anuluj</button>
          <button onClick={handleCreate} disabled={!name}>
            Utwórz
          </button>
        </div>
      </div>
    </div>
  );
}
