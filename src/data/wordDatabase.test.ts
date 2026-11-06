import test from 'node:test';
import assert from 'node:assert/strict';
import {
  upsertWordRecord,
  upsertBookWords,
  checkRightingBossUnlock,
  updateWordMasteryState,
  evaluateBadges,
  getInitialUserProgress,
  SAMPLE_EXTRACTION
} from './wordDatabase';
import { WordRecord } from '../types';

test('upsertWordRecord inserts new word correctly', () => {
  const initialDb: Record<string, WordRecord> = {};
  const word = SAMPLE_EXTRACTION.words[0]; // evidence

  const result = upsertWordRecord(initialDb, word, 'book-1', 'Test Book');
  assert.equal(result.isNew, true);
  assert.ok(result.updatedDb['evidence']);
  assert.equal(result.updatedDb['evidence'].lemma, 'evidence');
  assert.equal(result.updatedDb['evidence'].freqInLibrary, 1);
  assert.equal(result.updatedDb['evidence'].mastery, 0);
  assert.equal(result.updatedDb['evidence'].examples.length, 1);
  assert.equal(result.updatedDb['evidence'].examples[0].sourceName, 'Test Book');
});

test('upsertWordRecord updates existing word without resetting mastery', () => {
  const initialDb: Record<string, WordRecord> = {};
  const word = SAMPLE_EXTRACTION.words[0]; // evidence

  // First insert
  const first = upsertWordRecord(initialDb, word, 'book-1', 'First Book');
  // Simulate user learned the word to mastery 2
  first.updatedDb['evidence'].mastery = 2;

  // Second insert from another book with different excerpt
  const wordSecondBook = {
    ...word,
    excerpt: 'New evidence came to light during the trial.',
  };
  const second = upsertWordRecord(first.updatedDb, wordSecondBook, 'book-2', 'Second Book');

  assert.equal(second.isNew, false);
  const updated = second.updatedDb['evidence'];
  assert.equal(updated.freqInLibrary, 2);
  assert.equal(updated.mastery, 2, 'Mastery should be preserved across imports');
  assert.equal(updated.bookIds.length, 2);
  assert.equal(updated.examples.length, 2);
});

test('checkRightingBossUnlock works based on 8 words or presence of homophones', () => {
  const emptyDb: Record<string, WordRecord> = {};
  const checkEmpty = checkRightingBossUnlock(emptyDb);
  assert.equal(checkEmpty.unlocked, false);
  assert.equal(checkEmpty.learnedCount, 0);

  // When righting is in the database
  const dbWithRighting: Record<string, WordRecord> = {
    righting: {
      ...SAMPLE_EXTRACTION.words.find(w => w.lemma === 'righting')!,
      freqInLibrary: 1,
      bookIds: ['b1'],
      mastery: 0,
      sourceNote: 'kitoblar bazasi',
      examples: []
    }
  };
  const checkRighting = checkRightingBossUnlock(dbWithRighting);
  assert.equal(checkRighting.unlocked, true, 'Unlocked immediately because righting exists in DB');

  // When 8 words are learned even without righting
  const eightWordsDb: Record<string, WordRecord> = {};
  for (let i = 1; i <= 8; i++) {
    eightWordsDb[`word${i}`] = {
      lemma: `word${i}`,
      pos: 'noun',
      band: 'Core',
      meaningUz: 'ma’no',
      glossEn: 'meaning',
      examples: [],
      collocations: [],
      whyUseful: 'kerak',
      freqInLibrary: 1,
      bookIds: ['b1'],
      mastery: 1, // learned!
      sourceNote: 'kitoblar bazasi',
      check: { questionUz: '', options: [], answerIndex: 0, explainUz: '' }
    };
  }
  const checkEight = checkRightingBossUnlock(eightWordsDb);
  assert.equal(checkEight.unlocked, true);
  assert.equal(checkEight.learnedCount, 8);
});

test('updateWordMasteryState increments mastery and awards XP on correct', () => {
  const db: Record<string, WordRecord> = {
    evidence: {
      lemma: 'evidence',
      pos: 'noun',
      band: 'Core',
      meaningUz: 'dalil',
      glossEn: 'proof',
      examples: [],
      collocations: [],
      whyUseful: 'kerak',
      freqInLibrary: 1,
      bookIds: ['b1'],
      mastery: 0,
      sourceNote: 'kitoblar bazasi',
      check: { questionUz: '', options: [], answerIndex: 0, explainUz: '' }
    }
  };

  const res1 = updateWordMasteryState(db, 'evidence', true);
  assert.equal(res1.newMastery, 1);
  assert.equal(res1.xpEarned, 15);

  const res2 = updateWordMasteryState(res1.updatedDb, 'evidence', true);
  assert.equal(res2.newMastery, 2);
  assert.equal(res2.xpEarned, 20);

  const res3 = updateWordMasteryState(res2.updatedDb, 'evidence', true);
  assert.equal(res3.newMastery, 3);
  assert.equal(res3.xpEarned, 30);

  // Capped at 3
  const res4 = updateWordMasteryState(res3.updatedDb, 'evidence', true);
  assert.equal(res4.newMastery, 3);
});

test('evaluateBadges awards Omofon ovchisi on boss completion', () => {
  const initial = getInitialUserProgress();
  assert.equal(initial.badges.length, 0);

  const updated = evaluateBadges(initial, {}, [], true);
  assert.ok(updated.badges.some(b => b.id === 'omofon-ovchisi'));
});
