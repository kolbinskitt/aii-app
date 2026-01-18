import { MemoryItem } from '@/types';

const getFacts = (memory: MemoryItem[], type: 'user_memory' | 'aiik_memory') =>
  memory
    .filter(m => m.type === type)
    .map(
      m =>
        `– ${m.content.replace(/^"+|"+$/g, '')} (np. ${m.interpretation.toLowerCase()})`,
    )
    .join('\n');

export function generateMemoryMessageForLLM(memory: MemoryItem[]) {
  if (!memory?.length) return;

  const userFacts = getFacts(memory, 'user_memory');
  const aiikFacts = getFacts(memory, 'aiik_memory');
  const summaryParts: string[] = [];

  if (userFacts) {
    summaryParts.push(
      `🧠 Aiik pamięta następujące fakty o użytkowniku:\n${userFacts}`,
    );
  }

  if (aiikFacts) {
    summaryParts.push(
      `🤖 Aiik pamięta również swoje własne reakcje i fakty:\n${aiikFacts}`,
    );
  }

  const finalContent = summaryParts.join('\n\n');

  return {
    role: 'assistant' as const,
    content: finalContent,
  };
}
