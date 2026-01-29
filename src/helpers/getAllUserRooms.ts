import { supabase } from '@/lib/supabase';
import { Room } from '@/types';

export async function getAllUserRooms(userId: string): Promise<Room[]> {
  const [owned, joined] = await Promise.all([
    supabase.from('rooms').select('*').eq('user_id', userId),
    supabase
      .from('rooms_users')
      .select('room_id, rooms(*)')
      .eq('user_id', userId),
  ]);

  if (owned.error || joined.error) throw owned.error || joined.error;

  const joinedRooms = (joined.data ?? []).map(r => r.rooms);
  const all = [...(owned.data ?? []), ...joinedRooms];

  // Deduplikacja (jeśli user i stworzył i dołączył do tego samego pokoju)
  const uniqueMap = new Map<string, Room>();
  for (const room of all) {
    if (room?.id) uniqueMap.set(room.id, room);
  }

  return Array.from(uniqueMap.values());
}
