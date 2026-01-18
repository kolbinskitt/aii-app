import { MemoryFragment } from '@/types';
import { api } from '@/lib/api';

export default async function handleNewTagsAndTraits(
  accessToken: string,
  tags: MemoryFragment[],
  traits: MemoryFragment[],
  user_memory: MemoryFragment[],
  aiik_memory: MemoryFragment[],
  message: string,
  response: string,
) {
  // 1. Zbierz wszystkie znane wartości (bazowe tagi/traits)
  const knownTags = new Set(tags.map(t => t.content));
  const knownTraits = new Set(traits.map(t => t.content));

  // 2. Wyciągnij tagi/traits z odpowiedzi GPT (user + aiik)
  const allFragments = [...(user_memory ?? []), ...(aiik_memory ?? [])];

  const newTags = new Set<string>();
  const newTraits = new Set<string>();

  for (const frag of allFragments) {
    if (frag.tags) {
      for (const tag of frag.tags) {
        if (!knownTags.has(tag.value)) newTags.add(tag.value);
      }
    }
    if (frag.traits) {
      for (const trait of frag.traits) {
        if (!knownTraits.has(trait.value)) newTraits.add(trait.value);
      }
    }
  }

  // 3. Wyślij maila, jeśli znaleziono coś nowego
  if (newTags.size > 0 || newTraits.size > 0) {
    const newTagsString = [...newTags].join(', ') || 'brak';
    const newTraitsString = [...newTraits].join(', ') || 'brak';
    console.log({ newTagsString, newTraitsString });
    await api('send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subject: '🆕 Aii: Nowe tags lub traits wygenerowane przez GPT',
        body: `
Nowe tagi: ${newTagsString}

Nowe traits: ${newTraitsString}

Message: ${message}

Response: ${response}
`,
      }),
    });
  }
}
