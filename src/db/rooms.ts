import { supabase } from '../lib/supabase';
import { Room, RoomWithMessages, HumZON } from '../types';
import { generateRelatizon } from '../utils/generateRelatizon';

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
      messages_with_aiik(
        *
      ),
      room_aiiki (
        *,
        aiiki (*)
      )
    `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  // 🧼 Ręczne sortowanie messages (jeśli Supabase nie wspiera zagnieżdżonego order)
  if (data?.messages_with_aiik) {
    data.messages_with_aiik.sort(
      (a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return data;
}

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
  const { error } = await supabase.from('messages').insert([
    {
      room_id: roomId,
      text,
      role,
      aiik_id: aiikId ?? null,
      user_id: userId,
    },
  ]);

  if (error) {
    console.error('❌ Error adding message to room:', error);
    return;
  }

  // 2️⃣ Przygotuj prompt do GPT
  const systemPrompt =
    role === 'user'
      ? 'Stwórz bardzo krótkie streszczenie tego, co powiedział użytkownik. Nie cytuj. Nie oceniaj.'
      : 'Stwórz bardzo krótkie streszczenie tego, co powiedział aiik. Nie cytuj. Nie oceniaj.';

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

  if (!summary) {
    console.warn('⚠️ GPT summary failed or was empty.');
    return;
  }

  // 3️⃣ Pobierz meta.context[] pokoju
  const { data: roomData, error: metaError } = await supabase
    .from('rooms')
    .select('meta')
    .eq('id', roomId)
    .single();

  if (metaError || !roomData) {
    console.error('❌ Error fetching room meta:', metaError);
    return;
  }

  const oldMeta = roomData.meta || {};
  const context: string[] = oldMeta.context || [];

  // 4️⃣ Dodaj nowe streszczenie (max 10 wpisów)
  const newContext = [
    ...context,
    `${role === 'user' ? 'User' : `Aiik ${aiikName}`}: ${summary}`,
  ].slice(-10);

  // 5️⃣ Zapisz nową wersję meta.context[]
  const { error: updateError } = await supabase
    .from('rooms')
    .update({ meta: { ...oldMeta, context: newContext } })
    .eq('id', roomId);

  if (updateError) {
    console.error('❌ Error updating room meta.context:', updateError);
  } else {
    console.log('🧠 Updated room.context[]:', summary);
  }
}

export async function createRoom(
  id: string,
  name: string,
  aiikiIds: string[],
  userId: string,
): Promise<Room> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

  const { data, error } = await supabase
    .from('rooms')
    .insert([
      {
        id,
        name,
        slug,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error || !data) throw error ?? new Error('Room creation failed');

  // 🧠 Pobierz ostatni humZON usera
  const { data: humzonData } = await supabase
    .from('user_humzon')
    .select('humzon')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const humZON: HumZON = humzonData?.humzon || {};

  // 🔁 Przetwórz każde aiikiId do linku z relatizon
  const aiikiLinks = [];

  for (const aiik_id of aiikiIds) {
    const { data: aiikData, error: aiikError } = await supabase
      .from('aiiki')
      .select('id, name, rezon, description')
      .eq('id', aiik_id)
      .single();

    if (aiikError || !aiikData) {
      console.warn(`⚠️ Failed to fetch aiik ${aiik_id}, skipping.`);
      continue;
    }

    // Nie mamy jeszcze żadnego past context – to pierwszy pokój
    const relatizon = generateRelatizon(aiikData, humZON, []);

    aiikiLinks.push({
      room_id: data.id,
      aiik_id,
      relatizon,
    });
  }

  if (aiikiLinks.length > 0) {
    const { error: linkError } = await supabase
      .from('room_aiiki')
      .insert(aiikiLinks);

    if (linkError) throw linkError;
  }

  return data;
}
