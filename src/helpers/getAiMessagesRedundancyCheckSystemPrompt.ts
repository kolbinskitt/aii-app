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
- Jeśli żadna wypowiedź nie wnosi wystarczająco nowej treści, możesz zachować jedną lub żadną.
- Jeśli masz wątpliwości, ustaw \`response_could_be_better.value = true\` i opisz powód.

Zwróć wynik w następującym formacie JSON (niczego nie dodawaj poza kodem):

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
`;
}
