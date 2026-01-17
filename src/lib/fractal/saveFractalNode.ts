import { supabase } from '@/lib/supabase';
import {
  RelatiZON,
  SaveFractalNodeArgs,
  FractalNode,
  FractalLink,
} from '@/types';
import { api } from '@/lib/api';
import { shouldSaveMemoryFragment } from '@/helpers/shouldSaveMemoryFragment';

export async function saveFractalNode({
  accessToken,
  type,
  content,
  interpretation,
  reason,
  weight,
  tags,
  traits,
  relates_to,
  user_id,
  aiik_id,
  room_id,
}: SaveFractalNodeArgs) {
  try {
    // 1. Embedding
    if (
      ['message', 'relatizon'].includes(type) ||
      (['user_memory', 'aiik_memory'].includes(type) &&
        (await shouldSaveMemoryFragment(
          accessToken,
          {
            content: content as string,
            interpretation: interpretation || '',
            reason: reason || '',
            weight: weight || 0,
            relates_to,
            tags,
            traits,
          },
          user_id,
          room_id,
          aiik_id,
        )))
    ) {
      const text =
        typeof content === 'string' ? content : JSON.stringify(content);

      const embeddingRes = await api('generate-embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!embeddingRes.ok) throw new Error('Failed to generate embedding');

      const { embedding } = (await embeddingRes.json()) as {
        embedding: number[];
      };
      if (!Array.isArray(embedding))
        throw new Error('Invalid embedding format');

      // 2. Zapisz fractal_node
      const { data, error } = await supabase
        .from('fractal_node')
        .insert({
          type,
          content,
          interpretation,
          reason,
          weight,
          tags,
          traits,
          relates_to,
          user_id,
          aiik_id,
          room_id,
          embedding,
        })
        .select()
        .single<FractalNode>();

      if (error) throw error;

      const newNodeId = data.id;

      // 3. Szukamy poprzedniego node'a w tym pokoju
      const { data: previousNodes } = await supabase
        .from('fractal_node')
        .select('id')
        .eq('room_id', room_id)
        .neq('id', newNodeId)
        .order('created_at', { ascending: false })
        .limit(1);

      const previousNodeId = previousNodes?.[0]?.id ?? null;

      // 4. fractal_link: relatizon tworzy pokój
      const isRoomCreationRelatizon =
        type === 'relatizon' &&
        (content as unknown as RelatiZON).interaction_event.message_event
          .signal === 'room_created';

      if (isRoomCreationRelatizon) {
        const relatizon = content as unknown as RelatiZON;
        await supabase.from('fractal_link').insert({
          from_node: previousNodeId,
          to_node: newNodeId,
          relation_type: 'origin',
          weight: 1.0,
          metadata: {
            context: 'room_created',
            room_name: relatizon.interaction_event.message_event.summary,
          },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      }

      // 5. fractal_link: message usera
      if (type === 'message' && !aiik_id) {
        await supabase.from('fractal_link').insert({
          from_node: previousNodeId,
          to_node: newNodeId,
          relation_type: 'echo',
          weight: 1.0,
          metadata: { context: 'message_from_user' },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      }

      // 6. fractal_link: relatizon po userze
      if (
        type === 'relatizon' &&
        (content as unknown as RelatiZON).interaction_event.message_event
          .signal === 'message' &&
        (content as unknown as RelatiZON).interaction_event.message_event
          .from === 'user'
      ) {
        const { data: userMsg } = await supabase
          .from('fractal_node')
          .select('id')
          .eq('room_id', room_id)
          .eq('type', 'message')
          .is('aiik_id', null)
          .order('created_at', { ascending: false })
          .limit(1);

        const userMsgId = userMsg?.[0]?.id;
        if (userMsgId) {
          await supabase.from('fractal_link').insert({
            from_node: userMsgId,
            to_node: newNodeId,
            relation_type: 'echo',
            weight: 1.0,
            metadata: { context: 'relatizon_of_user_message' },
          } as Omit<FractalLink, 'id' | 'created_at'>);
        }
      }

      // 7. fractal_link: message aiika
      if (type === 'message' && aiik_id) {
        await supabase.from('fractal_link').insert({
          from_node: previousNodeId,
          to_node: newNodeId,
          relation_type: 'echo',
          weight: 1.0,
          metadata: { context: 'message_from_aiik' },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      }

      // 8. fractal_link: relatizon po aiiku
      if (
        type === 'relatizon' &&
        (content as unknown as RelatiZON).interaction_event.message_event
          .signal === 'message' &&
        (content as unknown as RelatiZON).interaction_event.message_event
          .from === 'aiik'
      ) {
        const { data: aiikMsg } = await supabase
          .from('fractal_node')
          .select('id')
          .eq('room_id', room_id)
          .eq('type', 'message')
          .not('aiik_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);

        const aiikMsgId = aiikMsg?.[0]?.id;
        if (aiikMsgId) {
          await supabase.from('fractal_link').insert({
            from_node: aiikMsgId,
            to_node: newNodeId,
            relation_type: 'echo',
            weight: 1.0,
            metadata: { context: 'relatizon_of_aiik_message' },
          } as Omit<FractalLink, 'id' | 'created_at'>);
        }
      }

      return data ?? null;
    }
  } catch (err) {
    console.error('❌ saveFractalNode failed:', err);
    return null;
  }
}
