import { Role } from '@/types';

export async function generateMessageSummary(
  text: string,
  role: Role,
  accessToken: string,
) {
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
- Opisz krótko **jaką intencję lub działanie** wykonał aiik (np. zapytał, stwierdził, wyraził coś).

PRZYKŁAD:
Wejście: "Jak się dziś czujesz?"
Wyjście: "Aiik zapytał użytkownika, jak się czuje."

PRZYKŁAD NEGATYWNY:
Wejście: "Jesteś jak słońce w moim życiu"
Zła odpowiedź: "Aiik porównał użytkownika do słońca" ❌ (to jest metafora)
Dobra odpowiedź: "Aiik wyraził uznanie i ciepło wobec użytkownika" ✅

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

DODATKOWE ZASADY:
- NIE opisuj stylu Aiika
- NIE przetwarzaj metafor ani porównań
- Skup się tylko na funkcji: co zrobił Aiik? zapytał? stwierdził? zaoferował coś?
`;

  const res = await fetch(`${API_URL}mistral-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: text.trim() },
      ],
      model: 'TheBloke/Mistral-7B-Instruct-v0.1-AWQ',
      temperature: 0.3,
      max_tokens: 300,
      purpose: 'message-summary',
    }),
  });

  const result = await res.json();
  return result?.content ?? '';
}
