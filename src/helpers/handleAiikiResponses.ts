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
  // 1️⃣ ZAPISZ WIADOMOŚĆ USERA
  await addMessageToRoom(
    accessToken,
    roomId,
    true,
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

  // 2️⃣ WSZYSCY AIIKI REAGUJĄ WEWNĘTRZNIE
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

  // 3️⃣ WYBIERZ AIIKI, KTÓRE POWINNY MÓWIĆ
  const candidates = reactions
    .filter(isSpeakCandidate)
    .sort(
      (a, b) =>
        b.result.internal_reaction.confidence -
        a.result.internal_reaction.confidence,
    )
    .slice(0, MAX_AIIKI_RESPONSES_PER_WAVE);

  // 4️⃣ SPRAWDŹ REDUNDANCJĘ
  const uniqueCandidates = await fetchResponsesRedundancyCheck(
    userMsg,
    candidates,
    accessToken,
  );

  if (uniqueCandidates) {
    // 5️⃣ PUBLIKUJ WSZYSTKIE, ALE SAID TYLKO POD WARUNKIEM
    for (const { aiik, result } of candidates) {
      const said = uniqueCandidates.keep.includes(aiik.id);

      await addMessageToRoom(
        accessToken,
        roomId,
        said,
        result,
        'aiik',
        userId,
        aiik.id,
        aiik.name,
        aiik.avatar_url,
      );
    }
  } else {
    // 5️⃣ PUBLIKUJ WSZYSTKIE JAKO SAID
    for (const { aiik, result } of candidates) {
      await addMessageToRoom(
        accessToken,
        roomId,
        true,
        result,
        'aiik',
        userId,
        aiik.id,
        aiik.name,
        aiik.avatar_url,
      );
    }
  }
}
