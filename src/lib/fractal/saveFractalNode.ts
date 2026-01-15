import { supabase } from '@/lib/supabase';
import {
  RelatiZON,
  SaveFractalNodeArgs,
  FractalNode,
  FractalLink,
} from '@/types';
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
    const { data, error } = await supabase
      .from('fractal_node')
      .insert({
        type,
        content,
        user_id,
        aiik_id,
        room_id,
        embedding,
        created_at: new Date().toISOString(),
      })
      .select()
      .single<FractalNode>();

    if (error) throw error;

    const isRelatizonOfRoomCreated =
      type === 'relatizon' &&
      (content as RelatiZON).interaction_event.message_event.signal ===
        'room_created';

    if (isRelatizonOfRoomCreated) {
      const relatizon = content as RelatiZON;
      try {
        await supabase.from('fractal_link').insert({
          from_node: null,
          to_node: data.id,
          relation_type: 'origin',
          weight: 1.0,
          metadata: {
            context: 'room_created',
            room_name: relatizon.interaction_event.message_event.summary,
          },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      } catch (err) {
        console.warn('⚠️ Failed to insert fractal_link for room_created:', err);
      }
    }

    return data ?? null;
  } catch (err) {
    console.error('❌ saveFractalNode failed:', err);
    return null;
  }
}
