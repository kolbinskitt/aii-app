import { LLMResponse, SpeakCandidate } from '@/types';
import { api } from '@/lib/api';
import { getAiMessagesRedundancyCheckSystemPrompt } from './getAiMessagesRedundancyCheckSystemPrompt';

export async function fetchResponsesRedundancyCheck(
  userMsg: string,
  candidates: SpeakCandidate[],
  accessToken?: string,
): Promise<LLMResponse | null> {
  if (!accessToken) {
    console.error('❌ Brak access token (fetchAiikResponse)');
    return null;
  }

  try {
    const userPrompt = {
      role: 'user' as const,
      content: getAiMessagesRedundancyCheckSystemPrompt(userMsg, candidates),
    };

    const res = await api('llm-responses-redundancy-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [userPrompt],
      }),
    });

    const { content } = await res.json();

    if (!content) return null;

    if (content.not_enought_data) {
      const res = await api('llm-responses-redundancy-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [userPrompt],
        }),
      });

      const { content: secondCallContent } = await res.json();

      if (!secondCallContent) return null;

      try {
        return secondCallContent;
      } catch (err) {
        console.error('Parse JSON error', err, { content: secondCallContent });
        return null;
      }
    }

    try {
      return content;
    } catch (err) {
      console.error('Parse JSON error', err, { content });
      return null;
    }
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
