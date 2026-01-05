import { supabase } from '../lib/supabase';
import { Room, RoomWithMessages, HumZON, RelatiZON, Aiik } from '../types';

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
        aiiki(*)
      )
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  if (data?.messages_with_aiik) {
    data.messages_with_aiik.sort(
      (a: any, b: any) =>
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
  text: string,
  role: 'user' | 'aiik',
  userId?: string,
  aiikId?: string,
  aiikName?: string,
) {
  // 1️⃣ Zapisz wiadomość
  const { error: messageError } = await supabase.from('messages').insert([
    {
      room_id: roomId,
      text,
      role,
      aiik_id: aiikId ?? null,
      user_id: userId ?? null,
    },
  ]);

  if (messageError) {
    console.error('❌ Error adding message:', messageError);
    return;
  }

  // 2️⃣ Streszczenie GPT
  const systemPrompt =
    role === 'user'
      ? 'Stwórz bardzo krótkie streszczenie tego, co powiedział użytkownik.'
      : 'Stwórz bardzo krótkie streszczenie tego, co powiedział aiik.';

  const response = await fetch('http://localhost:1234/gpt-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    }),
  });

  const { content: summary } = await response.json();

  if (!summary || !userId) return;

  // 3️⃣ Pobierz wszystkie aiiki w pokoju
  const { data: roomAiiki, error: roomAiikiError } = (await supabase
    .from('room_aiiki')
    .select('aiiki(id, name, rezon, description)')
    .eq('room_id', roomId)) as unknown as {
    data: { aiiki: Aiik }[];
    error: any;
  };

  if (roomAiikiError || !roomAiiki?.length) return;

  const aiiki: Aiik[] = roomAiiki.map(r => r.aiiki).filter(Boolean);

  // 4️⃣ Pobierz humZON usera
  const { data: humzonData } = await supabase
    .from('user_humzon')
    .select('humzon')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const humZON: HumZON = humzonData?.humzon || {};

  // pobierz kontekst z pokoju
  const { data: roomMetaData } = await supabase
    .from('rooms')
    .select('meta')
    .eq('id', roomId)
    .single();

  const pastContexts: string[] = roomMetaData?.meta?.context ?? [];

  const res = await fetch('http://localhost:1234/generate-relatizon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      aiiki,
      humzon: humZON,
      pastContexts,
      message_event: {
        from: role,
        summary,
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
        },
      ])
      .select()
      .single();
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
          `${role === 'user' ? 'User' : `Aiik ${aiikName}`}: ${summary}`,
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
    .from('aiiki')
    .select('id, name, rezon, description')
    .in('id', aiikiIds);

  // humZON
  const { data: humzonData } = await supabase
    .from('user_humzon')
    .select('humzon')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const humZON: HumZON = humzonData?.humzon || {};

  const res = await fetch('http://localhost:1234/generate-relatizon', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      aiiki: aiiki || [],
      humzon: humZON,
      pastContexts: [`Utworzono pokój: ${roomData.name}`],
      message_event: {
        from: 'user',
        summary: 'Room created',
        signal: 'room_created' as const,
      },
    }),
  });
  const { relatizon: baseRelatizon } = await res.json();

  for (const aiik of aiiki || []) {
    const { data: link } = await supabase
      .from('room_aiiki')
      .insert([{ room_id: roomData.id, aiik_id: aiik.id }])
      .select()
      .single();

    await supabase
      .from('room_aiiki_relatizon')
      .insert([
        {
          room_aiiki_id: link.id,
          relatizon: {
            ...baseRelatizon,
            message_event: {
              from: 'user',
              summary: `Utworzono pokój "${name}"`,
              signal: 'room_created' as const,
            },
          },
        },
      ])
      .select()
      .single();
  }

  return roomData;
}
