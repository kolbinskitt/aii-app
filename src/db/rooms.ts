import { supabase } from '../lib/supabase';
import { Room, Role, RoomWithMessages } from '../types';

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
    room_aiiki (
      *,
      aiiki (*)
    )
  `,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addMessageToRoom(
  roomId: string,
  text: string,
  role: Role,
  userId?: string,
  aiikId?: string,
) {
  return supabase.from('messages').insert([
    {
      room_id: roomId,
      text,
      role,
      aiik_id: aiikId ?? null,
      user_id: !aiikId ? userId : null,
    },
  ]);
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

  // 🔗 Tworzenie powiązań room <-> aiiki
  const aiikiLinks = aiikiIds.map(aiik_id => ({
    room_id: data.id,
    aiik_id,
  }));

  if (aiikiLinks.length > 0) {
    const { error: linkError } = await supabase
      .from('room_aiiki')
      .insert(aiikiLinks);

    if (linkError) throw linkError;
  }

  return data;
}
