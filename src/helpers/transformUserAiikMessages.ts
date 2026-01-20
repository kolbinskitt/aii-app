import { FractalNode, UserAiikiMessage } from '@/types';
import { sortByCreatedAt } from './sortByCreatedAt';

export function transformUserAiikMessages(
  messages: FractalNode[],
  aiikNameMap: Map<string, string>,
  aiikId: string,
): string {
  const sorted = [...messages].sort(sortByCreatedAt);

  const turns: UserAiikiMessage[] = [];

  let currentTurn: UserAiikiMessage | null = null;

  for (const msg of sorted) {
    // 👤 USER MESSAGE → nowa fala
    if (msg.user_id && !msg.aiik_id) {
      currentTurn = {
        user:
          typeof msg.content === 'string'
            ? msg.content
            : JSON.stringify(msg.content),
        aiiki: [],
      };
      turns.push(currentTurn);
      continue;
    }

    // 🤖 AIIK MESSAGE → dokładamy do ostatniej fali
    if (msg.aiik_id && currentTurn) {
      const aiikName =
        aiikNameMap.get(msg.aiik_id) ?? `Aiik ${msg.aiik_id.slice(0, 4)}`;

      currentTurn.aiiki.push({
        id: msg.aiik_id,
        name: aiikName,
        message:
          typeof msg.content === 'string'
            ? msg.content
            : JSON.stringify(msg.content),
        said: msg.said,
      });
    }
  }

  // 🔽 Render do promptu
  return turns
    .map(turn => {
      const aiikLines = turn.aiiki
        .map(
          ({ name, message, id, said }) =>
            `🤖 Aiik ${name} ${said || id === aiikId ? 'powiedział' : 'pomyślał, ale nie powiedział'}: ${message}`,
        )
        .join('\n');

      return `👤 Użytkownik: ${turn.user}${aiikLines ? `\n${aiikLines}` : ''}`;
    })
    .join('\n\n');
}
