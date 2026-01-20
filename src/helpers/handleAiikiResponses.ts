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
  // 1️⃣ ZAPISZ WIADOMOŚĆ USERA (zawsze said: true)
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

  // 2️⃣ WSZYSTKIE AIIKI REAGUJĄ WEWNĘTRZNIE
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

  // 3️⃣ KANDYDACI DO MÓWIENIA
  const candidates = reactions
    .filter(isSpeakCandidate)
    .sort(
      (a, b) =>
        b.result.internal_reaction.confidence -
        a.result.internal_reaction.confidence,
    )
    .slice(0, MAX_AIIKI_RESPONSES_PER_WAVE);

  // 🟡 PRZYPADEK: NIKT NIE PRZESZEDŁ PROGU → ZAPISZ MYŚLI (said: false)
  if (candidates.length === 0) {
    const unsaid = reactions.filter(
      r =>
        r.result &&
        r.result.internal_reaction &&
        r.result.internal_reaction.shouldSpeak === false,
    );

    for (const { aiik, result } of unsaid) {
      if (result) {
        await addMessageToRoom(
          accessToken,
          roomId,
          false, // 👈 pomyślał, ale nie powiedział
          result,
          'aiik',
          userId,
          aiik.id,
          aiik.name,
          aiik.avatar_url,
        );
      }
    }

    return; // świadoma cisza
  }

  // ✅ JEDEN KANDYDAT → BEZ REDUNDANCY CHECK
  if (candidates.length === 1) {
    const { aiik, result } = candidates[0];

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

    return;
  }

  // 4️⃣ REDUNDANCY CHECK (dopiero gdy > 1)
  const uniqueCandidates = await fetchResponsesRedundancyCheck(
    userMsg,
    candidates,
    accessToken,
  );

  // 5️⃣ PUBLIKACJA: said true / false wg decyzji LLM
  if (uniqueCandidates) {
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
  }
}
