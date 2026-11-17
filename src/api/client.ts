import {
  ExtractionResult,
  FieldType,
  LevelType,
  WritingCheckResult,
  WritingTask,
  WritingType,
} from '../types';

async function postAI<T>(
  action: string,
  payload: unknown
): Promise<T & { messageUz?: string; _meta?: { source?: string; error?: string } }> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  const raw = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    console.error(
      `[api/ai ${action}] JSON emas (status ${res.status}):`,
      raw.slice(0, 200)
    );
    throw new Error(
      res.status === 404
        ? 'API topilmadi (404). Vercel serverless /api marshrutlarini tekshiring.'
        : `Server noto‘g‘ri javob qaytardi (${res.status}).`
    );
  }

  if (!res.ok) {
    const msg =
      (data?.messageUz as string) ||
      (data?.error as string) ||
      `So‘rov xatosi (${res.status})`;
    console.error(`[api/ai ${action}]`, msg, (data?._meta as { error?: string })?.error || '');
    throw new Error(msg);
  }

  const meta = data._meta as { source?: string; error?: string } | undefined;
  if (meta?.error) {
    console.error(`[api/ai ${action}] Dev sabab:`, meta.error, '| manba:', meta.source);
  }

  return data as T & { messageUz?: string; _meta?: { source?: string; error?: string } };
}

export async function apiAnalyzeBook(text: string, title?: string): Promise<ExtractionResult> {
  try {
    return await postAI<ExtractionResult>('analyzeBook', { text, title });
  } catch (e) {
    console.error('[apiAnalyzeBook]', e);
    // Fallback via legacy endpoint
    const res = await fetch('/api/extract-words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title }),
    });
    return res.json();
  }
}

export async function apiExplainWord(input: {
  lemma: string;
  pos?: string;
  meaningUz?: string;
  excerpt?: string;
  questionType: 'simplify' | 'another_example' | 'quiz_me';
}) {
  return postAI<{ type: string; responseUz: string }>('explainWord', input);
}

export async function apiCheckWriting(input: {
  text: string;
  type: WritingType;
  field: FieldType;
  level: LevelType;
}): Promise<WritingCheckResult> {
  const data = await postAI<WritingCheckResult>('checkWriting', input);
  return {
    overallScore: data.overallScore ?? 50,
    scores: data.scores ?? {
      correctness: 50,
      clarity: 50,
      formality: 50,
      structure: 50,
      vocabulary: 50,
    },
    issues: Array.isArray(data.issues) ? data.issues : [],
    betterCollocations: Array.isArray(data.betterCollocations) ? data.betterCollocations : [],
    summaryUz:
      data.summaryUz ||
      'Tekshiruv yakunlandi. Matnni yana bir bor o‘qing va taklif etilgan o‘zgarishlarni ko‘rib chiqing.',
  };
}

export async function apiSuggestCollocations(input: {
  word: string;
  field?: FieldType;
  register?: string;
  limit?: number;
}) {
  return postAI<{ items: unknown[] }>('suggestCollocations', input);
}

export async function apiGenerateTask(input: {
  type: WritingType;
  field: FieldType;
  level: LevelType;
  withOutline?: boolean;
}): Promise<WritingTask> {
  const data = await postAI<WritingTask & { outline?: WritingTask['outline'] | null }>(
    'generateTask',
    input
  );
  return {
    situationEn: data.situationEn,
    recipientEn: data.recipientEn,
    requiredPoints: data.requiredPoints || [],
    wordLimit: data.wordLimit || { min: 120, max: 200 },
    explanationUz: data.explanationUz || 'Vazifani diqqat bilan bajaring.',
    outline: data.outline || undefined,
  };
}

export async function apiStatus(): Promise<{
  gemini: boolean;
  bnc: { connected: boolean; labelUz: string };
}> {
  try {
    const res = await fetch('/api/status');
    return res.json();
  } catch {
    return {
      gemini: false,
      bnc: { connected: false, labelUz: 'BNC: ulanmagan' },
    };
  }
}
