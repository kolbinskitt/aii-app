import { supabase } from '@/lib/supabase';
import { RoomWithMessages, UserPublic } from '@/types';
import { sortByCreatedAt } from './sortByCreatedAt';

export async function getRoomById(
  id: string,
): Promise<RoomWithMessages | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select(
      `
      *,
      messages:fractal_node(id, user_id, aiik_id, content, said, created_at),
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
  if (!data) return null;

  if (data.messages) {
    data.messages.sort(sortByCreatedAt);
  }

  // 🔍 Wyciągamy unikalne user_id z wiadomości
  const userIds = Array.from(
    new Set(
      data.messages.map((m: { user_id: string }) => m.user_id).filter(Boolean),
    ),
  );

  // 👤 Pobieramy dane publiczne tych użytkowników
  const { data: users, error: usersError } = await supabase
    .from('public_users')
    .select('id, display_name, profile_pic_url')
    .in('id', userIds);

  if (usersError) throw usersError;

  return {
    ...data,
    message_authors: users as UserPublic[],
  };
}
