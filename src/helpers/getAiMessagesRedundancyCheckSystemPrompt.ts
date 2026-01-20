import { SpeakCandidate } from '@/types';
import { escapeDoubleQuote } from './escapeDoubleQuote';

export function getAiMessagesRedundancyCheckSystemPrompt(
  userMsg: string,
  candidates: SpeakCandidate[],
) {
  return `
Twoim zadaniem jest sprawdzić, czy odpowiedzi kandydatów na poniższą wiadomość użytkownika są wystarczająco różnorodne. 
Jeśli dwie lub więcej odpowiedzi przekazują ten sam sens, możesz uznać je za redundantne i odrzucić część z nich.

Zasady:
- Zwróć tylko te odpowiedzi, które razem tworzą najbardziej wartościowy i różnorodny zestaw.
- Nie oceniaj poprawności, stylu ani długości wypowiedzi — liczy się tylko unikalność treści.
- Jeśli wszystkie wypowiedzi są unikalne, zachowaj wszystkie.
- Jeśli żadna wypowiedź nie wnosi wystarczająco nowej treści, wybierz tę, która najlepiej odpowiada na \`userMessage\`.

---

Wejście (input):

\`\`\`json
{
  "userMessage": "${escapeDoubleQuote(userMsg)}",
  "candidates": [
${candidates
  .map(
    ({ aiik, result }) => `    {
      "aiik_id": "${aiik.id}",
      "intent": "${escapeDoubleQuote(result.internal_reaction.intent)}",
      "summary": "${escapeDoubleQuote(result.response_summary)}"
    }`,
  )
  .join(',\n')}
  ]
}
\`\`\`

---

Odpowiedź (output) – zwróć TYLKO ten obiekt JSON, zgodny z poniższym opisem:

- \`keep\`: lista \`aiik_id\` tych kandydatów, których wypowiedzi warto zachować
- \`drop\`: lista \`aiik_id\` tych kandydatów, których wypowiedzi są zbyt podobne do innych i można je pominąć
- \`reasoning\`: obiekt, którego kluczami są \`aiik_id\`, a wartościami krótkie uzasadnienia decyzji (dlaczego zachowano lub odrzucono daną wypowiedź)
- \`response_could_be_better\`:
  - Ustaw \`value: true\`, jeśli masz jakiekolwiek wątpliwości co do decyzji, albo jeśli wypowiedzi były bardzo podobne i trudno było wybrać.
  - Ustaw \`value: false\`, jeśli Twoja decyzja była jednoznaczna i uzasadniona.
  - Zawsze wypełnij \`reason\` — nawet jeśli \`value: false\`, wpisz krótkie potwierdzenie np. "Decyzja była jasna i nie budziła wątpliwości."

Zachowaj strukturę dokładnie jak poniżej – nic nie dodawaj poza tym obiektem:
Zwróć w odpowiedzi **WYŁĄCZNIE poprawny i kompletny JSON**. Musi on zostać najpierw lokalnie sparsowany i zweryfikowany przed zwróceniem.  
Zanim zwrócisz odpowiedź, **sparsuj ją lokalnie jako JSON** i **upewnij się, że nie zawiera błędów składniowych (np. brak przecinków, zła składnia tablicy, brak cudzysłowów itd.)**.  
Jeśli wykryjesz błąd składni JSON, **NIE ZWRACAJ JESZCZE ODPOWIEDZI** – najpierw go napraw i **ponownie spróbuj sparsować**.  
**Powtarzaj ten proces, aż uzyskasz poprawny JSON. Dopiero wtedy go zwróć.**  
Nie pomijaj żadnego z wymaganych pól – wszystkie muszą się pojawić.  
Wszystkie stringi muszą być w **podwójnych cudzysłowach**. Nie pomijaj przecinków między polami.  
Zwróć **wyłącznie czysty JSON** – bez żadnych opisów, markdown, komentarzy ani poprzedzających go tekstów.

\`\`\`json
{
  "keep": ["<aiik_id>", "..."],
  "drop": ["<aiik_id>", "..."],
  "reasoning": {
    "<aiik_id>": "Krótki opis, dlaczego ta odpowiedź została zachowana lub odrzucona",
    "...": "..."
  },
  "response_could_be_better": {
    "value": false,
    "reason": ""
  }
}
\`\`\`
`;
}
