import { MemoryFragment } from '@/types';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const MATCH_THRESHOLD = 0.985; // bardzo wysokie

export async function shouldSaveMemoryFragment(
  accessToken: string,
  fragment: MemoryFragment,
  userId?: string,
  roomId?: string,
  aiikId?: string,
): Promise<boolean> {
  const embeddingRes = await api('generate-embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text: fragment.content }),
  });

  if (!embeddingRes.ok) throw new Error('Failed to generate embedding');

  const { embedding } = (await embeddingRes.json()) as {
    embedding: number[];
  };
  if (!Array.isArray(embedding)) throw new Error('Invalid embedding format');

  const { data: matches } = await supabase.rpc('match_fractal_memory', {
    query_embedding: embedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: 1,
    user_id: userId,
    aiik_id: aiikId,
    room_id: roomId,
  });

  return !matches?.length;
}
