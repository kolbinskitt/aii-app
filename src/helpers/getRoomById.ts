import { supabase } from '@/lib/supabase';
import { RoomWithMessages } from '@/types';
import { sortByCreatedAt } from './sortByCreatedAt';

export async function getRoomById(
  id: string,
): Promise<RoomWithMessages | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(
      `
    *,
    messages:fractal_node(id, aiik_id, content, said, created_at),
    room_aiiki(
      *,
      aiiki_with_conzon(*),
      room_aiiki_relatizon(*)
    )
  `,
    )
    .eq('id', id)
    .eq('messages.type', 'message')
    .eq('messages.said', true)
    .maybeSingle();

  if (error) throw error;

  if (data?.messages) {
    data.messages.sort(sortByCreatedAt);
  }

  return data;
}
