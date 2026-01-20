import { Aiik, SpeakCandidate, AiikReaction } from '@/types';
import { fetchAiikResponse } from '@/helpers/fetchAiikResponse';
import { addMessageToRoom } from '@/helpers/addMessageToRoom';
import {
  MAX_AIIKI_RESPONSES_PER_WAVE,
  AIIK_RESPONSE_INTENT_THRESHOLD,
} from '@/consts';
import { fetchResponsesRedundancyCheck } from './fetchResponsesRedundancyCheck';

function isSpeakCandidate(r: AiikReaction): r is SpeakCandidate {
  const ir = r.result?.internal_reaction;
  return (
    !!r.result &&
    !!ir &&
    ir.shouldSpeak === true &&
    typeof ir.confidence === 'number' &&
    ir.confidence >= AIIK_RESPONSE_INTENT_THRESHOLD[ir.intent]
  );
}

export async function handleAiikiResponses(
  accessToken: string,
  aiiki: Aiik[],
  userMsg: string,
  userId: string,
  roomId: string,
) {
  // ZAPISZ WIADOMOŚĆ USERA (zawsze)
  await addMessageToRoom(
    accessToken,
    roomId,
    {
      response: userMsg,
      message_summary: userMsg,
      response_summary: userMsg,
      user_memory: [],
      aiik_memory: [],
    },
    'user',
    userId,
  );

  // WSZYSCY AIKI REAGUJĄ WEWNĘTRZNIE
  const reactions: AiikReaction[] = await Promise.all(
    aiiki.map(async aiik => {
      const result = await fetchAiikResponse(
        userMsg,
        userId,
        aiik,
        roomId,
        accessToken,
      );

      return { aiik, result };
    }),
  );

  // WYBIERZ AIKI, KTÓRE POWINNY MÓWIĆ
  const candidates = reactions
    .filter(isSpeakCandidate)
    .sort(
      (a, b) =>
        b.result.internal_reaction.confidence -
        a.result.internal_reaction.confidence,
    )
    .slice(0, MAX_AIIKI_RESPONSES_PER_WAVE);

  // WYBIERZ TYLKO NIEREDUNDANTNE ODPOWIEDZI AIIKÓW

  const uniqueCandidates = await fetchResponsesRedundancyCheck(
    userMsg,
    candidates,
    accessToken,
  );

  console.log({ uniqueCandidates });

  // PUBLIKACJA ODPOWIEDZI (max 1 na aiika na falę)
  for (const { aiik, result } of candidates) {
    await addMessageToRoom(
      accessToken,
      roomId,
      result,
      'aiik',
      userId,
      aiik.id,
      aiik.name,
      aiik.avatar_url,
    );
  }

  // 5️⃣ CISZA = poprawny stan końcowy
}
