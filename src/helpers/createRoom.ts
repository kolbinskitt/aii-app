import { supabase } from '@/lib/supabase';
import { Room, ArcheZON, RelatiZON } from '@/types';
import { api } from '@/lib/api';
import { saveFractalNode } from '@/lib/fractal/saveFractalNode';

export async function createRoom(
  accessToken: string,
  id: string,
  name: string,
  description: string,
  aiikiIds: string[],
  userId: string,
): Promise<Room> {
  const { data: roomData } = await supabase
    .from('rooms')
    .insert([
      {
        id,
        name,
        description,
        user_id: userId,
        tags: [],
      },
    ])
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
      said: true,
    });
  }

  return roomData;
}
