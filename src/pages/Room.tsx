import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getRoomById, addMessageToRoom } from '../db/rooms';
import type { RoomWithMessages, Aiik } from '../types';
import useUser from '../hooks/useUser';
import { useAccessToken } from '../hooks/useAccessToken';
import { supabase } from '../lib/supabase';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import {
  BottomTile,
  Message,
  MessageArea,
} from '@/components/ui/room/RoomComponents';

export default function Room() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomWithMessages | null>(null);
  const [message, setMessage] = useState('');
  const [aiikThinking, setAiikThinking] = useState(false);
  const [thinkingAiiki, setThinkingAiiki] = useState<Record<string, Aiik>>({});
  const user = useUser();
  const accessToken = useAccessToken();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages_with_aiik]);

  async function fetchAiikResponse(
    prompt: string,
    aiik: Aiik,
  ): Promise<{
    response: string;
    message_summary: string;
    response_summary: string;
  } | null> {
    try {
      const systemMessage = {
        role: 'system' as const,
        content: `
Jesteś Aiikiem – rezonansową postacią wspierającą użytkownika. Twoja odpowiedź powinna być naturalna, empatyczna i zgodna z osobowością Aiika.

Zwróć **tylko poprawny JSON** w formacie:

{
  "response": "...",             // Twoja odpowiedź jako Aiika
  "message_summary": "...",      // Krótkie podsumowanie wiadomości użytkownika – w trzeciej osobie
  "response_summary": "..."      // Krótkie podsumowanie Twojej odpowiedzi – opisowo, w trzeciej osobie (np. "Aiik zapytał...", "Aiik zauważył...", "Aiik odpowiedział...")
}

Pamiętaj:
– **Nie mówisz** bezpośrednio do użytkownika w podsumowaniach.
– **Nie używaj drugiej osoby ("ty", "twój")** w żadnym z pól \`*_summary\`.

Aiik: ${aiik.name}
Opis: ${aiik.description}
Osobowość: ${aiik.conzon}
`.trim(),
      };

      const userMessage = {
        role: 'user' as const,
        content: prompt,
      };

      const res = await api('gpt-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [systemMessage, userMessage],
          purpose: 'aiik-message',
        }),
      });

      const { content } = await res.json();

      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        response: parsed.response,
        message_summary: parsed.message_summary,
        response_summary: parsed.response_summary,
      };
    } catch (err) {
      console.error('❌ Błąd AI (parse or fetch):', err);
      return null;
    }
  }

  async function handleSend() {
    if (!id || message.trim() === '' || !room) return;

    const userMsg = message.trim();

    // 2️⃣ Odśwież pokój (żeby UI był responsywny)
    const updatedRoom = await getRoomById(id);
    setRoom(updatedRoom as RoomWithMessages);
    setMessage('');
    setAiikThinking(true);

    if (room.room_aiiki && room.room_aiiki.length > 0) {
      // 4️⃣ Wybierz aiika (na razie losowo)
      const chosenAiik =
        room.room_aiiki[Math.floor(Math.random() * room.room_aiiki.length)];

      setThinkingAiiki(prev => ({
        ...prev,
        [chosenAiik.aiiki.id]: chosenAiik.aiiki,
      }));

      // 3️⃣ Pobierz odpowiedź AI
      const aiikResponse = await fetchAiikResponse(userMsg, chosenAiik.aiiki);

      if (aiikResponse) {
        // 1️⃣ Zapisz wiadomość usera
        await addMessageToRoom(
          accessToken!,
          id,
          {
            response: userMsg,
            message_summary: aiikResponse.message_summary,
            response_summary: aiikResponse.response_summary,
          },
          'user',
          user.user?.id,
        );

        // 5️⃣ Zapisz odpowiedź aiika z aiik_id
        await addMessageToRoom(
          accessToken!,
          id,
          aiikResponse,
          'aiik',
          user.user?.id,
          chosenAiik.aiiki.id,
          chosenAiik.aiiki.name,
          chosenAiik.aiiki.avatar_url,
        );

        // 6️⃣ Odśwież pokój po odpowiedzi aiika
        const refreshedRoom = await getRoomById(id);
        setRoom(refreshedRoom as RoomWithMessages);

        setThinkingAiiki(prev => {
          const updated = { ...prev };
          delete updated[chosenAiik.aiiki.id];
          return updated;
        });
      }
    }

    setAiikThinking(false);
  }

  useEffect(() => {
    if (!id) return;

    // 1️⃣ Fetch initial room
    getRoomById(id).then(data => {
      setRoom(data as RoomWithMessages);
    });

    // 2️⃣ Subskrybuj wiadomości
    const channel = supabase
      .channel(`room-${id}-messages`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${id}`,
        },
        async () => {
          const updated = await getRoomById(id);
          setRoom(updated as RoomWithMessages);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (!room) {
    return <div className="p-6">Nie znaleziono pokoju.</div>;
  }

  return (
    <div className="relative w-full">
      <MessageArea room={room}>
        {aiikThinking &&
          Object.values(thinkingAiiki).map(aiik => (
            <Message key={aiik.id} aiikAvatar={aiik.avatar_url} role="aiik">
              {aiik.name} {t('chat.writing')}...
            </Message>
          ))}
      </MessageArea>
      <BottomTile
        value={message}
        onChange={setMessage}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        onClick={handleSend}
      />
    </div>
  );
}
