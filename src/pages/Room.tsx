import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRoomById, addMessageToRoom } from '../db/rooms';
import type { RoomWithMessages, Aiik } from '../types'; // dopasuj ścieżkę jeśli trzeba

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomWithMessages | null>(null);
  const [message, setMessage] = useState('');
  const [aiikThinking, setAiikThinking] = useState(false);

  async function fetchAiikResponse(
    prompt: string,
    aiik: Aiik,
  ): Promise<string | null> {
    console.log(aiik);
    try {
      const res = await fetch('http://localhost:1234/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          stream: false,
          name: aiik.name,
          description: aiik.description,
          persona: aiik.rezon,
        }),
      });
      const data = await res.json();
      return data.response ?? null;
    } catch (err) {
      console.error('Błąd AI:', err);
      return null;
    }
  }

  async function handleSend() {
    if (!id || message.trim() === '' || !room) return;

    const userMsg = message.trim();

    // 1️⃣ Zapisz wiadomość usera
    await addMessageToRoom(id, userMsg, 'user');

    // 2️⃣ Odśwież pokój (żeby UI był responsywny)
    const updatedRoom = await getRoomById(id);
    setRoom(updatedRoom as RoomWithMessages);

    setMessage('');
    setAiikThinking(true);

    if (room.room_aiiki && room.room_aiiki.length > 0) {
      // 4️⃣ Wybierz aiika (na razie losowo)
      const chosenAiik =
        room.room_aiiki[Math.floor(Math.random() * room.room_aiiki.length)];

      // 3️⃣ Pobierz odpowiedź AI
      const aiikResponse = await fetchAiikResponse(userMsg, chosenAiik.aiiki);

      if (aiikResponse) {
        // 5️⃣ Zapisz odpowiedź aiika z aiik_id
        await addMessageToRoom(id, aiikResponse, 'aiik', chosenAiik.aiiki.id);

        // 6️⃣ Odśwież pokój po odpowiedzi aiika
        const refreshedRoom = await getRoomById(id);
        setRoom(refreshedRoom as RoomWithMessages);
      }
    }

    setAiikThinking(false);
  }

  useEffect(() => {
    if (id) {
      getRoomById(id).then(data => {
        setRoom(data as RoomWithMessages);
      });
    }
  }, [id]);

  if (!room) {
    return <div className="p-6">Nie znaleziono pokoju.</div>;
  }

  console.log({ room });

  return (
    <div className="p-6 space-y-6" style={{ width: 800 }}>
      <h2 className="text-xl font-light">
        {room.name || '🌀 Bezimienny pokój'}
      </h2>
      {room.room_aiiki?.length > 0 && (
        <div className="text-xs text-neutral-400 italic">
          aiiki:{' '}
          {room.room_aiiki
            .map(a => a.aiiki)
            .map(a => a.name)
            .join(', ')}
        </div>
      )}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {room.messages_with_aiik.length ? (
          room.messages_with_aiik.map(msg => (
            <div
              key={msg.id}
              className={`text-sm border border-neutral-800 pb-1 ${
                msg.role === 'aiik'
                  ? 'text-rose-500'
                  : 'text-sky-400 text-right'
              }`}
              style={{ margin: 4, padding: 8 }}
            >
              {msg.aiik_name ? `${msg.aiik_name}:` : ''} {msg.text}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Brak wiadomości.</div>
        )}
        {aiikThinking && (
          <div className="text-sm text-neutral-500">Aiik pisze...</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 border border-neutral-700 rounded-md bg-transparent"
          placeholder="Napisz coś..."
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 border border-neutral-700 hover:bg-neutral-800 transition"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}
