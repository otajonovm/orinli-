import React, { useMemo, useState } from 'react';
import { BookmarkPlus, Loader2, Search } from 'lucide-react';
import {
  BookRecord,
  CollocationGroup,
  CollocationItem,
  CollocationSearchResult,
  FieldType,
  RegisterType,
  SavedCollocation,
  WordRecord,
} from '../types';
import {
  AIProvider,
  BooksProvider,
  BNCProvider,
  EMPTY_GROUPS,
  searchMergedCollocations,
} from '../corpus';
import {
  COLLOCATION_GROUP_LABELS,
  FIELD_LABELS,
  SOURCE_BADGE_LABELS,
} from '../data/writingTemplates';
import { nextReviewDate } from '../data/wordDatabase';

interface CollocationScreenProps {
  wordsDb: Record<string, WordRecord>;
  books: BookRecord[];
  providersEnabled: { books: boolean; ai: boolean; bnc: boolean };
  importedFrequencies: Array<{ lemma: string; pos: string; frequency: number }>;
  savedCollocations: SavedCollocation[];
  onSaveCollocation: (item: SavedCollocation) => void;
  initialQuery?: string;
}

const GROUPS: CollocationGroup[] = [
  'verb_noun',
  'adj_noun',
  'noun_of_noun',
  'phrasal',
  'preposition',
];

export const CollocationScreen: React.FC<CollocationScreenProps> = ({
  wordsDb,
  books,
  providersEnabled,
  importedFrequencies,
  savedCollocations,
  onSaveCollocation,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [field, setField] = useState<FieldType | 'all'>('all');
  const [register, setRegister] = useState<RegisterType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CollocationSearchResult | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorUz, setErrorUz] = useState('');
  const didAutoSearch = React.useRef(false);

  const providers = useMemo(() => {
    const booksP = new BooksProvider(
      () => wordsDb,
      () => books
    );
    const aiP = new AIProvider(providersEnabled.ai);
    const bncP = new BNCProvider({
      importedFrequencies,
      apiUrl: null,
      hasKey: false,
    });
    return [booksP, aiP, bncP];
  }, [wordsDb, books, providersEnabled.ai, importedFrequencies]);

  const runSearch = async (word?: string) => {
    const w = (word ?? query).trim().toLowerCase();
    if (!w) {
      setErrorUz('Qidirish uchun so‘z yozing (masalan: deliver).');
      return;
    }
    setLoading(true);
    setErrorUz('');
    setExpandedId(null);
    try {
      const res = await searchMergedCollocations(
        providers,
        w,
        {
          field,
          register,
          limit: 30,
        },
        providersEnabled
      );
      setResult(res);
      const total = Object.values(res.groups).reduce((a, g) => a + g.length, 0);
      if (total === 0) {
        setErrorUz(
          `"${w}" bo‘yicha natija topilmadi. Boshqa so‘z yoki AI manbasini yoqing.`
        );
      }
    } catch (e) {
      console.error('[Kollokatsiya]', e);
      setErrorUz('Qidiruvda xatolik. Qayta urinib ko‘ring.');
      setResult({ word: w, groups: { ...EMPTY_GROUPS }, sourcesUsed: [] });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      setQuery(initialQuery);
      void runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSave = (item: CollocationItem) => {
    const already = savedCollocations.some(
      (s) => s.phrase.toLowerCase() === item.phrase.toLowerCase()
    );
    if (already) return;
    onSaveCollocation({
      id: `sc-${Date.now()}-${item.id}`,
      phrase: item.phrase,
      group: item.group,
      exampleEn: item.examples[0]?.full?.slice(0, 200) || item.phrase,
      meaningUz: item.meaningUz,
      source: item.source,
      field: item.field,
      register: item.register,
      savedAt: new Date().toISOString(),
      nextReviewAt: nextReviewDate(1),
      reviewIntervalDays: 1,
      mastery: 0,
    });
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-5 pb-24 md:pb-10">
      <div>
        <h2 className="text-2xl font-black text-[#0F1C2E]">Kollokatsiya qidiruvi</h2>
        <p className="text-sm text-[#0F1C2E]/60 mt-0.5">
          So‘z sketchi: fe’l+ot, sifat+ot, phrasal fe’llar va boshqalar.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1C2E]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder='Masalan: make, deliver, issue…'
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#0F1C2E]/12 bg-[#F6F1E8]/50 text-sm outline-none focus:border-[#1F7A6B]"
            />
          </div>
          <button
            onClick={() => runSearch()}
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-[#1F7A6B] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Qidirish'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1.5">
            <span className="text-[#0F1C2E]/50 font-semibold">Soha</span>
            <select
              value={field}
              onChange={(e) => setField(e.target.value as FieldType | 'all')}
              className="rounded-lg border border-[#0F1C2E]/12 bg-white px-2 py-1.5"
            >
              <option value="all">Barchasi</option>
              {(Object.keys(FIELD_LABELS) as FieldType[]).map((k) => (
                <option key={k} value={k}>
                  {FIELD_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-[#0F1C2E]/50 font-semibold">Registr</span>
            <select
              value={register}
              onChange={(e) => setRegister(e.target.value as RegisterType | 'all')}
              className="rounded-lg border border-[#0F1C2E]/12 bg-white px-2 py-1.5"
            >
              <option value="all">Barchasi</option>
              <option value="formal">Rasmiy</option>
              <option value="neutral">Neytral</option>
              <option value="informal">Norasmiy</option>
            </select>
          </label>
        </div>
      </div>

      {errorUz && (
        <p className="text-sm text-[#0F1C2E]/70 bg-[#E2A13A]/10 rounded-xl px-3 py-2">{errorUz}</p>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {GROUPS.map((g) => {
            const items = result.groups[g] || [];
            return (
              <div
                key={g}
                className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4 space-y-2 min-h-[140px]"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1F7A6B]">
                  {COLLOCATION_GROUP_LABELS[g]}
                  <span className="text-[#0F1C2E]/40 ml-1">({items.length})</span>
                </h3>
                {items.length === 0 ? (
                  <p className="text-[11px] text-[#0F1C2E]/40">Natija yo‘q</p>
                ) : (
                  items.map((item) => {
                    const saved = savedCollocations.some(
                      (s) => s.phrase.toLowerCase() === item.phrase.toLowerCase()
                    );
                    const open = expandedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl bg-[#F6F1E8]/70 p-2.5 space-y-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : item.id)}
                          className="w-full text-left"
                        >
                          <div className="text-sm font-bold text-[#0F1C2E]">{item.phrase}</div>
                          <SourceBadge source={item.source} />
                        </button>

                        {open && (
                          <div className="space-y-2 pt-1 border-t border-[#0F1C2E]/5">
                            {item.examples.slice(0, 3).map((ex, i) => (
                              <p key={i} className="text-[11px] font-mono leading-relaxed text-[#0F1C2E]/80">
                                <span className="text-[#0F1C2E]/45">{ex.left} </span>
                                <span className="font-bold text-[#1F7A6B] bg-[#1F7A6B]/15 px-0.5">
                                  {ex.keyword}
                                </span>
                                <span className="text-[#0F1C2E]/45"> {ex.right}</span>
                              </p>
                            ))}
                            <p className="text-xs text-[#0F1C2E]/70">{item.meaningUz}</p>
                            <button
                              disabled={saved}
                              onClick={() => handleSave(item)}
                              className={`w-full h-8 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 ${
                                saved
                                  ? 'bg-[#0F1C2E]/8 text-[#0F1C2E]/45'
                                  : 'bg-[#1F7A6B] text-white'
                              }`}
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              {saved ? 'Saqlangan' : 'Saqlash'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {savedCollocations.length > 0 && !result && (
        <div className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4">
          <h3 className="text-sm font-bold mb-2">
            Saqlangan kollokatsiyalar ({savedCollocations.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedCollocations.slice(0, 20).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const w = s.phrase.split(/\s+/)[0];
                  setQuery(w);
                  runSearch(w);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#F6F1E8] text-xs font-semibold"
              >
                {s.phrase}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function SourceBadge({ source }: { source: CollocationItem['source'] }) {
  const colors = {
    books: 'bg-[#1F7A6B]/15 text-[#1F7A6B]',
    ai: 'bg-[#E2A13A]/20 text-[#8A5A10]',
    bnc: 'bg-[#0F1C2E]/10 text-[#0F1C2E]/70',
  };
  return (
    <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${colors[source]}`}>
      {SOURCE_BADGE_LABELS[source]}
    </span>
  );
}
