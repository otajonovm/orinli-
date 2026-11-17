import { BookRecord, CollocationItem, ConcordanceLine, WordRecord } from '../types';
import { CollocationFilters, CorpusProvider } from './types';

const MAX_EXAMPLE_CHARS = 200;

function truncateLine(s: string): string {
  const t = s.trim().replace(/\s+/g, ' ');
  return t.length <= MAX_EXAMPLE_CHARS ? t : t.slice(0, MAX_EXAMPLE_CHARS - 1) + '…';
}

function buildConcordance(sentence: string, keyword: string): ConcordanceLine | null {
  const rx = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'i');
  const m = sentence.match(rx);
  if (!m || m.index === undefined) return null;
  const full = truncateLine(sentence);
  const idx = full.toLowerCase().indexOf(m[1].toLowerCase());
  if (idx < 0) {
    return { left: '', keyword: m[1], right: '', full };
  }
  return {
    left: full.slice(0, idx).trimEnd(),
    keyword: full.slice(idx, idx + m[1].length),
    right: full.slice(idx + m[1].length).trimStart(),
    full,
  };
}

function inferGroup(phrase: string, word: string): CollocationItem['group'] {
  const p = phrase.toLowerCase();
  const w = word.toLowerCase();
  if (/\b(up|out|in|off|on|over|away|down|through|about|across)\b/.test(p) && p.includes(w)) {
    if (p.split(/\s+/).length <= 3) return 'phrasal';
  }
  if (/\bof\b/.test(p)) return 'noun_of_noun';
  if (new RegExp(`\\b(the|a|an)\\s+\\w+\\s+${w}\\b`, 'i').test(p) || new RegExp(`\\b\\w+\\s+${w}\\b`, 'i').test(p)) {
    if (/^(very|highly|strongly|clear|strong|main|key|important)\b/i.test(p)) return 'adj_noun';
  }
  if (new RegExp(`\\b${w}\\s+(a|an|the|to)\\b`, 'i').test(p) || new RegExp(`\\b${w}\\s+\\w+`, 'i').test(p)) {
    return 'verb_noun';
  }
  if (/\b(in|on|at|for|with|to|from|by|about)\b/.test(p)) return 'preposition';
  return 'verb_noun';
}

export class BooksProvider implements CorpusProvider {
  readonly id = 'books' as const;
  readonly labelUz = 'Kitoblar bazasi';

  constructor(
    private getWords: () => Record<string, WordRecord>,
    private getBooks: () => BookRecord[]
  ) {}

  isConnected(): boolean {
    return Object.keys(this.getWords()).length > 0 || this.getBooks().length > 0;
  }

  async searchCollocations(
    word: string,
    filters: CollocationFilters = {}
  ): Promise<CollocationItem[]> {
    const w = word.trim().toLowerCase();
    if (!w) return [];

    const words = this.getWords();
    const books = this.getBooks();
    const record = words[w];
    const items: CollocationItem[] = [];
    const seen = new Set<string>();

    if (record?.collocations) {
      for (const phrase of record.collocations) {
        const key = phrase.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const examples: ConcordanceLine[] = [];
        for (const ex of record.examples || []) {
          const line = buildConcordance(ex.text, w);
          if (line) {
            examples.push({ ...line, meaningUz: record.meaningUz });
          }
        }
        if (examples.length === 0) {
          examples.push({
            left: '…',
            keyword: phrase,
            right: '…',
            full: phrase,
            meaningUz: record.meaningUz,
          });
        }

        items.push({
          id: `books-${key}`,
          phrase,
          group: inferGroup(phrase, w),
          examples: examples.slice(0, 3),
          meaningUz: record.meaningUz,
          source: 'books',
          register: 'neutral',
          frequency: record.freqInLibrary,
        });
      }
    }

    // Scan book snippets for concordance (short lines only)
    for (const book of books) {
      const snippet = book.truncatedSnippet || '';
      const sentences = snippet.match(/[^.!?]+[.!?]+/g) || [];
      const rx = new RegExp(`\\b${w}\\b`, 'i');
      for (const s of sentences) {
        if (!rx.test(s)) continue;
        const line = buildConcordance(s, w);
        if (!line) continue;
        // Extract simple bigrams around keyword as collocations
        const tokens = s.toLowerCase().match(/\b[a-z']+\b/g) || [];
        const idx = tokens.findIndex((t) => t === w);
        if (idx >= 0) {
          if (idx > 0) {
            const phrase = `${tokens[idx - 1]} ${tokens[idx]}`;
            if (!seen.has(phrase)) {
              seen.add(phrase);
              items.push({
                id: `books-ctx-${phrase}`,
                phrase,
                group: 'adj_noun',
                examples: [{ ...line, meaningUz: 'Kitobingizdagi kontekst' }],
                meaningUz: 'Kitobingizdagi kontekst',
                source: 'books',
                register: 'neutral',
              });
            }
          }
          if (idx < tokens.length - 1) {
            const phrase = `${tokens[idx]} ${tokens[idx + 1]}`;
            if (!seen.has(phrase)) {
              seen.add(phrase);
              items.push({
                id: `books-ctx2-${phrase}`,
                phrase,
                group: 'verb_noun',
                examples: [{ ...line, meaningUz: 'Kitobingizdagi kontekst' }],
                meaningUz: 'Kitobingizdagi kontekst',
                source: 'books',
                register: 'neutral',
              });
            }
          }
        }
      }
    }

    let filtered = items;
    if (filters.register && filters.register !== 'all') {
      filtered = filtered.filter((i) => i.register === filters.register);
    }
    if (filters.groups?.length) {
      filtered = filtered.filter((i) => filters.groups!.includes(i.group));
    }
    return filtered.slice(0, filters.limit ?? 40);
  }

  async getFrequency(lemma: string): Promise<number | null> {
    const w = this.getWords()[lemma.trim().toLowerCase()];
    return w ? w.freqInLibrary : null;
  }

  async getExamples(word: string, limit = 5): Promise<ConcordanceLine[]> {
    const w = word.trim().toLowerCase();
    const record = this.getWords()[w];
    const lines: ConcordanceLine[] = [];
    if (record) {
      for (const ex of record.examples) {
        const line = buildConcordance(ex.text, w);
        if (line) lines.push({ ...line, meaningUz: record.meaningUz });
        if (lines.length >= limit) break;
      }
    }
    for (const book of this.getBooks()) {
      if (lines.length >= limit) break;
      const sentences = (book.truncatedSnippet || '').match(/[^.!?]+[.!?]+/g) || [];
      for (const s of sentences) {
        const line = buildConcordance(s, w);
        if (line) {
          lines.push(line);
          if (lines.length >= limit) break;
        }
      }
    }
    return lines;
  }
}
