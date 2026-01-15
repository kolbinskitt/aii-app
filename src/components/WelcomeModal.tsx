'use client';

import { useRef, useState } from 'react';
import useUser from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { Popup, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import CreateCorZON, { CreateCorZONRef } from './CreateCorZON';
import { ArcheZON, OnboardingStage, ProcessingStep } from '@/types';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  onComplete?: () => void;
};

export default function WelcomeModal({ isOpen, onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const { user } = useUser();

  const createRef = useRef<CreateCorZONRef>(null);

  const [stage, setStage] = useState<OnboardingStage>('form');
  const [currentStep, setCurrentStep] =
    useState<ProcessingStep>('save-profile');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!createRef.current || !user?.id) return;

    const data = createRef.current.getForm();
    const now = new Date().toISOString();

    const conzon: ArcheZON = {
      ...data,
      meta: {
        version: '0.1',
        created_at: now,
        last_updated: now,
      },
    };

    setError(null);
    setStage('processing');
    setCurrentStep('save-profile');

    try {
      // 1️⃣ Zapis conzonu usera
      const { error } = await supabase.from('user_conzon').insert([
        {
          user_id: user.id,
          conzon,
          created_at: now,
        },
      ]);

      if (error) throw error;

      onComplete?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Nie udało się dokończyć onboardingu. Spróbuj ponownie.');
      setStage('form');
    }
  };

  if (!isOpen) return null;

  // ====== STAGE: FORM ======
  if (stage === 'form') {
    return (
      <Popup
        isOpen
        closeOnBackdropClick={false}
        title={t('welcome.hello')}
        primaryActions={
          <Button onClick={handleSubmit} kind="submit">
            {t('save')}
          </Button>
        }
      >
        <CreateCorZON ref={createRef} />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </Popup>
    );
  }

  // ====== STAGE: PROCESSING ======
  return (
    <Popup
      isOpen
      closeOnBackdropClick={false}
      title={t('welcome.processingTitle', 'Chwila…')}
    >
      <div className="flex flex-col items-center justify-center py-16 text-center gap-6">
        {/* Loader */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />

        {/* Dynamic text */}
        <div className="space-y-2 max-w-sm">
          {currentStep === 'save-profile' && (
            <>
              <p className="text-lg font-medium">Trwa zapis Twojego profilu</p>
              <p className="text-sm text-zinc-500">
                Twoje odpowiedzi zostały przyjęte
              </p>
            </>
          )}
          {currentStep === 'generate-aiiki' && (
            <>
              <p className="text-lg font-medium">
                Tworzymy pierwsze aiiki dla Ciebie
              </p>
              <p className="text-sm text-zinc-500">
                To może potrwać kilkanaście sekund
              </p>
            </>
          )}
          {currentStep === 'generate-avatars' && (
            <>
              <p className="text-lg font-medium">Aiiki nabierają kształtu</p>
              <p className="text-sm text-zinc-500">
                Tworzymy ich pierwszą formę
              </p>
            </>
          )}
        </div>
      </div>
    </Popup>
  );
}
