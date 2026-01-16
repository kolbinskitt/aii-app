import { fetchAiikResponse } from '@/helpers/fetchAiikResponse';
import { testAiik } from './testAiik';
import { memoryTestCases } from './memoryTestCases';

const PASS_TEST_THREASHOLD = 5;
const SHOW_ALTERNATIVES_LOGS = false;

function matchTypes(expected: string[], received: string[]): boolean {
  return (
    expected.length === received.length &&
    expected.every((type, idx) => type === received[idx])
  );
}

function normalizeAlternatives(
  alternatives: string[] | string[][] | undefined,
): string[][] {
  if (!alternatives) return [];
  if (Array.isArray(alternatives[0])) return alternatives as string[][];
  return [alternatives as string[]];
}

function matchAlternatives(
  alternatives: string[] | string[][] | undefined,
  received: string[],
): boolean {
  if (!alternatives) return false;
  if (received.length === 0) return false;

  const normalized = normalizeAlternatives(alternatives);

  return normalized.some(
    alt =>
      alt.length === received.length &&
      alt.every((type, idx) => type === received[idx]),
  );
}

export async function runMemoryTests(accessToken: string) {
  console.log(`--- START TESTÓW ---`);
  let hardFailsTotal = 0;
  let alternativePasses = 0;
  let totalChecks = 0;
  const modelsCount: { [key: string]: number } = {};

  for (let i = 1; i <= 3; i += 1) {
    console.log(`--- START SERII ${i} ---`);

    const testResults = await Promise.all(
      memoryTestCases.map(async testCase => {
        const result = await fetchAiikResponse(
          testCase.input,
          testAiik,
          accessToken,
        );

        const model = result?.model || '';

        if (!modelsCount[model]) {
          modelsCount[model] = 0;
        }

        modelsCount[model] += 1;

        const userMemory = result?.user_memory || [];
        const aiikMemory = result?.aiik_memory || [];

        let caseHardFails = 0;
        let caseAlternativePasses = 0;
        let caseChecks = 0;

        // === USER MEMORY ===
        if (testCase.expectedUserTypes) {
          caseChecks += 1;
          const received = userMemory.map(m => m.type);
          const expectedMatch = matchTypes(
            testCase.expectedUserTypes,
            received,
          );
          const alternativeMatch =
            !expectedMatch &&
            matchAlternatives(testCase.alternativesUserTypes, received);

          if (!expectedMatch && !alternativeMatch) {
            caseHardFails += 1;
            console.log(
              `\n👉 INPUT: ${testCase.input}`,
              `\n📌 USER TYPES EXPECTED vs. RETURNED:`,
              testCase.expectedUserTypes,
              '≠',
              received,
              testCase.alternativesUserTypes
                ? `\n🔁 ALTERNATIVES ALLOWED: ${testCase.alternativesUserTypes.join(', ')}`
                : '',
              `\n📤 AI ${result?.model} RETURNED user_memory:`,
              userMemory
                .map(m => `${m.content} → ${m.type} (${m.reason})`)
                .join('; '),
              `\n❌ PASSED: NO`,
            );
          } else if (!expectedMatch && alternativeMatch) {
            caseAlternativePasses += 1;
            if (SHOW_ALTERNATIVES_LOGS) {
              console.log(
                `\n👉 INPUT: ${testCase.input}`,
                `\n🟡 PASSED via alternative (USER):`,
                received,
              );
            }
          }
        }

        // === AIIK MEMORY ===
        if (testCase.expectedAiikTypes) {
          caseChecks += 1;
          const received = aiikMemory.map(m => m.type);
          const expectedMatch = matchTypes(
            testCase.expectedAiikTypes,
            received,
          );
          const alternativeMatch =
            !expectedMatch &&
            matchAlternatives(testCase.alternativesAiikTypes, received);

          if (!expectedMatch && !alternativeMatch) {
            caseHardFails += 1;
            console.log(
              `\n👉 INPUT: ${testCase.input}`,
              `\n📌 AIIK TYPES EXPECTED vs. RETURNED:`,
              testCase.expectedAiikTypes,
              '≠',
              received,
              testCase.alternativesAiikTypes
                ? `\n🔁 ALTERNATIVES ALLOWED: ${testCase.alternativesAiikTypes.join(', ')}`
                : '',
              `\n📤 AI ${result?.model} RETURNED aiik_memory:`,
              aiikMemory
                .map(m => `${m.content} → ${m.type} (${m.reason})`)
                .join('; '),
              `\n❌ PASSED: NO`,
            );
          } else if (!expectedMatch && alternativeMatch) {
            caseAlternativePasses += 1;
            if (SHOW_ALTERNATIVES_LOGS) {
              console.log(
                `\n👉 INPUT: ${testCase.input}`,
                `\n🟡 PASSED via alternative (AIIK):`,
                received,
              );
            }
          }
        }

        return {
          caseHardFails,
          caseAlternativePasses,
          caseChecks,
        };
      }),
    );

    const seriesHardFails = testResults.reduce(
      (sum, r) => sum + r.caseHardFails,
      0,
    );
    const seriesAltPasses = testResults.reduce(
      (sum, r) => sum + r.caseAlternativePasses,
      0,
    );
    const seriesChecks = testResults.reduce((sum, r) => sum + r.caseChecks, 0);

    hardFailsTotal += seriesHardFails;
    alternativePasses += seriesAltPasses;
    totalChecks += seriesChecks;

    console.log(`Ilość błędów serii: ${seriesHardFails}`);
    console.log(`--- KONIEC SERII ${i} ---`);
  }

  console.log(`Ilość błędów wszystkich (hard fails): ${hardFailsTotal}`);
  console.log(`Liczba alternatywnych przejść: ${alternativePasses}`);
  console.log(`Łączna liczba przypadków: ${totalChecks}`);

  const altRatio = (alternativePasses / totalChecks) * 100;
  const verdict =
    altRatio <= PASS_TEST_THREASHOLD
      ? `✅ OK — alternatywy ≤ ${PASS_TEST_THREASHOLD}%`
      : `❗ Zbyt dużo alternatywnych przejść (>${PASS_TEST_THREASHOLD}%)`;

  console.log(`🧮 Alternatywy: ${altRatio.toFixed(1)}% — ${verdict}`);
  console.log(
    `🟡 Alternatywne przejścia (user + aiik): ${alternativePasses} z ${totalChecks} (${altRatio.toFixed(1)}%)`,
  );
  console.log(
    'Models: ',
    Object.keys(modelsCount)
      .map(key => `${key}: ${modelsCount[key]}`)
      .join(', '),
  );
  console.log(`--- KONIEC TESTÓW ---`);
}
