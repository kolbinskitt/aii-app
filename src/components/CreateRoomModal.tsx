import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../db/rooms';
import useGlobalAiiki from '../db/aiiki';
import { Aiik } from '../types';
import useUser from '../hooks/useUser';
import { useAccessToken } from '../hooks/useAccessToken';
import { Popup, Button, Input, Checkbox } from './ui';
import { useTranslation } from 'react-i18next';

type Props = {
  onClose: () => void;
};

export default function CreateRoomModal({ onClose }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [aiiki, setAiiki] = useState<Aiik[]>([]);
  const [selectedAiiki, setSelectedAiiki] = useState<Set<string>>(new Set());
  const globalAiiki = useGlobalAiiki();
  const navigate = useNavigate();
  const user = useUser();
  const accessToken = useAccessToken();
  const [opened, setOpened] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setAiiki(globalAiiki);
  }, [globalAiiki]);

  useEffect(() => {
    setDisabled(!name || selectedAiiki.size === 0);
  }, [name, selectedAiiki]);

  const toggleAiik = (id: string) => {
    setSelectedAiiki(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  async function handleCreate() {
    if (user.user) {
      setDisabled(true);
      setSaving(true);
      const id = crypto.randomUUID();
      const aiikiIds = Array.from(selectedAiiki);
      await createRoom(accessToken!, id, name, aiikiIds, user.user.id);
      navigate(`/room/${id}`);
      setOpened(false);
    }
  }

  return ReactDOM.createPortal(
    <Popup
      isOpen={opened}
      title={t('campfires.starting_new_campfire')}
      primaryActions={
        <div
          className="flex items-center space-x-2"
          title={disabled ? t('campfires.start_fire_hint') : ''}
        >
          <Button
            onClick={handleCreate}
            disabled={disabled}
            kind="primary"
            loading={saving}
          >
            {t('campfires.start_fire')}
          </Button>
        </div>
      }
      secondaryActions={<Button onClick={onClose}>{t('cancel')}</Button>}
      onClose={onClose}
    >
      <Input
        value={name}
        onChange={v => setName(v)}
        placeholder={t('campfires.starting_new_campfire.placeholder')}
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
              <Checkbox
                checked={selectedAiiki.has(aiik.id)}
                onChange={() => toggleAiik(aiik.id)}
              />
              <img src={aiik.avatar_url} width={130} className="rounded-md" />
              <div>
                <div className="font-semibold">{aiik.name}</div>
                <div className="text-xs text-gray-500">{aiik.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </Popup>,
    document.body,
  );
}
