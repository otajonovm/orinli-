/**
 * Storage service abstraction — localStorage now, ready for Supabase later.
 * All UI should go through this service, never touch localStorage directly.
 */
import {
  AppStorageSchema,
  BookRecord,
  SavedCollocation,
  UserProgress,
  UserSettings,
  WordRecord,
  WritingDraft,
} from '../types';
import { getInitialUserProgress } from '../data/wordDatabase';

const STORAGE_KEY = 'writetechai_v1';
const LEGACY_KEYS = {
  WORDS: 'orinli_words_db',
  BOOKS: 'orinli_books',
  PROGRESS: 'orinli_progress',
};

const SCHEMA_VERSION = 1;

export interface StorageAdapter {
  getRaw(): string | null;
  setRaw(value: string): void;
  remove(): void;
}

class LocalStorageAdapter implements StorageAdapter {
  constructor(private key: string) {}

  getRaw(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  setRaw(value: string): void {
    try {
      localStorage.setItem(this.key, value);
    } catch (e) {
      console.error('Saqlash xatosi:', e);
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.key);
    } catch {
      /* ignore */
    }
  }
}

/** Placeholder for future Supabase / remote DB */
export class RemoteStorageAdapter implements StorageAdapter {
  getRaw(): string | null {
    return null;
  }
  setRaw(_value: string): void {
    /* not connected */
  }
  remove(): void {
    /* not connected */
  }
}

function defaultSettings(): UserSettings {
  return {
    level: 'B1',
    field: 'business',
    providers: { books: true, ai: true, bnc: false },
    privacyLocalOnly: true,
  };
}

function emptySchema(): AppStorageSchema {
  return {
    version: SCHEMA_VERSION,
    words: {},
    books: [],
    progress: getInitialUserProgress(),
    drafts: [],
    savedCollocations: [],
    importedFrequencies: [],
    authPlaceholder: { userId: null, email: null },
  };
}

function migrateLegacy(): AppStorageSchema | null {
  try {
    const wordsRaw = localStorage.getItem(LEGACY_KEYS.WORDS);
    const booksRaw = localStorage.getItem(LEGACY_KEYS.BOOKS);
    const progressRaw = localStorage.getItem(LEGACY_KEYS.PROGRESS);
    if (!wordsRaw && !booksRaw && !progressRaw) return null;

    const schema = emptySchema();
    if (wordsRaw) schema.words = JSON.parse(wordsRaw);
    if (booksRaw) schema.books = JSON.parse(booksRaw);
    if (progressRaw) {
      const p = JSON.parse(progressRaw);
      schema.progress = normalizeProgress(p);
    }
    return schema;
  } catch {
    return null;
  }
}

function normalizeProgress(raw: Partial<UserProgress>): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const base = getInitialUserProgress();
  const quest =
    raw.dailyQuest?.date === today
      ? {
          date: today,
          writingsCompleted: raw.dailyQuest.writingsCompleted ?? 0,
          collocationsSaved: raw.dailyQuest.collocationsSaved ?? 0,
          wordsLearned: raw.dailyQuest.wordsLearned ?? 0,
          wordsReviewed: raw.dailyQuest.wordsReviewed ?? 0,
        }
      : base.dailyQuest;

  return {
    xp: raw.xp ?? 0,
    streak: raw.streak ?? 1,
    lastActiveDate: raw.lastActiveDate ?? today,
    dailyQuest: quest,
    badges: raw.badges ?? [],
    lastStudiedLemma: raw.lastStudiedLemma,
    lastWritingDraftId: raw.lastWritingDraftId,
    writingHistory: raw.writingHistory ?? [],
    settings: {
      ...defaultSettings(),
      ...(raw.settings || {}),
      providers: {
        ...defaultSettings().providers,
        ...(raw.settings?.providers || {}),
      },
    },
  };
}

export class StorageService {
  private adapter: StorageAdapter;
  private cache: AppStorageSchema | null = null;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || new LocalStorageAdapter(STORAGE_KEY);
  }

  private load(): AppStorageSchema {
    if (this.cache) return this.cache;

    const raw = this.adapter.getRaw();
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppStorageSchema;
        parsed.progress = normalizeProgress(parsed.progress);
        this.cache = parsed;
        return parsed;
      } catch (e) {
        console.error('Saqlangan ma’lumot o‘qilmadi', e);
      }
    }

    const migrated = migrateLegacy();
    if (migrated) {
      this.cache = migrated;
      this.persist();
      return migrated;
    }

    this.cache = emptySchema();
    return this.cache;
  }

  private persist(): void {
    if (!this.cache) return;
    this.adapter.setRaw(JSON.stringify(this.cache));
  }

  getWords(): Record<string, WordRecord> {
    return this.load().words;
  }

  saveWords(words: Record<string, WordRecord>): void {
    const s = this.load();
    s.words = words;
    this.persist();
  }

  getBooks(): BookRecord[] {
    return this.load().books;
  }

  saveBooks(books: BookRecord[]): void {
    const s = this.load();
    s.books = books;
    this.persist();
  }

  getProgress(): UserProgress {
    return this.load().progress;
  }

  saveProgress(progress: UserProgress): void {
    const s = this.load();
    s.progress = normalizeProgress(progress);
    this.persist();
  }

  getDrafts(): WritingDraft[] {
    return this.load().drafts;
  }

  saveDrafts(drafts: WritingDraft[]): void {
    const s = this.load();
    s.drafts = drafts;
    this.persist();
  }

  upsertDraft(draft: WritingDraft): WritingDraft[] {
    const drafts = this.getDrafts();
    const idx = drafts.findIndex((d) => d.id === draft.id);
    const next =
      idx >= 0
        ? drafts.map((d, i) => (i === idx ? draft : d))
        : [draft, ...drafts];
    this.saveDrafts(next);
    return next;
  }

  getSavedCollocations(): SavedCollocation[] {
    return this.load().savedCollocations;
  }

  saveSavedCollocations(items: SavedCollocation[]): void {
    const s = this.load();
    s.savedCollocations = items;
    this.persist();
  }

  getImportedFrequencies() {
    return this.load().importedFrequencies;
  }

  saveImportedFrequencies(
    rows: Array<{ lemma: string; pos: string; frequency: number }>
  ): void {
    const s = this.load();
    s.importedFrequencies = rows;
    this.persist();
  }

  getAuthPlaceholder() {
    return this.load().authPlaceholder;
  }

  clearAll(): void {
    this.cache = emptySchema();
    this.adapter.remove();
    try {
      localStorage.removeItem(LEGACY_KEYS.WORDS);
      localStorage.removeItem(LEGACY_KEYS.BOOKS);
      localStorage.removeItem(LEGACY_KEYS.PROGRESS);
    } catch {
      /* ignore */
    }
  }
}

export const storageService = new StorageService();

/* —— Convenience wrappers (compat with existing imports) —— */

export function loadWordDatabase(): Record<string, WordRecord> {
  return storageService.getWords();
}
export function saveWordDatabase(db: Record<string, WordRecord>): void {
  storageService.saveWords(db);
}
export function loadBooks(): BookRecord[] {
  return storageService.getBooks();
}
export function saveBooks(books: BookRecord[]): void {
  storageService.saveBooks(books);
}
export function loadUserProgress(): UserProgress {
  return storageService.getProgress();
}
export function saveUserProgress(progress: UserProgress): void {
  storageService.saveProgress(progress);
}
export function clearAllData(): void {
  storageService.clearAll();
}
