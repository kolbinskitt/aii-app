import { supabase } from '@/lib/supabase';
import {
  RelatiZON,
  SaveFractalNodeArgs,
  FractalNode,
  FractalLink,
} from '@/types';
import { shouldSaveMemoryFragment } from '@/helpers/shouldSaveMemoryFragment';
import { generateEmbedding } from '@/helpers/generateEmbedding';

export async function saveFractalNode({
  accessToken,
  type,
  content,
  said,
  interpretation,
  reason,
  weight,
  tags,
  traits,
  relates_to,
  user_id,
  aiik_id,
  room_id,
  said_reason,
  content_summary,
}: SaveFractalNodeArgs) {
  try {
    // Embedding
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
      const embedding = await generateEmbedding(accessToken, text);

      // Zapisz fractal_node
      const { data, error } = await supabase
        .from('fractal_node')
        .insert({
          type,
          content,
          said,
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
          said_reason,
          content_summary,
        })
        .select()
        .single<FractalNode>();

      if (error) throw error;

      const newNodeId = data.id;

      // Szukamy poprzedniego node'a w tym pokoju
      const { data: previousNodes } = await supabase
        .from('fractal_node')
        .select('id')
        .eq('room_id', room_id)
        .neq('id', newNodeId)
        .order('created_at', { ascending: false })
        .limit(1);

      const previousNodeId = previousNodes?.[0]?.id ?? null;

      // fractal_link: relatizon tworzy pokój
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

      // fractal_link: message usera
      if (type === 'message' && !aiik_id) {
        await supabase.from('fractal_link').insert({
          from_node: previousNodeId,
          to_node: newNodeId,
          relation_type: 'echo',
          weight: 1.0,
          metadata: { context: 'message_from_user' },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      }

      // fractal_link: relatizon po userze
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

      // fractal_link: message aiika
      if (type === 'message' && aiik_id) {
        await supabase.from('fractal_link').insert({
          from_node: previousNodeId,
          to_node: newNodeId,
          relation_type: 'echo',
          weight: 1.0,
          metadata: { context: 'message_from_aiik' },
        } as Omit<FractalLink, 'id' | 'created_at'>);
      }

      // fractal_link: relatizon po aiiku
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

      // fractal_topic: zapisuj wszystkie relates_to jako tematy
      if (relates_to?.length) {
        await Promise.all(
          relates_to.map(async topic => {
            const text = topic.value;
            const embedding = await generateEmbedding(accessToken, text);
            await supabase.from('fractal_topic').insert({
              fractal_id: newNodeId,
              type,
              value: topic.value,
              weight: topic.weight,
              user_id,
              embedding,
            });

            // Jeśli to odpowiedź AI, przypisz też temat do ostatniej wiadomości usera
            if (aiik_id && type === 'message') {
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
                // Aktualizuj również pole relates_to w fractal_node wiadomości usera
                const { data: userMsgFull } = await supabase
                  .from('fractal_node')
                  .select('id, relates_to')
                  .eq('id', userMsgId)
                  .single();

                const existingTopics = userMsgFull?.relates_to ?? [];
                const topicExists = existingTopics.some(
                  (t: { value: string }) => t.value === topic.value,
                );

                if (!topicExists) {
                  const updatedTopics = [
                    ...existingTopics,
                    { value: topic.value, weight: topic.weight },
                  ];
                  await supabase
                    .from('fractal_node')
                    .update({ relates_to: updatedTopics })
                    .eq('id', userMsgId);
                }

                await supabase.from('fractal_topic').insert({
                  fractal_id: userMsgId,
                  type: 'message',
                  value: topic.value,
                  weight: topic.weight,
                  user_id,
                  embedding,
                });
              }
            }
          }),
        );
      }

      return data ?? null;
    }
  } catch (err) {
    console.error('❌ saveFractalNode failed:', err);
    return null;
  }
}
