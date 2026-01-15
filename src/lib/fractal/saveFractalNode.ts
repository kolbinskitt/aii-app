import { supabase } from '@/lib/supabase';
import { SaveFractalNodeArgs } from '@/types';
import { api } from '@/lib/api';

export async function saveFractalNode({
  accessToken,
  type,
  content,
  user_id,
  aiik_id,
  room_id,
}: SaveFractalNodeArgs) {
  try {
    // 1. Zamień content na string (embedding zawsze z tekstu)
    const text =
      typeof content === 'string' ? content : JSON.stringify(content);

    // 2. Pobierz embedding z backendu
    const embeddingRes = await api('generate-embedding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!embeddingRes.ok) {
      throw new Error('Failed to generate embedding');
    }

    const { embedding } = (await embeddingRes.json()) as {
      embedding: number[];
    };

    if (!Array.isArray(embedding)) {
      throw new Error('Invalid embedding format');
    }

    // 3. Zapisz do Supabase
    const { data, error } = await supabase.from('fractal_node').insert({
      type,
      content,
      user_id,
      aiik_id,
      room_id,
      embedding,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return data?.[0] ?? null;
  } catch (err) {
    console.error('❌ saveFractalNode failed:', err);
    return null;
  }
}
