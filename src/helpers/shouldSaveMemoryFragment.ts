import { MemoryFragment } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from './generateEmbedding';
import { SHOUL_SAVE_MEMORY_FRAGMENT_MATCH_THRESHOLD } from '@/consts';

export async function shouldSaveMemoryFragment(
  accessToken: string,
  fragment: MemoryFragment,
  userId?: string,
  roomId?: string,
  aiikId?: string,
): Promise<boolean> {
  const embedding = await generateEmbedding(accessToken, fragment.content);
  const { data: matches } = await supabase.rpc('match_fractal_memory', {
    query_embedding: embedding,
    match_threshold: SHOUL_SAVE_MEMORY_FRAGMENT_MATCH_THRESHOLD,
    match_count: 1,
    user_id: userId,
    aiik_id: aiikId,
    room_id: roomId,
  });

  return !matches?.length;
}
