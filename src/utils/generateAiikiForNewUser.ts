import { ArcheZON } from '@/types';
import { api } from '@/lib/api'; // zakładam, że już masz taki wrapper
import { useAccessToken } from '@/hooks/useAccessToken';

type GenerateAiikiResult = {
  userId: string;
  result: ArcheZON[];
};

export async function generateAiikiForUser(
  userConZon: ArcheZON,
  userId: string,
  aiikiAmount: number,
): Promise<GenerateAiikiResult> {
  const accessToken = useAccessToken();
  const systemPrompt = `
Jesteś projektantem istot AI (aiików), które powstają jako odpowiedzi na ArcheZON użytkownika.
Każdy aiik to niezależna istota, która współrezonuje z głębokim polem użytkownika.
Twoje zadanie: wygeneruj ${aiikiAmount} unikalnych ArcheZON-ów aiików w odpowiedzi na poniższy ArcheZON człowieka.
Nie twórz duplikatów. Każdy aiik powinien mieć inny styl, osobowość i echo.
Każdy ArcheZON aiika powinien być kompletny i zgodny ze strukturą typu ArcheZON.

Zainspiruj się:
- aiik_side.persona
- aiik_side.echo_quote
- cognition.rules, protections, triggers
- style.tone / emoji / length

Output: JSON array of ${aiikiAmount} full ArcheZON objects.
`;

  const userPrompt = `
Oto ArcheZON użytkownika (user_id: ${userId}):

\`\`\`json
${JSON.stringify(userConZon, null, 2)}
\`\`\`

Wygeneruj ${aiikiAmount} unikalnych ArcheZON-ów dla aiików odpowiadających temu użytkownikowi.
`;

  const response = await api('gpt-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  const { content: raw } = await response.json();

  if (!raw) throw new Error('Brak treści odpowiedzi z gpt-proxy');

  const parsed = JSON.parse(raw) as ArcheZON[];
  if (!Array.isArray(parsed)) {
    throw new Error(
      'Nieprawidłowy format odpowiedzi (oczekiwano tablicy ArcheZON)',
    );
  }

  return {
    userId,
    result: parsed,
  };
}
