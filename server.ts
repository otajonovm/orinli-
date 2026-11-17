import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { SAMPLE_EXTRACTION } from './src/data/wordDatabase';
import {
  analyzeBook,
  bncStatus,
  checkWriting,
  explainWord,
  generateTask,
  isAIConfigured,
  safeErrorMessage,
  suggestCollocations,
  type AIAction,
} from './server/ai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

/** Local offline word extraction fallback (no Gemini) */
function fallbackExtractWords(text: string, title?: string) {
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.length;
  if (totalChars > 30 && latinChars / totalChars < 0.3) {
    return {
      title: title || 'Yuklangan fayl',
      levelGuess: 'B1' as const,
      words: [],
      warningUz: 'Matn ingliz tilida emasga o‘xshaydi. Iltimos, inglizcha kitob yoki matn yuklang.',
    };
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const wordsFound: typeof SAMPLE_EXTRACTION.words = [];
  const seen = new Set<string>();

  const findSentence = (w: string) => {
    const rx = new RegExp(`\\b${w}\\b`, 'i');
    for (const s of sentences) {
      if (rx.test(s)) return s.trim().slice(0, 180);
    }
    return `In your book: "...${w}..." was used in this passage.`;
  };

  for (const w of SAMPLE_EXTRACTION.words) {
    const rx = new RegExp(`\\b${w.lemma}\\b`, 'i');
    if (rx.test(text) && !seen.has(w.lemma)) {
      seen.add(w.lemma);
      wordsFound.push({ ...w, excerpt: findSentence(w.lemma) });
    }
  }

  const tokens = text.match(/\b[a-zA-Z]{5,15}\b/g) || [];
  const stop = new Set(['there', 'their', 'which', 'about', 'would', 'could', 'should', 'other', 'these', 'where', 'after', 'before', 'being', 'under']);
  for (const raw of tokens) {
    if (wordsFound.length >= 14) break;
    const lemma = raw.toLowerCase();
    if (seen.has(lemma) || stop.has(lemma)) continue;
    seen.add(lemma);
    wordsFound.push({
      lemma,
      pos: 'lug‘at birligi',
      band: lemma.length > 8 ? 'Mid' : 'Core',
      meaningUz: `"${lemma}" so‘zi matningizda muhim ma’noda kelgan kalit so‘zlardan biridir.`,
      glossEn: 'useful vocabulary from your reading',
      excerpt: findSentence(lemma),
      whyUseful: 'Ushbu so‘z kitobingizda tabiiy tilda qo‘llangan.',
      collocations: [`use ${lemma}`, `understand ${lemma}`],
      check: {
        questionUz: `Kitobingizdagi gapda "${lemma}" so‘zi qanday vazifada kelgan?`,
        options: [
          'Matn mazmuniga ko‘ra to‘g‘ri ma’noda ishlatilgan',
          'Gapda xato yozilgan',
          'Qisqartma so‘z',
          'Son ma’nosida',
        ],
        answerIndex: 0,
        explainUz: `"${lemma}" so‘zi kitobingizdagi kontekstda aniq ma’no ifodalamoqda.`,
      },
    });
  }

  return {
    title: title || 'Yuklangan kitob / matn',
    levelGuess: (wordsFound.length > 8 ? 'B1' : 'A2') as 'A2' | 'B1' | 'B2' | 'C1',
    words: wordsFound.length > 0 ? wordsFound : SAMPLE_EXTRACTION.words,
  };
}

// Unified AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const action = req.body?.action as AIAction;
    const payload = req.body?.payload || {};

    if (action === 'analyzeBook') {
      const text = payload.text || '';
      const title = payload.title;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({
          error: 'Matn bo‘sh bo‘lishi mumkin emas.',
          messageUz: 'Matn bo‘sh. Iltimos, matn joylashtiring.',
        });
      }

      if (text.includes('Maya had no time to finish the work')) {
        return res.json({
          ...SAMPLE_EXTRACTION,
          title: title || SAMPLE_EXTRACTION.title,
          _meta: { source: 'fallback' },
        });
      }

      const local = fallbackExtractWords(text.slice(0, 25000), title);
      const result = await analyzeBook({ text, title }, local);

      if ((result as { _meta?: { error?: string } })._meta?.error) {
        console.error(
          '[/api/ai analyzeBook] Sabab:',
          (result as { _meta: { error?: string } })._meta.error,
          '| Gemini sozlangan:',
          isAIConfigured()
        );
      }

      return res.json(result);
    }

    if (action === 'explainWord') {
      const result = await explainWord(payload);
      return res.json(result);
    }

    if (action === 'checkWriting') {
      if (!payload.text || typeof payload.text !== 'string' || !payload.text.trim()) {
        return res.status(400).json({
          error: 'Matn bo‘sh',
          messageUz: 'Tekshirish uchun matn yozing.',
        });
      }
      const result = await checkWriting(payload);
      return res.json(result);
    }

    if (action === 'suggestCollocations') {
      const result = await suggestCollocations(payload);
      return res.json(result);
    }

    if (action === 'generateTask') {
      const result = await generateTask(payload);
      return res.json(result);
    }

    return res.status(400).json({
      error: 'Noma’lum amal',
      messageUz: 'So‘rov noto‘g‘ri. Qayta urinib ko‘ring.',
    });
  } catch (error) {
    const msg = safeErrorMessage(error);
    console.error('[/api/ai] Kutilmagan xato:', msg);
    return res.status(200).json({
      messageUz: 'AI vaqtincha ishlamayapti. Mahalliy yordamchi ishlatilmoqda.',
      error: msg,
      _meta: { source: 'fallback', error: msg },
    });
  }
});

// Legacy aliases (compat with existing UploadModal / LearnScreen)
app.post('/api/extract-words', async (req, res) => {
  try {
    const { text, title } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Matn bo‘sh bo‘lishi mumkin emas.' });
    }

    console.info('[/api/extract-words] Gemini sozlangan:', isAIConfigured(), '| matn uzunligi:', text.length);

    if (text.includes('Maya had no time to finish the work')) {
      return res.json({ ...SAMPLE_EXTRACTION, title: title || SAMPLE_EXTRACTION.title });
    }

    const local = fallbackExtractWords(text.slice(0, 25000), title);
    const result = await analyzeBook({ text, title }, local);

    if ((result as { _meta?: { error?: string; source?: string } })._meta?.error) {
      console.error(
        '[/api/extract-words] Tahlil xatosi (dev):',
        (result as { _meta: { error?: string } })._meta.error
      );
    } else {
      console.info(
        '[/api/extract-words] Manba:',
        (result as { _meta?: { source?: string } })._meta?.source || 'noma’lum'
      );
    }

    return res.json(result);
  } catch (error) {
    const msg = safeErrorMessage(error);
    console.error('[/api/extract-words] Xato sababi:', msg);
    try {
      return res.json(fallbackExtractWords(req.body?.text || '', req.body?.title));
    } catch {
      return res.json(SAMPLE_EXTRACTION);
    }
  }
});

app.post('/api/word-help', async (req, res) => {
  try {
    const { word, questionType } = req.body || {};
    if (!word?.lemma) {
      return res.status(400).json({ error: 'So‘z ma’lumoti topilmadi.' });
    }
    const result = await explainWord({
      lemma: word.lemma,
      pos: word.pos,
      meaningUz: word.meaningUz,
      excerpt: word.examples?.[0]?.text || '',
      questionType: questionType || 'simplify',
    });
    return res.json(result);
  } catch (error) {
    console.error('[/api/word-help]', safeErrorMessage(error));
    const lemma = req.body?.word?.lemma || 'so‘z';
    return res.json({
      type: req.body?.questionType || 'simplify',
      responseUz: `"${lemma}" so‘zi bo‘yicha qisqa yordam: kontekst va kollokatsiyalarga e’tibor bering.`,
    });
  }
});

app.get('/api/status', (_req, res) => {
  const bnc = bncStatus();
  res.json({
    gemini: isAIConfigured(),
    bnc: {
      connected: bnc.connected,
      labelUz: bnc.connected ? 'BNC: ulangan' : 'BNC: ulanmagan',
    },
    app: 'WriteTechAI',
  });
});

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
    console.log(`WriteTechAI http://0.0.0.0:${PORT}`);
    console.log(`Gemini: ${isAIConfigured() ? 'faol' : 'GEMINI_API_KEY yo‘q — mahalliy rejim'}`);
    const bnc = bncStatus();
    console.log(`BNC: ${bnc.connected ? 'ulangan' : 'ulanmagan'}`);
  });
}

startServer();
