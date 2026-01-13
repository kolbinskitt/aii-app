import { Link, useParams } from 'react-router-dom';
import {
  useEffect,
  useState,
  useRef,
  KeyboardEventHandler,
  MouseEventHandler,
  PropsWithChildren,
} from 'react';
import { getRoomById, addMessageToRoom } from '../db/rooms';
import type { RoomWithMessages, Aiik, Role } from '../types';
import useUser from '../hooks/useUser';
import { useAccessToken } from '../hooks/useAccessToken';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { Button, Tile, Input } from '../components/ui';

function TopTile({ room }: { room: RoomWithMessages | null }) {
  const { t } = useTranslation();
  return !room ? null : (
    <Tile className="space-y-1 p-2">
      <h2
        className="text-2xl font-echo text-gray-800 leading-snug font-semibold truncate"
        style={{
          maxWidth: 'calc(100vw - 500px)',
        }}
      >
        {room.name || '🌀'}
      </h2>
      <div className="flex w-full justify-between items-start text-xs text-neutral-500 tracking-wide">
        <div>
          {t('chat.aiiki_near_campfire')}:{' '}
          <span className="text-neutral-600">
            {room.room_aiiki?.map(a => a.aiiki.name).join(', ')}
          </span>
        </div>
        <Link
          to={`/room/${room.id}/field`}
          className="text-blue-500 whitespace-nowrap"
        >
          {t('chat.see_field')}
        </Link>
      </div>
      {room.messages_with_aiik.length === 0 && (
        <div className="text-sm text-muted-foreground">
          {t('chat.no_stories')}
        </div>
      )}
    </Tile>
  );
}

function Message({
  children,
  role,
  aiikAvatar,
}: PropsWithChildren<{ role: Role; aiikAvatar: string }>) {
  const marginH = -12;
  const marginV = -4;
  const borderRadius = '0.5rem';
  const width = 40;
  const maxHeight = 60;

  return (
    <div
      className={`!p-2 !pl-4 !pr-4 font-system rounded-md ${
        role === 'user' ? 'bg-blue-700' : ''
      }`}
      style={{
        display: 'flex',
        gap: 8,
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        color: role === 'user' ? 'white' : 'white',
      }}
    >
      {role === 'aiik' && (
        <img
          src={aiikAvatar}
          width={width}
          className="object-cover"
          style={{
            marginTop: marginV,
            marginLeft: marginH,
            marginBottom: marginV,
            borderRadius,
            maxHeight,
          }}
        />
      )}
      {children}
    </div>
  );
}

function MessageArea({
  room,
  children,
}: PropsWithChildren<{ room: RoomWithMessages | null }>) {
  return !room ? null : (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 128px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingBottom: 8,
      }}
    >
      <TopTile room={room} />
      {room.messages_with_aiik.length > 0 &&
        room.messages_with_aiik.map(msg => (
          <Message
            key={msg.id}
            role={msg.role}
            aiikAvatar={msg.aiik_avatar_url}
          >
            {msg.text}
          </Message>
        ))}
      {children}
    </div>
  );
}

function BottomTile({
  value,
  onChange,
  onKeyDown,
  onClick,
}: {
  value: string;
  onChange: (_val: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  return (
    <Tile
      className="fixed z-100"
      styles={{
        bottom: 14,
        right: 8,
        left: 328,
      }}
    >
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          // className="flex-1 px-4 py-2 border border-neutral-300 rounded-md bg-white
          // focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm font-system"
          placeholder={t('chat.write_something')}
          onKeyDown={onKeyDown}
        />
        <Button onClick={onClick} kind="primary">
          {t('chat.send')}
        </Button>
      </div>
    </Tile>
  );
}

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
  ): Promise<string | null> {
    try {
      // 🧠 buduj systemowy prompt
      const systemMessage = {
        role: 'system' as const,
        content: `
[Uwaga: Aiik to rezonansowa postać wspierająca użytkownika. Ma unikalną osobowość i styl odpowiadania.]

Aiik: ${aiik.name}
Opis Aiika: ${aiik.description}
Osobowość Aiika: ${aiik.conzon}

[Wiadomość od użytkownika]
      `.trim(),
      };

      // 🧠 prompt usera jako wiadomość
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
          log: true, // można potem wykorzystać
          user_id: user?.user?.id, // jeśli potrzebne do logowania
          purpose: 'aiik-message', // można potem rozwinąć w backendzie
        }),
      });

      const data = await res.json();
      return data.content ?? null;
    } catch (err) {
      console.error('❌ Błąd AI:', err);
      return null;
    }
  }

  async function handleSend() {
    if (!id || message.trim() === '' || !room) return;

    const userMsg = message.trim();

    // 1️⃣ Zapisz wiadomość usera
    await addMessageToRoom(
      accessToken!,
      id,
      userMsg,
      'user',
      user.user?.id,
      // tutaj powinniśmy przekazać aiik id
      // tutaj powinniśmy przekazać aiik name
    );

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
