import { FractalNode } from '@/types';
import { sortByCreatedAt } from './sortByCreatedAt';

export function transformUserAiikMessages(messages: FractalNode[]) {
  const sorted = [...messages].sort(sortByCreatedAt);
  const pairs: { user: string; aiik: string }[] = [];
  let buffer = { user: '', aiik: '' };

  for (const msg of sorted) {
    if (msg.user_id && !msg.aiik_id) {
      buffer.user =
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content);
    } else if (msg.aiik_id) {
      buffer.aiik =
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content);
      pairs.push({ ...buffer });
      buffer = { user: '', aiik: '' };
    }
  }

  return pairs
    .map(({ user, aiik }) => `👤 Użytkownik: ${user}\n🤖 Aiik: ${aiik}`)
    .join('\n\n');
}
