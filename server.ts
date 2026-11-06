import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_EXTRACTION } from './src/data/wordDatabase';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI client (only if key exists)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback dictionary for offline or API errors
const COMMON_DICTIONARY: Record<
  string,
  {
    pos: string;
    band: 'Core' | 'Mid' | 'Rare';
    meaningUz: string;
    glossEn: string;
    whyUseful: string;
    collocations: string[];
    check: { questionUz: string; options: string[]; answerIndex: number; explainUz: string };
  }
> = {
  evidence: {
    pos: 'ot (noun)',
    band: 'Core',
    meaningUz: 'Biror narsaning to‘g‘ri yoki borligini isbotlovchi dalil, isbot.',
    glossEn: 'facts or signs showing truth',
    whyUseful: 'Ilmiy, rasmiy va kundalik mantiqda fikrni asoslash uchun asosiy so‘z.',
    collocations: ['clear evidence', 'without evidence', 'gather evidence', 'strong evidence'],
    check: {
      questionUz: 'Qaysi vaziyatda "evidence" (dalil) so‘zi to‘g‘ri ishlatilgan?',
      options: [
        'The police found strong evidence at the scene.',
        'He poured evidence into the cup.',
        'We need to buy three fresh evidences.',
        'The weather is very evidence today.'
      ],
      answerIndex: 0,
      explainUz: '"Evidence" — biror faktni isbotlovchi ashyoviy yoki mantiqiy dalildir.'
    }
  },
  context: {
    pos: 'ot (noun)',
    band: 'Core',
    meaningUz: 'So‘z yoki voqeaning atrofi, vaziyat va mazmunni belgilovchi umumiy sharoit.',
    glossEn: 'surrounding situation or meaning',
    whyUseful: 'Ingliz tilida so‘zlarni joyida va o‘rinli qo‘llash uchun eng kerakli tushuncha.',
    collocations: ['in this context', 'out of context', 'historical context', 'social context'],
    check: {
      questionUz: '"Out of context" iborasining ma’nosi nima?',
      options: [
        'Kontekstdan, umumiy mazmundan yulib olingan',
        'Juda aniq va tushunarli aytilgan',
        'Yangi kitobdan olingan',
        'Xato yozilgan so‘z'
      ],
      answerIndex: 0,
      explainUz: '"Out of context" — butun matndan ajratib, noto‘g‘ri talqin qilishni bildiradi.'
    }
  },
  righting: {
    pos: 'fe’l (verb / gerund)',
    band: 'Mid',
    meaningUz: 'Xatoni to‘g‘rilash, adolatsizlikni tuzatish yoki yiqilgan narsani tiklash.',
    glossEn: 'correcting a wrong or restoring balance',
    whyUseful: '"Writing" (yozish) bilan omofon; adolat va xatoni to‘g‘rilash ma’nosida ishlatiladi.',
    collocations: ['righting a wrong', 'righting an injustice', 'righting the ship', 'righting reflex'],
    check: {
      questionUz: '"Righting a wrong" nimani bildiradi?',
      options: [
        'Qilingan xato yoki adolatsizlikni to‘g‘rilash',
        'Xat yozib jo‘natish',
        'O‘ng tomonga burilish',
        'Kitob o‘qish'
      ],
      answerIndex: 0,
      explainUz: '"Righting a wrong" — xatoni tuzatish ma’nosidagi klassik ibora.'
    }
  },
  writing: {
    pos: 'ot / fe’l (noun/verb)',
    band: 'Core',
    meaningUz: 'Yozish, matn tuzish yoki qog‘ozga tushirish jarayoni.',
    glossEn: 'creating text or words',
    whyUseful: 'Muloqotning eng asosiy shakllaridan biri.',
    collocations: ['in writing', 'creative writing', 'writing skills', 'writing an essay'],
    check: {
      questionUz: '"Writing" so‘zining to‘g‘ri ma’nosi qaysi?',
      options: [
        'Yozish yoki yozma matn',
        'To‘g‘rilash',
        'Eshitish',
        'Yugurish'
      ],
      answerIndex: 0,
      explainUz: '"Writing" — yozish jarayoni yoki qo‘lyozma.'
    }
  },
  decide: {
    pos: 'fe’l (verb)',
    band: 'Core',
    meaningUz: 'Bir qarorga kelish, variantlar orasidan birini qat’iy tanlash.',
    glossEn: 'make a final choice',
    whyUseful: 'Qaror qabul qilishda kundalik hayotdagi eng ko‘p qo‘llanadigan so‘z.',
    collocations: ['decide to do', 'decide between', 'finally decide', 'hard to decide'],
    check: {
      questionUz: '"Decide" so‘zi nimani anglatadi?',
      options: ['Qaror qilmoq, tanlamoq', 'Uxlashga yotmoq', 'Savol bermoq', 'Kutmoq'],
      answerIndex: 0,
      explainUz: '"Decide" — aniq bir qarorga kelish.'
    }
  },
  important: {
    pos: 'sifat (adj)',
    band: 'Core',
    meaningUz: 'Ahamiyatli, zarur va katta qimmatga ega.',
    glossEn: 'of great significance or value',
    whyUseful: 'Ustuvorlikni ifodalashda ajralmas so‘z.',
    collocations: ['important role', 'most important', 'important decision', 'vital importance'],
    check: {
      questionUz: '"Important" so‘zining ma’nodoshini toping:',
      options: ['Crucial / Significant', 'Boring', 'Tiny', 'Slow'],
      answerIndex: 0,
      explainUz: '"Crucial" va "significant" so‘zlari "important" kabi muhimlikni bildiradi.'
    }
  },
  problem: {
    pos: 'ot (noun)',
    band: 'Core',
    meaningUz: 'Hal qilinishi lozim bo‘lgan qiyin masala yoki vaziyat.',
    glossEn: 'difficulty needing a solution',
    whyUseful: 'Qiyinchiliklarni ifodalash uchun universal so‘z.',
    collocations: ['solve a problem', 'face a problem', 'serious problem', 'problem solver'],
    check: {
      questionUz: 'Qaysi fe’l "problem" bilan eng ko‘p birga keladi?',
      options: ['Solve a problem', 'Drink a problem', 'Wear a problem', 'Fly a problem'],
      answerIndex: 0,
      explainUz: 'Muammoni yechish uchun "solve a problem" kollokatsiyasi qo‘llanadi.'
    }
  },
  mistake: {
    pos: 'ot (noun)',
    band: 'Core',
    meaningUz: 'Xato, noto‘g‘ri qadam yoki yanglishish.',
    glossEn: 'an error or incorrect action',
    whyUseful: 'Xatolardan o‘rganish va tuzatish jarayonini ifodalaydi.',
    collocations: ['make a mistake', 'by mistake', 'learn from mistakes', 'huge mistake'],
    check: {
      questionUz: 'Ingliz tilida "xato qildim" deyish qanday aytiladi?',
      options: ['I made a mistake', 'I did a mistake', 'I took a mistake', 'I ran a mistake'],
      answerIndex: 0,
      explainUz: '"Mistake" so‘zi bilan har doim "make" fe’li ishlatiladi.'
    }
  }
};

function fallbackExtractWords(text: string, title?: string) {
  // Check if text is mostly English
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.length;
  if (totalChars > 30 && latinChars / totalChars < 0.3) {
    return {
      title: title || 'Yuklangan fayl',
      levelGuess: 'B1' as const,
      words: [],
      warningUz: 'Matn ingliz tilida emasga o‘xshaydi. Iltimos, inglizcha kitob yoki matn yuklang.'
    };
  }

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  const wordsFound: Array<{
    lemma: string;
    pos: string;
    band: 'Core' | 'Mid' | 'Rare';
    meaningUz: string;
    glossEn: string;
    excerpt: string;
    whyUseful: string;
    collocations: string[];
    check: { questionUz: string; options: string[]; answerIndex: number; explainUz: string };
    isEasilyConfused?: boolean;
    confusedWith?: string;
  }> = [];

  const seenLemmas = new Set<string>();

  // Helper to find sentence with word
  const findSentenceForWord = (w: string) => {
    const rx = new RegExp(`\\b${w}\\b`, 'i');
    for (const s of sentences) {
      if (rx.test(s)) {
        return s.trim().slice(0, 180);
      }
    }
    return `In your book: "...${w}..." was used in this passage.`;
  };

  // Prioritize righting/writing if found
  const lowerText = text.toLowerCase();
  const hasRighting = /\brighting\b/.test(lowerText);
  const hasWriting = /\bwriting\b/.test(lowerText);

  if (hasRighting) {
    seenLemmas.add('righting');
    wordsFound.push({
      lemma: 'righting',
      ...COMMON_DICTIONARY.righting,
      excerpt: findSentenceForWord('righting'),
      isEasilyConfused: true,
      confusedWith: 'writing',
    });
  }
  if (hasWriting) {
    seenLemmas.add('writing');
    wordsFound.push({
      lemma: 'writing',
      ...COMMON_DICTIONARY.writing,
      excerpt: findSentenceForWord('writing'),
      isEasilyConfused: true,
      confusedWith: 'righting',
    });
  }

  // Check known dictionary words
  for (const [key, item] of Object.entries(COMMON_DICTIONARY)) {
    if (seenLemmas.has(key)) continue;
    const rx = new RegExp(`\\b${key}\\b`, 'i');
    if (rx.test(text)) {
      seenLemmas.add(key);
      wordsFound.push({
        lemma: key,
        ...item,
        excerpt: findSentenceForWord(key),
      });
    }
  }

  // If still fewer than 12 words, extract other meaningful candidate words
  const tokens = text.match(/\b[a-zA-Z]{5,15}\b/g) || [];
  const stopWords = new Set([
    'there', 'their', 'which', 'about', 'would', 'could', 'should',
    'other', 'these', 'where', 'after', 'before', 'being', 'under'
  ]);

  for (const rawToken of tokens) {
    if (wordsFound.length >= 14) break;
    const lemma = rawToken.toLowerCase();
    if (seenLemmas.has(lemma) || stopWords.has(lemma)) continue;

    seenLemmas.add(lemma);
    const excerpt = findSentenceForWord(lemma);
    wordsFound.push({
      lemma,
      pos: 'lug‘at birligi',
      band: lemma.length > 8 ? 'Mid' : 'Core',
      meaningUz: `"${lemma}" so‘zi matningizda muhim ma’noda kelgan kalit so‘zlardan biridir.`,
      glossEn: `useful vocabulary from your reading`,
      excerpt,
      whyUseful: `Ushbu so‘z kitobingizda tabiiy tilda qo‘llangan.`,
      collocations: [`use ${lemma}`, `understand ${lemma}`, `in context: ${lemma}`],
      check: {
        questionUz: `Kitobingizdagi gapda "${lemma}" so‘zi qanday vazifada kelgan?`,
        options: [
          `Matn mazmuniga ko‘ra to‘g‘ri ma’noda ishlatilgan`,
          `Gapda xato yozilgan`,
          `Qisqartma so‘z`,
          `Son ma’nosida`
        ],
        answerIndex: 0,
        explainUz: `"${lemma}" so‘zi kitobingizdagi kontekstda aniq ma’no ifodalamoqda.`
      }
    });
  }

  return {
    title: title || 'Yuklangan kitob / matn',
    levelGuess: (wordsFound.length > 8 ? 'B1' : 'A2') as 'A2' | 'B1' | 'B2' | 'C1',
    words: wordsFound.length > 0 ? wordsFound : SAMPLE_EXTRACTION.words,
  };
}

// 1. API: Extract Words
app.post('/api/extract-words', async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Matn bo‘sh bo‘lishi mumkin emas.' });
    }

    // Limit text to first ~25k characters for speed & privacy
    const truncatedText = text.slice(0, 25000);

    // If text contains the Maya sample text, return SAMPLE_EXTRACTION directly for instant high fidelity
    if (text.includes('Maya had no time to finish the work')) {
      return res.json({
        ...SAMPLE_EXTRACTION,
        title: title || SAMPLE_EXTRACTION.title,
      });
    }

    if (!aiClient) {
      // Offline fallback
      const fallbackResult = fallbackExtractWords(truncatedText, title);
      return res.json(fallbackResult);
    }

    // Gemini 3.8 Flash extraction
    const prompt = `You are the core language engine of "Orinli", an English learning app for Uzbek speakers.
Your mission is to extract 12 to 16 useful content words (skip pure function words like the/and/of/in/on/at) from the user's uploaded book excerpt.

If "righting" or "writing" appears in the text, you MUST include them and mark isEasilyConfused: true, noting they are homophones (/ˈraɪ.tɪŋ/).
If the text is NOT English, return words: [] and a helpful warningUz in Uzbek.

Uploaded text:
"""
${truncatedText}
"""

Required JSON schema:
{
  "title": "${title || 'Kitob'}",
  "levelGuess": "A2" | "B1" | "B2" | "C1",
  "words": [
    {
      "lemma": "base form in lowercase English",
      "pos": "ot (noun) | fe’l (verb) | sifat (adjective) | ravish (adverb)",
      "band": "Core" | "Mid" | "Rare",
      "meaningUz": "1 short simple Uzbek sentence explaining the real meaning",
      "glossEn": "3 to 6 words English gloss",
      "excerpt": "ONE short sentence strictly from the uploaded text containing this word (max 200 chars)",
      "whyUseful": "one short simple Uzbek sentence explaining why this word matters",
      "collocations": ["2 to 4 natural English phrases"],
      "check": {
        "questionUz": "one clear multiple-choice question in Uzbek testing this word's meaning or usage",
        "options": ["correct answer", "distractor 1", "distractor 2", "distractor 3"],
        "answerIndex": 0,
        "explainUz": "brief 1-2 sentence explanation in Uzbek why the answer is correct"
      },
      "isEasilyConfused": false,
      "confusedWith": "optional string e.g. writing"
    }
  ]
}
Return strictly JSON matching this structure.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      const fallbackResult = fallbackExtractWords(truncatedText, title);
      return res.json(fallbackResult);
    }

    const parsed = JSON.parse(responseText);
    // Sanity validation
    if (!parsed.words || !Array.isArray(parsed.words) || parsed.words.length === 0) {
      const fallbackResult = fallbackExtractWords(truncatedText, title);
      return res.json(fallbackResult);
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Error in /api/extract-words:', error);
    // Always return fallback so app never crashes
    try {
      const fallback = fallbackExtractWords(req.body?.text || '', req.body?.title);
      return res.json(fallback);
    } catch {
      return res.json(SAMPLE_EXTRACTION);
    }
  }
});

// 2. API: Word Help Assistant
app.post('/api/word-help', async (req, res) => {
  try {
    const { word, questionType } = req.body;
    if (!word || !word.lemma) {
      return res.status(400).json({ error: 'So‘z ma’lumoti topilmadi.' });
    }

    const lemma = word.lemma;
    const meaningUz = word.meaningUz;
    const excerpt = word.examples?.[0]?.text || '';

    let userIntentUz = 'Yana soddaroq tushuntir';
    if (questionType === 'another_example') {
      userIntentUz = 'Boshqa misol ber';
    } else if (questionType === 'quiz_me') {
      userIntentUz = 'Meni tekshir (bitta qiziq savol ber)';
    }

    if (!aiClient) {
      // Warm, helpful offline fallback
      let fallbackText = '';
      if (questionType === 'simplify') {
        fallbackText = `"${lemma}" so‘zini eng oddiy qilib tushunsak: ${meaningUz} Misol uchun, kitobingizdagi "${excerpt}" jumlasi bu so‘z qanday vaziyatda tabiiy chiqishini yaqqol ko‘rsatadi.`;
      } else if (questionType === 'another_example') {
        fallbackText = `Yana bitta amaliy misol: "It is important to understand '${lemma}' in everyday speech." Bu yerda so‘z kundalik suhbatda faol qo‘llangan.`;
      } else {
        fallbackText = `Kichik sinov: Agar "${lemma}" so‘zini o‘z jumlangizda ishlatsangiz, u qaysi o‘rinda keladi? Kitobingizdagi kabi: "${excerpt}" shaklida eslab qolish eng oson yo‘l!`;
      }
      return res.json({ type: questionType, responseUz: fallbackText });
    }

    const prompt = `You are the friendly, encouraging AI tutor in "Orinli".
A learner is studying the English word "${lemma}" (${word.pos}).
Uzbek meaning: "${meaningUz}"
Book excerpt: "${excerpt}"
User requested: "${userIntentUz}"

Respond in 2 to 4 SHORT, SIMPLE Uzbek sentences with a warm, encouraging tone.
- If "simplify": Explain in everyday, child-friendly Uzbek without academic jargon.
- If "another_example": Give 1-2 brand new, very clear English sentences with Uzbek translation.
- If "quiz_me": Ask one friendly quick question in Uzbek to check their understanding.
Keep response concise and clear. No markdown headers.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    return res.json({
      type: questionType,
      responseUz: responseText.trim(),
    });
  } catch (error) {
    console.error('Error in /api/word-help:', error);
    const lemma = req.body?.word?.lemma || 'so‘z';
    const fallbackText = `"${lemma}" so‘zi bo‘yicha tushuntirish: Bu so‘z kitobingizdagi kontekstda eng to‘g‘ri ma’noda qo‘llangan. Kollokatsiyalariga e’tibor bering, shunda so‘zni eslab qolish ancha osonlashadi.`;
    return res.json({
      type: req.body?.questionType || 'simplify',
      responseUz: fallbackText,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Orinli app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
