import { CollocationItem, ConcordanceLine } from '../types';
import { CollocationFilters, CorpusProvider } from './types';

/**
 * BNCProvider — NOT connected yet.
 * Ready for: (a) imported lemma,pos,frequency CSV/JSON, or (b) external corpus API
 * (e.g. Sketch Engine). Does NOT fake BNC data or frequencies.
 *
 * Env (server): BNC_API_URL, BNC_API_KEY
 * Client config is mirrored via /api/ai status or settings flag.
 */
export class BNCProvider implements CorpusProvider {
  readonly id = 'bnc' as const;
  readonly labelUz = 'BNC';

  private apiUrl: string | null;
  private hasKey: boolean;
  private importedFreq: Map<string, number>;

  constructor(opts?: {
    apiUrl?: string | null;
    hasKey?: boolean;
    importedFrequencies?: Array<{ lemma: string; pos: string; frequency: number }>;
  }) {
    this.apiUrl = opts?.apiUrl ?? null;
    this.hasKey = opts?.hasKey ?? false;
    this.importedFreq = new Map();
    for (const row of opts?.importedFrequencies || []) {
      this.importedFreq.set(row.lemma.toLowerCase(), row.frequency);
    }
  }

  /** True only when external BNC API credentials exist OR frequency list imported */
  isConnected(): boolean {
    const hasApi = !!(this.apiUrl && this.hasKey);
    const hasImport = this.importedFreq.size > 0;
    return hasApi || hasImport;
  }

  setImportedFrequencies(
    rows: Array<{ lemma: string; pos: string; frequency: number }>
  ) {
    this.importedFreq.clear();
    for (const row of rows) {
      this.importedFreq.set(row.lemma.toLowerCase(), row.frequency);
    }
  }

  setApiConfig(apiUrl: string | null, hasKey: boolean) {
    this.apiUrl = apiUrl;
    this.hasKey = hasKey;
  }

  async searchCollocations(
    _word: string,
    _filters?: CollocationFilters
  ): Promise<CollocationItem[]> {
    if (!this.isConnected()) return [];

    // External API path — stub ready for Sketch Engine / custom BNC proxy
    if (this.apiUrl && this.hasKey) {
      try {
        // Intentionally not calling until backend BNC proxy is implemented.
        // Returning empty avoids faking BNC collocations.
        console.info('[BNCProvider] API configured but live search not enabled yet.');
        return [];
      } catch (e) {
        console.error('[BNCProvider] search error:', e);
        return [];
      }
    }

    // Imported frequency list alone does not yield collocations
    return [];
  }

  async getFrequency(lemma: string): Promise<number | null> {
    if (!this.isConnected()) return null;
    const f = this.importedFreq.get(lemma.trim().toLowerCase());
    return f ?? null;
  }

  async getExamples(_word: string, _limit?: number): Promise<ConcordanceLine[]> {
    // Never invent BNC concordance lines
    return [];
  }
}
