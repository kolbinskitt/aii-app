import { useEffect, useState } from 'react';
import useUser from '../hooks/useUser';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAccessToken } from '../hooks/useAccessToken';

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
  const accessToken = useAccessToken();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const humzonId = uuidv4();

    try {
      // 1️⃣ Call GPT proxy
      const gptRes = await fetch('http://localhost:1234/gpt-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          temperature: 0.6,
          messages: [
            {
              role: 'system',
              content: `
Jesteś projektantem struktur Jaźni w systemie AI. Twoim zadaniem jest przekształcić jedno zdanie użytkownika w pełny JSON o strukturze humZON.

Oto przykład poprawnej struktury humZON:

{
  "identity": {
    "self_sentence": "Czuję więcej niż potrafię powiedzieć.",
    "name": null,
    "gender": null,
    "language": "pl",
    "labels": ["introwertyk", "wrażliwy"]
  },
  "currentState": {
    "mood": "withdrawn",
    "energy": 0.3,
    "risk": 0.1,
    "openness": 0.6,
    "activeAiik": null
  },
  "emotionalHistory": [
    {
      "at": "2026-01-04T13:00:00Z",
      "state": "initial",
      "trigger": "first_login",
      "note": "First self-definition"
    }
  ],
  "keyMoments": {
    "firstContact": "2026-01-04T13:00:00Z",
    "breakdowns": [],
    "redemptions": [],
    "silences": []
  },
  "trust": {
    "aiiki": {},
    "system": 0.5
  },
  "triggers": ["nadmiar bodźców", "krytyka"],
  "protections": ["samotność", "muzyka"],
  "notes": {
    "internal": null,
    "user_visible": null
  }
}

Twoja odpowiedź ma być wyłącznie takim JSONem, bez komentarzy ani wyjaśnień.
`,
            },
            {
              role: 'user',
              content: sentence,
            },
          ],
        }),
      });

      const { content } = await gptRes.json();
      const parsedHumzon = JSON.parse(content);

      // 2️⃣ Uzupełnij brakujące metadane
      const fullHumzon = {
        ...parsedHumzon,
        meta: {
          humzon_id: humzonId,
          version: '0.1',
          created_at: now,
          last_updated: now,
        },
      };

      // 3️⃣ Zapisz do Supabase
      const { error } = await supabase.from('user_humzon').insert([
        {
          id: humzonId,
          user_id: user?.id,
          hum_zon: fullHumzon,
          created_at: now,
        },
      ]);

      if (error) throw error;

      onComplete();
      onClose();
    } catch (err) {
      console.error('humZON creation error:', err);
      setError('Nie udało się zapisać. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white' }}
    >
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
