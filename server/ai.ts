/**
 * WriteTechAI — single server-side Gemini module.
 * API key is read ONLY from process.env.GEMINI_API_KEY. Never logged, never sent to client.
 */
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.8-flash';

export type AIAction =
  | 'analyzeBook'
  | 'explainWord'
  | 'checkWriting'
  | 'suggestCollocations'
  | 'generateTask';

let client: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI | null {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'writetechai-app' },
    },
  });
  return client;
}

export function isAIConfigured(): boolean {
  return getAIClient() !== null;
}

export function bncStatus(): { connected: boolean; hasUrl: boolean; hasKey: boolean } {
  const url = process.env.BNC_API_URL;
  const key = process.env.BNC_API_KEY;
  const hasUrl = !!(url && url.trim());
  const hasKey = !!(key && key.trim());
  return { connected: hasUrl && hasKey, hasUrl, hasKey };
}

/** Safe error message for logs — never includes API key */
export function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`.slice(0, 500);
  }
  return String(err).slice(0, 500);
}

async function generateJSON<T>(
  prompt: string,
  fallback: T,
  label: string
): Promise<{ data: T; source: 'gemini' | 'fallback'; error?: string }> {
  const ai = getAIClient();
  if (!ai) {
    const msg = 'GEMINI_API_KEY o‘rnatilmagan yoki bo‘sh';
    console.error(`[AI:${label}] ${msg}`);
    return { data: fallback, source: 'fallback', error: msg };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      const msg = 'Gemini bo‘sh javob qaytardi';
      console.error(`[AI:${label}] ${msg}`);
      return { data: fallback, source: 'fallback', error: msg };
    }

    const parsed = JSON.parse(text) as T;
    return { data: parsed, source: 'gemini' };
  } catch (err) {
    const msg = safeErrorMessage(err);
    console.error(`[AI:${label}] Gemini xatosi:`, msg);
    return { data: fallback, source: 'fallback', error: msg };
  }
}

/* ───────── analyzeBook ───────── */

export interface AnalyzeBookInput {
  text: string;
  title?: string;
}

export async function analyzeBook(input: AnalyzeBookInput, fallbackWords: unknown) {
  const truncated = (input.text || '').slice(0, 25000);
  const prompt = `You are the language engine of "WriteTechAI", an English writing app for Uzbek speakers.
Extract 12 to 16 useful content words from the uploaded book excerpt.
If "righting" or "writing" appears, include them with isEasilyConfused: true.
If the text is NOT English, return words: [] and warningUz in Uzbek.

Text:
"""
${truncated}
"""

Return STRICT JSON:
{
  "title": "${input.title || 'Kitob'}",
  "levelGuess": "A2"|"B1"|"B2"|"C1",
  "words": [{
    "lemma": "lowercase",
    "pos": "ot (noun)|fe’l (verb)|sifat (adjective)|ravish (adverb)",
    "band": "Core"|"Mid"|"Rare",
    "meaningUz": "short Uzbek",
    "glossEn": "3-6 English words",
    "excerpt": "ONE sentence from text containing the word (max 200 chars)",
    "whyUseful": "short Uzbek",
    "collocations": ["2-4 phrases"],
    "check": {
      "questionUz": "Uzbek MCQ",
      "options": ["a","b","c","d"],
      "answerIndex": 0,
      "explainUz": "short Uzbek"
    },
    "isEasilyConfused": false,
    "confusedWith": ""
  }],
  "warningUz": ""
}`;

  const result = await generateJSON(prompt, fallbackWords, 'analyzeBook');
  const data = result.data as {
    words?: unknown[];
    title?: string;
    levelGuess?: string;
    warningUz?: string;
  };

  if (!data?.words || !Array.isArray(data.words) || data.words.length === 0) {
    if (result.source === 'gemini') {
      console.error('[AI:analyzeBook] Gemini JSON had empty words array — using fallback');
    }
    return {
      ...(typeof fallbackWords === 'object' && fallbackWords ? fallbackWords : {}),
      _meta: { source: 'fallback' as const, error: result.error || 'Bo‘sh words massivi' },
    };
  }

  return { ...data, _meta: { source: result.source, error: result.error } };
}

/* ───────── explainWord ───────── */

export async function explainWord(input: {
  lemma: string;
  pos?: string;
  meaningUz?: string;
  excerpt?: string;
  questionType: 'simplify' | 'another_example' | 'quiz_me';
}) {
  const fallback = {
    type: input.questionType,
    responseUz: `"${input.lemma}" — ${input.meaningUz || 'foydali so‘z'}. Kitobingizdagi kontekstda eslab qoling.`,
  };

  const intent =
    input.questionType === 'another_example'
      ? 'Boshqa misol ber'
      : input.questionType === 'quiz_me'
        ? 'Meni tekshir'
        : 'Yana soddaroq tushuntir';

  const prompt = `You are a friendly tutor in WriteTechAI for Uzbek learners.
Word: "${input.lemma}" (${input.pos || ''})
Meaning: "${input.meaningUz || ''}"
Excerpt: "${input.excerpt || ''}"
Request: "${intent}"

Return STRICT JSON: { "type": "${input.questionType}", "responseUz": "2-4 short Uzbek sentences" }`;

  const result = await generateJSON(prompt, fallback, 'explainWord');
  const data = result.data as { type?: string; responseUz?: string };
  if (!data?.responseUz) {
    return { ...fallback, _meta: { source: 'fallback' as const, error: result.error } };
  }
  return { type: data.type || input.questionType, responseUz: data.responseUz, _meta: { source: result.source } };
}

/* ───────── checkWriting ───────── */

export async function checkWriting(input: {
  text: string;
  type: string;
  field: string;
  level: string;
}) {
  const fallback = {
    overallScore: 55,
    scores: {
      correctness: 50,
      clarity: 55,
      formality: 50,
      structure: 55,
      vocabulary: 50,
    },
    issues: [] as Array<{
      start: number;
      end: number;
      original: string;
      suggestion: string;
      type: string;
      explanationUz: string;
    }>,
    betterCollocations: [] as Array<{ original: string; better: string; exampleEn: string }>,
    summaryUz:
      'Hozircha AI tekshiruvi ishlamadi. Matningizni qayta yuboring yoki soddaroq qilib yozing. Asosiy maslahat: rasmiy iboralardan foydalaning va har bir xatboshida bitta g‘oya bo‘lsin.',
  };

  // Heuristic local issues if AI fails
  const localIssues = heuristicIssues(input.text || '');
  fallback.issues = localIssues;

  const prompt = `You are a strict but helpful English writing coach for Uzbek students (level ${input.level}).
Genre: ${input.type}. Field: ${input.field}.
Check the student's text for grammar, spelling, word choice, collocations, formality, punctuation, structure, and vocabulary.

Text (character offsets must match this exact string):
"""
${input.text}
"""

Return STRICT JSON only:
{
  "overallScore": 0-100,
  "scores": {
    "correctness": 0-100,
    "clarity": 0-100,
    "formality": 0-100,
    "structure": 0-100,
    "vocabulary": 0-100
  },
  "issues": [{
    "start": number,
    "end": number,
    "original": "exact substring",
    "suggestion": "better English",
    "type": "grammar"|"spelling"|"word-choice"|"collocation"|"formality"|"punctuation",
    "explanationUz": "short Uzbek explanation"
  }],
  "betterCollocations": [{
    "original": "phrase used",
    "better": "more natural collocation",
    "exampleEn": "short example sentence"
  }],
  "summaryUz": "2-4 sentence Uzbek summary of strengths and what to improve"
}
Offsets start/end are 0-based indices into the exact text above. Max 12 issues.`;

  const result = await generateJSON(prompt, fallback, 'checkWriting');
  const data = result.data as typeof fallback;

  if (
    typeof data.overallScore !== 'number' ||
    !data.scores ||
    !Array.isArray(data.issues)
  ) {
    console.error('[AI:checkWriting] Invalid JSON shape — using fallback');
    return { ...fallback, _meta: { source: 'fallback' as const, error: result.error || 'Noto‘g‘ri JSON' } };
  }

  // Clamp scores
  data.overallScore = clamp(data.overallScore);
  for (const k of Object.keys(data.scores) as Array<keyof typeof data.scores>) {
    data.scores[k] = clamp(Number(data.scores[k]) || 0);
  }

  return { ...data, _meta: { source: result.source, error: result.error } };
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function heuristicIssues(text: string) {
  const issues: Array<{
    start: number;
    end: number;
    original: string;
    suggestion: string;
    type: string;
    explanationUz: string;
  }> = [];

  const patterns: Array<{ rx: RegExp; suggestion: string; type: string; explanationUz: string }> = [
    {
      rx: /\bi am writing for ask\b/gi,
      suggestion: 'I am writing to ask',
      type: 'collocation',
      explanationUz: 'So‘rov uchun "writing to ask" kollokatsiyasi to‘g‘ri.',
    },
    {
      rx: /\bmore better\b/gi,
      suggestion: 'better',
      type: 'grammar',
      explanationUz: '"Better" allaqachon qiyosiy daraja — "more" kerak emas.',
    },
    {
      rx: /\bdid a mistake\b/gi,
      suggestion: 'made a mistake',
      type: 'collocation',
      explanationUz: 'Ingliz tilida "make a mistake" deyiladi.',
    },
    {
      rx: /\binform to you\b/gi,
      suggestion: 'inform you',
      type: 'grammar',
      explanationUz: '"Inform" fe’lidan keyin "to" kelmaydi.',
    },
  ];

  for (const p of patterns) {
    const m = p.rx.exec(text);
    if (m && m.index !== undefined) {
      issues.push({
        start: m.index,
        end: m.index + m[0].length,
        original: m[0],
        suggestion: p.suggestion,
        type: p.type,
        explanationUz: p.explanationUz,
      });
    }
  }
  return issues;
}

/* ───────── suggestCollocations ───────── */

export async function suggestCollocations(input: {
  word: string;
  field?: string;
  register?: string;
  limit?: number;
}) {
  const word = (input.word || '').trim().toLowerCase();
  const fallback = {
    items: localCollocations(word, input.field),
  };

  const prompt = `Generate natural English collocations for the word "${word}".
Field focus: ${input.field || 'general technical/academic'}.
Register: ${input.register || 'formal'}.
For Uzbek technical English learners.

Return STRICT JSON:
{
  "items": [{
    "phrase": "collocation phrase",
    "group": "verb_noun"|"adj_noun"|"noun_of_noun"|"phrasal"|"preposition",
    "meaningUz": "short Uzbek meaning",
    "register": "formal"|"neutral"|"informal",
    "field": "${input.field || 'business'}",
    "examples": [{
      "left": "words before",
      "keyword": "${word}",
      "right": "words after",
      "full": "complete short sentence under 200 chars"
    }]
  }]
}
Provide ${Math.min(input.limit || 16, 20)} diverse items across groups.`;

  const result = await generateJSON(prompt, fallback, 'suggestCollocations');
  const data = result.data as { items?: unknown[] };
  if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) {
    return { ...fallback, _meta: { source: 'fallback' as const, error: result.error } };
  }
  return { items: data.items, _meta: { source: result.source } };
}

function localCollocations(word: string, field?: string) {
  const bank: Record<string, Array<{ phrase: string; group: string; meaningUz: string }>> = {
    make: [
      { phrase: 'make a decision', group: 'verb_noun', meaningUz: 'Qaror qabul qilmoq' },
      { phrase: 'make progress', group: 'verb_noun', meaningUz: 'Taraqqiyotga erishmoq' },
      { phrase: 'make an enquiry', group: 'verb_noun', meaningUz: 'So‘rov yubormoq' },
    ],
    deliver: [
      { phrase: 'deliver goods', group: 'verb_noun', meaningUz: 'Tovarlarni yetkazib bermoq' },
      { phrase: 'deliver a report', group: 'verb_noun', meaningUz: 'Hisobot topshirmoq' },
      { phrase: 'on-time delivery', group: 'adj_noun', meaningUz: 'O‘z vaqtida yetkazish' },
      { phrase: 'delivery of cargo', group: 'noun_of_noun', meaningUz: 'Yuk yetkazib berish' },
      { phrase: 'deliver on', group: 'phrasal', meaningUz: 'Va’dani bajarish' },
    ],
    issue: [
      { phrase: 'issue a statement', group: 'verb_noun', meaningUz: 'Bayonot chiqarmoq' },
      { phrase: 'raise an issue', group: 'verb_noun', meaningUz: 'Masalani ko‘tarmoq' },
      { phrase: 'key issue', group: 'adj_noun', meaningUz: 'Asosiy masala' },
      { phrase: 'issue of concern', group: 'noun_of_noun', meaningUz: 'Tashvishli masala' },
    ],
  };

  const items = (bank[word] || [
    { phrase: `${word} a report`, group: 'verb_noun', meaningUz: `"${word}" bilan tipik birikma` },
    { phrase: `important ${word}`, group: 'adj_noun', meaningUz: 'Muhim kontekst' },
    { phrase: `${word} of interest`, group: 'noun_of_noun', meaningUz: 'Qiziqish obyekti' },
  ]).map((item, i) => ({
    ...item,
    register: 'formal',
    field: field || 'business',
    examples: [
      {
        left: 'We need to',
        keyword: word,
        right: 'this carefully.',
        full: `We need to ${item.phrase} carefully.`,
      },
    ],
    id: `local-${word}-${i}`,
  }));

  return items;
}

/* ───────── generateTask ───────── */

export async function generateTask(input: {
  type: string;
  field: string;
  level: string;
  withOutline?: boolean;
}) {
  const fallback = localTask(input);

  const prompt = `Create a realistic English writing task for an Uzbek learner.
Type: ${input.type} (formal_letter|email|report|essay)
Field: ${input.field}
Level: ${input.level}
Include a short Uzbek explanation.
${input.withOutline ? 'Also include a simple outline with mainIdea, subIdeas (3), linkingWords (4-6).' : 'outline can be null.'}

Return STRICT JSON:
{
  "situationEn": "2-4 sentences describing the situation in English",
  "recipientEn": "who they write to",
  "requiredPoints": ["point1","point2","point3","point4"],
  "wordLimit": { "min": 120, "max": 220 },
  "explanationUz": "short Uzbek guidance",
  "outline": ${
    input.withOutline
      ? '{ "mainIdea": "...", "subIdeas": ["..."], "linkingWords": ["Firstly","Moreover","However","In conclusion"] }'
      : 'null'
  }
}`;

  const result = await generateJSON(prompt, fallback, 'generateTask');
  const data = result.data as typeof fallback;
  if (!data?.situationEn || !Array.isArray(data.requiredPoints)) {
    return { ...fallback, _meta: { source: 'fallback' as const, error: result.error } };
  }
  return { ...data, _meta: { source: result.source } };
}

function localTask(input: { type: string; field: string; level: string; withOutline?: boolean }) {
  const fieldScenes: Record<string, { situation: string; recipient: string; points: string[] }> = {
    logistics: {
      situation:
        'Your company ordered spare parts that arrived three days late. The delay affected production. Write a formal letter to the supplier.',
      recipient: 'The Logistics Manager at Atlas Supplies Ltd',
      points: [
        'State the shipment reference and delay',
        'Explain the impact on operations',
        'Request compensation or a revised schedule',
        'Propose a polite next step',
      ],
    },
    business: {
      situation:
        'You attended a business conference and want to propose a partnership. Write a formal letter to the company representative.',
      recipient: 'Ms. Helen Carter, Partnerships Director',
      points: [
        'Mention where you met',
        'Explain mutual benefits',
        'Suggest a short meeting',
        'Close politely',
      ],
    },
    it: {
      situation:
        'Users cannot access the company VPN after an update. Write a formal email to the IT support lead.',
      recipient: 'IT Support Lead',
      points: [
        'Describe the problem and when it started',
        'List affected users/systems',
        'Request urgent investigation',
        'Offer logs if needed',
      ],
    },
    engineering: {
      situation:
        'A safety inspection found a minor fault on Line B. Write a short report to the plant supervisor.',
      recipient: 'Plant Supervisor',
      points: [
        'Summarize the finding',
        'Assess risk level',
        'Recommend corrective action',
        'Suggest a timeline',
      ],
    },
    computing: {
      situation:
        'You need access to the staging server for a university project. Write a formal request email.',
      recipient: 'Systems Administrator',
      points: [
        'Introduce yourself and purpose',
        'Specify access needed',
        'Give a timeframe',
        'Thank them in advance',
      ],
    },
  };

  const scene = fieldScenes[input.field] || fieldScenes.business;
  const wordLimit =
    input.level === 'C1'
      ? { min: 180, max: 280 }
      : input.level === 'B2'
        ? { min: 150, max: 240 }
        : { min: 120, max: 200 };

  return {
    situationEn: scene.situation,
    recipientEn: scene.recipient,
    requiredPoints: scene.points,
    wordLimit,
    explanationUz:
      'Vaziyatni diqqat bilan o‘qing. Har bir talab qilingan bandni yoritib yozing. Rasmiy uslubda, aniq va muloyim bo‘ling.',
    outline: input.withOutline
      ? {
          mainIdea: 'Asosiy maqsad: muammo yoki so‘rovni aniq bayon qilish',
          subIdeas: [
            'Kirish va vaziyat',
            'Dalillar / ta’sir',
            'So‘rov va yakun',
          ],
          linkingWords: ['Firstly', 'Furthermore', 'However', 'Therefore', 'In conclusion'],
        }
      : null,
  };
}
