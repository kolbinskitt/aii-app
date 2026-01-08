import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../db/rooms';
import useUserAiiki from '../db/aiiki';
import { Aiik } from '../types';
import useUser from '../hooks/useUser';
import { useAccessToken } from '../hooks/useAccessToken';
import { Popup, Button } from './ui';
import { useTranslation } from 'react-i18next';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const { t } = useTranslation();
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

  const disabled = !name || selectedAiiki.size === 0;

  return ReactDOM.createPortal(
    <Popup>
      <h2 className="text-3xl font-echo tracking-wide text-center text-gray-900 mb-4">
        {t('campfires.starting_new_campfire')}
        <div className="animate-pulse text-2xl mt-1">🔥🔥🔥</div>
      </h2>
      <div className="border-t border-gray-300 my-4" />
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t('campfires.starting_new_campfire.placeholder')}
        className="w-full bg-gray-100 p-2 outline-none mb-4 font-system"
      />
      <div>
        <h3 className="text-sm text-gray-600 mb-2">
          {t('campfires.choose_aiiki')}:
        </h3>
        <div className="space-y-1">
          {aiiki.map(aiik => (
            <label
              key={aiik.id}
              className="flex gap-2 p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedAiiki.has(aiik.id)}
                onChange={() => toggleAiik(aiik.id)}
              />
              <img
                src={`images/aiiki/avatars/${aiik.avatar_url}`}
                width={30}
                className="rounded-md"
              />
              <div>
                <div className="font-semibold">{aiik.name}</div>
                <div className="text-xs text-gray-500">{aiik.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-300 my-4" />
      <div className="flex justify-between">
        <Button onClick={onClose}>{t('cancel')}</Button>
        <div
          className="flex items-center space-x-2"
          title={disabled ? t('campfires.start_fire_hint') : ''}
        >
          <div>{disabled ? '🔒' : '🔥'}</div>
          <Button onClick={handleCreate} disabled={disabled} kind="fire">
            {t('campfires.start_fire')}
          </Button>
        </div>
      </div>
    </Popup>,
    document.body,
  );
}
