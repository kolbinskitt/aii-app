import { Aiik, LLMResponse } from '@/types';
import { api } from '@/lib/api';
import { getAIMessageSystemPrompt } from './getAIMessageSystemPrompt';
import { generateMemoryMessageForLLM } from '@/utils/generateMemoryMessageForLLM';
import { loadTagsAndTraitsIfNeeded } from './loadTagsAndTraitsIfNeeded';
import handleNewTagsAndTraits from './handleNewTagsAndTraits';
import { getRelevantMessagesFromTopics } from './getRelevantMessagesFromTopics';
import { getRelatesToFromMemory } from './getRelatesToFromMemory';
import { LAST_MESSAGES_FOR_SYSTEM_PROMPT } from '@/consts';

export async function fetchAiikResponse(
  prompt: string,
  userId: string,
  aiik: Aiik,
  roomId: string,
  accessToken?: string,
): Promise<LLMResponse | null> {
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
        lastMessagesAmount: LAST_MESSAGES_FOR_SYSTEM_PROMPT,
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

    const res = await api('llm-message-response', {
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

    if (content.not_enought_data) {
      const relatedMessages = await getRelevantMessagesFromTopics(
        accessToken,
        userId,
        getRelatesToFromMemory([
          ...content.user_memory,
          ...content.aiik_memory,
        ]),
      );
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
          lastMessagesAmount: LAST_MESSAGES_FOR_SYSTEM_PROMPT,
        }),
      });
      const { memory, messages } = await relevantMemory.json();
      const systemMessagePrompt = getAIMessageSystemPrompt(
        aiik,
        tags,
        traits,
        messages,
        relatedMessages,
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
      const res = await api('llm-message-response', {
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

      const { content: secondCallContent } = await res.json();

      if (!secondCallContent) return null;

      handleNewTagsAndTraits(
        accessToken,
        tags,
        traits,
        secondCallContent.user_memory,
        secondCallContent.aiik_memory,
        secondCallContent.message,
        secondCallContent.response,
      );

      try {
        return {
          message: secondCallContent.message,
          response: secondCallContent.response,
          message_summary: secondCallContent.message_summary,
          response_summary: secondCallContent.response_summary,
          user_memory: secondCallContent.user_memory ?? [],
          aiik_memory: secondCallContent.aiik_memory ?? [],
          model: secondCallContent.model,
          not_enought_data: secondCallContent.not_enought_data,
          internal_reaction: secondCallContent.internal_reaction,
        };
      } catch (err) {
        console.error('Parse JSON error', err, { content: secondCallContent });
        return null;
      }
    }

    try {
      return {
        message: content.message,
        response: content.response,
        message_summary: content.message_summary,
        response_summary: content.response_summary,
        user_memory: content.user_memory ?? [],
        aiik_memory: content.aiik_memory ?? [],
        model: content.model,
        not_enought_data: content.not_enought_data,
        internal_reaction: content.internal_reaction,
      };
    } catch (err) {
      console.error('Parse JSON error', err, { content });
      return null;
    }
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
