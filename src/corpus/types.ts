import {
  CollocationGroup,
  CollocationItem,
  ConcordanceLine,
  DataSource,
  FieldType,
  RegisterType,
} from '../types';

export interface CollocationFilters {
  field?: FieldType | 'all';
  register?: RegisterType | 'all';
  groups?: CollocationGroup[];
  limit?: number;
}

export interface CorpusProvider {
  readonly id: DataSource;
  readonly labelUz: string;
  isConnected(): boolean;
  searchCollocations(
    word: string,
    filters?: CollocationFilters
  ): Promise<CollocationItem[]>;
  getFrequency(lemma: string): Promise<number | null>;
  getExamples(word: string, limit?: number): Promise<ConcordanceLine[]>;
}
