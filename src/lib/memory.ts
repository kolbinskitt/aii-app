// Plik: lib/memory.ts

import { supabase } from '@/lib/supabase';
import { FractalNode } from '@/types';
import { api } from '@/lib/api';

/**
 * Zapisz ważne wspomnienie do pamięci długoterminowej.
 * Może pochodzić z messaga, odpowiedzi aiika, lub wniosku.
 */
export async function saveLongTermMemory({
  user_id,
  aiik_id,
  room_id,
  content,
  source_type = 'message', // 'message' | 'insight' | 'memory'
  importance = 1.0,
  metadata = {},
}: {
  user_id?: string;
  aiik_id?: string;
  room_id?: string;
  content: string;
  source_type?: 'message' | 'insight' | 'memory';
  importance?: number; // np. 1.0 - normalne, 2.0 - ważne
  metadata?: Record<string, unknown>;
}): Promise<FractalNode | null> {
  const embeddingRes = await api('generate-embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content }),
  });

  if (!embeddingRes.ok) return null;

  const { embedding } = await embeddingRes.json();

  const { data, error } = await supabase
    .from('fractal_node')
    .insert({
      type: 'memory',
      user_id,
      aiik_id,
      room_id,
      content,
      embedding,
      metadata: {
        importance,
        source_type,
        ...metadata,
      },
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('❌ saveLongTermMemory failed:', error);
    return null;
  }

  return data;
}

/**
 * Wyszukaj wspomnienia podobne semantycznie (embedding).
 */
export async function queryLongTermMemory({
  user_id,
  query,
  topK = 3,
  minSimilarity = 0.75,
}: {
  user_id: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
}): Promise<FractalNode[]> {
  const embeddingRes = await api('generate-embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: query }),
  });

  if (!embeddingRes.ok) return [];

  const { embedding } = await embeddingRes.json();

  const { data, error } = await supabase.rpc('match_fractal_nodes', {
    query_embedding: embedding,
    match_count: topK,
    similarity_threshold: minSimilarity,
    filter_user_id: user_id,
    filter_type: 'memory',
  });

  if (error) {
    console.error('❌ queryLongTermMemory failed:', error);
    return [];
  }

  return data;
}
