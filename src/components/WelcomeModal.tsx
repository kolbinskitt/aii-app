import { useState } from 'react';
import useUser from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function WelcomeModal({
  isOpen,
  onClose,
  onComplete,
}: WelcomeModalProps) {
  const { user } = useUser();
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const humzonId = uuidv4();
    const now = new Date().toISOString();

    const payload = {
      meta: {
        humzon_id: humzonId,
        version: '0.1',
        created_at: now,
        last_updated: now,
      },
      identity: {
        self_sentence: sentence,
        name: null,
        gender: null,
        language: 'pl',
        labels: [],
      },
      currentState: {
        mood: 'unknown',
        energy: 0.5,
        risk: 0.0,
        openness: 0.5,
        activeAiik: null,
      },
      emotionalHistory: [
        {
          at: now,
          state: 'initial',
          trigger: 'first_login',
          note: 'First self-definition',
        },
      ],
      keyMoments: {
        firstContact: now,
        breakdowns: [],
        redemptions: [],
        silences: [],
      },
      trust: {
        aiiki: {},
        system: 0.5,
      },
      triggers: [],
      protections: [],
      notes: {
        internal: null,
        user_visible: null,
      },
    };

    const { error } = await supabase.from('user_humzon').insert([
      {
        id: humzonId,
        user_id: user?.id,
        hum_zon: payload,
        created_at: now,
      },
    ]);

    setLoading(false);

    if (error) {
      setError('Nie udało się zapisać. Spróbuj ponownie.');
    } else {
      onComplete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Witaj w przestrzeni Jaźni</h2>
        <p className="mb-4 text-sm text-zinc-500">
          W jednym lub kilku zdaniach scharakteryzuj siebie. To początek Twojego
          humZONu.
        </p>
        <textarea
          value={sentence}
          onChange={e => setSentence(e.target.value)}
          placeholder="Np. Czuję więcej, niż potrafię powiedzieć."
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded p-2 h-24 resize-none"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:underline"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !sentence.trim()}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Zapisuję...' : 'Zapisz'}
          </button>
        </div>
      </div>
    </div>
  );
}
