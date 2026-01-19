import { supabase } from '@/lib/supabase';
import { Role, ArcheZON, Aiik, MemoryFragment } from '@/types';
import { saveFractalNode } from '@/lib/fractal/saveFractalNode';
import { api } from '@/lib/api';
import { getRelatesToFromMemory } from './getRelatesToFromMemory';

export async function addMessageToRoom(
  accessToken: string,
  roomId: string,
  message: {
    response: string;
    message_summary: string;
    response_summary: string;
    user_memory: MemoryFragment[];
    aiik_memory: MemoryFragment[];
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

  const messageRelatesTo = getRelatesToFromMemory([
    ...message.user_memory,
    ...message.aiik_memory,
  ]);

  await saveFractalNode({
    accessToken,
    type: 'message',
    content: message.response,
    user_id: userId,
    aiik_id: aiikId,
    room_id: roomId,
    relates_to: messageRelatesTo,
  });

  if (!message.message_summary || !message.response_summary || !userId) return;

  // 2️⃣ Zapisz user_memory i aiik_memory jako fractal_node
  const memoryFragments = [
    ...(role === 'user'
      ? message.user_memory.map(mem => ({
          ...mem,
          type: 'user_memory' as const,
          user_id: userId,
          aiik_id: null,
        }))
      : []),
    ...(role === 'aiik'
      ? message.aiik_memory.map(mem => ({
          ...mem,
          type: 'aiik_memory' as const,
          user_id: userId,
          aiik_id: aiikId ?? null,
        }))
      : []),
  ];

  for (const fragment of memoryFragments) {
    await saveFractalNode({
      accessToken,
      type: fragment.type,
      content: fragment.content,
      interpretation: fragment.interpretation,
      reason: fragment.reason,
      weight: fragment.weight,
      tags: fragment.tags,
      traits: fragment.traits,
      relates_to: fragment.relates_to,
      user_id: fragment.user_id,
      aiik_id: fragment.aiik_id ?? undefined,
      room_id: roomId,
    });
  }

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
