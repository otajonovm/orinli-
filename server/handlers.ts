/**
 * Shared API handlers — used by Express (local) and Vercel serverless.
 */
import { SAMPLE_EXTRACTION } from '../src/data/wordDatabase';
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
} from './ai';

export type HandlerResult = { status: number; body: unknown };

export function fallbackExtractWords(text: string, title?: string) {
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  const totalChars = text.length;
  if (totalChars > 30 && latinChars / totalChars < 0.3) {
    return {
      title: title || 'Yuklangan fayl',
      levelGuess: 'B1' as const,
      words: [],
      warningUz:
        'Matn ingliz tilida emasga o‘xshaydi. Iltimos, inglizcha kitob yoki matn yuklang.',
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
  const stop = new Set([
    'there', 'their', 'which', 'about', 'would', 'could', 'should',
    'other', 'these', 'where', 'after', 'before', 'being', 'under',
  ]);
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

export async function handleAi(body: {
  action?: AIAction;
  payload?: Record<string, unknown>;
}): Promise<HandlerResult> {
  try {
    const action = body?.action as AIAction;
    const payload = (body?.payload || {}) as Record<string, unknown>;

    if (action === 'analyzeBook') {
      const text = (payload.text as string) || '';
      const title = payload.title as string | undefined;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return {
          status: 400,
          body: {
            error: 'Matn bo‘sh bo‘lishi mumkin emas.',
            messageUz: 'Matn bo‘sh. Iltimos, matn joylashtiring.',
          },
        };
      }

      if (text.includes('Maya had no time to finish the work')) {
        return {
          status: 200,
          body: {
            ...SAMPLE_EXTRACTION,
            title: title || SAMPLE_EXTRACTION.title,
            _meta: { source: 'fallback' },
          },
        };
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

      return { status: 200, body: result };
    }

    if (action === 'explainWord') {
      return { status: 200, body: await explainWord(payload as never) };
    }

    if (action === 'checkWriting') {
      if (!payload.text || typeof payload.text !== 'string' || !(payload.text as string).trim()) {
        return {
          status: 400,
          body: { error: 'Matn bo‘sh', messageUz: 'Tekshirish uchun matn yozing.' },
        };
      }
      return { status: 200, body: await checkWriting(payload as never) };
    }

    if (action === 'suggestCollocations') {
      return { status: 200, body: await suggestCollocations(payload as never) };
    }

    if (action === 'generateTask') {
      return { status: 200, body: await generateTask(payload as never) };
    }

    return {
      status: 400,
      body: {
        error: 'Noma’lum amal',
        messageUz: 'So‘rov noto‘g‘ri. Qayta urinib ko‘ring.',
      },
    };
  } catch (error) {
    const msg = safeErrorMessage(error);
    console.error('[/api/ai] Kutilmagan xato:', msg);
    return {
      status: 200,
      body: {
        messageUz: 'AI vaqtincha ishlamayapti. Mahalliy yordamchi ishlatilmoqda.',
        error: msg,
        _meta: { source: 'fallback', error: msg },
      },
    };
  }
}

export async function handleExtractWords(body: {
  text?: string;
  title?: string;
}): Promise<HandlerResult> {
  try {
    const { text, title } = body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return { status: 400, body: { error: 'Matn bo‘sh bo‘lishi mumkin emas.' } };
    }

    console.info(
      '[/api/extract-words] Gemini sozlangan:',
      isAIConfigured(),
      '| matn uzunligi:',
      text.length
    );

    if (text.includes('Maya had no time to finish the work')) {
      return {
        status: 200,
        body: { ...SAMPLE_EXTRACTION, title: title || SAMPLE_EXTRACTION.title },
      };
    }

    const local = fallbackExtractWords(text.slice(0, 25000), title);
    const result = await analyzeBook({ text, title }, local);

    if ((result as { _meta?: { error?: string } })._meta?.error) {
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

    return { status: 200, body: result };
  } catch (error) {
    const msg = safeErrorMessage(error);
    console.error('[/api/extract-words] Xato sababi:', msg);
    try {
      return {
        status: 200,
        body: fallbackExtractWords(body?.text || '', body?.title),
      };
    } catch {
      return { status: 200, body: SAMPLE_EXTRACTION };
    }
  }
}

export async function handleWordHelp(body: {
  word?: {
    lemma?: string;
    pos?: string;
    meaningUz?: string;
    examples?: Array<{ text?: string }>;
  };
  questionType?: 'simplify' | 'another_example' | 'quiz_me';
}): Promise<HandlerResult> {
  try {
    const { word, questionType } = body || {};
    if (!word?.lemma) {
      return { status: 400, body: { error: 'So‘z ma’lumoti topilmadi.' } };
    }
    const result = await explainWord({
      lemma: word.lemma,
      pos: word.pos,
      meaningUz: word.meaningUz,
      excerpt: word.examples?.[0]?.text || '',
      questionType: questionType || 'simplify',
    });
    return { status: 200, body: result };
  } catch (error) {
    console.error('[/api/word-help]', safeErrorMessage(error));
    const lemma = body?.word?.lemma || 'so‘z';
    return {
      status: 200,
      body: {
        type: body?.questionType || 'simplify',
        responseUz: `"${lemma}" so‘zi bo‘yicha qisqa yordam: kontekst va kollokatsiyalarga e’tibor bering.`,
      },
    };
  }
}

export function handleStatus(): HandlerResult {
  const bnc = bncStatus();
  return {
    status: 200,
    body: {
      gemini: isAIConfigured(),
      bnc: {
        connected: bnc.connected,
        labelUz: bnc.connected ? 'BNC: ulangan' : 'BNC: ulanmagan',
      },
      app: 'WriteTechAI',
    },
  };
}
