import { FractalNode, WeightedValue } from '@/types';
import { transformUserAiikMessages } from './transformUserAiikMessages';

export function transformRelatedMessages(
  messages: FractalNode[],
  relatesTo: WeightedValue[],
  aiikNameMap: Map<string, string>,
  aiikId: string,
  userNameMap: Map<string, string>,
) {
  if (messages.length === 0) return '';

  return relatesTo
    .map(({ value }) => {
      const relatedMsgs = messages.filter(msg =>
        msg.relates_to?.some(r => r.value === value),
      );

      if (relatedMsgs.length === 0) return '';

      const transformedUserAiikMessages = transformUserAiikMessages(
        relatedMsgs,
        aiikNameMap,
        aiikId,
        userNameMap,
      );

      return transformedUserAiikMessages === ''
        ? ''
        : `
Rozmowa użytkownika z Aiikami dla "relates_to" = "${value}":
${transformedUserAiikMessages}
`.trim();
    })
    .filter(Boolean)
    .join('\n\n---\n\n')
    .trim();
}
