import { MemoryFragment } from '@/types';
import { supabase } from '@/lib/supabase';

let cachedTags: MemoryFragment[] | null = null;
let cachedTraits: MemoryFragment[] | null = null;
let lastFetchedAt: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minut

export async function loadTagsAndTraitsIfNeeded(): Promise<{
  tags: MemoryFragment[];
  traits: MemoryFragment[];
}> {
  const now = Date.now();
  if (
    cachedTags !== null &&
    cachedTraits !== null &&
    lastFetchedAt !== null &&
    now - lastFetchedAt < CACHE_TTL_MS
  ) {
    return { tags: cachedTags, traits: cachedTraits };
  }

  const { data, error } = await supabase
    .from('fractal_node')
    .select('*')
    .in('type', ['tag', 'trait']);

  if (error) {
    console.error('❌ Błąd przy pobieraniu tagów/traitsów:', error);
    return { tags: [], traits: [] };
  }

  const tags = data.filter(d => d.type === 'tag') as MemoryFragment[];
  const traits = data.filter(d => d.type === 'trait') as MemoryFragment[];
  cachedTags = tags;
  cachedTraits = traits;
  lastFetchedAt = now;

  return { tags, traits };
}
