import React, { useMemo, useState } from 'react';
import { BookOpen, GraduationCap, RefreshCw } from 'lucide-react';
import { BookRecord, WordRecord } from '../types';
import { BooksScreen } from './BooksScreen';
import { LearnScreen } from './LearnScreen';
import { getDueWords } from '../data/wordDatabase';

interface WordsHubScreenProps {
  books: BookRecord[];
  wordsDb: Record<string, WordRecord>;
  onOpenUpload: () => void;
  onWordAnswered: (lemma: string, isCorrect: boolean) => void;
}

type SubTab = 'books' | 'learn' | 'review';

export const WordsHubScreen: React.FC<WordsHubScreenProps> = ({
  books,
  wordsDb,
  onOpenUpload,
  onWordAnswered,
}) => {
  const [sub, setSub] = useState<SubTab>('books');
  const due = useMemo(() => getDueWords(wordsDb), [wordsDb]);

  const reviewDb = useMemo(() => {
    const map: Record<string, WordRecord> = {};
    for (const w of due) map[w.lemma] = w;
    return map;
  }, [due]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-4 pt-4">
        <div className="inline-flex p-1 rounded-2xl bg-white border border-[#0F1C2E]/8 gap-1">
          <SubBtn
            active={sub === 'books'}
            onClick={() => setSub('books')}
            icon={BookOpen}
            label="Kitoblar"
          />
          <SubBtn
            active={sub === 'learn'}
            onClick={() => setSub('learn')}
            icon={GraduationCap}
            label="O‘rganish"
          />
          <SubBtn
            active={sub === 'review'}
            onClick={() => setSub('review')}
            icon={RefreshCw}
            label={`Takrorlash${due.length ? ` (${due.length})` : ''}`}
          />
        </div>
      </div>

      {sub === 'books' && (
        <BooksScreen books={books} wordsDb={wordsDb} onOpenUpload={onOpenUpload} />
      )}
      {sub === 'learn' && (
        <LearnScreen
          wordsDb={wordsDb}
          onWordAnswered={onWordAnswered}
          onOpenUpload={onOpenUpload}
        />
      )}
      {sub === 'review' && (
        <div className="flex-1 flex flex-col">
          <div className="max-w-6xl mx-auto w-full px-4 pt-4">
            <p className="text-xs text-[#0F1C2E]/60 mb-2">
              Spaced repetition: 1, 3, 7, 14 kun. Bugun takrorlash kerak: {due.length} ta.
            </p>
          </div>
          {due.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4 pb-24">
              <div className="bg-white rounded-3xl border border-[#0F1C2E]/8 p-8 text-center max-w-sm">
                <RefreshCw className="w-8 h-8 text-[#1F7A6B] mx-auto mb-3" />
                <h3 className="font-bold">Hozircha takrorlash yo‘q</h3>
                <p className="text-xs text-[#0F1C2E]/55 mt-2">
                  Yangi so‘zlarni o‘rganing — keyin ular shu navbatga tushadi.
                </p>
              </div>
            </div>
          ) : (
            <LearnScreen
              wordsDb={reviewDb}
              onWordAnswered={onWordAnswered}
              onOpenUpload={onOpenUpload}
            />
          )}
        </div>
      )}
    </div>
  );
};

function SubBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
        active ? 'bg-[#0F1C2E] text-white' : 'text-[#0F1C2E]/65 hover:bg-[#F6F1E8]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
