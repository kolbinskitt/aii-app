import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getRoomById } from '@/helpers/getRoomById';
import type { RoomWithMessages } from '@/types';
import useUser from '@/hooks/useUser';
import { useAccessToken } from '@/hooks/useAccessToken';
import { supabase } from '@/lib/supabase';
import { BottomTile, MessageArea } from '@/components/ui/room/RoomComponents';
import { Card, LoaderFullScreen } from '@/components/ui';
import { handleAiikiResponses } from '@/helpers/handleAiikiResponses';
import { TypingDots } from '@/components/ui';

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomWithMessages | null>(null);
  const [message, setMessage] = useState('');
  const [aiikiThinking, setAiikiThinking] = useState(false);
  const user = useUser();
  const accessToken = useAccessToken();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = user.user?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  useEffect(() => {
    if (!id) return;

    // 1️⃣ Fetch initial room
    getRoomById(id).then(data => {
      setRoom(data as RoomWithMessages);
      setLoading(false);
    });

    // 2️⃣ Subskrybuj wiadomości
    const channel = supabase
      .channel(`room-${id}-fractal-node-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fractal_node',
          filter: `room_id=eq.${id}`,
        },
        async payload => {
          const newRow = payload.new;
          const isMessage = newRow?.type === 'message';
          const isSaid = newRow?.said === true;

          if (isMessage && isSaid) {
            const updated = await getRoomById(id);
            setRoom(updated as RoomWithMessages);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  async function handleSend() {
    if (!accessToken) {
      console.error('Brak accessToken');
      return;
    }

    if (!userId || !id || message.trim() === '' || !room) return;

    setAiikiThinking(true);
    const userMsg = message.trim();
    setMessage('');
    setRoom({
      ...room,
      messages: [
        ...room.messages,
        {
          id: '',
          content: userMsg,
          aiik_id: '',
        },
      ],
    });

    if (room.room_aiiki && room.room_aiiki.length > 0) {
      await handleAiikiResponses(
        accessToken,
        room.room_aiiki.map(({ aiiki_with_conzon }) => aiiki_with_conzon),
        userMsg,
        userId,
        id,
      );
      setAiikiThinking(false);
    }
  }

  if (loading) {
    return <LoaderFullScreen />;
  }

  if (!loading && !room) {
    return <Card>Nie znaleziono pokoju.</Card>;
  }

  return (
    <div className="relative w-full">
      <MessageArea room={room}>
        {aiikiThinking && <TypingDots />}
        <div ref={bottomRef} />
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
