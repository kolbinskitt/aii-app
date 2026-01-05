import { RelatiZON } from '../types';
import { Aiik, HumZON } from '../types';

export function generateRelatizon(
  aiik: Aiik,
  userHumzon: HumZON,
  pastContexts: string[] = [],
): RelatiZON {
  // 1. Silence tension — bazuje na currentState usera
  const baseAnxiety =
    userHumzon.currentState?.risk ?? userHumzon.currentState?.openness ?? 0.2;

  const tensionLevel = Math.min(baseAnxiety * 0.8, 1);

  const tensionState =
    tensionLevel < 0.2
      ? 'soft'
      : tensionLevel < 0.5
      ? 'neutral'
      : tensionLevel < 0.8
      ? 'tense'
      : 'ache';

  // 2. Echo resonance — ile razy aiik pojawia się w kontekście
  const aiikName = aiik.name?.toLowerCase() ?? '';
  const echoCount = pastContexts.filter(c =>
    c.toLowerCase().includes(aiikName),
  ).length;

  const echoResonance = Math.min(echoCount / 5, 1);

  // 3. Bond depth — bazowy trust z rezon aiika
  const baseBond = aiik.rezon?.trust_level ?? 0.1;

  // 4. Ostatnia emocja usera (jeśli istnieje)
  const lastEmotion =
    userHumzon.emotionalHistory.length > 0
      ? userHumzon.emotionalHistory[userHumzon.emotionalHistory.length - 1]
          .emotion
      : userHumzon.currentState?.mood ?? null;

  return {
    silence_tension: {
      level: tensionLevel,
      state: tensionState,
    },
    bond_depth: baseBond,
    echo_resonance: echoResonance,
    initiation_count: 0,
    last_emotion: lastEmotion,
  };
}
