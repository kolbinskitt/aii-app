import { Aiik, MemoryFragment } from '@/types';
import { api } from '@/lib/api';
import { getAIMessageSystemPrompt } from './getAIMessageSystemPrompt';
import { generateMemoryMessageForLLM } from '@/utils/generateMemoryMessageForLLM';
import { loadTagsAndTraitsIfNeeded } from './loadTagsAndTraitsIfNeeded';
import handleNewTagsAndTraits from './handleNewTagsAndTraits';

export async function fetchAiikResponse(
  prompt: string,
  aiik: Aiik,
  roomId: string,
  accessToken?: string,
): Promise<{
  message: string;
  response: string;
  message_summary: string;
  response_summary: string;
  user_memory: MemoryFragment[];
  aiik_memory: MemoryFragment[];
  model: string;
} | null> {
  if (!accessToken) {
    console.error('❌ Brak access token (fetchAiikResponse)');
    return null;
  }

  const { tags, traits } = await loadTagsAndTraitsIfNeeded();

  try {
    const relevantMemory = await api('get-relevant-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userMessage: prompt,
        aiikId: aiik.id,
        roomId,
        lastMessagesAmount: 10,
      }),
    });

    const { memory, messages } = await relevantMemory.json();
    const systemMessagePrompt = getAIMessageSystemPrompt(
      aiik,
      tags,
      traits,
      messages,
    );
    const systemMessage = {
      role: 'system' as const,
      content: systemMessagePrompt,
    };
    const userMessage = {
      role: 'user' as const,
      content: prompt,
    };
    const assistantMessage = generateMemoryMessageForLLM(memory);

    const res = await api('gpt-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [
          systemMessage,
          userMessage,
          ...(assistantMessage ? [assistantMessage] : []),
        ],
        purpose: 'aiik-message',
      }),
    });

    const { content } = await res.json();

    if (!content) return null;

    handleNewTagsAndTraits(
      accessToken,
      tags,
      traits,
      content.user_memory,
      content.aiik_memory,
      content.message,
      content.response,
    );

    try {
      return {
        message: content.message,
        response: content.response,
        message_summary: content.message_summary,
        response_summary: content.response_summary,
        user_memory: content.user_memory ?? [],
        aiik_memory: content.aiik_memory ?? [],
        model: content.model,
      };
    } catch (err) {
      console.log('Parse JSON error', err, { content });
      return null;
    }
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
