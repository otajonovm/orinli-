export type WordBand = 'Core' | 'Mid' | 'Rare';

export interface WordExample {
  text: string;
  sourceType: 'book';
  sourceName: string;
}

export interface WordCheck {
  questionUz: string;
  options: string[];
  answerIndex: number;
  explainUz: string;
}

export interface WordRecord {
  lemma: string;
  pos: string; // e.g. "fe'l", "ot", "sifat", "ravish" or "verb", "noun"
  band: WordBand;
  meaningUz: string;
  glossEn: string;
  examples: WordExample[];
  collocations: string[];
  whyUseful: string;
  freqInLibrary: number;
  bookIds: string[];
  mastery: number; // 0: Yangi, 1: Boshlang'ich, 2: O'rta, 3: Mustahkam
  sourceNote: 'kitoblar bazasi';
  check: WordCheck;
  isEasilyConfused?: boolean;
  confusedWith?: string;
  lastStudiedAt?: string;
}

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  addedAt: string;
  charCount: number;
  wordsExtractedCount: number;
  levelGuess: 'A2' | 'B1' | 'B2' | 'C1';
  truncatedSnippet: string; // first 20-30k chars
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyQuest: {
    date: string;
    wordsLearned: number; // goal: 5
    wordsReviewed: number; // goal: 3
  };
  badges: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    icon: string;
  }>;
  lastStudiedLemma?: string;
}

export interface ExtractionResult {
  title: string;
  levelGuess: 'A2' | 'B1' | 'B2' | 'C1';
  words: Array<{
    lemma: string;
    pos: string;
    band: WordBand;
    meaningUz: string;
    glossEn: string;
    excerpt: string;
    whyUseful: string;
    collocations: string[];
    check: WordCheck;
    isEasilyConfused?: boolean;
    confusedWith?: string;
  }>;
  warningUz?: string;
}

export interface AIHelpResponse {
  type: 'simplify' | 'another_example' | 'quiz_me';
  responseUz: string;
}
