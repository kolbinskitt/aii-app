'use client';

import { useRef, useState } from 'react';
import useUser from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Popup, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import CreateCorZON, { CreateCorZONRef } from './CreateCorZON';
import { generateAndSaveAiikiForUser } from '@/utils/generateAndSaveAiikiForNewUser';
import { ArcheZON } from '@/types';
import { useAccessToken } from '@/hooks/useAccessToken';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  onComplete?: () => void;
};

export default function WelcomeModal({ isOpen, onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const { user } = useUser();
  const createRef = useRef<CreateCorZONRef>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAccessToken();

  const handleSubmit = async () => {
    if (!createRef.current) return;

    const data = createRef.current.getForm();
    const now = new Date().toISOString();
    const id = uuidv4();

    setLoading(true);
    setError(null);

    const conzon: ArcheZON = {
      ...data,
      meta: {
        version: '0.1',
        created_at: now,
        last_updated: now,
        core_id: id,
      },
    };

    try {
      const { error } = await supabase.from('user_conzon').insert([
        {
          user_id: user?.id,
          conzon,
          created_at: now,
        },
      ]);

      if (error) throw error;

      if (!user?.id) {
        throw new Error('User ID is required to generate Aiiki');
      }

      await generateAndSaveAiikiForUser(conzon, user?.id, 3, accessToken);
      onComplete?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Popup
      isOpen
      closeOnBackdropClick={false}
      title={t('welcome.hello')}
      primaryActions={
        <Button onClick={handleSubmit} disabled={loading} kind="submit">
          {loading ? t('saving') : t('save')}
        </Button>
      }
    >
      <CreateCorZON ref={createRef} />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </Popup>
  );
}
