export type WordBand = 'Core' | 'Mid' | 'Rare';

export type WritingType = 'formal_letter' | 'email' | 'report' | 'essay';
export type FieldType = 'business' | 'logistics' | 'it' | 'engineering' | 'computing';
export type LevelType = 'B1' | 'B2' | 'C1';
export type RegisterType = 'formal' | 'neutral' | 'informal';

export type IssueType =
  | 'grammar'
  | 'spelling'
  | 'word-choice'
  | 'collocation'
  | 'formality'
  | 'punctuation';

export type DataSource = 'books' | 'ai' | 'bnc';

export type CollocationGroup =
  | 'verb_noun'
  | 'adj_noun'
  | 'noun_of_noun'
  | 'phrasal'
  | 'preposition';

export interface WordExample {
  text: string;
  sourceType: 'book' | 'ai' | 'bnc';
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
  pos: string;
  band: WordBand;
  meaningUz: string;
  glossEn: string;
  examples: WordExample[];
  collocations: string[];
  whyUseful: string;
  freqInLibrary: number;
  bookIds: string[];
  mastery: number; // 0–3 Mustahkamlik
  sourceNote: 'kitoblar bazasi' | 'ai' | 'foydalanuvchi';
  check: WordCheck;
  isEasilyConfused?: boolean;
  confusedWith?: string;
  lastStudiedAt?: string;
  /** Spaced repetition: next review date ISO */
  nextReviewAt?: string;
  reviewIntervalDays?: number;
  savedCollocations?: SavedCollocation[];
}

export interface SavedCollocation {
  id: string;
  phrase: string;
  group: CollocationGroup;
  exampleEn: string;
  meaningUz: string;
  source: DataSource;
  field?: FieldType;
  register?: RegisterType;
  savedAt: string;
  nextReviewAt: string;
  reviewIntervalDays: number;
  mastery: number;
}

export interface BookRecord {
  id: string;
  title: string;
  author?: string;
  addedAt: string;
  charCount: number;
  wordsExtractedCount: number;
  levelGuess: 'A2' | 'B1' | 'B2' | 'C1';
  truncatedSnippet: string;
}

export interface BadgeRecord {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface WritingScoreSnapshot {
  date: string;
  overallScore: number;
  scores: WritingCategoryScores;
  writingType: WritingType;
  field: FieldType;
}

export interface UserSettings {
  level: LevelType;
  field: FieldType;
  providers: {
    books: boolean;
    ai: boolean;
    bnc: boolean;
  };
  privacyLocalOnly: boolean;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  dailyQuest: {
    date: string;
    writingsCompleted: number; // goal: 1
    collocationsSaved: number; // goal: 5
    wordsLearned: number;
    wordsReviewed: number;
  };
  badges: BadgeRecord[];
  lastStudiedLemma?: string;
  lastWritingDraftId?: string;
  writingHistory: WritingScoreSnapshot[];
  settings: UserSettings;
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
  _meta?: { source: 'gemini' | 'fallback'; error?: string };
}

export interface AIHelpResponse {
  type: 'simplify' | 'another_example' | 'quiz_me';
  responseUz: string;
}

export interface WritingCategoryScores {
  correctness: number;
  clarity: number;
  formality: number;
  structure: number;
  vocabulary: number;
}

export interface WritingIssue {
  start: number;
  end: number;
  original: string;
  suggestion: string;
  type: IssueType;
  explanationUz: string;
  ignored?: boolean;
  accepted?: boolean;
}

export interface BetterCollocation {
  original: string;
  better: string;
  exampleEn: string;
}

export interface WritingCheckResult {
  overallScore: number;
  scores: WritingCategoryScores;
  issues: WritingIssue[];
  betterCollocations: BetterCollocation[];
  summaryUz: string;
}

export interface WritingTask {
  situationEn: string;
  recipientEn: string;
  requiredPoints: string[];
  wordLimit: { min: number; max: number };
  explanationUz: string;
  outline?: {
    mainIdea: string;
    subIdeas: string[];
    linkingWords: string[];
  };
}

export interface WritingDraft {
  id: string;
  type: WritingType;
  field: FieldType;
  level: LevelType;
  task: WritingTask;
  text: string;
  previousScore?: number;
  lastCheck?: WritingCheckResult;
  createdAt: string;
  updatedAt: string;
  history: Array<{
    text: string;
    score?: number;
    checkedAt: string;
  }>;
}

export interface ConcordanceLine {
  left: string;
  keyword: string;
  right: string;
  full: string;
  meaningUz?: string;
}

export interface CollocationItem {
  id: string;
  phrase: string;
  group: CollocationGroup;
  examples: ConcordanceLine[];
  meaningUz: string;
  source: DataSource;
  field?: FieldType;
  register: RegisterType;
  frequency?: number;
}

export interface CollocationSearchResult {
  word: string;
  groups: Record<CollocationGroup, CollocationItem[]>;
  sourcesUsed: DataSource[];
}

export interface PhrasalVerb {
  id: string;
  verb: string;
  meaningUz: string;
  formalAlternative: string;
  examples: string[];
  field: FieldType;
  frequency: 'high' | 'mid' | 'low';
  quiz: {
    questionUz: string;
    options: string[];
    answerIndex: number;
  };
}

export interface LetterTemplate {
  id: string;
  field: FieldType;
  section: 'opening' | 'purpose' | 'request' | 'closing';
  phraseEn: string;
  noteUz: string;
}

/** Versioned local storage schema */
export interface AppStorageSchema {
  version: number;
  words: Record<string, WordRecord>;
  books: BookRecord[];
  progress: UserProgress;
  drafts: WritingDraft[];
  savedCollocations: SavedCollocation[];
  importedFrequencies: Array<{ lemma: string; pos: string; frequency: number }>;
  authPlaceholder: { userId: string | null; email: string | null };
}
