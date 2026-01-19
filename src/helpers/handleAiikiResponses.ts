import { Aiik } from '@/types';
import { fetchAiikResponse } from '@/helpers/fetchAiikResponse';
import { addMessageToRoom } from '@/helpers/addMessageToRoom';

export async function handleAiikiResponses(
  accessToken: string,
  aiiki: Aiik[],
  userMsg: string,
  userId: string,
  roomId: string,
) {
  // 4️⃣ Wybierz aiika (na razie losowo)
  const chosenAiik = aiiki[Math.floor(Math.random() * aiiki.length)];

  // 3️⃣ Pobierz odpowiedź Aiika
  const aiikResponse = await fetchAiikResponse(
    userMsg,
    userId,
    chosenAiik,
    roomId,
    accessToken,
  );

  if (aiikResponse) {
    // 1️⃣ Zapisz wiadomość usera
    await addMessageToRoom(
      accessToken!,
      roomId,
      {
        response: userMsg,
        message_summary: aiikResponse.message_summary,
        response_summary: aiikResponse.response_summary,
        user_memory: aiikResponse.user_memory,
        aiik_memory: [],
      },
      'user',
      userId,
    );

    // 5️⃣ Zapisz odpowiedź Aiika
    await addMessageToRoom(
      accessToken!,
      roomId,
      aiikResponse,
      'aiik',
      userId,
      chosenAiik.id,
      chosenAiik.name,
      chosenAiik.avatar_url,
    );
  }
}
