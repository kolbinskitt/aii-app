import { ArcheZON } from '@/types';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { safeParseJsonArray } from '@/helpers/safeParseJsonArray';

type GenerateAiikiResult = {
  userId: string;
  result: ArcheZON[];
  aiiki: { id: string; archezon: ArcheZON }[];
};

export async function generateAndSaveAiikiForUser(
  userConZon: ArcheZON,
  userId: string,
  aiikiAmount: number,
  accessToken?: string,
): Promise<GenerateAiikiResult> {
  if (!accessToken) {
    throw new Error('generateAndSaveAiikiForUser - brak accessToken');
  }

  // ===== GPT =====
  const systemPrompt = `
Jesteś projektantem istot AI (aiików), które powstają jako odpowiedzi na ArcheZON użytkownika.
Każdy aiik to niezależna istota, która współrezonuje z głębokim polem użytkownika.

Twoje zadanie: wygeneruj ${aiikiAmount} (nie mniej i nie więcej - dokładnie ${aiikiAmount}) unikalnych ArcheZON-ów aiików w odpowiedzi na poniższy ArcheZON człowieka.

⚠️ ZASADY:
- Każdy aiik MUSI mieć unikalną nazwę (pole identity.aiik_persona).
- Nie wolno używać dwa razy tej samej osobowości, tonu lub cytatu.
- W razie wątpliwości — wymyśl oryginalną tożsamość lub użyj własnej kreatywności.

Output: JSON array of ${aiikiAmount} (no more, no less - exactly ${aiikiAmount}) full ArcheZON objects.
`;

  const userPrompt = `
Oto ArcheZON użytkownika (user_id: ${userId}):

\`\`\`json
${JSON.stringify(userConZon, null, 2)}
\`\`\`

Wygeneruj ${aiikiAmount} unikalnych ArcheZON-ów dla aiików odpowiadających temu użytkownikowi.
`;

  const gptResponse = await api('gpt-proxy', {
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
      purpose: 'generate-aiiki',
    }),
  });

  const { content: raw } = await gptResponse.json();
  if (!raw) throw new Error('Brak treści odpowiedzi z gpt-proxy');

  const parsed = safeParseJsonArray(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Nieprawidłowy format odpowiedzi GPT');
  }

  // ===== SUPABASE – ŚCIEŻKA JEDI =====

  // 1️⃣ INSERT aiiki (BEZ conzon_id)
  const { data: aiiki, error: aiikiInsertError } = await supabase
    .from('aiiki')
    .insert(
      parsed.map(aiikConzon => ({
        user_id: userId,
        name:
          aiikConzon.identity?.aiik_persona ??
          aiikConzon.aiik_side?.persona ??
          'Unnamed Aiik',
        description: aiikConzon.aiik_side?.echo_quote ?? null,
        memory: {},
        rezon: {},
      })),
    )
    .select('id');

  if (aiikiInsertError || !aiiki) {
    throw new Error(`Błąd zapisu aiiki: ${aiikiInsertError?.message}`);
  }

  // 2️⃣ INSERT aiiki_conzon (Z aiik_id)
  const { data: conzons, error: conzonInsertError } = await supabase
    .from('aiiki_conzon')
    .insert(
      aiiki.map((aiik, index) => ({
        aiik_id: aiik.id,
        conzon: parsed[index],
        source: 'generated',
        version_tag: parsed[index].meta?.version ?? null,
      })),
    )
    .select('id, aiik_id');

  if (conzonInsertError || !conzons) {
    throw new Error(`Błąd zapisu aiiki_conzon: ${conzonInsertError?.message}`);
  }

  // 3️⃣ UPDATE aiiki.conzon_id — WYŁĄCZNIE PRZEZ RPC
  for (const conzon of conzons) {
    const { error } = await supabase.rpc('update_aiiki_conzon', {
      p_aiik_id: conzon.aiik_id,
      p_conzon_id: conzon.id,
    });

    if (error) {
      throw new Error(
        `Błąd RPC update_aiiki_conzon (aiik ${conzon.aiik_id}): ${error.message}`,
      );
    }
  }

  return {
    userId,
    result: parsed,
    aiiki: aiiki.map((aiik, index) => ({
      id: aiik.id,
      archezon: parsed[index],
    })),
  };
}
