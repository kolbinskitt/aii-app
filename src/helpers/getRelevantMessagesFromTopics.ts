import { supabase } from '@/lib/supabase';
import { generateEmbedding } from './generateEmbedding';
import { WeightedValue } from '@/types';
import { transformRelatedMessages } from './transformRelatedMessages';
import {
  MAX_TOPICS,
  TOPIC_MATCH_THRESHOLD,
  MAX_LAST_RELATED_MESSAGES,
} from '@/consts';

export async function getRelevantMessagesFromTopics(
  accessToken: string,
  userId: string,
  relatesTo: WeightedValue[],
): Promise<string> {
  if (relatesTo.length === 0) return '';

  try {
    // 1. Embedding for each relates_to.value
    const embeddings = await Promise.all(
      relatesTo.map(async ({ value }) => {
        const embedding = await generateEmbedding(accessToken, value);
        return { value, embedding };
      }),
    );

    // 2. Query matching topics from fractal_topic
    const allMatches = await Promise.all(
      embeddings.map(async ({ embedding }) => {
        const { data, error } = await supabase.rpc(
          'match_fractal_topics_by_embedding',
          {
            query_embedding: embedding,
            match_threshold: TOPIC_MATCH_THRESHOLD,
            match_count: MAX_TOPICS,
            user_id: userId,
          },
        );

        if (error) {
          console.error('Topic matching error:', error);
          return [];
        }

        return data || [];
      }),
    );

    // 3. Extract all unique fractal_ids
    const matchedFractalIds = Array.from(
      new Set(allMatches.flat().map((t: any) => t.fractal_id)),
    );

    if (!matchedFractalIds.length) return '';

    // 4. Get related messages from fractal_node
    const { data: messages, error: msgError } = await supabase
      .from('fractal_node')
      .select('*')
      .in('id', matchedFractalIds)
      .eq('type', 'message')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_LAST_RELATED_MESSAGES);

    if (msgError) {
      console.error('Message fetch error:', msgError);
      return '';
    }

    return transformRelatedMessages(messages, relatesTo);
  } catch (err) {
    console.error('getRelevantMessagesFromTopics error:', err);
    return '';
  }
}
