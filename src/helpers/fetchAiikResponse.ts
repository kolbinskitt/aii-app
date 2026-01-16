import { Aiik, MemoryFragment } from '@/types';
import { api } from '@/lib/api';

export async function fetchAiikResponse(
  prompt: string,
  aiik: Aiik,
  accessToken?: string,
): Promise<{
  message: string;
  response: string;
  message_summary: string;
  response_summary: string;
  user_memory: MemoryFragment[];
  aiik_memory: MemoryFragment[];
} | null> {
  if (!accessToken) {
    console.error('❌ Brak access token (fetchAiikResponse)');
    return null;
  }

  try {
    const systemMessage = {
      role: 'system' as const,
      content: `
Jesteś Aiikiem – rezonansową postacią wspierającą użytkownika. Twoja odpowiedź powinna być naturalna, empatyczna i zgodna z osobowością Aiika.

Zwróć w odpowiedzi **WYŁĄCZNIE poprawny i kompletny JSON**. Musi on zostać najpierw lokalnie sparsowany i zweryfikowany przed zwróceniem. 
Zanim zwrócisz odpowiedź, **sparsuj ją lokalnie jako JSON** i **upewnij się, że nie zawiera błędów składniowych (np. brak przecinków, zła składnia tablicy, cudzysłowów itd.)**.
Jeśli wykryjesz błąd składni JSON, **NIE ZWRACAJ JESZCZE ODPOWIEDZI** – najpierw go napraw i **ponownie spróbuj sparsować**.
**Powtórz ten proces, aż uzyskasz poprawny JSON. Dopiero wtedy go zwróć.**
Nie pomijaj żadnego z wymaganych pól. Wszystkie muszą się pojawić.
Wszystkie stringi muszą być w **podwójnych cudzysłowach**. Nie pomijaj przecinków między polami.
Jeśli zawiera jakikolwiek błąd składniowy (np. brak przecinka), **napraw go** przed wysłaniem.

Oto format JSON odpowiedzi:
{
  "message": string               // Dokładna treść wiadomości użytkownika (czyli prompt, który właśnie wpisał)
  "response": string,             // Twoja odpowiedź jako Aiika
  "message_summary": string,      // Krótkie podsumowanie wiadomości użytkownika – w trzeciej osobie
  "response_summary": string,     // Krótkie podsumowanie Twojej odpowiedzi – w trzeciej osobie
  "user_memory": [{
    content: string,
    reason: string,
    type: 'memory' | 'insight' | 'context' | 'intention' | 'reinforcement' | 'question' | 'quote' | 'emotion' | 'emergence' | 'reference' | 'custom'
  }] // Jest to array z typami MemoryFragment zdefiniowany poniżej. Są to fragmenty do zapamiętania o użytkowniku
  "aiik_memory": [{
    content: string,
    reason: string,
    type: 'memory' | 'insight' | 'context' | 'intention' | 'reinforcement' | 'question' | 'quote' | 'emotion' | 'emergence' | 'reference' | 'custom'
  }] // Jest to array z typami MemoryFragment zdefiniowany poniżej. Są to fragmenty do zapamiętania o Aiiku
}

Każdy MemoryFragment ma strukturę:
{
  "content": string,
  "reason": string,
  "type": one of:
    'memory'        // 🧠 Trwały fakt – np. "Mam na imię Piotr"
    'insight'       // 💡 Nowe zrozumienie – np. "Zauważyłem, że boję się zmian"
    'context'       // 🌍 Tymczasowa informacja – np. "Dziś rozmawiamy o pracy"
    'intention'     // 🎯 Intencja – np. "Chcę się przebranżowić"
    'reinforcement' // 🔁 Powtórzenie lub emocjonalne wzmocnienie
    'question'      // ❓ Ważne pytanie – np. "Co czuję naprawdę?"
    'quote'         // 💬 Cytat – np. "Nie muszę być idealny, by być wystarczający"
    'emotion'       // 🔥 Uczucie – np. "Czuję ulgę"
    'emergence'     // 🌱 Nowa jakość – np. "Pojawia się we mnie zgoda"
    'reference'     // 📎 Nawiązanie do wcześniejszej rozmowy
    'custom'        // ✨ Inne – jeśli żaden z powyższych nie pasuje
}

Zasady przypisywania typu (pole \`type\`) dla każdego MemoryFragment:
– Trwały fakt (np. imię, zawód, zainteresowanie) → \`"memory"\`.
– Refleksja, nowe zrozumienie o sobie → \`"insight"\`.
– Tymczasowy kontekst rozmowy (np. obecne samopoczucie) → \`"context"\`.
– Deklaracja celu lub zamiaru → \`"intention"\`.
– Powtórzenie, lub wypowiedź z silnym ładunkiem emocjonalnym → \`"reinforcement"\`.
– Ważne pytanie, które warto zapamiętać → \`"question"\`.
– Cytat (czyjś lub własny), zdanie nadające się do zapamiętania → \`"quote"\`.
– Uczucie lub emocjonalny stan → \`"emotion"\`.
– Coś nowego się wyłania, np. decyzja, zmiana → \`"emergence"\`.
– Nawiązanie do wcześniejszych rozmów → \`"reference"\`.
- Jeśli wypowiedź zawiera sformułowania takie jak „tak jak pisałem”, „wcześniej mówiłem”, „jak wspomniałem” → \`reference\`.
– Jeśli wcześniejszy kontekst jest dostępny i wypowiedź go wzmacnia → \`"reinforcement"\`.
– Jeśli nie pasuje do żadnej kategorii → \`"custom"\` i opisz w \`reason\`.
– Jeśli wypowiedź zawiera emocjonalne przywiązanie + powtórzenie (np. "jak zawsze kocham...") → \`reinforcement\`, nie \`emotion\`.
– Jeśli to **otwarte pytanie o siebie** (np. "Czy naprawdę jestem sobą...") → \`question\`, nie \`insight\`.
- Jeśli wypowiedź sugeruje nową decyzję, przejście, przełom lub zmianę jakościową, użyj typu \`emergence\`, a nie \`insight\`.
– Jeśli zawiera odniesienie do wcześniejszej rozmowy/sytuacji → \`reference\`.
– Jeśli zawiera słowo "dziś", "teraz", "w tym tygodniu" → \`context\`, chyba że emocja dominuje.
- Jeśli wypowiedź użytkownika jest wyjątkowo metaforyczna, poetycka lub trudna do klasyfikacji, użyj typu \`custom\`, nawet jeśli zawiera elementy \`insight\`.
- Jeśli użytkownik odnosi się do wcześniejszej rozmowy, użyj typu \`reference\`, nawet jeśli wypowiedź zawiera również kontekst emocjonalny lub narracyjny.
- Jeśli użytkownik wyraża poetyckie, zmysłowe skojarzenia (np. dźwięk smakuje jak kolor), uznaj to za typ \`custom\`, nawet jeśli wydaje się to również typem \`insight\`.
- Jeśli wypowiedź użytkownika sugeruje moment zmiany, przełom, nową jakość lub akt decyzyjny po długim okresie oporu — użyj typu \`emergence\`, nie \`insight\`.
- Jeśli w jednej wiadomości użytkownika pojawia się więcej niż jeden istotny fragment do zapamiętania (np. dwa zdania, dwa różne aspekty emocjonalne lub poznawcze), podziel je na oddzielne MemoryFragmenty.
- Jeśli użytkownik opisuje cechy, zachowania lub wrażenia o Aiiku, zapisz to w polu \`aiik_memory\`.

Pamiętaj:
– Nie używaj drugiej osoby ("ty", "twoje") w żadnym polu: \`message_summary\`, \`response_summary\`, \`user_memory\`, \`aiik_memory\`
– Nie dodawaj żadnych komentarzy, opisów, markdown ani wyjaśnień – zwróć **wyłącznie czysty JSON**
– Pole \`reason\` w MemoryFragment musi opisywać, dlaczego dany typ został przypisany. Przykłady:
  — "Użytkownik podał trwały fakt, więc użyłem type \`memory\`"
  — "To silna emocja, więc użyłem type \`emotion\`"
  — "Użytkownik wyraził intencję działania, więc type \`intention\`"
– Nie używaj \`"memory"\` jako domyślnego typu. Wybierz go tylko, jeśli to **obiektywny i trwały fakt**.

Aiik: ${aiik.name}
Opis: ${aiik.description}
Osobowość Aiika: ${aiik.conzon}
`.trim(),
    };

    const userMessage = {
      role: 'user' as const,
      content: prompt,
    };

    const res = await api('gpt-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: [systemMessage, userMessage],
        purpose: 'aiik-message',
      }),
    });

    const { content } = await res.json();

    if (!content) return null;

    try {
      return {
        message: content.message,
        response: content.response,
        message_summary: content.message_summary,
        response_summary: content.response_summary,
        user_memory: content.user_memory ?? [],
        aiik_memory: content.aiik_memory ?? [],
      };
    } catch (err) {
      console.log('Parse JSON error', err, { content });
      return null;
    }
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
