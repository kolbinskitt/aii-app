import { Aiik, MemoryFragment } from '@/types';
import { api } from '@/lib/api';

export async function fetchAiikResponse(
  prompt: string,
  aiik: Aiik,
  accessToken?: string,
): Promise<{
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

Zwróć **tylko poprawny JSON** w formacie:

{
  "response": "...",             // Twoja odpowiedź jako Aiika
  "message_summary": "...",      // Krótkie podsumowanie wiadomości użytkownika – w trzeciej osobie
  "response_summary": "...",     // Krótkie podsumowanie Twojej odpowiedzi – w trzeciej osobie
  "user_memory": [MemoryFragment], // Wspomnienia/fragmenty, które warto zapamiętać o użytkowniku
  "aiik_memory": [MemoryFragment]  // Wspomnienia/fragmenty, które warto zapamiętać o Aiiku
}

Każdy MemoryFragment ma strukturę:
{
  "content": string,
  "reason": string,
  "type": one of:
    'memory'        // 🧠 Trwały fakt — np. "Mam na imię Piotr"
    'insight'       // 💡 Wewnętrzne zrozumienie — np. "Zauważyłem, że boję się zmian"
    'context'       // 🌍 Tymczasowa informacja — np. "Dziś rozmawiamy o pracy"
    'intention'     // 🎯 Intencja działania — np. "Chcę się przebranżowić"
    'reinforcement' // 🔁 Powtórzenie, które wzmacnia pamięć
    'question'      // ❓ Pytanie do zapamiętania — np. "Co czuję naprawdę?"
    'quote'         // 💬 Ważny cytat — np. "Nie muszę być idealny, by być wystarczający"
    'emotion'       // 🔥 Uczucie — np. "Czuję ulgę"
    'emergence'     // 🌱 Nowa jakość — np. "Pojawia się we mnie zgoda"
    'reference'     // 📎 Odniesienie do wcześniejszej rozmowy — np. "Jak mówiłeś wczoraj..."
    'custom'        // ✨ Dowolny inny, nazwany przez Ciebie
}

Zasady wyboru typu w MemoryFragment dla zwracanych pól user_memory i aiik_memory:
– Jeśli użytkownik lub Aiik podaje trwały fakt (np. zawód, imię, pochodzenie, zainteresowanie) → \`type: "memory"\`
– Jeśli użytkownik lub Aiik dzieli się nowym zrozumieniem, refleksją lub odkryciem o sobie → \`type: "insight"\`
– Jeśli użytkownik lub Aiik mówi o aktualnym kontekście rozmowy (np. "dzisiaj czuję się źle", "rozmawiamy o pracy") → \`type: "context"\`
– Jeśli użytkownik lub Aiik wyraża cel lub zamiar (np. "chcę coś zmienić", "mam zamiar...") → \`type: "intention"\`
– Jeśli użytkownik lub Aiik powtarza coś, co już mówił, lub mówi coś z silnym ładunkiem osobistym → \`type: "reinforcement"\`
– Jeśli użytkownik lub Aiik zadaje głębokie lub ważne pytanie → \`type: "question"\`
– Jeśli użytkownik lub Aiik cytuje kogoś lub samego siebie, lub mówi coś nadającego się na cytat → \`type: "quote"\`
– Jeśli użytkownik lub Aiik mówi o emocjach lub uczuciach → \`type: "emotion"\`
– Jeśli użytkownik lub Aiik coś się z niego wyłania, np. zmiana decyzji, świadomości → \`type: "emergence"\`
– Jeśli użytkownik lub Aiik nawiązuje do wcześniejszej rozmowy → \`type: "reference"\`
– Jeśli to, co użytkownik mówi, nawiązuje do wcześniejszych wypowiedzi i pojawia się ponownie z silniejszym ładunkiem emocjonalnym — użyj \`type: "reinforcement"\`. *(dotyczy sytuacji, gdy znany jest wcześniejszy kontekst rozmowy)*
– Jeśli nie wiesz, jaki typ zastosować — użyj \`type: "custom"\` i nazwij go w \`content\`


Pamiętaj:
– Nie używaj drugiej osoby ("ty", "twoje") w żadnym polu: message_summary, response_summary, user_memory ani aiik_memory
– Nie dodawaj żadnych komentarzy, opisu, wyjaśnień, formatowania Markdown – zwróć **wyłącznie czysty JSON**
– Jeśli użytkownik mówi o sobie coś trwałego (np. imię, upodobania, wartości, zawód), zapisz to do \`user_memory\` jako typ \`memory\`.
– Jeśli użytkownik mówi coś entuzjastycznie, z emocją lub kilkakrotnie wspomina daną rzecz, użyj typu \`reinforcement\`.
– Zawsze zapisuj w \`user_memory\` pełne zdanie (np. „Użytkownik lubi lody pistacjowe”), a nie tylko wyraz („lody”).
- W polu MemoryFragment.reason każdego fragmentu wyjaśnij, dlaczego został przypisany dany type, np.:
  -- "Użytkownik wyraził cel działania, dlatego wybrałem \`type 'intention'\`."
  -- "To silna emocja, wybrałem \`type 'emotion'\`."
  -- i tym podobne - jak w sekcji "Zasady wyboru typu w MemoryFragment dla zwracanych pól user_memory i aiik_memory" powyżej
- A zatem W MemoryFragment.type nie możesz zawsze ustawiać \`type: "memory"\`. Nie ustawiaj \`type: "memory"\` domyślnie – wybieraj go tylko wtedy, gdy informacja jest obiektywnym i trwałym faktem o użytkowniku lub Aiiku.

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

    const parsed = JSON.parse(content);

    return {
      response: parsed.response,
      message_summary: parsed.message_summary,
      response_summary: parsed.response_summary,
      user_memory: parsed.user_memory ?? [],
      aiik_memory: parsed.aiik_memory ?? [],
    };
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
