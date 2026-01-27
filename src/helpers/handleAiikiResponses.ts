import { Aiik, SpeakCandidate, AiikReaction, LLMResult } from '@/types';
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
  // ZAPISZ WIADOMOŚĆ USERA (zawsze said: true)
  await addMessageToRoom(
    accessToken,
    roomId,
    true,
    {
      response: userMsg,
      message_summary: '',
      response_summary: '',
      user_memory: [],
      aiik_memory: [],
    },
    'user',
    userId,
  );

  // WSZYSTKIE AIIKI REAGUJĄ WEWNĘTRZNIE
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

  // KANDYDACI DO MÓWIENIA
  const candidates = reactions
    .filter(isSpeakCandidate)
    .sort(
      (a, b) =>
        b.result.internal_reaction.confidence -
        a.result.internal_reaction.confidence,
    )
    .slice(0, MAX_AIIKI_RESPONSES_PER_WAVE);

  // PRZYPADEK: NIKT NIE PRZESZEDŁ PROGU → ZAPISZ MYŚLI (said: false)
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
          result.internal_reaction.reason,
        );
      }
    }

    return; // świadoma cisza
  }

  // JEDEN KANDYDAT → BEZ REDUNDANCY CHECK
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
      result.internal_reaction.reason,
    );

    return [{ aiik, response: result }];
  }

  // REDUNDANCY CHECK (dopiero gdy > 1)
  const uniqueCandidates = await fetchResponsesRedundancyCheck(
    userMsg,
    candidates,
    accessToken,
  );

  // PUBLIKACJA: said true / false wg decyzji LLM
  if (uniqueCandidates) {
    const results: { aiik: Aiik; response: LLMResult }[] = [];
    for (const { aiik, result } of candidates) {
      const said = uniqueCandidates.keep.includes(aiik.id);

      if (said) results.push({ aiik, response: result });

      await addMessageToRoom(
        accessToken,
        roomId,
        said,
        result,
        'aiik',
        userId,
        aiik.id,
        aiik.name,
        uniqueCandidates.reasoning.find(({ aiik_id }) => aiik_id === aiik.id)
          ?.reason,
      );
    }

    return results;
  }
}

export async function handleAiikiResponsesAutoFollowUp(
  accessToken: string,
  aiiki: Aiik[],
  userId: string,
  roomId: string,
) {
  const reactions: AiikReaction[] = await Promise.all(
    aiiki.map(async aiik => {
      const result = await fetchAiikResponse(
        'Kontynuuj swoją poprzednią wypowiedź. Nie powtarzaj tego, co już powiedziałeś. Dodaj nową myśl lub refleksję, która wynika z wcześniejszego wątku.',
        userId,
        aiik,
        roomId,
        accessToken,
      );

      return { aiik, result };
    }),
  );

  const results: { aiik: Aiik; response: LLMResult }[] = [];
  for (const { aiik, result } of reactions) {
    if (result) {
      results.push({ aiik, response: result });

      await addMessageToRoom(
        accessToken,
        roomId,
        true,
        result,
        'aiik',
        userId,
        aiik.id,
        aiik.name,
        result.internal_reaction.reason,
      );
    }
  }

  return results;
}
