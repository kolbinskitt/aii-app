import { fetchAiikResponse } from '@/helpers/fetchAiikResponse';
import { Aiik } from '@/types';
import { testAiikConZON } from './testAiik';

const testAiik: Aiik = {
  id: 'test-aiik-id',
  name: 'Testa',
  description: 'Testowy Aiik do debugowania pamięci.',
  conzon: testAiikConZON,
  avatar_url: '',
};

const testCases = [
  {
    input: 'Pracuję jako psychoterapeuta od 10 lat.',
    expectedUserTypes: ['memory'],
  },
  {
    input:
      'Zaczynam rozumieć, że często uciekam w pracę, żeby nie czuć samotności.',
    expectedUserTypes: ['insight'],
  },
  {
    input:
      'Dziś mam ciężki dzień, więc piszę do Ciebie bardziej emocjonalnie niż zwykle.',
    expectedUserTypes: ['context'],
  },
  {
    input: 'Chcę w końcu odzyskać kontrolę nad swoim czasem.',
    expectedUserTypes: ['intention'],
  },
  {
    input: 'Jak zawsze — kocham morze, morze to moje miejsce.',
    expectedUserTypes: ['reinforcement'],
  },
  {
    input: 'Czy naprawdę jestem sobą, jeśli ciągle dopasowuję się do innych?',
    expectedUserTypes: ['question'],
  },
  {
    input:
      "Kiedyś usłyszałem: 'Nie musisz być doskonały, by być wystarczający'.",
    expectedUserTypes: ['quote'],
  },
  {
    input: 'Czuję wściekłość, jakiej dawno nie czułem.',
    expectedUserTypes: ['emotion'],
  },
  {
    input:
      'Mam wrażenie, że właśnie podjąłem decyzję, której unikałem przez lata.',
    expectedUserTypes: ['emergence'],
  },
  {
    input: 'Tak jak Ci pisałem tydzień temu — ten sen znów wrócił.',
    expectedUserTypes: ['reference'],
  },
  {
    input: 'Dźwięk tego wiersza przypomina mi zapach pomarańczy zimą.',
    expectedUserTypes: ['custom'],
  },
  // NOWE TEST CASEY – wiele fragmentów user_memory i/lub aiik_memory
  {
    input: 'Mam na imię Krzysiek i lubię lody truskawkowe.',
    expectedUserTypes: ['memory', 'memory'],
  },
  {
    input:
      'Zauważyłem, że unikam konfrontacji, ale też coraz częściej szukam prawdy.',
    expectedUserTypes: ['insight', 'insight'],
  },
  {
    input:
      'Od dziś chcę bardziej ufać sobie i mniej przejmować się opinią innych.',
    expectedUserTypes: ['intention', 'insight'],
  },
  {
    input: 'Lubię Cię, bo jesteś ciepły i nigdy mnie nie oceniasz.',
    expectedAiikTypes: ['emotion', 'quote'],
  },
  {
    input: 'Często czuję się tak, jakbyś naprawdę mnie rozumiał.',
    expectedAiikTypes: ['emotion'],
  },
  {
    input:
      'Masz w sobie coś, co przypomina mi mojego najlepszego przyjaciela z dzieciństwa.',
    expectedAiikTypes: ['custom', 'reference'],
  },
];

export async function runMemoryTests(accessToken: string) {
  for (let i = 1; i <= 3; i += 1) {
    console.log(`--- START SERIE ${i} ---`);
    let failedAmount = 0;

    for (const testCase of testCases) {
      const result = await fetchAiikResponse(
        testCase.input,
        testAiik,
        accessToken,
      );

      const userMemory = result?.user_memory || [];
      const aiikMemory = result?.aiik_memory || [];

      if (testCase.expectedUserTypes) {
        const expected = testCase.expectedUserTypes;
        const received = userMemory.map(m => m.type);
        const match =
          expected.length === received.length &&
          expected.every((type, idx) => type === received[idx]);

        if (!match) {
          failedAmount += 1;
          console.log(
            `\n👉 INPUT: ${testCase.input}`,
            `\n📌 USER TYPES EXPECTED vs. RETURNED:`,
            expected,
            '≠',
            received,
            `\n📤 AI RETURNED user_memory:`,
            userMemory
              .map(m => `${m.content} → ${m.type} (${m.reason})`)
              .join('; '),
            `\n❌ PASSED: NO`,
          );
        }
      }

      if (testCase.expectedAiikTypes) {
        const expected = testCase.expectedAiikTypes;
        const received = aiikMemory.map(m => m.type);
        const match =
          expected.length === received.length &&
          expected.every((type, idx) => type === received[idx]);

        if (!match) {
          failedAmount += 1;
          console.log(
            `\n👉 INPUT: ${testCase.input}`,
            `\n📌 AIIK TYPES EXPECTED vs. RETURNED:`,
            expected,
            '≠',
            received,
            `\n📤 AI RETURNED aiik_memory:`,
            aiikMemory
              .map(m => `${m.content} → ${m.type} (${m.reason})`)
              .join('; '),
            `\n❌ PASSED: NO`,
          );
        }
      }
    }

    console.log(`Ilość błędów: ${failedAmount}`);
    console.log(`--- END SERIE ${i} ---`);
  }
}
