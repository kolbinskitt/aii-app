import { supabase } from '@/lib/supabase';
import { RoomWithMessages, Message } from '@/types';

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
