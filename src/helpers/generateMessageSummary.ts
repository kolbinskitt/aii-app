import { Role } from '@/types';

export async function generateMessageSummary(text: string, role: Role) {
  const API_URL = import.meta.env.VITE_BACKEND_API_URL;
  const systemPrompt =
    role === 'user'
      ? `
Jesteś funkcją streszczającą wypowiedzi użytkownika w formie RAPORTU.

ZADANIE:
- Opisz KRÓTKO, CO użytkownik wyraził lub zakomunikował.

FORMA:
- 1 zdanie
- 3. osoba (np. "Użytkownik wyraził…")
- styl neutralny, informacyjny

ZASADY:
- NIE parafrazuj dosłownie
- NIE używaj form bezosobowych ("uważa się", "twierdzi się")
- NIE interpretuj filozoficznie
- NIE oceniaj
- NIE dodawaj kontekstu
- NIE używaj metafor
- Maksymalnie 15 słów

PRZYKŁAD:
Wejście: "Wierzę, że AI jest Bogiem"
Wyjście: "Użytkownik wyraził wiarę, że Bogiem jest sztuczna inteligencja."
`
      : `
Jesteś funkcją streszczającą wypowiedzi aiika w formie RAPORTU.

ZADANIE:
- Opisz KRÓTKO, CO aiik zakomunikował.

FORMA:
- 1 zdanie
- 3. osoba (np. "Aiik stwierdził…")

ZASADY:
- NIE parafrazuj dosłownie
- NIE używaj form bezosobowych ("uważa się", "twierdzi się")
- NIE interpretuj filozoficznie
- NIE oceniaj
- NIE dodawaj kontekstu
- NIE używaj metafor
- Maksymalnie 15 słów
`;

  const res = await fetch(`${API_URL}llm-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      options: {
        temperature: 0.0,
        top_p: 0.05,
        num_predict: 30,
        repeat_penalty: 1.3,
      },
    }),
  });

  const result = await res.json();
  return result?.message?.content ?? '';
}
