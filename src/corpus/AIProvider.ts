import { CollocationItem, ConcordanceLine } from '../types';
import { CollocationFilters, CorpusProvider } from './types';

/**
 * AIProvider — fetches collocations via /api/ai (Gemini on server).
 * Clearly labeled "AI" in UI. Never holds API key on client.
 */
export class AIProvider implements CorpusProvider {
  readonly id = 'ai' as const;
  readonly labelUz = 'AI';

  private enabled: boolean;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  isConnected(): boolean {
    return this.enabled;
  }

  async searchCollocations(
    word: string,
    filters: CollocationFilters = {}
  ): Promise<CollocationItem[]> {
    if (!this.enabled || !word.trim()) return [];

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggestCollocations',
          payload: {
            word: word.trim().toLowerCase(),
            field: filters.field === 'all' ? undefined : filters.field,
            register: filters.register === 'all' ? undefined : filters.register,
            limit: filters.limit ?? 20,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('[AIProvider] suggestCollocations failed:', res.status, errText);
        return [];
      }

      const data = await res.json();
      if (!data?.items || !Array.isArray(data.items)) return [];

      return data.items.map(
        (item: {
          phrase: string;
          group: CollocationItem['group'];
          examples?: Array<{ left: string; keyword: string; right: string; full?: string }>;
          meaningUz: string;
          register?: CollocationItem['register'];
          field?: CollocationItem['field'];
        },
        i: number): CollocationItem => ({
          id: `ai-${word}-${i}-${item.phrase}`,
          phrase: item.phrase,
          group: item.group || 'verb_noun',
          examples: (item.examples || []).map((ex) => ({
            left: ex.left || '',
            keyword: ex.keyword || word,
            right: ex.right || '',
            full: ex.full || `${ex.left || ''} ${ex.keyword || word} ${ex.right || ''}`.trim(),
            meaningUz: item.meaningUz,
          })),
          meaningUz: item.meaningUz || '',
          source: 'ai',
          register: item.register || 'formal',
          field: item.field,
        })
      );
    } catch (e) {
      console.error('[AIProvider] suggestCollocations error:', e);
      return [];
    }
  }

  async getFrequency(_lemma: string): Promise<number | null> {
    return null; // AI does not provide corpus frequency
  }

  async getExamples(word: string, limit = 5): Promise<ConcordanceLine[]> {
    const items = await this.searchCollocations(word, { limit });
    const lines: ConcordanceLine[] = [];
    for (const item of items) {
      for (const ex of item.examples) {
        lines.push(ex);
        if (lines.length >= limit) return lines;
      }
    }
    return lines;
  }
}
