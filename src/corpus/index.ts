import { CollocationGroup, CollocationItem, CollocationSearchResult, DataSource } from '../types';
import { AIProvider } from './AIProvider';
import { BooksProvider } from './BooksProvider';
import { BNCProvider } from './BNCProvider';
import { CollocationFilters, CorpusProvider } from './types';

export type { CorpusProvider, CollocationFilters } from './types';
export { BooksProvider } from './BooksProvider';
export { AIProvider } from './AIProvider';
export { BNCProvider } from './BNCProvider';

export const EMPTY_GROUPS: Record<CollocationGroup, CollocationItem[]> = {
  verb_noun: [],
  adj_noun: [],
  noun_of_noun: [],
  phrasal: [],
  preposition: [],
};

function dedupeKey(item: CollocationItem): string {
  return `${item.group}::${item.phrase.trim().toLowerCase()}`;
}

/**
 * Merge results from all connected providers, deduplicate by phrase+group,
 * prefer books > bnc > ai for the same phrase.
 */
export async function searchMergedCollocations(
  providers: CorpusProvider[],
  word: string,
  filters: CollocationFilters = {},
  enabledSources?: Partial<Record<DataSource, boolean>>
): Promise<CollocationSearchResult> {
  const active = providers.filter((p) => {
    if (!p.isConnected()) return false;
    if (enabledSources && enabledSources[p.id] === false) return false;
    return true;
  });

  const priority: Record<DataSource, number> = { books: 0, bnc: 1, ai: 2 };
  const batches = await Promise.all(
    active.map(async (p) => {
      try {
        return await p.searchCollocations(word, filters);
      } catch (e) {
        console.error(`[corpus] ${p.id} search failed:`, e);
        return [] as CollocationItem[];
      }
    })
  );

  const map = new Map<string, CollocationItem>();
  for (const batch of batches) {
    for (const item of batch) {
      const key = dedupeKey(item);
      const existing = map.get(key);
      if (!existing || priority[item.source] < priority[existing.source]) {
        map.set(key, item);
      }
    }
  }

  const groups: Record<CollocationGroup, CollocationItem[]> = {
    verb_noun: [],
    adj_noun: [],
    noun_of_noun: [],
    phrasal: [],
    preposition: [],
  };

  for (const item of map.values()) {
    groups[item.group].push(item);
  }

  return {
    word: word.trim().toLowerCase(),
    groups,
    sourcesUsed: active.map((p) => p.id),
  };
}

export function createCorpusBundle(opts: {
  books: BooksProvider;
  ai: AIProvider;
  bnc: BNCProvider;
}): CorpusProvider[] {
  return [opts.books, opts.ai, opts.bnc];
}
