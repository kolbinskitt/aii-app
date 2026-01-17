import { MemoryItem } from '@/types';

export function generateMemoryMessageForLLM(memory: MemoryItem[]) {
  if (!memory?.length) return;

  const userFacts = memory
    .filter(m => m.type === 'user_memory')
    .map(
      m =>
        `– ${m.content.replace(/^"+|"+$/g, '')} (np. ${m.interpretation.toLowerCase()})`,
    )
    .join('\n');

  const aiikFacts = memory
    .filter(m => m.type === 'aiik_memory')
    .map(
      m =>
        `– ${m.content.replace(/^"+|"+$/g, '')} (np. ${m.interpretation.toLowerCase()})`,
    )
    .join('\n');

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
