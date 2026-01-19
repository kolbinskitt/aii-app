import { uniq, flattenDeep } from 'lodash';
import { MemoryFragment } from '@/types';

export const getRelatesToFromMemory = (memories: MemoryFragment[]) =>
  uniq(
    flattenDeep(memories.map(m => (m.relates_to || []).map(r => r.value))),
  ).map(value => ({ value, weight: 1 }));
