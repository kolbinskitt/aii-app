import { supabase } from '../lib/supabase';
import {
  Room,
  RoomWithMessages,
  ArcheZON,
  Aiik,
  Message,
  Role,
  RelatiZON,
} from '@/types';
import { api } from '../lib/api';
import { saveFractalNode } from '@/lib/fractal/saveFractalNode';

/* ---------------------------------- */
/* Rooms                               */
/* ---------------------------------- */

export async function getAllRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Room[];
}

export async function getRoomById(
  id: string,
): Promise<RoomWithMessages | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(
      `
      *,
      messages_with_aiik(*),
      room_aiiki(
        *,
        aiiki(*),
        room_aiiki_relatizon(*)
      )
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  if (data?.messages_with_aiik) {
    data.messages_with_aiik.sort(
      (a: Message, b: Message) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return data;
}

/* ---------------------------------- */
/* Messages                            */
/* ---------------------------------- */

export async function addMessageToRoom(
  accessToken: string,
  roomId: string,
  message: {
    response: string;
    message_summary: string;
    response_summary: string;
  },
  role: Role,
  userId?: string,
  aiikId?: string,
  aiikName?: string,
  aiikAvatarUrl?: string,
) {
  // 1️⃣ Zapisz wiadomość
  const { error: messageError } = await supabase.from('messages').insert([
    {
      room_id: roomId,
      text: message.response,
      role,
      aiik_id: aiikId ?? null,
      user_id: userId ?? null,
      avatar_url: aiikAvatarUrl,
    },
  ]);

  if (messageError) {
    console.error('❌ Error adding message: ', messageError);
    return;
  }

  await saveFractalNode({
    accessToken,
    type: 'message',
    content: message.response,
    user_id: userId,
    aiik_id: aiikId,
    room_id: roomId,
  });

  if (!message.message_summary || !message.response_summary || !userId) return;

  // 3️⃣ Pobierz wszystkie aiiki w pokoju
  const { data: roomAiiki, error: roomAiikiError } = (await supabase
    .from('room_aiiki')
    .select('aiiki_with_conzon(id, name, conzon, description)')
    .eq('room_id', roomId)) as unknown as {
    data: { aiiki_with_conzon: Aiik }[];
    error: Error;
  };

  if (roomAiikiError || !roomAiiki?.length) return;

  const aiiki: Aiik[] = roomAiiki.map(r => r.aiiki_with_conzon).filter(Boolean);

  // 4️⃣ Pobierz conZON usera
  const { data: userConZONData } = await supabase
    .from('user_with_conzon')
    .select('conzon')
    .eq('id', userId)
    .order('conzon_created_at', { ascending: false })
    .limit(1)
    .single();

  const userConZON: ArcheZON = userConZONData?.conzon || {};

  // pobierz kontekst z pokoju
  const { data: roomMetaData } = await supabase
    .from('rooms')
    .select('meta')
    .eq('id', roomId)
    .single();

  const pastContexts: string[] = roomMetaData?.meta?.context ?? [];

  const res = await api('generate-relatizon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      aiiki,
      userConZON,
      pastContexts,
      message_event: {
        from: role,
        summary:
          role === 'user' ? message.message_summary : message.response_summary,
        signal: 'message' as const,
      },
    }),
  });
  const { relatizon: baseRelatizon } = await res.json();

  // 6️⃣ Aktualizacja per-aiik
  for (const aiik of aiiki) {
    const { data: link } = await supabase
      .from('room_aiiki')
      .select('id')
      .eq('room_id', roomId)
      .eq('aiik_id', aiik.id)
      .single();

    if (!link) continue;

    await supabase
      .from('room_aiiki_relatizon')
      .insert([
        {
          room_aiiki_id: link.id,
          relatizon: baseRelatizon,
          user_id: userId,
        },
      ])
      .select()
      .single();

    await saveFractalNode({
      accessToken,
      content: baseRelatizon,
      type: 'relatizon',
      aiik_id: role === 'aiik' ? aiik.id : undefined,
      user_id: userId,
      room_id: roomId,
    });
  }

  // 7️⃣ meta.context
  const { data: roomData } = await supabase
    .from('rooms')
    .select('meta')
    .eq('id', roomId)
    .single();

  const oldMeta = roomData?.meta || {};
  const context: string[] = oldMeta.context || [];

  await supabase
    .from('rooms')
    .update({
      meta: {
        ...oldMeta,
        context: [
          ...context,
          `${role === 'user' ? 'User' : `Aiik ${aiikName}`}: ${
            role === 'user' ? message.message_summary : message.response_summary
          }`,
        ].slice(-10),
      },
    })
    .eq('id', roomId);
}

/* ---------------------------------- */
/* Create room                         */
/* ---------------------------------- */

export async function createRoom(
  accessToken: string,
  id: string,
  name: string,
  aiikiIds: string[],
  userId: string,
): Promise<Room> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

  const { data: roomData } = await supabase
    .from('rooms')
    .insert([{ id, name, slug, user_id: userId }])
    .select()
    .single();

  // aiiki
  const { data: aiiki } = await supabase
    .from('aiiki_with_conzon')
    .select('id, name, conzon, description')
    .in('id', aiikiIds);

  // user conZON
  const { data: userConZONData } = await supabase
    .from('user_with_conzon')
    .select('conzon')
    .eq('id', userId)
    .order('conzon_created_at', { ascending: false })
    .limit(1)
    .single();

  const userConZON: ArcheZON = userConZONData?.conzon || {};

  const res = await api('generate-relatizon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      aiiki: aiiki || [],
      userConZON,
      pastContexts: [`Utworzono pokój: ${roomData.name}`],
      message_event: {
        from: 'user',
        summary: 'Room created',
        signal: 'room_created' as const,
      },
    }),
  });
  const { relatizon: baseRelatizon }: { relatizon: RelatiZON } =
    await res.json();

  for (const aiik of aiiki || []) {
    const { data: link } = await supabase
      .from('room_aiiki')
      .insert([
        {
          room_id: roomData.id,
          aiik_id: aiik.id,
        },
      ])
      .select()
      .single();

    const relatizon: RelatiZON = {
      ...baseRelatizon,
      interaction_event: {
        ...baseRelatizon.interaction_event,
        message_event: {
          from: 'user',
          summary: name,
          signal: 'room_created' as const,
        },
      },
    };

    await supabase
      .from('room_aiiki_relatizon')
      .insert([
        {
          room_aiiki_id: link.id,
          user_id: userId,
          relatizon,
        },
      ])
      .select()
      .single();

    await saveFractalNode({
      accessToken,
      content: relatizon,
      type: 'relatizon',
      room_id: roomData.id,
      user_id: userId,
    });
  }

  return roomData;
}
