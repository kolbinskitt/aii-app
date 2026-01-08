import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../db/rooms';
import useUserAiiki from '../db/aiiki';
import { Aiik } from '../types';
import useUser from '../hooks/useUser';
import { useAccessToken } from '../hooks/useAccessToken';
import { Popup } from './ui';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [aiiki, setAiiki] = useState<Aiik[]>([]);
  const [selectedAiiki, setSelectedAiiki] = useState<Set<string>>(new Set());
  const userAiiki = useUserAiiki();
  const navigate = useNavigate();
  const user = useUser();
  const accessToken = useAccessToken();

  useEffect(() => {
    setAiiki(userAiiki);
  }, [userAiiki]);

  const toggleAiik = (id: string) => {
    setSelectedAiiki(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  async function handleCreate() {
    if (user.user) {
      const id = crypto.randomUUID();
      const aiikiIds = Array.from(selectedAiiki);
      await createRoom(accessToken!, id, name, aiikiIds, user.user.id);
      navigate(`/room/${id}`);
    }
  }

  return ReactDOM.createPortal(
    <Popup>
      <div className="text-black p-6 shadow-2xl rounded-lg overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Nowy pokój</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nazwa pokoju"
          className="w-full bg-gray-100 p-2 outline-none mb-4"
        />
        <div>
          <h3 className="text-sm text-gray-600 mb-2">Wybierz aiiki:</h3>
          <div className="space-y-1">
            {aiiki.map(aiik => (
              <label
                key={aiik.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedAiiki.has(aiik.id)}
                  onChange={() => toggleAiik(aiik.id)}
                />
                <div>
                  <div className="font-semibold">{aiik.name}</div>
                  <div className="text-xs text-gray-500">
                    {aiik.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button onClick={onClose}>Anuluj</button>
          <button
            onClick={handleCreate}
            disabled={!name || selectedAiiki.size === 0}
          >
            Utwórz
          </button>
        </div>
      </div>
    </Popup>,
    document.body,
  );
}
