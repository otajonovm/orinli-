import { BookRecord, UserProgress, WordRecord } from '../types';
import { getInitialUserProgress } from '../data/wordDatabase';

const STORAGE_KEYS = {
  WORDS: 'orinli_words_db',
  BOOKS: 'orinli_books',
  PROGRESS: 'orinli_progress',
};

export function loadWordDatabase(): Record<string, WordRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load WordDatabase from localStorage', e);
    return {};
  }
}

export function saveWordDatabase(db: Record<string, WordRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save WordDatabase to localStorage', e);
  }
}

export function loadBooks(): BookRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load books from localStorage', e);
    return [];
  }
}

export function saveBooks(books: BookRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save books to localStorage', e);
  }
}

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return getInitialUserProgress();
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    // Reset daily quest if new day
    if (parsed.dailyQuest?.date !== today) {
      parsed.dailyQuest = {
        date: today,
        wordsLearned: 0,
        wordsReviewed: 0,
      };
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return getInitialUserProgress();
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.WORDS);
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}
