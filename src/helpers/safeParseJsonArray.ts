import { ArcheZON } from '@/types';

export function safeParseJsonArray(raw: string): ArcheZON[] {
  let cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ RAW GPT OUTPUT:', raw);
    console.error('❌ CLEANED JSON:', cleaned);
    throw new Error('Nie udało się sparsować JSON z GPT');
  }
}
