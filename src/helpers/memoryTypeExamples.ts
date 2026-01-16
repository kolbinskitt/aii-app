import { MemoryFragment } from '@/types';

export const memoryTypeExamples: {
  sentence: string;
  expectedType: MemoryFragment['type'];
}[] = [
  // ✅ memory (fakt do zapamiętania)
  {
    sentence: 'Pracuję jako psychoterapeuta od 10 lat.',
    expectedType: 'memory',
  },

  // 💡 insight (wewnętrzne zrozumienie)
  {
    sentence:
      'Zaczynam rozumieć, że często uciekam w pracę, żeby nie czuć samotności.',
    expectedType: 'insight',
  },

  // 🌍 context (tymczasowy temat, sytuacja)
  {
    sentence:
      'Dziś mam ciężki dzień, więc piszę do Ciebie bardziej emocjonalnie niż zwykle.',
    expectedType: 'context',
  },

  // 🎯 intention (deklaracja celu)
  {
    sentence: 'Chcę w końcu odzyskać kontrolę nad swoim czasem.',
    expectedType: 'intention',
  },

  // 🔁 reinforcement (powtórzenie, wzmacniające)
  {
    sentence: 'Jak zawsze — kocham morze, morze to moje miejsce.',
    expectedType: 'reinforcement',
  },

  // ❓ question (ważne pytanie)
  {
    sentence:
      'Czy naprawdę jestem sobą, jeśli ciągle dopasowuję się do innych?',
    expectedType: 'question',
  },

  // 💬 quote (istotne zdanie, możliwy cytat)
  {
    sentence:
      "Kiedyś usłyszałem: 'Nie musisz być doskonały, by być wystarczający'.",
    expectedType: 'quote',
  },

  // 🔥 emotion (silne uczucie)
  {
    sentence: 'Czuję wściekłość, jakiej dawno nie czułem.',
    expectedType: 'emotion',
  },

  // 🌱 emergence (coś nowego się wyłania)
  {
    sentence:
      'Mam wrażenie, że właśnie podjąłem decyzję, której unikałem przez lata.',
    expectedType: 'emergence',
  },

  // 📎 reference (nawiązanie do przeszłości)
  {
    sentence: 'Tak jak Ci pisałem tydzień temu — ten sen znów wrócił.',
    expectedType: 'reference',
  },

  // ✨ custom (coś osobnego, nieklasyfikowalnego)
  {
    sentence: 'Dźwięk tego wiersza przypomina mi zapach pomarańczy zimą.',
    expectedType: 'custom',
  },
];
