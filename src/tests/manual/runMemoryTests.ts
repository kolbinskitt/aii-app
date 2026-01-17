import { fetchAiikResponse } from '@/helpers/fetchAiikResponse';
import { testAiik } from './testAiik';
import { memoryTestCases } from './memoryTestCases';
import { MemoryFragment } from '@/types';

const SHOW_USER_MEMORY_OK = false;
const SHOW_AIIK_MEMORY_OK = false;
const SERIES_AMOUNT = 3;

export async function runMemoryTests(accessToken: string) {
  console.log(`--- START TESTÓW ---`);
  let hardFailsTotal = 0;
  let totalCases = 0;
  const modelsCount: Record<string, number> = {};

  for (let i = 1; i <= SERIES_AMOUNT; i += 1) {
    console.log(`--- START SERII ${i} ---`);

    const testResults = await Promise.all(
      memoryTestCases.map(async testCase => {
        const result = await fetchAiikResponse(
          testCase.input,
          testAiik,
          accessToken,
        );

        const model = result?.model || 'unknown';
        modelsCount[model] = (modelsCount[model] || 0) + 1;

        const userMemory = result?.user_memory || [];
        const aiikMemory = result?.aiik_memory || [];

        let caseHardFails = 0;

        const checkMemorySet = (
          memorySet: MemoryFragment[],
          label: 'USER' | 'AIIK',
        ): void => {
          if (memorySet.length === 0) {
            console.log(
              `\n👉 INPUT: ${testCase.input}`,
              `\n📌 ${label}_MEMORY is empty.`,
              `\n📤 AI ${model} RETURNED: []`,
              `\n❌ PASSED: NO`,
            );
            caseHardFails += 1;
            return;
          }

          for (const fragment of memorySet) {
            const missingFields = [];
            if (!fragment.content) missingFields.push('content');
            if (!fragment.interpretation) missingFields.push('interpretation');
            if (!fragment.reason) missingFields.push('reason');
            if (
              typeof fragment.weight !== 'number' ||
              fragment.weight < 0 ||
              fragment.weight > 1
            )
              missingFields.push('weight');

            if (missingFields.length > 0) {
              console.log(
                `\n👉 INPUT: ${testCase.input}`,
                `\n📌 ${label}_MEMORY missing required fields: ${missingFields.join(', ')}`,
                `\n📤 AI ${model} RETURNED:`,
                JSON.stringify(fragment, null, 2),
                `\n❌ PASSED: NO`,
              );
              caseHardFails += 1;
            } else {
              if (
                (label === 'USER' && SHOW_USER_MEMORY_OK) ||
                (label === 'AIIK' && SHOW_AIIK_MEMORY_OK)
              ) {
                console.log(
                  `\n✅ ${label}_MEMORY fragment OK`,
                  `\n👉 INPUT: ${testCase.input}`,
                  `\ncontent: ${fragment.content}`,
                  `\ninterpretation: ${fragment.interpretation}`,
                  `\nreason: ${fragment.reason}`,
                  `\nweight: ${fragment.weight}`,
                  `\ntags: ${JSON.stringify(fragment.tags || [])}`,
                  `\ntraits: ${JSON.stringify(fragment.traits || [])}`,
                  `\nrelates_to: ${JSON.stringify(fragment.relates_to || [])}`,
                );
              }
            }
          }
        };

        checkMemorySet(userMemory, 'USER');
        checkMemorySet(aiikMemory, 'AIIK');

        totalCases += 1;
        return { caseHardFails };
      }),
    );

    const hardFailsInSeries = testResults.reduce(
      (s, r) => s + r.caseHardFails,
      0,
    );
    hardFailsTotal += hardFailsInSeries;

    console.log(`Ilość błędów serii: ${hardFailsInSeries}`);
    console.log(`--- KONIEC SERII ${i} ---`);
  }

  console.log(`Ilość błędów wszystkich (hard fails): ${hardFailsTotal}`);
  console.log(`Łączna liczba przypadków: ${totalCases}`);
  console.log(
    'Models:',
    Object.entries(modelsCount)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', '),
  );
  console.log(`--- KONIEC TESTÓW ---`);
}
