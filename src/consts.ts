export const TOPIC_MATCH_THRESHOLD = 0.78;
export const MAX_TOPICS = 12;
export const MAX_LAST_RELATED_MESSAGES = 20;
export const TAGS_AND_TRAITS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minut
export const SHOUL_SAVE_MEMORY_FRAGMENT_MATCH_THRESHOLD = 0.985; // bardzo wysokie
export const LAST_MESSAGES_FOR_SYSTEM_PROMPT = 20;
export const MAX_AIIKI_RESPONSES_PER_WAVE = 3;
export const AIIK_RESPONSE_INTENT_THRESHOLD: Record<string, number> = {
  add: 0.6,
  clarify: 0.65,
  challenge: 0.75,
  ask: 0.7,
  hold: 1.0,
};
export const EAGER_TO_FOLLOW_UP_THRESHOLD = 0.5;
