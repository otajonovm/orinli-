import React, { useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { FieldType } from '../types';
import { filterPhrasalVerbs } from '../data/phrasalVerbs';
import { FIELD_LABELS } from '../data/writingTemplates';

interface PhrasalVerbsScreenProps {
  onQuizComplete?: (xp: number) => void;
}

export const PhrasalVerbsScreen: React.FC<PhrasalVerbsScreenProps> = ({
  onQuizComplete,
}) => {
  const [field, setField] = useState<FieldType | 'all'>('all');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const list = useMemo(() => {
    const items = filterPhrasalVerbs(field);
    const order = { high: 0, mid: 1, low: 2 };
    return [...items].sort((a, b) => order[a.frequency] - order[b.frequency]);
  }, [field]);

  const active = list.find((p) => p.id === quizId);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-5 pb-24 md:pb-10">
      <div>
        <h2 className="text-2xl font-black text-[#0F1C2E]">Phrasal fe’llar</h2>
        <p className="text-sm text-[#0F1C2E]/60 mt-0.5">
          Ma’no, rasmiy muqobil va qisqa sinov — texnik yozuv uchun.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={field === 'all'} onClick={() => setField('all')}>
          Barchasi
        </Chip>
        {(Object.keys(FIELD_LABELS) as FieldType[]).map((k) => (
          <Chip key={k} active={field === k} onClick={() => setField(k)}>
            {FIELD_LABELS[k]}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((pv) => (
          <div
            key={pv.id}
            className="bg-white rounded-2xl border border-[#0F1C2E]/8 p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#0F1C2E]">{pv.verb}</h3>
                <p className="text-sm text-[#0F1C2E]/75 mt-0.5">{pv.meaningUz}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-[#0F1C2E]/40 block">
                  {pv.frequency === 'high' ? 'Yuqori' : pv.frequency === 'mid' ? 'O‘rta' : 'Past'} chastota
                </span>
                <span className="text-[10px] font-semibold text-[#1F7A6B]">
                  {FIELD_LABELS[pv.field]}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#F6F1E8] px-3 py-2 text-xs">
              <span className="text-[#0F1C2E]/50 font-semibold">Rasmiy muqobil: </span>
              <span className="font-bold text-[#1F7A6B]">{pv.formalAlternative}</span>
            </div>

            <ul className="text-xs text-[#0F1C2E]/70 space-y-1">
              {pv.examples.map((ex, i) => (
                <li key={i} className="italic">
                  “{ex.slice(0, 200)}”
                </li>
              ))}
            </ul>

            {quizId === pv.id && active ? (
              <div className="pt-2 border-t border-[#0F1C2E]/5 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#E2A13A]" />
                  {active.quiz.questionUz}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {active.quiz.options.map((opt, i) => {
                    const show = picked !== null;
                    const correct = i === active.quiz.answerIndex;
                    return (
                      <button
                        key={i}
                        disabled={picked !== null}
                        onClick={() => {
                          setPicked(i);
                          if (i === active.quiz.answerIndex) onQuizComplete?.(12);
                          else onQuizComplete?.(3);
                        }}
                        className={`text-left text-xs p-2.5 rounded-xl border font-medium transition-colors ${
                          show && correct
                            ? 'border-[#1F7A6B] bg-[#1F7A6B]/10 text-[#1F7A6B]'
                            : show && picked === i
                              ? 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-[#0F1C2E]/10 hover:bg-[#F6F1E8]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <button
                    onClick={() => {
                      setQuizId(null);
                      setPicked(null);
                    }}
                    className="text-[11px] font-bold text-[#1F7A6B] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Yopish
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setQuizId(pv.id);
                  setPicked(null);
                }}
                className="text-xs font-bold text-[#E2A13A] hover:underline"
              >
                Mini-sinov
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
        active ? 'bg-[#0F1C2E] text-white' : 'bg-white border border-[#0F1C2E]/10 text-[#0F1C2E]/70'
      }`}
    >
      {children}
    </button>
  );
}
