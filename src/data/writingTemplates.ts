import { FieldType, LetterTemplate } from '../types';

export const WRITING_TYPE_LABELS = {
  formal_letter: 'Rasmiy xat',
  email: 'Email',
  report: 'Hisobot',
  essay: 'Esse',
} as const;

export const FIELD_LABELS: Record<FieldType, string> = {
  business: 'Biznes / menejment',
  logistics: 'Logistika',
  it: 'Dasturlash / IT',
  engineering: 'Muhandislik',
  computing: 'Kompyuter',
};

export const LEVEL_LABELS = {
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
} as const;

export const COLLOCATION_GROUP_LABELS = {
  verb_noun: 'Fe’l + ot',
  adj_noun: 'Sifat + ot',
  noun_of_noun: 'Ot + of + ot',
  phrasal: 'Phrasal fe’llar',
  preposition: 'Predloglar',
} as const;

export const SOURCE_BADGE_LABELS = {
  books: 'Manba: Kitoblar bazasi',
  ai: 'Manba: AI',
  bnc: 'Manba: BNC',
} as const;

export const ISSUE_TYPE_LABELS = {
  grammar: 'Grammatika',
  spelling: 'Imlo',
  'word-choice': 'So‘z tanlash',
  collocation: 'Kollokatsiya',
  formality: 'Rasmiylik',
  punctuation: 'Tinish belgilari',
} as const;

export const ISSUE_COLORS: Record<string, string> = {
  grammar: '#E2A13A',
  spelling: '#C45C5C',
  'word-choice': '#1F7A6B',
  collocation: '#5B6BCF',
  formality: '#0F1C2E',
  punctuation: '#8B7355',
};

export const LETTER_TEMPLATES: LetterTemplate[] = [
  // Business
  { id: 'biz-open-1', field: 'business', section: 'opening', phraseEn: 'Dear Sir or Madam,', noteUz: 'Ism noma’lum bo‘lsa' },
  { id: 'biz-open-2', field: 'business', section: 'opening', phraseEn: 'I am writing to enquire about…', noteUz: 'So‘rov uchun ochilish' },
  { id: 'biz-purpose-1', field: 'business', section: 'purpose', phraseEn: 'The purpose of this letter is to…', noteUz: 'Maqsadni aniq aytish' },
  { id: 'biz-req-1', field: 'business', section: 'request', phraseEn: 'I would be grateful if you could…', noteUz: 'Muloyim so‘rov' },
  { id: 'biz-close-1', field: 'business', section: 'closing', phraseEn: 'Yours faithfully,', noteUz: 'Ism noma’lum bo‘lsa' },
  { id: 'biz-close-2', field: 'business', section: 'closing', phraseEn: 'I look forward to your reply.', noteUz: 'Javob kutish' },

  // Logistics
  { id: 'log-open-1', field: 'logistics', section: 'opening', phraseEn: 'Dear Logistics Manager,', noteUz: 'Logistika bo‘limiga' },
  { id: 'log-purpose-1', field: 'logistics', section: 'purpose', phraseEn: 'I am writing regarding shipment reference…', noteUz: 'Yuk jo‘natmasi haqida' },
  { id: 'log-req-1', field: 'logistics', section: 'request', phraseEn: 'Could you please confirm the estimated time of arrival?', noteUz: 'Yetib kelish vaqtini so‘rash' },
  { id: 'log-req-2', field: 'logistics', section: 'request', phraseEn: 'We kindly request an update on the delayed delivery.', noteUz: 'Kechikish haqida yangilanish' },
  { id: 'log-close-1', field: 'logistics', section: 'closing', phraseEn: 'Thank you for your prompt attention to this matter.', noteUz: 'Tezkor e’tibor uchun' },
  { id: 'log-close-2', field: 'logistics', section: 'closing', phraseEn: 'Yours sincerely,', noteUz: 'Ism ma’lum bo‘lsa' },

  // IT
  { id: 'it-open-1', field: 'it', section: 'opening', phraseEn: 'Dear Support Team,', noteUz: 'Texnik yordamga' },
  { id: 'it-purpose-1', field: 'it', section: 'purpose', phraseEn: 'I am writing to report a technical issue with…', noteUz: 'Texnik muammo haqida' },
  { id: 'it-req-1', field: 'it', section: 'request', phraseEn: 'Please advise on the recommended next steps.', noteUz: 'Keyingi qadamlarni so‘rash' },
  { id: 'it-close-1', field: 'it', section: 'closing', phraseEn: 'Please let me know if you need further logs or details.', noteUz: 'Qo‘shimcha ma’lumot taklifi' },

  // Engineering
  { id: 'eng-open-1', field: 'engineering', section: 'opening', phraseEn: 'Dear Project Engineer,', noteUz: 'Loyiha muhandisiga' },
  { id: 'eng-purpose-1', field: 'engineering', section: 'purpose', phraseEn: 'This letter concerns the safety inspection of…', noteUz: 'Xavfsizlik tekshiruvi' },
  { id: 'eng-req-1', field: 'engineering', section: 'request', phraseEn: 'We request clarification on the revised specifications.', noteUz: 'Texnik talablar haqida' },
  { id: 'eng-close-1', field: 'engineering', section: 'closing', phraseEn: 'We appreciate your cooperation on this matter.', noteUz: 'Hamkorlik uchun' },

  // Computing
  { id: 'comp-open-1', field: 'computing', section: 'opening', phraseEn: 'Dear IT Administrator,', noteUz: 'IT administratorga' },
  { id: 'comp-purpose-1', field: 'computing', section: 'purpose', phraseEn: 'I am writing to request access to the development environment.', noteUz: 'Kirish huquqi so‘rovi' },
  { id: 'comp-req-1', field: 'computing', section: 'request', phraseEn: 'Could you please enable my account by Friday?', noteUz: 'Muddat bilan so‘rov' },
  { id: 'comp-close-1', field: 'computing', section: 'closing', phraseEn: 'Thank you for your assistance.', noteUz: 'Yordam uchun' },
];

export function templatesForField(field: FieldType): LetterTemplate[] {
  return LETTER_TEMPLATES.filter((t) => t.field === field);
}

export const SECTION_LABELS = {
  opening: 'Ochilish',
  purpose: 'Maqsad',
  request: 'So‘rov',
  closing: 'Yakun',
} as const;
