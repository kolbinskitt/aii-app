import { Aiik } from '@/types';
import { api } from '@/lib/api';

export async function fetchAiikResponse(
  prompt: string,
  aiik: Aiik,
  accessToken?: string,
): Promise<{
  response: string;
  message_summary: string;
  response_summary: string;
} | null> {
  if (!accessToken) {
    console.error('❌ Brak access token:');
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
  "response_summary": "..."      // Krótkie podsumowanie Twojej odpowiedzi – opisowo, w trzeciej osobie (np. "Aiik zapytał...", "Aiik zauważył...", "Aiik odpowiedział...")
}

Pamiętaj:
– **Nie mówisz** bezpośrednio do użytkownika w podsumowaniach.
– **Nie używaj drugiej osoby ("ty", "twój")** w żadnym z pól \`*_summary\`.

Aiik: ${aiik.name}
Opis: ${aiik.description}
Osobowość: ${aiik.conzon}
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
    };
  } catch (err) {
    console.error('❌ Błąd AI (parse or fetch):', err);
    return null;
  }
}
