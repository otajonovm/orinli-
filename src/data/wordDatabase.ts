import { BookRecord, ExtractionResult, UserProgress, WordRecord } from '../types';

export const SAMPLE_TEXT = `Maya had no time to finish the work, but people around her wanted to help. She had to think, learn the important parts, and decide what to do. The main problem was context: without evidence, it was hard to choose the right word. However, righting a small mistake today felt better than writing the same error again tomorrow.`;

export const SAMPLE_BOOK: BookRecord = {
  id: 'sample-book-maya',
  title: 'Maya va To‘g‘ri So‘z Tanlovi',
  author: 'Namuna matn',
  addedAt: new Date().toISOString(),
  charCount: SAMPLE_TEXT.length,
  wordsExtractedCount: 12,
  levelGuess: 'B1',
  truncatedSnippet: SAMPLE_TEXT,
};

export const SAMPLE_EXTRACTION: ExtractionResult = {
  title: 'Maya va To‘g‘ri So‘z Tanlovi',
  levelGuess: 'B1',
  words: [
    {
      lemma: 'evidence',
      pos: 'ot (noun)',
      band: 'Core',
      meaningUz: 'Biror narsa to‘g‘ri yoki mavjudligini isbotlovchi dalil, ashyoviy isbot.',
      glossEn: 'facts or signs showing truth',
      excerpt: 'The main problem was context: without evidence, it was hard to choose the right word.',
      whyUseful: 'Ilmiy, ishbilarmonlik va mantiqiy fikrlashda doimiy ishlatiladigan tayanch so‘z.',
      collocations: ['clear evidence', 'without evidence', 'gather evidence', 'strong evidence'],
      check: {
        questionUz: 'Qaysi jumla "evidence" (dalil) so‘zini to‘g‘ri ma’noda ishlatgan?',
        options: [
          'Without evidence, we cannot make a safe decision.',
          'She ate an evidence for breakfast.',
          'The car is running on fast evidence.',
          'He wore a warm evidence yesterday.'
        ],
        answerIndex: 0,
        explainUz: '"Evidence" — biror faktni asoslovchi dalil yoki isbot degan ma’noda keladi.'
      }
    },
    {
      lemma: 'context',
      pos: 'ot (noun)',
      band: 'Core',
      meaningUz: 'So‘z yoki voqeaning atrofi, vaziyat va mazmunni belgilovchi umumiy sharoit.',
      glossEn: 'surrounding situation or meaning',
      excerpt: 'The main problem was context: without evidence, it was hard to choose the right word.',
      whyUseful: 'So‘zlarni to‘g‘ri tushunish va o‘rinli ishlatishning bosh kaliti shu so‘zdir.',
      collocations: ['in this context', 'out of context', 'historical context', 'cultural context'],
      check: {
        questionUz: '"Context" so‘zining o‘zbek tilidagi eng to‘g‘ri ma’nosi nima?',
        options: [
          'Matn va vaziyatning umumiy mazmuni',
          'Kitobning sahifasi',
          'Tez yugurish harakati',
          'Oyna yoki shisha idish'
        ],
        answerIndex: 0,
        explainUz: 'Context — so‘zning qanday vaziyatda aytilganini ko‘rsatuvchi ma’no maydoni.'
      }
    },
    {
      lemma: 'righting',
      pos: 'fe’l (verb / gerund)',
      band: 'Mid',
      meaningUz: 'Xatoni tuzatish, adolatsizlikni to‘g‘rilash yoki biror narsani dastlabki holatiga keltirish.',
      glossEn: 'correcting a wrong or restoring balance',
      excerpt: 'However, righting a small mistake today felt better than writing the same error again tomorrow.',
      whyUseful: '"Writing" (yozish) bilan bir xil talaffuz qilinadi, lekin mutlaqo boshqa ma’noda tuzatishni bildiradi.',
      collocations: ['righting a wrong', 'righting an injustice', 'righting the boat', 'righting reflex'],
      isEasilyConfused: true,
      confusedWith: 'writing',
      check: {
        questionUz: '"Righting a wrong" iborasi qanday ma’noni bildiradi?',
        options: [
          'Qilingan xato yoki adolatsizlikni tuzatish',
          'Yangi xat yozish',
          'O‘ng qo‘l bilan chizish',
          'Tezda kitob sotib olish'
        ],
        answerIndex: 0,
        explainUz: '"Righting a wrong" — qilingan xatoni tan olib, uni to‘g‘rilash degan ma’noni anglatadi.'
      }
    },
    {
      lemma: 'writing',
      pos: 'fe’l / ot (verb/noun)',
      band: 'Core',
      meaningUz: 'Yozish, matn yaratish yoki qog‘ozga tushirish jarayoni.',
      glossEn: 'creating text or recording words',
      excerpt: 'However, righting a small mistake today felt better than writing the same error again tomorrow.',
      whyUseful: '"Righting" bilan omofon (bir xil eshitiladi), ammo harflari va mazmuni boshqa.',
      collocations: ['in writing', 'creative writing', 'writing skills', 'writing an essay'],
      isEasilyConfused: true,
      confusedWith: 'righting',
      check: {
        questionUz: 'Qaysi holatda "writing" (yozish) to‘g‘ri qo‘llangan?',
        options: [
          'She is writing a letter to her friend.',
          'He is writing an injustice.',
          'The boat needs writing after tipping.',
          'Writing a mistake makes it upright.'
        ],
        answerIndex: 0,
        explainUz: '"Writing" — matn yozish va xat bitish ma’nosida ishlatiladi.'
      }
    },
    {
      lemma: 'decide',
      pos: 'fe’l (verb)',
      band: 'Core',
      meaningUz: 'Bir qarorga kelish, bir nechta variantdan birini qat’iy tanlash.',
      glossEn: 'choose after careful thought',
      excerpt: 'She had to think, learn the important parts, and decide what to do.',
      whyUseful: 'Kundalik hayotda eng ko‘p uchraydigan, faol harakatni ifodalovchi fe’l.',
      collocations: ['decide to do', 'decide between', 'finally decide', 'hard to decide'],
      check: {
        questionUz: '"Decide" so‘zi o‘rniga qaysi sinonim to‘g‘ri keladi?',
        options: [
          'Make a choice / determine',
          'Forget quickly',
          'Run away',
          'Paint slowly'
        ],
        answerIndex: 0,
        explainUz: '"Decide" — tanlov qilish, bir xulosaga kelishni anglatadi.'
      }
    },
    {
      lemma: 'important',
      pos: 'sifat (adjective)',
      band: 'Core',
      meaningUz: 'Katta ahamiyatga ega bo‘lgan, zarur va jiddiy e’tibor talab qiladigan.',
      glossEn: 'having great value or effect',
      excerpt: 'She had to think, learn the important parts, and decide what to do.',
      whyUseful: 'Narsalarning ustuvorligini bildirish uchun har kuni kerak bo‘ladi.',
      collocations: ['important role', 'most important', 'play an important part', 'important issue'],
      check: {
        questionUz: '"It is important to sleep well" jumlasining tarjimasi qaysi?',
        options: [
          'Yaxshi uxlash juda muhimdir',
          'Uxlash vaqtni bekor ketkazadi',
          'Uzoq yo‘lga chiqish qiziq',
          'Uxlash taqiqlangan'
        ],
        answerIndex: 0,
        explainUz: '"Important" so‘zi "muhim", "zarur" degan ma’noni beradi.'
      }
    },
    {
      lemma: 'problem',
      pos: 'ot (noun)',
      band: 'Core',
      meaningUz: 'Yechim talab qiladigan qiyinchilik yoki jumboq.',
      glossEn: 'a difficulty needing a solution',
      excerpt: 'The main problem was context: without evidence, it was hard to choose the right word.',
      whyUseful: 'Qiyinchiliklar va vazifalarni ifodalashda universal so‘z.',
      collocations: ['solve a problem', 'main problem', 'face a problem', 'serious problem'],
      check: {
        questionUz: '"The main problem was context" degani nimani anglatadi?',
        options: [
          'Asosiy muammo kontekst (vaziyat mazmuni) edi',
          'Kitobning narxi juda qimmat edi',
          'Muammo yo‘qolib qoldi',
          'Maya yangi ish topdi'
        ],
        answerIndex: 0,
        explainUz: '"Main problem" — eng bosh, asosiy qiyinchilik.'
      }
    },
    {
      lemma: 'choose',
      pos: 'fe’l (verb)',
      band: 'Core',
      meaningUz: 'Ikki yoki undan ortiq imkoniyat ichidan ma’qulini tanlamoq.',
      glossEn: 'pick out or select',
      excerpt: 'The main problem was context: without evidence, it was hard to choose the right word.',
      whyUseful: 'Xarid, qaror va so‘z tanlash kabi barcha amallarda kerak.',
      collocations: ['choose wisely', 'hard to choose', 'choose between', 'choose a path'],
      check: {
        questionUz: '"Choose the right word" jumlasining ma’nosi nima?',
        options: [
          'To‘g‘ri so‘zni tanlash',
          'So‘zni daftarga yozish',
          'So‘zni ovoz chiqarib o‘qish',
          'So‘zni lug‘atdan o‘chirish'
        ],
        answerIndex: 0,
        explainUz: '"Choose" — tanlash, ma’qul ko‘rish.'
      }
    },
    {
      lemma: 'mistake',
      pos: 'ot (noun)',
      band: 'Core',
      meaningUz: 'Noto‘g‘ri tushunish yoki xatolik oqibatida yo‘l qo‘yilgan kamchilik.',
      glossEn: 'an action that is not correct',
      excerpt: 'However, righting a small mistake today felt better than writing the same error again tomorrow.',
      whyUseful: 'O‘rganish jarayonining ajralmas qismini ifodalovchi asosiy so‘z.',
      collocations: ['make a mistake', 'by mistake', 'learn from mistakes', 'common mistake'],
      check: {
        questionUz: 'Qaysi ibora "xato qilish" ma’nosini bildiradi?',
        options: [
          'Make a mistake',
          'Do a mistake',
          'Take a mistake',
          'Give a mistake'
        ],
        answerIndex: 0,
        explainUz: 'Ingliz tilida xato qilish uchun doim "make a mistake" kollokatsiyasi ishlatiladi.'
      }
    },
    {
      lemma: 'finish',
      pos: 'fe’l (verb)',
      band: 'Core',
      meaningUz: 'Biror ish yoki jarayonni oxiriga yetkazmoq, tamomlamoq.',
      glossEn: 'bring to an end or complete',
      excerpt: 'Maya had no time to finish the work, but people around her wanted to help.',
      whyUseful: 'Vazifalarni yakunlash va muvaffaqiyatni bayon qilishda zarur.',
      collocations: ['finish the work', 'finish line', 'finish early', 'almost finished'],
      check: {
        questionUz: '"Finish" so‘zining to‘g‘ri ma’nosini toping:',
        options: [
          'Tugatmoq, yakuniga yetkazmoq',
          'Boshlamoq',
          'Kechiktirmoq',
          'Sotmoq'
        ],
        answerIndex: 0,
        explainUz: '"Finish" — ishni oxiriga yetkazish, tugatish demakdir.'
      }
    },
    {
      lemma: 'better',
      pos: 'sifat / ravish (adj/adv)',
      band: 'Core',
      meaningUz: 'Oldingisidan yoki boshqasidan sifatliroq, afzalroq, yaxshiroq.',
      glossEn: 'of higher quality or more suitable',
      excerpt: 'However, righting a small mistake today felt better than writing the same error again tomorrow.',
      whyUseful: 'Taqqoslash va baholashda eng asosiy taqqosiy sifat.',
      collocations: ['feel better', 'better than', 'get better', 'much better'],
      check: {
        questionUz: '"Good" sifatining qiyosiy (comparative) darajasi qaysi?',
        options: [
          'Better',
          'Gooder',
          'More good',
          'Best'
        ],
        answerIndex: 0,
        explainUz: '"Good" ning qiyosiy darajasi "better" (yaxshiroq) bo‘ladi.'
      }
    },
    {
      lemma: 'feel',
      pos: 'fe’l (verb)',
      band: 'Core',
      meaningUz: 'Sezmoq, his qilmoq yoki ma’lum bir holatda bo‘lmoq.',
      glossEn: 'experience an emotion or physical sensation',
      excerpt: 'However, righting a small mistake today felt better than writing the same error again tomorrow.',
      whyUseful: 'Insonning hissiy holati va kechinmalarini ifodalash uchun juda kerak.',
      collocations: ['feel better', 'feel like', 'feel free', 'feel confident'],
      check: {
        questionUz: '"Felt" shakli qaysi fe’lning o‘tgan zamonidir?',
        options: [
          'Feel',
          'Fill',
          'Fall',
          'Fail'
        ],
        answerIndex: 0,
        explainUz: '"Feel" ning o‘tgan zamon shakli (V2) "felt" dir.'
      }
    }
  ]
};

/**
 * Pure function to UPSERT a word into WordDatabase
 */
export function upsertWordRecord(
  db: Record<string, WordRecord>,
  extracted: ExtractionResult['words'][0],
  bookId: string,
  bookTitle: string
): { updatedDb: Record<string, WordRecord>; isNew: boolean } {
  const key = extracted.lemma.trim().toLowerCase();
  const existing = db[key];

  if (!existing) {
    const newWord: WordRecord = {
      lemma: key,
      pos: extracted.pos,
      band: extracted.band,
      meaningUz: extracted.meaningUz,
      glossEn: extracted.glossEn,
      examples: [
        {
          text: extracted.excerpt,
          sourceType: 'book',
          sourceName: bookTitle,
        },
      ],
      collocations: extracted.collocations || [],
      whyUseful: extracted.whyUseful,
      freqInLibrary: 1,
      bookIds: [bookId],
      mastery: 0,
      sourceNote: 'kitoblar bazasi',
      check: extracted.check,
      isEasilyConfused: extracted.isEasilyConfused || false,
      confusedWith: extracted.confusedWith,
    };

    return {
      updatedDb: {
        ...db,
        [key]: newWord,
      },
      isNew: true,
    };
  }

  // Word already exists:
  // - increase freqInLibrary
  // - add excerpt if not already in examples
  // - add bookId to bookIds if not present
  // - KEEP existing mastery and user learning history
  const alreadyHasExcerpt = existing.examples.some(
    (ex) => ex.text.trim().toLowerCase() === extracted.excerpt.trim().toLowerCase()
  );

  const updatedExamples = alreadyHasExcerpt
    ? existing.examples
    : [
        ...existing.examples,
        {
          text: extracted.excerpt,
          sourceType: 'book' as const,
          sourceName: bookTitle,
        },
      ];

  const updatedBookIds = existing.bookIds.includes(bookId)
    ? existing.bookIds
    : [...existing.bookIds, bookId];

  const mergedCollocations = Array.from(
    new Set([...existing.collocations, ...(extracted.collocations || [])])
  );

  const updatedWord: WordRecord = {
    ...existing,
    freqInLibrary: existing.freqInLibrary + 1,
    examples: updatedExamples,
    bookIds: updatedBookIds,
    collocations: mergedCollocations,
    isEasilyConfused: existing.isEasilyConfused || extracted.isEasilyConfused,
    confusedWith: existing.confusedWith || extracted.confusedWith,
    // Keep mastery unchanged!
  };

  return {
    updatedDb: {
      ...db,
      [key]: updatedWord,
    },
    isNew: false,
  };
}

/**
 * Upsert an entire ExtractionResult from a book into the WordDatabase
 */
export function upsertBookWords(
  db: Record<string, WordRecord>,
  extraction: ExtractionResult,
  bookId: string
): { updatedDb: Record<string, WordRecord>; newWordsCount: number; existingUpdatedCount: number } {
  let currentDb = { ...db };
  let newWordsCount = 0;
  let existingUpdatedCount = 0;

  for (const word of extraction.words) {
    const res = upsertWordRecord(currentDb, word, bookId, extraction.title);
    currentDb = res.updatedDb;
    if (res.isNew) {
      newWordsCount++;
    } else {
      existingUpdatedCount++;
    }
  }

  return {
    updatedDb: currentDb,
    newWordsCount,
    existingUpdatedCount,
  };
}

/**
 * Check if the RIGHTING boss lesson can be unlocked
 * Unlock condition:
 * - 8 words completed from database (mastery >= 1), OR
 * - immediately if 'righting' or 'writing' exist in the database!
 */
export function checkRightingBossUnlock(db: Record<string, WordRecord>): {
  unlocked: boolean;
  learnedCount: number;
  targetCount: number;
  hasHomophonesInDb: boolean;
  reasonUz: string;
} {
  const words = Object.values(db);
  const learnedCount = words.filter((w) => w.mastery >= 1).length;
  const hasRighting = !!db['righting'];
  const hasWriting = !!db['writing'];
  const hasHomophonesInDb = hasRighting || hasWriting;

  const targetCount = 8;
  const unlocked = learnedCount >= targetCount || hasHomophonesInDb;

  let reasonUz = '';
  if (hasHomophonesInDb) {
    reasonUz = 'Kitoblaringizda "righting" / "writing" so‘zlari aniqlandi! Dars ochiq.';
  } else if (learnedCount >= targetCount) {
    reasonUz = `8 ta so‘z o‘zlashtirildi (${learnedCount}/${targetCount}). Dars ochiq!`;
  } else {
    reasonUz = `${targetCount} ta so‘zdan ${learnedCount} tasi o‘rganildi (${learnedCount}/${targetCount}).`;
  }

  return {
    unlocked,
    learnedCount,
    targetCount,
    hasHomophonesInDb,
    reasonUz,
  };
}

/**
 * Update word mastery on user answering check questions
 * Mastery ranges from 0 to 3:
 * 0: Yangi
 * 1: Boshlang'ich
 * 2: O'rta
 * 3: Mustahkam
 */
export function updateWordMasteryState(
  db: Record<string, WordRecord>,
  lemma: string,
  isCorrect: boolean
): { updatedDb: Record<string, WordRecord>; newMastery: number; xpEarned: number } {
  const key = lemma.trim().toLowerCase();
  const word = db[key];
  if (!word) {
    return { updatedDb: db, newMastery: 0, xpEarned: 0 };
  }

  let newMastery = word.mastery;
  let xpEarned = 0;

  if (isCorrect) {
    newMastery = Math.min(3, word.mastery + 1);
    xpEarned = newMastery === 1 ? 15 : newMastery === 2 ? 20 : 30;
  } else {
    // Gentle approach: no punishing hearts, slight setback if already advanced
    newMastery = Math.max(0, word.mastery - 1);
    xpEarned = 5; // consolation XP for attempting and reading explanation
  }

  const updatedWord: WordRecord = {
    ...word,
    mastery: newMastery,
    lastStudiedAt: new Date().toISOString(),
  };

  return {
    updatedDb: {
      ...db,
      [key]: updatedWord,
    },
    newMastery,
    xpEarned,
  };
}

/**
 * Get initial state for UserProgress
 */
export function getInitialUserProgress(): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  return {
    xp: 0,
    streak: 1,
    lastActiveDate: today,
    dailyQuest: {
      date: today,
      wordsLearned: 0,
      wordsReviewed: 0,
    },
    badges: [],
  };
}

/**
 * Check and award badges
 */
export function evaluateBadges(
  progress: UserProgress,
  words: Record<string, WordRecord>,
  books: BookRecord[],
  bossCompleted = false
): UserProgress {
  const badges = [...progress.badges];
  const hasBadge = (id: string) => badges.some((b) => b.id === id);

  // Badge: Birinchi kitob
  if (books.length >= 1 && !hasBadge('first-book')) {
    badges.push({
      id: 'first-book',
      title: 'Kutubxona egasi',
      description: 'Dasturga ilk kitob yoki matn yuklandi',
      unlockedAt: new Date().toISOString(),
      icon: 'BookOpen',
    });
  }

  // Badge: So'z ustasi (at least 10 words in library)
  const totalWords = Object.keys(words).length;
  if (totalWords >= 10 && !hasBadge('words-10')) {
    badges.push({
      id: 'words-10',
      title: 'So‘z xazinasi',
      description: 'Shaxsiy bazada 10 dan ortiq so‘z yig‘ildi',
      unlockedAt: new Date().toISOString(),
      icon: 'Layers',
    });
  }

  // Badge: Omofon ovchisi
  if (bossCompleted && !hasBadge('omofon-ovchisi')) {
    badges.push({
      id: 'omofon-ovchisi',
      title: 'Omofon ovchisi',
      description: 'RIGHTING va writing boss darsini muvaffaqiyatli tamomladingiz!',
      unlockedAt: new Date().toISOString(),
      icon: 'Award',
    });
  }

  return {
    ...progress,
    badges,
  };
}
